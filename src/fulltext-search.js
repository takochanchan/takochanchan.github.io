(() => {
  "use strict";

  const INITIAL_SNIPPET_LIMIT = 10;
  const SNIPPET_BATCH_SIZE = 20;
  const WORK_BATCH_SIZE = 20;
  const RESULT_LOAD_CONCURRENCY = 2;
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
  let pagefindUnavailable = false;
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
      "一致頁 " + snippets.length + "頁",
    );
    heading.append(type, title, author, matchCount);

    const list = node("ol", "fulltext-snippets");
    let visible = 0;
    const actions = node("div", "fulltext-result__actions");
    const more = node("button", "fulltext-more");
    more.type = "button";
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
    appendSnippets(INITIAL_SNIPPET_LIMIT);
    actions.append(more, publication);
    article.append(heading, list, actions);
    return article;
  };

  const appendWorkBatch = async (searchId) => {
    const slice = pendingResults.slice(
      renderedWorks,
      renderedWorks + WORK_BATCH_SIZE,
    );
    if (!slice.length) return;
    const batchEnd = renderedWorks + slice.length;
    status.textContent = "検索結果を読み込んでいます…";
    for (let index = 0; index < slice.length; index += RESULT_LOAD_CONCURRENCY) {
      const loaded = await Promise.all(
        slice
          .slice(index, index + RESULT_LOAD_CONCURRENCY)
          .map(async (reference) => {
            const result = await reference.data();
            const pageMap =
              result.__pageMap || (await loadPageMap(result.meta.slug));
            return { result, pageMap };
          }),
      );
      if (searchId !== activeSearch) return;
      loaded.forEach(({ result, pageMap }) =>
        resultList.append(resultCard(result, pageMap)),
      );
      renderedWorks += loaded.length;
      status.textContent =
        renderedWorks < batchEnd
          ? "検索結果を読み込んでいます…（" + renderedWorks + "件表示）"
          : "";
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
    if (pagefindUnavailable) {
      return Promise.reject(new Error("Pagefind unavailable"));
    }
    if (!pagefindPromise) {
      const pagefindPath = resolveUrl(
        config.pagefindModule,
        "./pagefind/pagefind.js",
      );
      const pagefindBase = resolveUrl(config.pagefindBase, "./pagefind/");
      pagefindPromise = import(pagefindPath)
        .then(async (module) => {
          const instance = module.createInstance({
            basePath: pagefindBase,
            language: "ja",
          });
          await instance.init();
          return instance;
        })
        .catch((error) => {
          pagefindUnavailable = true;
          pagefindPromise = undefined;
          throw error;
        });
    }
    return pagefindPromise;
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
        const api = await ensurePagefind();
        // Pagefind instances share internal search state. Serialize the three
        // queries so filtered counts cannot race with the result set.
        const all = await api.search(query);
        const books = await api.search(query, {
          filters: { recordClass: "major-work" },
        });
        const papers = await api.search(query, {
          filters: { recordClass: "short-work" },
        });
        result = {
          results: all.results,
          books: books.results.length,
          papers: papers.results.length,
        };
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
