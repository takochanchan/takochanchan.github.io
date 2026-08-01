(() => {
  document.querySelectorAll("[data-pdf-reader]").forEach((reader) => {
    const button = reader.querySelector("[data-pdf-load]");
    const frame = reader.querySelector("[data-pdf-frame]");
    const placeholder = reader.querySelector("[data-pdf-placeholder]");
    if (!button || !frame || !placeholder) return;

    button.addEventListener(
      "click",
      () => {
        frame.src = button.dataset.pdfSrc;
        frame.hidden = false;
        placeholder.hidden = true;
      },
      { once: true },
    );
  });

  const root = document.querySelector("[data-archive]");
  if (!root || !Array.isArray(window.ARCHIVE_PUBLICATIONS)) return;

  const publications = window.ARCHIVE_PUBLICATIONS;
  const pageSizeOptions = new Set(["6", "12", "24", "all"]);
  const defaultPageSize = "12";
  const pageSizeStorageKey = "takochan-catalogue-page-size";
  const paginationMedia = window.matchMedia("(max-width: 680px)");
  const storedPageSize = (() => {
    try {
      return localStorage.getItem(pageSizeStorageKey);
    } catch {
      return null;
    }
  })();
  const controls = {
    googleForm: document.querySelector("#google-site-search"),
    googleInput: document.querySelector("#google-search-query"),
    googleValue: document.querySelector("#google-search-value"),
    search: document.querySelector("#archive-search"),
    type: document.querySelector("#filter-type"),
    region: document.querySelector("#filter-region"),
    language: document.querySelector("#filter-language"),
    era: document.querySelector("#filter-era"),
    sort: document.querySelector("#archive-sort"),
    perPage: document.querySelector("#archive-per-page"),
    reset: document.querySelector("#archive-reset"),
    results: document.querySelector("#archive-results"),
    pagination: document.querySelector("#archive-pagination"),
    active: document.querySelector("#active-filters"),
  };

  const params = new URLSearchParams(location.search);
  const requestedPageSize = params.get("perPage") || storedPageSize;
  const state = {
    q: params.get("q") || "",
    type: params.get("type") || "",
    region: params.get("region") || "",
    language: params.get("language") || "",
    era: params.get("era") || "",
    sort: params.get("sort") || "year-asc",
    perPage: pageSizeOptions.has(requestedPageSize)
      ? requestedPageSize
      : defaultPageSize,
    page: Math.max(1, Number(params.get("page")) || 1),
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const eraFor = (year) => {
    if (year < 1700) return "17世紀";
    if (year < 1800) return "18世紀";
    if (year < 1850) return "19世紀前半";
    if (year < 1900) return "19世紀後半";
    return "20世紀初頭";
  };

  const normalized = (item) =>
    [
      item.title,
      item.originalTitle,
      item.subtitle,
      item.author,
      item.description,
      item.originalPublication,
      ...item.types,
      ...item.regions,
      ...item.languages,
      ...item.tags,
    ]
      .join(" ")
      .toLocaleLowerCase("ja");

  publications.forEach((item) => {
    item.__search = normalized(item);
  });

  const syncInputs = () => {
    controls.search.value = state.q;
    controls.type.value = state.type;
    controls.region.value = state.region;
    controls.language.value = state.language;
    controls.era.value = state.era;
    controls.sort.value = state.sort;
    controls.perPage.value = state.perPage;
  };

  const updateUrl = () => {
    const next = new URLSearchParams();
    if (state.q) next.set("q", state.q);
    if (state.type) next.set("type", state.type);
    if (state.region) next.set("region", state.region);
    if (state.language) next.set("language", state.language);
    if (state.era) next.set("era", state.era);
    if (state.sort !== "year-asc") next.set("sort", state.sort);
    if (state.perPage !== defaultPageSize) next.set("perPage", state.perPage);
    if (state.page > 1) next.set("page", String(state.page));
    const query = next.toString();
    const target = query ? `?${query}` : location.pathname;
    history.replaceState(null, "", `${target}${location.hash}`);
  };

  const card = (item) => `
    <article class="record-card">
      <a class="record-card__cover" href="/publications/${escapeHtml(item.slug)}/">
        <img src="/${escapeHtml(item.cover)}" width="794" height="1123" loading="lazy"
          alt="${escapeHtml(item.title)}の表紙">
        <span>${escapeHtml(String(item.year))}</span>
      </a>
      <div class="record-card__body">
        <p class="record-card__series">${escapeHtml(item.series)}</p>
        <h3><a href="/publications/${escapeHtml(item.slug)}/">${escapeHtml(item.title)}</a></h3>
        <p class="record-card__original-title"><span>原題</span><cite>${escapeHtml(item.originalTitle)}</cite></p>
        <p class="record-card__author">${escapeHtml(item.author)}</p>
        <p class="record-card__subtitle">${escapeHtml(item.subtitle)}</p>
        <div class="tag-list">
          ${[item.types[0], item.regions[0], item.languages[0]]
            .map((tag) => `<span>${escapeHtml(tag)}</span>`)
            .join("")}
        </div>
        <dl class="record-card__facts">
          <div><dt>原刊</dt><dd>${escapeHtml(item.originalPublication)}</dd></div>
          <div><dt>構成</dt><dd>${escapeHtml(item.extent)}</dd></div>
        </dl>
        <div class="record-card__actions">
          <a class="button button--primary" href="/publications/${escapeHtml(item.slug)}/">書誌・本文</a>
          <a class="button button--quiet" href="${escapeHtml(item.pdfUrl)}" download>PDF保存（${escapeHtml(item.pdfSize)}）</a>
          <a class="button button--quiet" href="${escapeHtml(item.epubUrl)}"
            type="application/epub+zip" download>EPUB保存（${escapeHtml(item.epubSize)}）</a>
        </div>
      </div>
    </article>`;

  const renderActive = () => {
    const labels = [
      state.type,
      state.region,
      state.language,
      state.era,
      state.q ? `検索: ${state.q}` : "",
    ].filter(Boolean);
    controls.active.innerHTML = labels.length
      ? labels.map((label) => `<span>${escapeHtml(label)}</span>`).join("")
      : "<span class=\"active-filters__empty\">条件指定なし</span>";
  };

  const paginationItems = (pages) => {
    const visible = new Set([1, pages, state.page]);
    const siblingCount = paginationMedia.matches ? 0 : 1;

    for (let offset = 1; offset <= siblingCount; offset += 1) {
      visible.add(state.page - offset);
      visible.add(state.page + offset);
    }
    if (paginationMedia.matches && pages > 1) {
      if (state.page === 1) visible.add(2);
      if (state.page === pages) visible.add(pages - 1);
    }

    const ordered = [...visible]
      .filter((page) => page >= 1 && page <= pages)
      .sort((a, b) => a - b);
    const items = [];
    ordered.forEach((page, index) => {
      const previous = ordered[index - 1];
      if (index > 0 && page - previous === 2) {
        items.push(previous + 1);
      } else if (index > 0 && page - previous > 2) {
        items.push("ellipsis");
      }
      items.push(page);
    });
    return items;
  };

  const renderPagination = (pages) => {
    if (pages <= 1) {
      controls.pagination.innerHTML = "";
      return;
    }

    const previousPage = Math.max(1, state.page - 1);
    const nextPage = Math.min(pages, state.page + 1);
    const pageButtons = paginationItems(pages)
      .map((item) =>
        item === "ellipsis"
          ? '<span class="pagination__ellipsis" aria-hidden="true">…</span>'
          : `<button type="button" data-page="${item}" aria-label="${item}ページ目" ${
              item === state.page ? 'aria-current="page"' : ""
            }>${item}</button>`,
      )
      .join("");

    controls.pagination.innerHTML = `
      <button class="pagination__nav" type="button" data-page="${previousPage}"
        aria-label="前のページ" ${state.page === 1 ? "disabled" : ""}>
        <span aria-hidden="true">‹</span><span class="pagination__nav-label">前へ</span>
      </button>
      ${pageButtons}
      <button class="pagination__nav" type="button" data-page="${nextPage}"
        aria-label="次のページ" ${state.page === pages ? "disabled" : ""}>
        <span class="pagination__nav-label">次へ</span><span aria-hidden="true">›</span>
      </button>`;

    controls.pagination.querySelectorAll("[data-page]").forEach((button) => {
      button.addEventListener("click", () => {
        state.page = Number(button.dataset.page);
        render();
        document.querySelector("#publications").scrollIntoView({ behavior: "smooth" });
      });
    });
  };

  const render = () => {
    const query = state.q.trim().toLocaleLowerCase("ja");
    let filtered = publications.filter(
      (item) =>
        (!query || item.__search.includes(query)) &&
        (!state.type || item.types.includes(state.type)) &&
        (!state.region || item.regions.includes(state.region)) &&
        (!state.language || item.languages.includes(state.language)) &&
        (!state.era || eraFor(item.year) === state.era),
    );

    filtered = [...filtered].sort((a, b) => {
      if (state.sort === "year-desc") return b.year - a.year;
      if (state.sort === "title") return a.title.localeCompare(b.title, "ja");
      if (state.sort === "author") return a.author.localeCompare(b.author, "ja");
      return a.year - b.year;
    });

    const perPage =
      state.perPage === "all"
        ? Math.max(filtered.length, 1)
        : Number(state.perPage);
    const pages = Math.max(1, Math.ceil(filtered.length / perPage));
    state.page = Math.min(state.page, pages);
    const start = (state.page - 1) * perPage;
    const visible = filtered.slice(start, start + perPage);

    root.innerHTML = visible.length
      ? visible.map(card).join("")
      : `<div class="archive-empty"><strong>該当する刊本・大部論文はありません。</strong><p>検索語または絞り込み条件を変更してください。</p></div>`;
    controls.results.textContent = `${filtered.length}件中 ${
      filtered.length ? start + 1 : 0
    }–${Math.min(start + perPage, filtered.length)}件`;
    renderPagination(pages);
    renderActive();
    updateUrl();
  };

  controls.googleForm.addEventListener("submit", () => {
    const query = controls.googleInput.value.trim();
    controls.googleValue.value =
      `(site:${location.hostname} OR ` +
      "site:github.com/takochanchan/takochanchan.github.io/releases) " +
      query;
  });

  let searchTimer;
  controls.search.addEventListener("input", () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.q = controls.search.value;
      state.page = 1;
      render();
    }, 120);
  });

  ["type", "region", "language", "era", "sort"].forEach((key) => {
    controls[key].addEventListener("change", () => {
      state[key] = controls[key].value;
      state.page = 1;
      render();
    });
  });

  controls.perPage.addEventListener("change", () => {
    state.perPage = controls.perPage.value;
    state.page = 1;
    try {
      localStorage.setItem(pageSizeStorageKey, state.perPage);
    } catch {
      // The URL still preserves the selection when storage is unavailable.
    }
    render();
  });

  controls.reset.addEventListener("click", () => {
    Object.assign(state, {
      q: "",
      type: "",
      region: "",
      language: "",
      era: "",
      sort: "year-asc",
      page: 1,
    });
    syncInputs();
    render();
    controls.search.focus();
  });

  if (typeof paginationMedia.addEventListener === "function") {
    paginationMedia.addEventListener("change", render);
  } else if (typeof paginationMedia.addListener === "function") {
    paginationMedia.addListener(render);
  }

  syncInputs();
  render();
})();
