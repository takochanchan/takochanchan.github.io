// Pagefind 1.5.2's packed word index supplies token completions and positions.
// Resolve phrase-prefix matches here before asking Pagefind for excerpts; this
// avoids downloading hundreds of unrelated book fragments for a short query.
const fold = (value) => String(value).normalize("NFC").toLocaleLowerCase("ja");
const indexKey = (value) => fold(value).normalize("NFD").replace(/\p{M}/gu, "");

export const decodeSearchCbor = (bytes) => {
  let offset = 0;
  const decoder = new TextDecoder();
  const byte = () => {
    if (offset >= bytes.length) throw new Error("Truncated search index");
    return bytes[offset++];
  };
  const read = () => {
    const header = byte();
    const major = header >> 5;
    const additional = header & 31;
    let length = additional;
    if (additional >= 24) {
      if (additional > 26) throw new Error("Unsupported search index encoding");
      length = 0;
      for (let i = 0; i < 2 ** (additional - 24); i += 1) length = length * 256 + byte();
    }
    if (major === 0) return length;
    if (major === 1) return -1 - length;
    if (major === 3) {
      if (offset + length > bytes.length) throw new Error("Truncated search word");
      const value = decoder.decode(bytes.subarray(offset, offset + length));
      offset += length;
      return value;
    }
    if (major === 4) {
      const values = [];
      for (let i = 0; i < length; i += 1) values.push(read());
      return values;
    }
    throw new Error("Unsupported search index value");
  };
  const value = read();
  if (offset !== bytes.length) throw new Error("Trailing search index data");
  return value;
};

const readPacked = async (url, fetcher) => {
  const response = await fetcher(url);
  if (!response.ok) throw new Error("Search word index missing: " + url);
  let bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
    bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  }
  if (new TextDecoder().decode(bytes.subarray(0, 12)) !== "pagefind_dcd") {
    throw new Error("Invalid search word index signature");
  }
  return decodeSearchCbor(bytes.subarray(12));
};

const positionsFor = (pages) => {
  const positions = new Map();
  let pageNumber = 0;
  for (const [delta, locations] of pages) {
    pageNumber += delta;
    let position = 0;
    const values = new Set();
    for (const location of locations) {
      if (location < 0) position = 0;
      else { position += location; values.add(position); }
    }
    positions.set(pageNumber, values);
  }
  return positions;
};

export const createPrefixSearch = (baseUrls, fetcher = fetch) => {
  const shards = baseUrls.map((baseUrl) => ({
    baseUrl, metadata: null, chunks: new Map(),
  }));
  const metadataFor = (shard) => {
    if (!shard.metadata) {
      shard.metadata = (async () => {
        const response = await fetcher(new URL("pagefind-entry.json", shard.baseUrl));
        if (!response.ok) throw new Error("Search entry missing");
        const entry = await response.json();
        if (entry.version !== "1.5.2" || !entry.languages?.ja?.hash) {
          throw new Error("Unsupported prefix search index version");
        }
        const metadata = await readPacked(
          new URL(`pagefind.${entry.languages.ja.hash}.pf_meta`, shard.baseUrl), fetcher,
        );
        if (metadata[0] !== "1.5.2" || !Array.isArray(metadata[2])) {
          throw new Error("Invalid prefix search metadata");
        }
        return metadata;
      })().catch((error) => { shard.metadata = null; throw error; });
    }
    return shard.metadata;
  };
  const wordsFor = async (shard, token, prefix) => {
    const metadata = await metadataFor(shard);
    const key = indexKey(token);
    const chunks = metadata[2].filter(([from, to]) =>
      prefix ? to >= key && from < key + "\uffff" : from <= key && to >= key,
    );
    const words = await Promise.all(chunks.map(([, , hash]) => {
      if (!shard.chunks.has(hash)) {
        shard.chunks.set(hash, readPacked(
          new URL(`index/${hash}.pf_index`, shard.baseUrl), fetcher,
        ).then((chunk) => chunk[0]).catch((error) => {
          shard.chunks.delete(hash);
          throw error;
        }));
      }
      return shard.chunks.get(hash);
    }));
    const matching = [];
    for (const [word, pages, variants = []] of words.flat()) {
      for (const [form, locations] of [[word, pages], ...variants]) {
        const normalized = fold(form);
        if (prefix ? normalized.startsWith(fold(token)) : normalized === fold(token)) {
          matching.push({ form, positions: positionsFor(locations) });
        }
      }
    }
    return matching;
  };
  return async (candidates) => {
    const expansions = new Set();
    await Promise.all(shards.map(async (shard) => {
      const lookups = new Map();
      const lookup = (token, prefix) => {
        const key = `${prefix}:${token}`;
        if (!lookups.has(key)) lookups.set(key, wordsFor(shard, token, prefix));
        return lookups.get(key);
      };
      for (const candidate of candidates) {
        const tokens = candidate.split(/\s+/u);
        const preceding = await Promise.all(tokens.slice(0, -1).map((token) => lookup(token, false)));
        if (preceding.some((words) => !words.length)) continue;
        const endings = await lookup(tokens.at(-1), true);
        for (const ending of endings) {
          if (fold(ending.form) === fold(tokens.at(-1))) continue;
          const contiguous = [...ending.positions].some(([page, positions]) =>
            [...positions].some((position) => preceding.every((words, index) =>
              words.some((word) => word.positions.get(page)?.has(position - preceding.length + index)),
            )),
          );
          if (contiguous) expansions.add([...tokens.slice(0, -1), ending.form].join(" "));
        }
      }
    }));
    return [...expansions];
  };
};
