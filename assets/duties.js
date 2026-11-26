// Weekly Duties 本周站位 — opening hygiene check + stocktake deadlines, built from the rota + SupplierSchedule.
(function () {
  const DOW_KEY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DOW_CN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const HIDE = /tower\s*bridge/i;
  const DDL = '16:00';
  const ORDER = ['shoreditch', 'brentcross', 'battersea'];
  const SHORT = { shoreditch: 'SD', brentcross: 'BC', battersea: 'BT' };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = x => String(x || '').toLowerCase().replace(/\s+/g, '');
  function parseShift(v) {
    const m = String(v || '').match(/(\d{1,2})(\d{2})\s*-\s*(\d{1,2})(\d{2})/);
    if (!m) return null;
    const s = +m[1] + +m[2] / 60; let e = +m[3] + +m[4] / 60; if (e <= s) e += 24;
    return { s, e };
  }

  let SCHED = null, SUPCN = {};
  window.HDL_DUTIES = {
    async load(fetchCSV) {
      if (SCHED) return;
      try {
        const [sch, sup] = await Promise.all([fetchCSV('SupplierSchedule'), fetchCSV('Suppliers')]);
        const h = sch[0]; SCHED = sch.slice(1).map(r => Object.fromEntries(h.map((k, i) => [k, r[i] || ''])));
        const hs = sup[0]; sup.slice(1).forEach(r => { const o = Object.fromEntries(hs.map((k, i) => [k, r[i] || ''])); if (o.SupplierName) SUPCN[o.SupplierName] = o.SupplierCN || ''; });
      } catch (e) { SCHED = []; }
    },

    // staffMap: name -> {days[], daySite[], dayOnline[]}; dates: ISO per day index
    render(staffMap, dates, todayIdx) {
      const host = document.getElementById('duties');
      if (!host) return;
      host.style.display = 'block';

      // Build week: per day, per site -> {opener, stk:[suppliers], monthly}
      const siteSet = new Set();
      const week = dates.map((iso, i) => {
        const d = new Date(iso + 'T00:00'); const wd = d.getDay();
        const monthEnd = d.getDate() === new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
        const ppl = {};
        staffMap.forEach((rec, name) => {
          const v = rec.days[i]; const site = rec.daySite[i];
          if (!v || !site || rec.dayOnline[i] || HIDE.test(site)) return;
          const k = norm(site); siteSet.add(k);
          (ppl[k] = ppl[k] || []).push({ name, sh: parseShift(v) });
        });
        const sites = {};
        Object.keys(ppl).forEach(k => {
          const list = ppl[k].sort((a, b) => (a.sh ? a.sh.s : 99) - (b.sh ? b.sh.s : 99));
          const stk = (SCHED || []).filter(r => norm(r.Site) === k && (r.StocktakeDay || '').split(/[,\s]+/).includes(DOW_KEY[wd])).map(r => r.SupplierName);
          sites[k] = { opener: list[0].name, stk, monthly: monthEnd, ppl: list };
        });
        return { d, wd, monthEnd, today: i === todayIdx, sites };
      });
      const siteKeys = [...siteSet].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
      const siteLabel = k => ({ shoreditch: 'Shoreditch', brentcross: 'Brent Cross', battersea: 'Battersea' }[k] || k);
      const ALL = (SCHED || []).length ? new Set(SCHED.map(r => r.SupplierName)).size : 0;
      const many = arr => arr.length > 4;
      const enList = arr => many(arr) ? `All suppliers (${arr.length})` : arr.join(', ');
      const cnList = arr => many(arr) ? '全部供应商' : arr.map(s => SUPCN[s] || s).join('、');

      const hm = h => { const x = ((h % 24) + 24) % 24; return `${String(Math.floor(x)).padStart(2, '0')}:${String(Math.round((x % 1) * 60)).padStart(2, '0')}`; };
      const stkEN = c => c.monthly ? 'Monthly · all' : enList(c.stk);
      const stkCN = c => c.monthly ? '月度 · 全部' : cnList(c.stk);
      const dayLbl = w => `${DOW_KEY[w.wd]} ${DOW_CN[w.wd]}<small>${w.d.getDate()}/${w.d.getMonth() + 1}</small>`;

      // 2) Daily view
      const state = { idx: todayIdx >= 0 ? todayIdx : 0 };
      const drawDay = () => {
        const w = week[state.idx];
        const cards = siteKeys.filter(k => w.sites[k]).map(k => { const c = w.sites[k]; return `
          <div class="dd-site">
            <div class="dd-h"><span class="dot ${k}"></span>${siteLabel(k)}</div>
            <div class="dd-row"><span class="dd-lb g">Opening 开早</span><div class="dd-tx"><b>Menu on/off check</b><small>上下架检查</small><b class="dd-b2">Food safety check</b><small>食安检查</small></div></div>
            ${(c.monthly || c.stk.length) ? `<div class="dd-row"><span class="dd-lb r">Stocktake 盘点</span><div class="dd-tx"><b>${esc(stkEN(c))}</b><small>${esc(stkCN(c))}</small></div><em>DDL ${DDL}</em></div>` : `<div class="dd-row"><span class="dd-lb r">Stocktake 盘点</span><div class="dd-tx dd-none"><b>None today</b><small>今日暂无</small></div></div>`}
          </div>`; }).join('') || '<div class="dw-off" style="padding:16px;text-align:center">No shifts 无排班</div>';
        host.querySelector('.dd-days').innerHTML = week.map((x, i) => `<button class="dd-day${i === state.idx ? ' on' : ''}" data-i="${i}">${DOW_KEY[x.wd]}<small>${x.d.getDate()}/${x.d.getMonth() + 1}</small></button>`).join('');
        host.querySelector('.dd-grid').innerHTML = cards;
        host.querySelectorAll('.dd-day').forEach(b => b.onclick = () => { state.idx = +b.dataset.i; drawDay(); });
      };

      host.innerHTML = `
        <div class="sec-title">Daily Tasks · 每日任务</div>
        <div class="dd-days"></div>
        <div class="dd-grid"></div>`;
      drawDay();
    }
  };
})();
