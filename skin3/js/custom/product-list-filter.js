// Optional client-side "filtering feel" on product list page.
// Keeps default category navigation if no local matches exist.
(function () {
  function norm(s) {
    return (s || "").toString().replace(/\s+/g, " ").trim();
  }

  function getFilterAnchorFromEventTarget(t) {
    if (!t || !t.closest) return null;
    // Do not depend on .productListPage wrapper for robustness.
    return t.closest(".ec-base-tab.typeMenu .menuCategory.menu > li > a.button");
  }

  function endsWithWord(text, word) {
    var t = norm(text);
    return t.length >= word.length && t.slice(-word.length) === word;
  }

  function keywordFromLabel(label) {
    var t = norm(label);
    // Make the demo categories feel like instant filters.
    if (t.indexOf("잉크젯") !== -1) return "잉크젯";
    if (t.indexOf("a4") !== -1 || t.indexOf("A4") !== -1) return "a4";
    if (t.indexOf("id카드") !== -1 || t.indexOf("ID카드") !== -1) return "id카드";
    return "";
  }

  function getProductNameText(li) {
    var a = li.querySelector(".description .name a");
    return norm(a ? a.textContent : "");
  }

  function setActive(li) {
    var ul = li && li.closest ? li.closest(".menuCategory.menu") : null;
    if (!ul) return;
    // Avoid :scope for wider browser support
    Array.prototype.slice.call(ul.children).forEach(function (x) {
      if (x && x.classList) x.classList.remove("selected");
    });
    li.classList.add("selected");
  }

  function shouldExcludeProduct(categoryLabel, productName) {
    // Apply suffix-based exclusions (Korean):
    // - Category ends with '카드' -> exclude products containing '용지' or '라벨지'
    // - Category label contains '카드' -> exclude products containing '용지' or '라벨지'
    // - Category ends with '인쇄' -> exclude products containing '각인'
    // - Category ends with '각인' -> exclude products containing '인쇄'
    var label = norm(categoryLabel);
    var name = norm(productName);

    if (label.indexOf("카드") !== -1) {
      if (name.indexOf("용지") !== -1) return true;
      if (name.indexOf("라벨지") !== -1) return true;
    }
    if (endsWithWord(label, "카드")) {
      if (name.indexOf("용지") !== -1) return true;
      if (name.indexOf("라벨지") !== -1) return true;
    }
    if (endsWithWord(label, "인쇄")) {
      if (name.indexOf("각인") !== -1) return true;
    }
    if (endsWithWord(label, "각인")) {
      if (name.indexOf("인쇄") !== -1) return true;
    }
    return false;
  }

  function getListItems() {
    // Product list pages can contain multiple .prdList blocks (best/new/normal).
    // Filter all of them so the user always sees an immediate effect.
    var lists = document.querySelectorAll(".productListPage .prdList");
    if (!lists || !lists.length) return null;
    var groups = [];
    for (var i = 0; i < lists.length; i++) {
      var ul = lists[i];
      if (!ul) continue;
      var items = Array.prototype.slice
        .call(ul.children || [])
        .filter(function (el) {
          return el && el.id && el.id.indexOf("anchorBoxId_") === 0;
        });
      if (items.length) groups.push({ list: ul, items: items });
    }
    return groups.length ? { groups: groups } : null;
  }

  function applyFilter(predicate) {
    var data = getListItems();
    if (!data) return { total: 0, shown: 0 };
    var shown = 0;
    var total = 0;
    data.groups.forEach(function (g) {
      total += g.items.length;
      g.items.forEach(function (li) {
        var name = getProductNameText(li);
        var ok = predicate(name);
        li.style.display = ok ? "" : "none";
        if (ok) shown++;
      });
    });
    return { total: total, shown: shown };
  }

  function filterByKeyword(keyword, categoryLabel) {
    return applyFilter(function (name) {
      var ok = !keyword || name.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
      if (ok && shouldExcludeProduct(categoryLabel, name)) ok = false;
      return ok;
    });
  }

  function filterExcludeOnly(categoryLabel) {
    return applyFilter(function (name) {
      return !shouldExcludeProduct(categoryLabel, name);
    });
  }

  function flashFeedback() {
    document.documentElement.classList.add("productListPage__filtered");
    window.setTimeout(function () {
      document.documentElement.classList.remove("productListPage__filtered");
    }, 160);
  }

  function persistSelection(label, keyword) {
    try {
      sessionStorage.setItem("productListPageFilterLabel", label);
      sessionStorage.setItem("productListPageFilterKeyword", keyword);
    } catch (e) {}
  }

  function restoreSelection() {
    var label = "";
    var keyword = "";
    try {
      label = sessionStorage.getItem("productListPageFilterLabel") || "";
      keyword = sessionStorage.getItem("productListPageFilterKeyword") || "";
    } catch (e) {}
    if (!keyword) return;

    var anchors = document.querySelectorAll(".productListPage .menuCategory.menu > li > a.button");
    if (!anchors || !anchors.length) return;
    for (var i = 0; i < anchors.length; i++) {
      var a = anchors[i];
      if (norm(a.textContent) === norm(label)) {
        setActive(a.parentElement);
        // First try keyword filter; if it yields 0, apply exclusion-only.
        var res = filterByKeyword(keyword, label);
        if (res.total > 0 && res.shown === 0) {
          filterExcludeOnly(label);
        }
        return;
      }
    }
  }

  // Capture-phase click handler so links never navigate away.
  document.addEventListener(
    "click",
    function (e) {
      var a = getFilterAnchorFromEventTarget(e.target);
      if (!a) return;

      var kw = keywordFromLabel(a.textContent);
      if (!kw) return; // keep default navigation for non-filter chips

      // Hard block navigation first.
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();

      var label = norm(a.textContent);
      try {
        setActive(a.parentElement);
        persistSelection(label, kw);

        // 1) keyword filter
        var result = filterByKeyword(kw, label);
        // 2) if 0 results, keep page + apply exclusion-only
        if (result.total > 0 && result.shown === 0) {
          filterExcludeOnly(label);
        }
        flashFeedback();
      } catch (err) {
        // Still blocked navigation; do nothing else.
      }
    },
    true
  );

  // Restore selection on reload/back navigation
  window.addEventListener("pageshow", restoreSelection);
  document.addEventListener("DOMContentLoaded", restoreSelection);
})();

