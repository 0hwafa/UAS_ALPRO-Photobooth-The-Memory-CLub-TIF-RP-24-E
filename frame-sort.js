// frame-sort.js (ENHANCED) — Quick Sort + Name Sort, Kind Filter & Kind Sort + Data-Name Sort
window.addEventListener('DOMContentLoaded', function () {
  const frameOptionsList = document.getElementById('frameOptionsList');
  if (!frameOptionsList) return;

  // ============= Quick Sort (generic with comparator) =============
  function quickSort(arr, cmp) {
    if (arr.length <= 1) return arr;
    const pivot = arr[arr.length - 1];
    const left = [];
    const right = [];
    for (let i = 0; i < arr.length - 1; i++) {
      (cmp(arr[i], pivot) <= 0 ? left : right).push(arr[i]);
    }
    return [...quickSort(left, cmp), pivot, ...quickSort(right, cmp)];
  }

  // ============= Move all .frame-item into #frameOptionsList =============
  const frameItems = Array.from(document.querySelectorAll('.frame-item'));
  frameItems.forEach(item => {
    const wrapper = item.parentElement;
    const shouldMoveWrapper =
      wrapper && wrapper !== frameOptionsList && wrapper.childElementCount === 1;
    frameOptionsList.appendChild(shouldMoveWrapper ? wrapper : item);
  });

  // ============= Helpers =============
  const getItemEl = el =>
    el.matches?.('.frame-item') ? el : (el.querySelector?.('.frame-item') || el);

  const getName = el =>
    (el.querySelector?.('.frame-text')?.textContent || '').trim().toLowerCase();

  // NEW: Get data-name attribute with debugging
  const getDataName = el => {
    const item = getItemEl(el);
    const dataName = (item?.dataset?.name || item?.getAttribute?.('data-name') || '').trim().toLowerCase();
    // Fallback to regular name if data-name is empty
    return dataName || getName(el);
  };

  const getKinds = el => {
    const item = getItemEl(el);
    const raw = (item?.dataset?.kind || '').trim().toLowerCase();
    // support comma-separated kinds: data-kind="band,indie"
    return raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : [];
  };

  const getPrimaryKind = el => getKinds(el)[0] || 'uncategorized';

  // re-append nodes to apply new order (preserves existing event listeners)
  function applyOrder(nodes) {
    nodes.forEach(n => frameOptionsList.appendChild(n));
  }

  // ============= Build Kind options dynamically (if #kindFilter exists) =============
  const kindFilter = document.getElementById('kindFilter');
  if (kindFilter) {
    const kindsSet = new Set();
    Array.from(frameOptionsList.children).forEach(el => {
      getKinds(el).forEach(k => kindsSet.add(k));
    });

    // Keep "all", then add kinds that are not yet in the <select>
    const existing = new Set(
      Array.from(kindFilter.options).map(o => o.value.toLowerCase())
    );
    kindsSet.forEach(k => {
      if (!existing.has(k)) {
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = k.charAt(0).toUpperCase() + k.slice(1);
        kindFilter.appendChild(opt);
      }
    });
  }

  // ============= FILTER by kind =============
  function filterByKind(kind) {
    const children = Array.from(frameOptionsList.children);
    const target = (kind || 'all').toLowerCase();
    children.forEach(el => {
      if (target === 'all') {
        el.style.display = '';
      } else {
        const kinds = getKinds(el);
        el.style.display = kinds.includes(target) ? '' : 'none';
      }
    });
  }

  // ============= SORT by name (A–Z / Z–A) using Quick Sort =============
  function sortByName(asc = true) {
    const visible = Array.from(frameOptionsList.children)
      .filter(el => el.style.display !== 'none');

    const sorted = quickSort(visible, (a, b) => {
      const aName = getName(a);
      const bName = getName(b);
      return asc ? aName.localeCompare(bName) : bName.localeCompare(aName);
    });

    applyOrder(sorted);
  }

  // ============= SORT by data-name (A–Z / Z–A) - only sorts VISIBLE items =============
  function sortByDataName(asc = true) {
    const visible = Array.from(frameOptionsList.children)
      .filter(el => el.style.display !== 'none');

    console.log('Items to sort by data-name:', visible.length);
    
    // Debug: log first few data-name values
    visible.slice(0, 5).forEach((el, i) => {
      const item = getItemEl(el);
      console.log(`Item ${i}: data-name="${getDataName(el)}", data-kind="${item?.dataset?.kind}", text="${getName(el)}"`);
    });

    const sorted = quickSort(visible, (a, b) => {
      const aDataName = getDataName(a);
      const bDataName = getDataName(b);
      const cmp = asc ? aDataName.localeCompare(bDataName) : bDataName.localeCompare(aDataName);
      if (cmp !== 0) return cmp;
      // tie-breaker by regular name
      return getName(a).localeCompare(getName(b));
    });

    // Re-append only visible items in new order
    const allItems = Array.from(frameOptionsList.children);
    const hiddenItems = allItems.filter(el => el.style.display === 'none');
    
    // Clear and re-add in order: sorted visible items first, then hidden items
    frameOptionsList.innerHTML = '';
    sorted.forEach(item => frameOptionsList.appendChild(item));
    hiddenItems.forEach(item => frameOptionsList.appendChild(item));
    
    console.log('Data-name sorting complete');
  }



  // ============= Wire buttons (NAME sort) =============
  document.getElementById('sortAZ')?.addEventListener('click', () => {
    sortByName(true);
    localStorage.setItem('frameSortMode', 'nameAZ');
  });

  document.getElementById('sortZA')?.addEventListener('click', () => {
    sortByName(false);
    localStorage.setItem('frameSortMode', 'nameZA');
  });

  // ============= NEW: Wire buttons (DATA-NAME sort) with debugging =============
  document.getElementById('sortDataNameAZ')?.addEventListener('click', () => {
    console.log('Sorting by data-name A-Z');
    sortByDataName(true);
    localStorage.setItem('frameSortMode', 'dataNameAZ');
  });

  document.getElementById('sortDataNameZA')?.addEventListener('click', () => {
    console.log('Sorting by data-name Z-A');
    sortByDataName(false);
    localStorage.setItem('frameSortMode', 'dataNameZA');
  });



  // ============= Kind filter change + persist + keep sort mode =============
  kindFilter?.addEventListener('change', () => {
    const v = kindFilter.value || 'all';
    localStorage.setItem('frameKindFilter', v);
    filterByKind(v);

    // re-apply current sort after filter changes
    const mode = localStorage.getItem('frameSortMode');
    if (mode === 'nameAZ') sortByName(true);
    else if (mode === 'nameZA') sortByName(false);
    else if (mode === 'dataNameAZ') sortByDataName(true);
    else if (mode === 'dataNameZA') sortByDataName(false);
  });

  // ============= Initial state from localStorage =============
  const savedKind = localStorage.getItem('frameKindFilter') || 'all';
  if (kindFilter) kindFilter.value = savedKind;
  filterByKind(savedKind);

  const savedSort = localStorage.getItem('frameSortMode');
  if (savedSort === 'nameAZ') sortByName(true);
  else if (savedSort === 'nameZA') sortByName(false);
  else if (savedSort === 'dataNameAZ') sortByDataName(true);
  else if (savedSort === 'dataNameZA') sortByDataName(false);
});
