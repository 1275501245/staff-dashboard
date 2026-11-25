// Haidilao line icons (no emoji). HDL_ICON(nameOrKeyword) -> inline SVG string.
(function () {
  const P = {
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.4"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    book: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19"/><path d="M9 7.5h6"/>',
    bookOpen: '<path d="M12 6.5c-1.8-1.4-4.4-2-7.5-2v13c3.1 0 5.7.6 7.5 2 1.8-1.4 4.4-2 7.5-2v-13c-3.1 0-5.7.6-7.5 2z"/><path d="M12 6.5v13"/>',
    box: '<path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z"/><path d="M3.5 7.5 12 12l8.5-4.5M12 12v9"/>',
    sunrise: '<path d="M4 18h16M6.5 18a5.5 5.5 0 0 1 11 0"/><path d="M12 4v4M5 9.5l1.6 1.4M19 9.5l-1.6 1.4"/>',
    moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
    list: '<rect x="4.5" y="3.5" width="15" height="17" rx="3"/><path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4.5"/>',
    swap: '<path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/>',
    sparkle: '<path d="M12 3.5l1.8 4.7 4.7 1.8-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-1.8z"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    store: '<path d="M4 9.5 5.5 4h13L20 9.5"/><path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5.5 11.5V20h13v-8.5M10 20v-4.5h4V20"/>',
    clipboard: '<rect x="5" y="4.5" width="14" height="16" rx="3"/><path d="M9 4.5V3.5h6v1M9 10h6M9 13.5h6M9 17h3.5"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l8.5-8.5M16 7l2.5 2.5M14 9l2 2"/>',
    home: '<path d="M4 10.5 12 4l8 6.5V20H4z"/><path d="M10 20v-5.5h4V20"/>',
    camera: '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3L9.5 4.5h5L16.2 7h2.3A1.5 1.5 0 0 1 20 8.5v9.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z"/><circle cx="12" cy="13" r="3.5"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="9.5" r="1.6"/><path d="M20.5 15.5 15.5 11 6 19.5"/>',
    file: '<path d="M6.5 3h7.5l4.5 4.5V19.5A1.5 1.5 0 0 1 17 21H6.5A1.5 1.5 0 0 1 5 19.5v-15A1.5 1.5 0 0 1 6.5 3z"/><path d="M13.5 3v5h5M8.5 13h7M8.5 16.5h5"/>',
    check: '<circle cx="12" cy="12" r="8.5"/><path d="M8.3 12.3l2.5 2.5 5-5.2"/>',
    receipt: '<path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
    shield: '<path d="M12 3.5 19 6v5.5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
    pot: '<path d="M4 11h16v2.5A6.5 6.5 0 0 1 13.5 20h-3A6.5 6.5 0 0 1 4 13.5z"/><path d="M2.5 11h19M9 7.5c0-1 1-1.5 1-2.5M14 7.5c0-1 1-1.5 1-2.5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    truck: '<path d="M3 6.5h11v10H3zM14 10h4l3 3v3.5h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/>',
    upload: '<path d="M12 15V4.5M7.5 9 12 4.5 16.5 9"/><path d="M4.5 15v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3"/>',
    chart: '<path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
    user: '<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20a7.5 7.5 0 0 1 15 0"/>'
  };
  const RULES = [
    [/site|站点|地址/i, 'pin'], [/operations? rota|rota|排班|班表/i, 'calendar'], [/hour|工时|time/i, 'clock'],
    [/handbook|手册/i, 'book'], [/soup|汤底|hot ?pot/i, 'pot'], [/sop|guide|指南|menu/i, 'bookOpen'],
    [/stocktake|盘点|inventory|库存/i, 'box'], [/opening|开早/i, 'sunrise'], [/closing|收尾/i, 'moon'],
    [/prep|备货/i, 'list'], [/handover|交接/i, 'swap'], [/clean|清洁|蓝卡/i, 'sparkle'],
    [/supplier|供应商/i, 'store'], [/account|账号|账户|key/i, 'key'], [/home|首页/i, 'home'],
    [/upload|上传/i, 'upload'], [/photo|camera|拍照/i, 'camera'], [/pic|图文|image/i, 'image'],
    [/standard|标准|pdf|rule/i, 'file'], [/quality|品质/i, 'check'], [/refund|退款|客诉/i, 'receipt'],
    [/hygiene|food safety|食安|卫生/i, 'shield'], [/order|开货|下单|purchase|receiv|收货/i, 'truck'],
    [/report|日报|数据/i, 'chart'], [/check|检查/i, 'clipboard'], [/staff|员工/i, 'user']
  ];
  window.HDL_ICON = function (key, size) {
    const k = P[key] ? key : ((RULES.find(([re]) => re.test(key || '')) || [, 'clipboard'])[1]);
    const s = size || 20;
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[k]}</svg>`;
  };
})();
