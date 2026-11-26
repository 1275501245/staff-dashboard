// Order panel for suppliers page — bilingual, stock-aware, text or Excel output.
// Reads: Suppliers (OrderMethod, SupplierCN), SupplierSchedule (sites), SupplierSites (address),
//        Products (NameEN/NameCN/Unit/SKU), Stocktake (latest count per site+product).
(function () {
  const HIDE_SITE = /tower\s*bridge/i;
  const SHORT = { 'Shoreditch': 'SD', 'Brent Cross': 'BC', 'Battersea': 'BT' };
  const XLSX_SRC = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let D = null;          // shared data
  let S = null;          // current order state

  function parseGDate(v) {
    if (!v) return null;
    const m = String(v).match(/Date\((\d+),(\d+),(\d+)/);
    if (m) return new Date(+m[1], +m[2], +m[3]);
    const d = new Date(v);
    return isNaN(d) ? null : d;
  }
  const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const nice = s => { const d = new Date(s + 'T00:00'); return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
  const ddmm = d => `${d.getDate()}/${d.getMonth() + 1}`;
  const pName = p => p.NameEN || p.MyName;
  const pCN = p => p.NameCN || '';
  // Chinese name without the spec (spec already shown in English name)
  const cnShort = p => { const en = pName(p), cn = pCN(p); const sp = cn.split(' ').slice(1).join(' '); return sp && en.endsWith(sp) ? cn.split(' ')[0] : cn; };
  const num = v => { const n = parseFloat(String(v).replace(/[^\d.]/g, '')); return isNaN(n) ? 0 : n; };

  function store(key, val) { try { if (val === undefined) return JSON.parse(localStorage.getItem(key) || 'null'); localStorage.setItem(key, JSON.stringify(val)); } catch (e) { return null; } }

  window.HDL_ORDER = {
    init(data) {
      D = data;
      // latest stocktake per site|product
      D.stock = {};
      (data.stocktake || []).forEach(r => {
        const d = parseGDate(r.Date); if (!d || !r.Product) return;
        const k = r.Site + '|' + r.Product;
        if (!D.stock[k] || D.stock[k].date < d) D.stock[k] = { date: d, qty: r.Quantity };
      });
      D.addr = {};
      (data.supplierSites || []).forEach(r => { D.addr[r.SupplierKey + '|' + r.Site] = { name: r.SupplierSiteName || r.Site, address: r.Address || '' }; });
      (data.sites || []).forEach(r => { if (!D.addr['*|' + r.Site]) D.addr['*|' + r.Site] = { name: r.Site, address: r.Address || '' }; });
      document.body.insertAdjacentHTML('beforeend', `<div class="op" id="op" aria-hidden="true"></div><div class="op-toast" id="op-toast"></div>`);
    },
    open(supplier) {
      const sup = D.suppliers.find(s => s.SupplierName === supplier); if (!sup) return;
      const sites = [...new Set(D.schedule.filter(r => r.SupplierName === supplier).map(r => r.Site).filter(s => s && !HIDE_SITE.test(s)))];
      const prods = D.products.filter(p => p.SupplierName === supplier && p.MyName);
      const saved = store('hdl-order-' + supplier) || {};
      S = { sup, sites, prods, site: sites[0], date: saved.date || iso(new Date()), qty: saved.qty || {} };
      render();
      const op = document.getElementById('op'); op.classList.add('on'); op.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  };

  function close() {
    const op = document.getElementById('op'); op.classList.remove('on'); op.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function save() { store('hdl-order-' + S.sup.SupplierName, { date: S.date, qty: S.qty }); }
  function q(site, name) { return (S.qty[site] || {})[name] || ''; }
  function setQ(site, name, v) {
    S.qty[site] = S.qty[site] || {};
    if (!v || num(v) === 0) delete S.qty[site][name]; else S.qty[site][name] = String(v);
    save();
  }
  function siteCount(site) { return Object.keys(S.qty[site] || {}).length; }
  function addrOf(site) { return D.addr[S.sup.SupplierName + '|' + site] || D.addr['*|' + site] || { name: site, address: '' }; }
  function toast(m) { const t = document.getElementById('op-toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 1800); }

  function stockHTML(site, p) {
    const s = D.stock[site + '|' + p.MyName];
    if (!s) return `<span class="st none">No count · 无盘点</span>`;
    const age = Math.floor((new Date().setHours(0, 0, 0, 0) - s.date) / 864e5);
    return `<span class="st${age > 2 ? ' old' : ''}">Stock 库存 <b>${esc(s.qty)}</b> ${esc(p.Unit || '')} · ${ddmm(s.date)}</span>`;
  }

  function render() {
    const cn = S.sup.SupplierCN ? ' ' + S.sup.SupplierCN : '';
    const isExcel = (S.sup.OrderMethod || 'Text') === 'Excel';
    const tabs = S.sites.map(s => `<button class="op-tab${s === S.site ? ' on' : ''}" data-site="${esc(s)}">${esc(SHORT[s] || s)}<small>${esc(s)}</small>${siteCount(s) ? `<i>${siteCount(s)}</i>` : ''}</button>`).join('');
    const a = addrOf(S.site);
    const rows = S.prods.map(p => `
      <div class="op-row">
        <div class="op-name"><b>${esc(pName(p))}</b>${pCN(p) ? `<span>${esc(pCN(p))}</span>` : ''}${stockHTML(S.site, p)}</div>
        <div class="op-step">
          <button data-d="-1" data-p="${esc(p.MyName)}" aria-label="minus">−</button>
          <input inputmode="decimal" value="${esc(q(S.site, p.MyName))}" placeholder="0" data-p="${esc(p.MyName)}">
          <button data-d="1" data-p="${esc(p.MyName)}" aria-label="plus">+</button>
          <em>${esc(p.Unit || '')}</em>
        </div>
      </div>`).join('');
    const total = S.sites.reduce((t, s) => t + siteCount(s), 0);
    document.getElementById('op').innerHTML = `
      <div class="op-bar">
        <button class="op-x" aria-label="Close">‹</button>
        <div class="op-t">${esc(S.sup.SupplierName)}${esc(cn)}<small>Order 开货 · ${isExcel ? 'Excel file 表格' : 'Message 文字'}</small></div>
      </div>
      <div class="op-top">
        <label class="op-date">Order date 开货日期<input type="date" value="${S.date}"></label>
        <div class="op-tabs">${tabs}</div>
        <div class="op-addr">Deliver to 送货：<b>${esc(a.name)}</b> ${esc(a.address)}</div>
      </div>
      <div class="op-list">${rows || '<div class="op-empty">No products 暂无产品</div>'}</div>
      <div class="op-foot">
        <button class="op-clear">Clear 清空</button>
        <button class="op-go"${total ? '' : ' disabled'}>${isExcel ? 'Export Excel 导出表格' : 'Send 发送'}${total ? ` · ${total}` : ''}</button>
      </div>`;
  }

  function refreshFoot() {
    const total = S.sites.reduce((t, s) => t + siteCount(s), 0);
    const isExcel = (S.sup.OrderMethod || 'Text') === 'Excel';
    const b = document.querySelector('.op-go');
    b.disabled = !total; b.textContent = (isExcel ? 'Export Excel 导出表格' : 'Send 发送') + (total ? ` · ${total}` : '');
    document.querySelectorAll('.op-tab').forEach(t => {
      const n = siteCount(t.dataset.site); let i = t.querySelector('i');
      if (n) { if (!i) { i = document.createElement('i'); t.appendChild(i); } i.textContent = n; } else if (i) i.remove();
    });
  }

  // ---------- outputs ----------
  function orderedSites() { return S.sites.filter(s => siteCount(s)); }
  function supTitle() { return S.sup.SupplierName + (S.sup.SupplierCN ? ' ' + S.sup.SupplierCN : ''); }

  function buildText() {
    const L = [`${supTitle()} — Order 开货单`, `Date 日期: ${nice(S.date)}`, ''];
    orderedSites().forEach(site => {
      const a = addrOf(site);
      L.push(`【${a.name}】${a.address}`);
      let i = 1;
      S.prods.forEach(p => {
        const v = q(site, p.MyName); if (!v) return;
        L.push(`${i++}. ${pName(p)}${cnShort(p) ? ' ' + cnShort(p) : ''} × ${v} ${p.Unit || ''}`.trim());
      });
      L.push('');
    });
    L.push('Thank you 谢谢 — HDL Delivery Kitchen 海底捞外卖');
    return L.join('\n');
  }

  async function sendText() {
    const text = buildText();
    try {
      if (navigator.share) { await navigator.share({ text }); toast('Sent 已发送'); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(text); toast('Copied, paste into WhatsApp 已复制，粘贴到聊天'); }
    catch (e) { prompt('Copy 复制', text); }
  }

  function loadXLSX() {
    if (window.XLSX) return Promise.resolve();
    return new Promise((res, rej) => { const s = document.createElement('script'); s.src = XLSX_SRC; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
  }

  async function sendExcel() {
    try { await loadXLSX(); } catch (e) { toast('Excel tool failed to load 表格工具加载失败'); return; }
    const sites = orderedSites();
    const aoa = [[`${supTitle()} — Order 开货单`], ['Order date 开货日期', nice(S.date)], []];
    sites.forEach(site => { const a = addrOf(site); aoa.push([`Deliver to 送货 · ${a.name}`, a.address]); });
    aoa.push([]);
    const head = ['SKU 货号', 'Product 产品', '中文名称', 'Unit 单位', ...sites.map(s => addrOf(s).name), 'Total 合计'];
    aoa.push(head);
    S.prods.forEach(p => {
      const vals = sites.map(s => { const v = q(s, p.MyName); return v ? num(v) : ''; });
      if (!vals.some(v => v !== '')) return;
      aoa.push([p.SKU || '', pName(p), cnShort(p), p.Unit || '', ...vals, vals.reduce((t, v) => t + (v || 0), 0)]);
    });
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{ wch: 12 }, { wch: 40 }, { wch: 22 }, { wch: 10 }, ...sites.map(() => ({ wch: 14 })), { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, S.date);
    const fname = `${supTitle()} - Order ${S.date}.xlsx`;
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const file = new File([buf], fname, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: fname }); toast('Sent 已发送'); return; }
    } catch (e) { if (e && e.name === 'AbortError') return; }
    XLSX.writeFile(wb, fname); toast('Downloaded 已下载');
  }

  // ---------- events ----------
  document.addEventListener('click', e => {
    const op = e.target.closest('#op'); if (!op || !S) return;
    if (e.target.closest('.op-x')) return close();
    const tab = e.target.closest('.op-tab'); if (tab) { S.site = tab.dataset.site; render(); return; }
    const st = e.target.closest('.op-step button');
    if (st) {
      const name = st.dataset.p; const cur = num(q(S.site, name)); const nv = Math.max(0, cur + Number(st.dataset.d));
      setQ(S.site, name, nv ? String(nv) : ''); st.parentElement.querySelector('input').value = nv || ''; refreshFoot(); return;
    }
    if (e.target.closest('.op-clear')) { if (confirm('Clear all quantities? 清空所有数量？')) { S.qty = {}; save(); render(); } return; }
    if (e.target.closest('.op-go')) { ((S.sup.OrderMethod || 'Text') === 'Excel' ? sendExcel : sendText)(); }
  });
  document.addEventListener('input', e => {
    if (!S || !e.target.closest('#op')) return;
    if (e.target.matches('.op-step input')) { setQ(S.site, e.target.dataset.p, e.target.value.replace(/[^\d.]/g, '')); refreshFoot(); }
    if (e.target.matches('.op-date input')) { S.date = e.target.value; save(); }
  });
})();
