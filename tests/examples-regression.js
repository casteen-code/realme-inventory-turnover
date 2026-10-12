'use strict';

// Read the exact public CSV downloads with the same bundled reader used in the browser.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const core = require('../sku-core.js');
const XLSX = require('../vendor/xlsx.full.min.js');
const nodes = new Map();
const document = {
  getElementById(id) {
    if (!nodes.has(id)) nodes.set(id, { textContent: '', innerHTML: '', style: {}, classList: { toggle() {}, remove() {} } });
    return nodes.get(id);
  },
  querySelectorAll() { return []; }
};
const source = fs.readFileSync(path.join(__dirname, '../inventory-turnover.js'), 'utf8');
const marker = '\n  init();\n';
assert.ok(source.includes(marker));
const sandbox = { window: { RealmeSkuCore: core }, document, structuredClone, crypto: require('node:crypto').webcrypto };
vm.runInNewContext(source.replace(marker, '\n  globalThis.examplesTest = { app, sheetInfo, rawSummary, stocksFromInputs, salesFromInputs, matchSales, groupRows };\n'), sandbox);
const api = sandbox.examplesTest;
const fixtures = { mks: 'stock-mks.csv', pnk: 'stock-pnk.csv', bali: 'stock-bali.csv', shopee: 'sales-shopee.csv', tiktok: 'sales-tiktok.csv' };
for (const [slot, file] of Object.entries(fixtures)) {
  const book = XLSX.read(fs.readFileSync(path.join(__dirname, '../examples', file)), { type: 'buffer' });
  const matrix = XLSX.utils.sheet_to_json(book.Sheets[book.SheetNames[0]], { header: 1, defval: '', raw: false });
  const type = ['mks', 'pnk', 'bali'].includes(slot) ? 'stock' : slot;
  const sheet = api.sheetInfo(file, matrix, type);
  api.app.profiles[slot] = { sheets: [sheet], chosenName: sheet.name, fileName: file };
  assert.equal(api.rawSummary(slot).valid, true, `${file}: actual CSV headers must be recognized`);
}
const stocks = api.stocksFromInputs();
const sales = api.salesFromInputs();
assert.equal(stocks.length, 9, 'Stock totals are not extra products');
assert.equal(stocks.reduce((sum, row) => sum + row.qty, 0), 85);
assert.equal(sales.reduce((sum, row) => sum + row.qty, 0), 31);
assert.equal(stocks.filter(row => core.stockSkuProblems(row.sku).length).length, 0);
assert.equal(api.matchSales(stocks, sales).length, 0, 'Every fabricated sale must match automatically');
for (const view of ['model', 'sku']) {
  const rows = api.groupRows(stocks, sales, view, 'all');
  assert.equal(rows.length, 3);
  const expected = { C100i: [30, 10, 21], P4x: [40, 14, 20], 'Note 80': [15, 7, 15] };
  for (const row of rows) {
    assert.deepEqual([row.stock, row.sales, row.turnover], expected[row.name]);
    assert.equal(Object.values(row.byStore).reduce((sum, quantity) => sum + quantity, 0), row.sales);
  }
}
for (const [scope, expectedStock, expectedSales] of [['bali', 35, 18], ['pnk', 20, 3], ['mks', 30, 10]]) {
  const rows = api.groupRows(stocks, sales, 'model', scope);
  assert.equal(rows.reduce((sum, row) => sum + row.stock, 0), expectedStock, scope);
  assert.equal(rows.reduce((sum, row) => sum + row.sales, 0), expectedSales, scope);
}
console.log('Example regression passed: 5 public synthetic CSV files, 85 stock, 31 weekly sales, 3 matched SKUs and exact warehouse/store mapping');
