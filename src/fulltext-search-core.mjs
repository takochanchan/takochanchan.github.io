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

export const groupDocumentReferences = (
  exactReferences,
  broadReferences,
  documentMap,
  query,
) => {
  const broadById = new Map(
    broadReferences.map((reference) => [reference.id, reference]),
  );
  const worksBySlug = new Map();
  exactReferences.forEach((exactReference, order) => {
    const mapping = documentMap.fragments?.[exactReference.id];
    if (!mapping) throw new Error(`Unmapped search document: ${exactReference.id}`);
    const [slug, recordClass, partIndex] = mapping;
    if (!worksBySlug.has(slug)) {
      worksBySlug.set(slug, {
        slug,
        recordClass,
        score: 0,
        order,
        documents: [],
      });
    }
    const work = worksBySlug.get(slug);
    const broadReference = broadById.get(exactReference.id);
    work.score += broadReference?.score || exactReference.score || 0;
    work.documents.push({ partIndex, exactReference, broadReference });
  });

  const works = [...worksBySlug.values()].sort(
    (left, right) => right.score - left.score || left.order - right.order,
  );
  const results = works.map((work) => {
    work.documents.sort((left, right) => left.partIndex - right.partIndex);
    let dataPromise;
    let fullDataPromise;
    const loadFullData = () => {
      if (!fullDataPromise) {
        fullDataPromise = Promise.all(
          work.documents.map(async ({ exactReference, broadReference }) => {
            const broadData = await (broadReference || exactReference).data();
            let subResults = exactSubResultsFor(
              broadData.sub_results,
              query,
            );
            if (!subResults.length && broadReference) {
              const exactData = await exactReference.data();
              subResults = exactSubResultsFor(
                exactData.sub_results,
                query,
              );
            }
            return { data: broadData, subResults };
          }),
        ).then((documents) => {
          const first = documents[0]?.data;
          if (!first) throw new Error(`Empty search work: ${work.slug}`);
          return {
            ...first,
            meta: {
              ...first.meta,
              slug: work.slug,
              recordClass: work.recordClass,
            },
            sub_results: documents.flatMap(
              (document) => document.subResults,
            ),
          };
        });
      }
      return fullDataPromise;
    };
    return {
      id: work.slug,
      score: work.score,
      recordClass: work.recordClass,
      data: () => {
        if (!dataPromise) {
          dataPromise = (async () => {
            if (work.documents.length === 1) return loadFullData();
            for (const { exactReference } of work.documents) {
              const exactData = await exactReference.data();
              const subResults = exactSubResultsFor(
                exactData.sub_results,
                query,
              );
              if (!subResults.length) continue;
              return {
                ...exactData,
                meta: {
                  ...exactData.meta,
                  slug: work.slug,
                  recordClass: work.recordClass,
                },
                sub_results: subResults,
                __partialSearch: true,
                __loadFull: loadFullData,
              };
            }
            return loadFullData();
          })();
        }
        return dataPromise;
      },
    };
  });
  const books = works.filter(
    (work) => work.recordClass === "major-work",
  ).length;
  return { results, books, papers: works.length - books };
};
