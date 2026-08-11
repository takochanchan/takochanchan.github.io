(() => {
  "use strict";

  const INITIAL_SNIPPET_LIMIT = 10;
  const SNIPPET_BATCH_SIZE = 20;
  const INITIAL_WORK_BATCH_SIZE = 6;
  const WORK_BATCH_SIZE = 20;
  const RESULT_LOAD_CONCURRENCY = 2;
  const DOCUMENT_LOAD_CONCURRENCY = 6;
  const LITERAL_FILTER_CONCURRENCY = 4;
  const config = window.FULLTEXT_SEARCH_CONFIG || {};
  const previewCorpus = window.SEARCH_PREVIEW_CORPUS || null;
  const previewMetadata = window.SEARCH_PREVIEW_META || null;

  const form = document.querySelector("#fulltext-form");
  const input = document.querySelector("#fulltext-query");
  const dialog = document.querySelector("#fulltext-dialog");
  const closeButton = document.querySelector("#fulltext-dialog-close");
  const dialogQuery = document.querySelector("#fulltext-dialog-query");
  const summary = document.querySelector("#fulltext-summary");
  const status = document.querySelector("#fulltext-status");
  const resultList = document.querySelector("#fulltext-result-list");
  const scope = document.querySelector("#fulltext-scope, #prototype-scope");

  if (
    !form ||
    !input ||
    !dialog ||
    !closeButton ||
    !dialogQuery ||
    !summary ||
    !status ||
    !resultList
  ) {
    return;
  }

  const mapCache = new Map();
  let pagefindPromise;
  let documentMapPromise;
  let activeSearch = 0;
  let pendingResults = [];
  let renderedWorks = 0;

  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const escapeRegExp = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const safeExcerpt = (source) => {
    const template = document.createElement("template");
    template.innerHTML = source || "";
    const fragment = document.createDocumentFragment();
    const append = (sourceNode, target) => {
      if (sourceNode.nodeType === Node.TEXT_NODE) {
        target.append(document.createTextNode(sourceNode.textContent));
        return;
      }
      if (sourceNode.nodeType !== Node.ELEMENT_NODE) return;
      const destination =
        sourceNode.tagName === "MARK" ? document.createElement("mark") : target;
      [...sourceNode.childNodes].forEach((child) => append(child, destination));
      if (destination !== target) target.append(destination);
    };
    [...template.content.childNodes].forEach((child) => append(child, fragment));
    return fragment;
  };

  const formattedBytes = (bytes) => {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }
    return Math.round(bytes / 1024) + " KB";
  };

  const resolveUrl = (value, fallback) =>
    new URL(value || fallback, document.baseURI).toString();

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

  const surfaceWords = (query) =>
    String(query || "")
      .normalize("NFC")
      .trim()
      .match(/[\p{L}\p{N}]+/gu) || [];

  const centralSplitOrder = (length) =>
    Array.from(
      { length: Math.max(0, length - 1) },
      (_, index) => index + 1,
    ).sort(
      (a, b) =>
        Math.abs(a - length / 2) - Math.abs(b - length / 2) || a - b,
    );

  const candidateQuery = (tokens) =>
    tokens.join(" ").replaceAll('"', " ").replace(/\s+/gu, " ").trim();

  const literalCandidateQueries = (query) => {
    const variants = [];
    const tokenizations = [segmentWords(query), surfaceWords(query)];
    for (const tokens of tokenizations) {
      if (!tokens.length) continue;
      variants.push(candidateQuery(tokens));
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
    }
    return [...new Set(variants.filter(Boolean))];
  };

  const comparableText = (value) =>
    String(value || "")
      .normalize("NFC")
      .toLocaleLowerCase("ja")
      .replace(/\s+/gu, "");

  const exactSubResultsFor = (subResults, query) => {
    const needle = comparableText(query);
    if (!needle) return [];
    return (subResults || []).filter((subResult) =>
      comparableText(subResult.plain_excerpt).includes(needle),
    );
  };

  const markedLiteralExcerpt = (text, query) => {
    const source = String(text || "").normalize("NFC");
    const literal = [...String(query || "").normalize("NFC")].filter(
      (character) => !/\s/u.test(character),
    );
    if (!literal.length) return escapeHtml(source);
    const expression = new RegExp(
      literal.map(escapeRegExp).join("\\s*"),
      "giu",
    );
    let result = "";
    let previous = 0;
    let match;
    while ((match = expression.exec(source))) {
      result += escapeHtml(source.slice(previous, match.index));
      result += "<mark>" + escapeHtml(match[0]) + "</mark>";
      previous = match.index + match[0].length;
      if (!match[0].length) expression.lastIndex += 1;
    }
    return result + escapeHtml(source.slice(previous));
  };

  const literalSubResultsFor = (subResults, query) =>
    exactSubResultsFor(subResults, query).map((subResult) => ({
      ...subResult,
      excerpt: markedLiteralExcerpt(subResult.plain_excerpt, query),
    }));

  const subResultKey = (subResult) =>
    blockIdFor(subResult) ||
    String(subResult?.url || "") ||
    String(subResult?.plain_excerpt || "");

  const mergePagefindReferences = (references, query) => {
    const groups = new Map();
    for (const reference of references) {
      if (!reference?.id) continue;
      if (!groups.has(reference.id)) groups.set(reference.id, []);
      groups.get(reference.id).push(reference);
    }
    return [...groups.entries()].map(([id, variants]) => {
      let dataPromise;
      return {
        id,
        score: Math.max(
          ...variants.map((reference) => reference.score || 0),
        ),
        data: () => {
          if (!dataPromise) {
            dataPromise = Promise.all(
              variants.map((reference) => reference.data()),
            ).then((documents) => {
              const first = documents[0];
              if (!first) throw new Error("Empty Pagefind reference: " + id);
              const subResults = new Map();
              for (const document of documents) {
                for (const subResult of literalSubResultsFor(
                  document.sub_results,
                  query,
                )) {
                  const key = subResultKey(subResult);
                  if (!subResults.has(key)) subResults.set(key, subResult);
                }
              }
              return { ...first, sub_results: [...subResults.values()] };
            });
          }
          return dataPromise;
        },
      };
    });
  };

  const loadInBatches = async (items, concurrency, loader) => {
    const loaded = [];
    for (let index = 0; index < items.length; index += concurrency) {
      loaded.push(
        ...(await Promise.all(
          items.slice(index, index + concurrency).map(loader),
        )),
      );
    }
    return loaded;
  };

  const loadPageMap = async (slug) => {
    if (!mapCache.has(slug)) {
      const mapsPath = resolveUrl(config.mapsPath, "./maps/");
      mapCache.set(
        slug,
        fetch(new URL(slug + ".json", mapsPath)).then((response) => {
          if (!response.ok) throw new Error("Page map missing: " + slug);
          return response.json();
        }),
      );
    }
    return mapCache.get(slug);
  };

  const ensureDocumentMap = () => {
    if (!documentMapPromise) {
      const mapPath = resolveUrl(
        config.documentMapPath,
        "./document-map.json",
      );
      documentMapPromise = fetch(mapPath)
        .then((response) => {
          if (!response.ok) throw new Error("Search document map missing");
          return response.json();
        })
        .then((documentMap) => {
          if (
            documentMap.schemaVersion !== 1 ||
            !documentMap.fragments ||
            !Number.isInteger(documentMap.documents)
          ) {
            throw new Error("Unsupported search document map");
          }
          return documentMap;
        })
        .catch((error) => {
          documentMapPromise = undefined;
          throw error;
        });
    }
    return documentMapPromise;
  };

  const updateUrl = (query) => {
    try {
      const url = new URL(location.href);
      if (query) url.searchParams.set("fulltext", query);
      else url.searchParams.delete("fulltext");
      history.replaceState(null, "", url);
    } catch {
      // Search still works when a local preview blocks History API updates.
    }
  };

  const resultLabel = ({ books, papers }) =>
    "書籍 " + books + "冊・論文 " + papers + "篇が該当";

  const bibliographyUrlFor = (slug) =>
    /^[a-z0-9-]+$/.test(slug || "")
      ? "/publications/" + slug + "/"
      : "/";

  const blockIdFor = (subResult) => {
    const anchorId = subResult?.anchor?.id;
    if (/^b\d{5}$/.test(anchorId || "")) return anchorId;
    const hash = String(subResult?.url || "").split("#")[1] || "";
    return /^b\d{5}$/.test(hash) ? hash : null;
  };

  const snippetsFor = (result, pageMap) => {
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

  const snippetItem = (snippet, pdfUrl) => {
    const item = node("li", "fulltext-snippet");
    const locationLine = node("p", "fulltext-snippet__location");
    locationLine.append(node("span", "", snippet.originalPage));
    locationLine.append(node("span", "fulltext-snippet__separator", "｜"));
    const pdfLink = node("a", "", "PDF " + snippet.pdfPage + "頁");
    pdfLink.href = pdfUrl + "#page=" + snippet.pdfPage;
    pdfLink.target = "_blank";
    pdfLink.rel = "noopener";
    pdfLink.setAttribute(
      "aria-label",
      "日本語PDFの" + snippet.pdfPage + "頁を開く",
    );
    locationLine.append(pdfLink);
    const excerpt = node("p", "fulltext-snippet__excerpt");
    excerpt.append(safeExcerpt(snippet.excerpt));
    item.append(locationLine, excerpt);
    return item;
  };

  const resultCard = (result, pageMap) => {
    const snippets = snippetsFor(result, pageMap);
    const article = node("article", "fulltext-result");
    const heading = node("div", "fulltext-result__heading");
    const recordClass =
      result.meta?.recordClass === "major-work" ? "書籍" : "論文";
    const type = node("p", "fulltext-result__type", recordClass);
    const title = node("h3");
    const link = node("a", "", result.meta?.title || "無題");
    link.href = bibliographyUrlFor(result.meta?.slug);
    title.append(link);
    const author = node("p", "fulltext-result__author", result.meta?.author || "");
    const matchCount = node(
      "p",
      "fulltext-result__match-count",
      result.__partialSearch
        ? "一致頁 " + snippets.length + "頁以上"
        : "一致頁 " + snippets.length + "頁",
    );
    heading.append(type, title, author, matchCount);

    const list = node("ol", "fulltext-snippets");
    let visible = 0;
    const actions = node("div", "fulltext-result__actions");
    const more = node("button", "fulltext-more");
    more.type = "button";
    const loadFull = node(
      "button",
      "fulltext-more fulltext-load-all",
      "全一致頁を表示",
    );
    loadFull.type = "button";
    const publication = node("a", "fulltext-publication-link", "書誌・本文へ →");
    publication.href = bibliographyUrlFor(result.meta?.slug);

    const appendSnippets = (amount) => {
      const next = Math.min(visible + amount, snippets.length);
      for (const snippet of snippets.slice(visible, next)) {
        list.append(snippetItem(snippet, result.meta?.pdfUrl || ""));
      }
      visible = next;
      const remaining = snippets.length - visible;
      if (remaining > 0) {
        const batch = Math.min(SNIPPET_BATCH_SIZE, remaining);
        more.textContent =
          "さらに" + batch + "頁表示（残り" + remaining + "頁）";
        more.hidden = false;
      } else {
        more.hidden = true;
      }
    };
    more.addEventListener("click", () => appendSnippets(SNIPPET_BATCH_SIZE));
    if (result.__partialSearch && typeof result.__loadFull === "function") {
      loadFull.addEventListener("click", async () => {
        loadFull.disabled = true;
        loadFull.textContent = "全一致頁を読み込んでいます…";
        try {
          const fullResult = await result.__loadFull();
          article.replaceWith(resultCard(fullResult, pageMap));
        } catch (error) {
          console.error(error);
          loadFull.disabled = false;
          loadFull.textContent = "再度、全一致頁を読み込む";
        }
      });
    } else {
      loadFull.hidden = true;
    }
    appendSnippets(INITIAL_SNIPPET_LIMIT);
    actions.append(more, loadFull, publication);
    article.append(heading, list, actions);
    return article;
  };

  const appendWorkBatch = async (searchId) => {
    const batchSize = renderedWorks
      ? WORK_BATCH_SIZE
      : INITIAL_WORK_BATCH_SIZE;
    const slice = pendingResults.slice(
      renderedWorks,
      renderedWorks + batchSize,
    );
    if (!slice.length) return;
    const batchEnd = renderedWorks + slice.length;
    status.textContent = "検索結果を読み込んでいます…";
    for (let index = 0; index < slice.length; index += RESULT_LOAD_CONCURRENCY) {
      const loading = slice
        .slice(index, index + RESULT_LOAD_CONCURRENCY)
        .map(async (reference) => {
          const result = await reference.data();
          const pageMap =
            result.__pageMap || (await loadPageMap(result.meta.slug));
          return { result, pageMap };
        });
      for (const loaded of loading) {
        const { result, pageMap } = await loaded;
        if (searchId !== activeSearch) return;
        resultList.append(resultCard(result, pageMap));
        renderedWorks += 1;
        status.textContent =
          renderedWorks < batchEnd
            ? "検索結果を読み込んでいます…（" + renderedWorks + "件表示）"
            : "";
      }
    }
    if (renderedWorks < pendingResults.length) {
      const remaining = pendingResults.length - renderedWorks;
      const button = node(
        "button",
        "fulltext-more-works",
        "さらに資料を表示（残り" + remaining + "件）",
      );
      button.type = "button";
      button.addEventListener(
        "click",
        async () => {
          button.remove();
          await appendWorkBatch(searchId);
        },
        { once: true },
      );
      resultList.append(button);
    }
  };

  const ensurePagefind = () => {
    if (!pagefindPromise) {
      const pagefindPath = resolveUrl(
        config.pagefindModule,
        "./pagefind/pagefind.js",
      );
      const pagefindBase = resolveUrl(config.pagefindBase, "./pagefind/");
      pagefindPromise = import(pagefindPath)
        .then(async (module) => {
          // Pagefind 1.5.2 ignores createInstance({ language }) and reads the
          // document language instead. Chrome then re-tokenizes Japanese query
          // strings differently from the generated index. Detect the sole
          // Japanese index through Pagefind's fallback while treating our
          // explicit spaces as authoritative query boundaries.
          const root = document.documentElement;
          const documentLanguage = root.getAttribute("lang");
          let instance;
          try {
            root.setAttribute("lang", "und");
            instance = module.createInstance({
              basePath: pagefindBase,
              exactDiacritics: true,
            });
          } finally {
            if (documentLanguage === null) root.removeAttribute("lang");
            else root.setAttribute("lang", documentLanguage);
          }
          await instance.init();
          return instance;
        })
        .catch((error) => {
          pagefindPromise = undefined;
          throw error;
        });
    }
    return pagefindPromise;
  };

  const groupDocumentResults = (
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
      const mapping = documentMap.fragments[exactReference.id];
      if (!mapping) {
        throw new Error(`Unmapped search document: ${exactReference.id}`);
      }
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
      work.documents.push({
        partIndex,
        exactReference,
        broadReference,
      });
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
          fullDataPromise = (async () => {
            const documents = await loadInBatches(
              work.documents,
              DOCUMENT_LOAD_CONCURRENCY,
              async ({ exactReference, broadReference }) => {
                const broadData = await (
                  broadReference || exactReference
                ).data();
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
              },
            );
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
          })();
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

  const literalPagefindSearch = async (api, query, documentMap) => {
    const candidates = literalCandidateQueries(query);
    const exactSearches = await Promise.all(
      candidates.map(async (candidate) => ({
        candidate,
        result: await api.search('"' + candidate + '"'),
      })),
    );
    const matchedSearches = exactSearches.filter(
      ({ result }) => result.results.length,
    );
    if (matchedSearches.length) {
      const broadSearches = await Promise.all(
        matchedSearches.map(({ candidate }) => api.search(candidate)),
      );
      return groupDocumentResults(
        mergePagefindReferences(
          matchedSearches.flatMap(({ result }) => result.results),
          query,
        ),
        mergePagefindReferences(
          broadSearches.flatMap((result) => result.results),
          query,
        ),
        documentMap,
        query,
      );
    }

    // Compound names can have no stable quoted-token form in Pagefind's
    // Japanese index. Merge every punctuation- and word-boundary candidate,
    // then hydrate and retain only fragments containing the literal query.
    const broadSearches = await Promise.all(
      candidates.map((candidate) => api.search(candidate)),
    );
    const broadReferences = mergePagefindReferences(
      broadSearches.flatMap((result) => result.results),
      query,
    );
    const literalReferences = [];
    for (
      let index = 0;
      index < broadReferences.length;
      index += LITERAL_FILTER_CONCURRENCY
    ) {
      const filtered = await Promise.all(
        broadReferences
          .slice(index, index + LITERAL_FILTER_CONCURRENCY)
          .map(async (reference) => {
            const data = await reference.data();
            return data.sub_results.length ? reference : null;
          }),
      );
      literalReferences.push(...filtered.filter(Boolean));
    }

    return groupDocumentResults(
      literalReferences,
      broadReferences,
      documentMap,
      query,
    );
  };

  const markedExcerpt = (text, tokens) => {
    const lower = text.toLocaleLowerCase("ja");
    const positions = tokens
      .map((token) => lower.indexOf(token))
      .filter((position) => position >= 0);
    const first = positions.length ? Math.min(...positions) : 0;
    const start = Math.max(0, first - 54);
    const end = Math.min(text.length, first + 116);
    const excerpt = text.slice(start, end);
    const expression = new RegExp(
      tokens
        .slice()
        .sort((a, b) => b.length - a.length)
        .map(escapeRegExp)
        .join("|"),
      "giu",
    );
    let result = start > 0 ? "…" : "";
    let previous = 0;
    let match;
    while ((match = expression.exec(excerpt))) {
      result += escapeHtml(excerpt.slice(previous, match.index));
      result += "<mark>" + escapeHtml(match[0]) + "</mark>";
      previous = match.index + match[0].length;
      if (!match[0].length) expression.lastIndex += 1;
    }
    result += escapeHtml(excerpt.slice(previous));
    if (end < text.length) result += "…";
    return result;
  };

  const fallbackSearch = (query) => {
    if (!previewCorpus?.works) return null;
    const tokens = query
      .toLocaleLowerCase("ja")
      .split(/\s+/)
      .filter(Boolean);
    const references = [];
    for (const work of previewCorpus.works) {
      const matches = work.chunks.filter((chunk) => {
        const text = chunk.text.toLocaleLowerCase("ja");
        return tokens.every((token) => text.includes(token));
      });
      if (!matches.length) continue;
      const result = {
        meta: {
          slug: work.slug,
          title: work.title,
          author: work.author,
          recordClass: work.recordClass,
          url: work.url,
          pdfUrl: work.pdfUrl,
        },
        sub_results: matches.map((chunk) => ({
          anchor: { id: chunk.id },
          url: work.url + "#" + chunk.id,
          excerpt: markedExcerpt(chunk.text, tokens),
        })),
        __pageMap: {
          blocks: Object.fromEntries(
            work.chunks.map((chunk, order) => [
              chunk.id,
              [chunk.originalPage, chunk.pdfPage, order],
            ]),
          ),
        },
      };
      references.push({
        score: matches.length,
        data: async () => result,
        recordClass: work.recordClass,
      });
    }
    references.sort((a, b) => b.score - a.score);
    return {
      results: references,
      books: references.filter((item) => item.recordClass === "major-work").length,
      papers: references.filter((item) => item.recordClass === "short-work").length,
    };
  };

  const openResults = (query) => {
    dialogQuery.textContent = "「" + query + "」の検索結果";
    if (!dialog.open) dialog.showModal();
    dialog.querySelector(".fulltext-dialog__body")?.scrollTo(0, 0);
  };

  const search = async () => {
    const query = input.value.trim();
    if (!query) return;
    updateUrl(query);
    openResults(query);
    activeSearch += 1;
    const searchId = activeSearch;
    pendingResults = [];
    renderedWorks = 0;
    resultList.replaceChildren();
    summary.textContent = "検索中…";
    status.textContent = "索引を検索しています…";

    try {
      let result;
      if (
        (config.preferEmbedded || location.protocol === "file:") &&
        previewCorpus
      ) {
        result = fallbackSearch(query);
      } else try {
        const [api, documentMap] = await Promise.all([
          ensurePagefind(),
          ensureDocumentMap(),
        ]);
        // Pagefind's browser worker and build-time tokenizer can disagree on
        // Japanese word boundaries. Search every unchanged boundary variant,
        // then accept only fragments that contain the user's literal NFC text.
        // This preserves voiced kana and removes fuzzy candidates such as
        // 「クリバ」 without trusting Pagefind's diacritic normalization.
        result = await literalPagefindSearch(api, query, documentMap);
      } catch (pagefindError) {
        result = fallbackSearch(query);
        if (!result) throw pagefindError;
      }

      if (searchId !== activeSearch) return;
      summary.textContent = resultLabel(result);
      pendingResults = result.results;
      if (!pendingResults.length) {
        status.textContent =
          "一致する本文はありません。表記を変えて検索してください。";
        return;
      }
      await appendWorkBatch(searchId);
    } catch (error) {
      console.error(error);
      if (searchId !== activeSearch) return;
      summary.textContent = "検索できませんでした。";
      status.textContent = "索引の読み込みに失敗しました。";
    }
  };

  const applyMetadata = (metadata) => {
    if (!scope || !metadata) return;
    scope.textContent =
      (metadata.prototype ? "試作対象：" : "検索対象：") +
      metadata.books +
      "冊・" +
      metadata.papers +
      "篇／本文断片 " +
      metadata.chunks.toLocaleString("ja-JP") +
      "件／索引 " +
      formattedBytes(metadata.pagefindBytes);
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    search();
  });

  const warmSearchBackend = () => {
    if (previewCorpus && config.preferEmbedded) return;
    Promise.all([ensurePagefind(), ensureDocumentMap()]).catch(() => {
      // A transient warm-up failure is retried when the user submits a query.
    });
  };
  input.addEventListener("focus", warmSearchBackend, { once: true });
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(warmSearchBackend, { timeout: 2_000 });
  } else {
    setTimeout(warmSearchBackend, 500);
  }

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () => input.focus({ preventScroll: true }));

  if (previewMetadata) {
    applyMetadata(previewMetadata);
  } else if (scope) {
    fetch(resolveUrl(config.metadataPath, "./search-meta.json"))
      .then((response) => {
        if (!response.ok) throw new Error("Search metadata missing");
        return response.json();
      })
      .then(applyMetadata)
      .catch(() => {
        scope.textContent = "検索索引の構成情報を取得できませんでした。";
      });
  }

  const initialQuery = new URLSearchParams(location.search).get("fulltext") || "";
  input.value = initialQuery;
  if (initialQuery) search();
})();
