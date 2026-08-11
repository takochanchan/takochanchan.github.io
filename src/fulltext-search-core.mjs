export const INITIAL_SNIPPET_LIMIT = 10;
export const SNIPPET_BATCH_SIZE = 20;

export const blockIdFor = (subResult) => {
  const anchorId = subResult?.anchor?.id;
  if (/^b\d{5}$/.test(anchorId || "")) return anchorId;
  const hash = String(subResult?.url || "").split("#")[1] || "";
  return /^b\d{5}$/.test(hash) ? hash : null;
};

export const snippetsFor = (result, pageMap) => {
  const pages = new Map();
  for (const subResult of result.sub_results || []) {
    const blockId = blockIdFor(subResult);
    const mapping = blockId ? pageMap.blocks?.[blockId] : null;
    if (!blockId || !mapping) continue;
    const [originalPage, pdfPage, order] = mapping;
    const existing = pages.get(pdfPage);
    if (existing) {
      if (!existing.originalPages.includes(originalPage)) {
        existing.originalPages.push(originalPage);
      }
      existing.order = Math.min(existing.order, order);
      continue;
    }
    pages.set(pdfPage, {
      blockId,
      originalPages: [originalPage],
      pdfPage,
      order,
      excerpt: subResult.excerpt,
    });
  }
  return [...pages.values()]
    .map(({ originalPages, ...snippet }) => ({
      ...snippet,
      originalPage: originalPages.join("／"),
    }))
    .sort((a, b) => a.pdfPage - b.pdfPage || a.order - b.order);
};

export const countsFor = (results) => {
  const books = results.filter(
    (result) => result.meta?.recordClass === "major-work",
  ).length;
  return { books, papers: results.length - books };
};

export const resultLabel = ({ books, papers }) =>
  "書籍 " + books + "冊・論文 " + papers + "篇が該当";

const segmentWords = (query) => {
  const normalized = String(query || "").normalize("NFC").trim();
  if (!normalized) return [];
  if (typeof Intl.Segmenter !== "function") {
    return normalized.split(/\s+/u).filter(Boolean);
  }
  const segmenter = new Intl.Segmenter("ja", { granularity: "word" });
  return [...segmenter.segment(normalized)]
    .filter(({ segment, isWordLike }) =>
      isWordLike || /[\p{L}\p{N}]/u.test(segment),
    )
    .map(({ segment }) => segment);
};

const centralSplitOrder = (length) =>
  Array.from({ length: Math.max(0, length - 1) }, (_, index) => index + 1).sort(
    (a, b) => Math.abs(a - length / 2) - Math.abs(b - length / 2) || a - b,
  );

const candidateQuery = (tokens) =>
  tokens.join(" ").replaceAll('"', " ").replace(/\s+/gu, " ").trim();

export const literalCandidateQueries = (query) => {
  const tokens = segmentWords(query);
  if (!tokens.length) return [];
  const variants = [candidateQuery(tokens)];
  for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex += 1) {
    const graphemes = [...tokens[tokenIndex]];
    for (const splitAt of centralSplitOrder(graphemes.length)) {
      variants.push(
        candidateQuery([
          ...tokens.slice(0, tokenIndex),
          graphemes.slice(0, splitAt).join(""),
          graphemes.slice(splitAt).join(""),
          ...tokens.slice(tokenIndex + 1),
        ]),
      );
    }
  }
  return [...new Set(variants.filter(Boolean))];
};

const comparableText = (value) =>
  String(value || "")
    .normalize("NFC")
    .toLocaleLowerCase("ja")
    .replace(/\s+/gu, "");

export const exactSubResultsFor = (subResults, query) => {
  const needle = comparableText(query);
  if (!needle) return [];
  return (subResults || []).filter((subResult) =>
    comparableText(subResult.plain_excerpt).includes(needle),
  );
};
