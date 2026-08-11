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
