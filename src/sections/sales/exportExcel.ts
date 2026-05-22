import ExcelJS from 'exceljs';
import type { Transaction, Product } from '../../lib/db';
import type { TopProductRow, CategoryPoint } from './SalesSection';

interface ExportInput {
  storeName: string;
  rangeLabel: string;
  transactions: Transaction[];
  products: Product[];
  topProducts: TopProductRow[];
  categoryData: CategoryPoint[];
}

const COLOR = {
  indigo:      'FF6366F1',
  indigoDark:  'FF4F46E5',
  violet:      'FF8B5CF6',
  emerald:     'FF10B981',
  emeraldSoft: 'FFD1FAE5',
  amber:       'FFF59E0B',
  amberSoft:   'FFFEF3C7',
  rose:        'FFF43F5E',
  roseSoft:    'FFFFE4E6',
  slate800:    'FF1E293B',
  slate600:    'FF475569',
  slate400:    'FF94A3B8',
  slate100:    'FFF1F5F9',
  slate50:     'FFF8FAFC',
  white:       'FFFFFFFF',
  indigoSoft:  'FFE0E7FF',
};

const FONT = { name: 'Calibri', size: 11 };

function fillSolid(color: string): ExcelJS.Fill {
  return { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
}

function borderThin(color: string = COLOR.slate100): Partial<ExcelJS.Borders> {
  const side: Partial<ExcelJS.Border> = { style: 'thin', color: { argb: color } };
  return { top: side, bottom: side, left: side, right: side };
}

function setHeaderRow(row: ExcelJS.Row, height = 28) {
  row.height = height;
  row.eachCell(cell => {
    cell.font = { ...FONT, bold: true, color: { argb: COLOR.white }, size: 11 };
    cell.fill = fillSolid(COLOR.indigoDark);
    cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    cell.border = borderThin(COLOR.indigoDark);
  });
}

function setSectionTitleRow(row: ExcelJS.Row, color: string = COLOR.indigo) {
  row.height = 30;
  row.eachCell(cell => {
    cell.font = { ...FONT, bold: true, color: { argb: COLOR.white }, size: 13 };
    cell.fill = fillSolid(color);
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  });
}

const IDR = '"Rp"#,##0;[Red]"Rp"-#,##0';
const PCT = '0.0%';

export async function exportSalesReport(input: ExportInput): Promise<void> {
  const { storeName, rangeLabel, transactions, products, topProducts, categoryData } = input;

  const wb = new ExcelJS.Workbook();
  wb.creator = 'Kasirnya POS';
  wb.created = new Date();

  // ═══════════════════════════════════════════════════════════
  // SHEET 1: RINGKASAN
  // ═══════════════════════════════════════════════════════════
  const s1 = wb.addWorksheet('Ringkasan', {
    views: [{ showGridLines: false }],
  });

  s1.columns = [
    { width: 4 },
    { width: 28 },
    { width: 22 },
    { width: 22 },
    { width: 22 },
    { width: 18 },
  ];

  // Title block
  s1.mergeCells('B2:F2');
  const titleCell = s1.getCell('B2');
  titleCell.value = `LAPORAN PENJUALAN — ${storeName || 'Outlet'}`.toUpperCase();
  titleCell.font = { ...FONT, bold: true, size: 18, color: { argb: COLOR.white } };
  titleCell.fill = fillSolid(COLOR.indigoDark);
  titleCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  s1.getRow(2).height = 40;

  s1.mergeCells('B3:F3');
  const subCell = s1.getCell('B3');
  subCell.value = `Periode: ${rangeLabel}  •  Dicetak: ${new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}`;
  subCell.font = { ...FONT, italic: true, size: 10, color: { argb: COLOR.white } };
  subCell.fill = fillSolid(COLOR.indigo);
  subCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
  s1.getRow(3).height = 22;

  // Aggregate KPIs
  const totalRevenue = transactions.reduce((s, t) => s + Number(t.total_amount), 0);
  const totalOrders  = transactions.length;
  const totalItems   = transactions.reduce((s, t) => s + t.items.reduce((q, i) => q + i.quantity, 0), 0);
  const avgOrder     = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalSubtotal = transactions.reduce((s, t) => s + t.items.reduce((sub, i) => sub + i.price * i.quantity, 0), 0);
  const totalPPN     = totalRevenue - totalSubtotal;

  // KPI cards (4 cards in a row)
  const kpiRow = 5;
  const kpis = [
    { label: 'Total Pendapatan', value: totalRevenue, color: COLOR.indigo, fmt: IDR },
    { label: 'Jumlah Transaksi', value: totalOrders, color: COLOR.emerald, fmt: '0' },
    { label: 'Item Terjual', value: totalItems, color: COLOR.amber, fmt: '0' },
    { label: 'Rata-rata Pesanan', value: avgOrder, color: COLOR.violet, fmt: IDR },
  ];

  kpis.forEach((kpi, i) => {
    const col = String.fromCharCode(66 + i); // B, C, D, E
    const labelCell = s1.getCell(`${col}${kpiRow}`);
    labelCell.value = kpi.label.toUpperCase();
    labelCell.font = { ...FONT, bold: true, size: 9, color: { argb: COLOR.white } };
    labelCell.fill = fillSolid(kpi.color);
    labelCell.alignment = { vertical: 'middle', horizontal: 'center' };
    s1.getRow(kpiRow).height = 22;

    const valueCell = s1.getCell(`${col}${kpiRow + 1}`);
    valueCell.value = kpi.value;
    valueCell.numFmt = kpi.fmt;
    valueCell.font = { ...FONT, bold: true, size: 14, color: { argb: COLOR.slate800 } };
    valueCell.fill = fillSolid(COLOR.white);
    valueCell.alignment = { vertical: 'middle', horizontal: 'center' };
    valueCell.border = borderThin();
    s1.getRow(kpiRow + 1).height = 36;
  });

  // Tax breakdown
  let r = kpiRow + 4;
  s1.mergeCells(`B${r}:F${r}`);
  s1.getCell(`B${r}`).value = '  RINGKASAN PAJAK & PENDAPATAN';
  setSectionTitleRow(s1.getRow(r));
  r++;

  const taxRows = [
    ['Subtotal (sebelum PPN)', totalSubtotal],
    ['Total PPN 11%', totalPPN],
    ['TOTAL PENDAPATAN', totalRevenue],
  ];
  taxRows.forEach(([label, val], i) => {
    const isTotal = i === taxRows.length - 1;
    s1.mergeCells(`B${r}:D${r}`);
    const labelCell = s1.getCell(`B${r}`);
    labelCell.value = label;
    labelCell.font = { ...FONT, bold: isTotal, size: isTotal ? 12 : 11, color: { argb: isTotal ? COLOR.white : COLOR.slate800 } };
    labelCell.fill = fillSolid(isTotal ? COLOR.indigo : (i % 2 === 0 ? COLOR.slate50 : COLOR.white));
    labelCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    labelCell.border = borderThin();

    s1.mergeCells(`E${r}:F${r}`);
    const valCell = s1.getCell(`E${r}`);
    valCell.value = val as number;
    valCell.numFmt = IDR;
    valCell.font = { ...FONT, bold: true, size: isTotal ? 12 : 11, color: { argb: isTotal ? COLOR.white : COLOR.slate800 } };
    valCell.fill = fillSolid(isTotal ? COLOR.indigo : (i % 2 === 0 ? COLOR.slate50 : COLOR.white));
    valCell.alignment = { vertical: 'middle', horizontal: 'right', indent: 1 };
    valCell.border = borderThin();
    s1.getRow(r).height = 22;
    r++;
  });
  r += 2;

  // Payment Method breakdown
  const cashTx  = transactions.filter(t => t.payment_method === 'Cash');
  const qrisTx  = transactions.filter(t => t.payment_method === 'QRIS');
  const cashRev = cashTx.reduce((s, t) => s + Number(t.total_amount), 0);
  const qrisRev = qrisTx.reduce((s, t) => s + Number(t.total_amount), 0);

  s1.mergeCells(`B${r}:F${r}`);
  s1.getCell(`B${r}`).value = '  RINGKASAN METODE PEMBAYARAN';
  setSectionTitleRow(s1.getRow(r), COLOR.emerald);
  r++;

  const pmHeader = s1.getRow(r);
  pmHeader.values = [null, 'Metode', 'Jumlah Transaksi', 'Total Pendapatan', 'Persentase', '% Kontribusi'];
  setHeaderRow(pmHeader);
  r++;

  const paymentRows = [
    { label: 'Tunai (Cash)', count: cashTx.length, rev: cashRev, color: COLOR.emeraldSoft },
    { label: 'QRIS', count: qrisTx.length, rev: qrisRev, color: COLOR.indigoSoft },
  ];
  paymentRows.forEach((p, i) => {
    const pct = totalRevenue > 0 ? p.rev / totalRevenue : 0;
    const row = s1.getRow(r);
    row.values = [null, p.label, p.count, p.rev, pct, ''];
    row.height = 22;

    [2, 3, 4, 5, 6].forEach(col => {
      const cell = row.getCell(col);
      cell.fill = fillSolid(i % 2 === 0 ? COLOR.slate50 : COLOR.white);
      cell.font = { ...FONT, bold: col === 4, color: { argb: COLOR.slate800 } };
      cell.border = borderThin();
      cell.alignment = { vertical: 'middle', horizontal: col === 2 ? 'left' : 'right', indent: 1 };
    });
    row.getCell(4).numFmt = IDR;
    row.getCell(5).numFmt = PCT;

    // Visual bar chart in last column (using filled emoji blocks)
    const barWidth = Math.round(pct * 10);
    row.getCell(6).value = '█'.repeat(barWidth) + '░'.repeat(10 - barWidth);
    row.getCell(6).font = { ...FONT, color: { argb: p.color === COLOR.emeraldSoft ? COLOR.emerald : COLOR.indigo }, size: 10 };
    row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' };
    r++;
  });
  r += 2;

  // Top Products
  if (topProducts.length > 0) {
    s1.mergeCells(`B${r}:F${r}`);
    s1.getCell(`B${r}`).value = '  TOP PRODUK TERLARIS';
    setSectionTitleRow(s1.getRow(r), COLOR.amber);
    r++;

    const tpHeader = s1.getRow(r);
    tpHeader.values = [null, 'Peringkat', 'Nama Produk', 'Kategori', 'Terjual', 'Pendapatan'];
    setHeaderRow(tpHeader);
    r++;

    topProducts.forEach((p, i) => {
      const row = s1.getRow(r);
      row.values = [null, p.rank, p.name, p.category, p.sold, p.revenue];
      row.height = 20;
      [2, 3, 4, 5, 6].forEach(col => {
        const cell = row.getCell(col);
        cell.fill = fillSolid(i === 0 ? COLOR.amberSoft : (i % 2 === 0 ? COLOR.slate50 : COLOR.white));
        cell.font = { ...FONT, bold: i === 0, color: { argb: COLOR.slate800 } };
        cell.border = borderThin();
        cell.alignment = { vertical: 'middle', horizontal: col === 3 ? 'left' : col === 4 ? 'left' : 'right', indent: 1 };
      });
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(6).numFmt = IDR;
      r++;
    });
    r += 2;
  }

  // Cashier Performance
  const cashierMap = new Map<string, { count: number; revenue: number }>();
  transactions.forEach(tx => {
    const name = tx.cashier_name?.trim() || 'Tidak diketahui';
    const prev = cashierMap.get(name) ?? { count: 0, revenue: 0 };
    cashierMap.set(name, { count: prev.count + 1, revenue: prev.revenue + Number(tx.total_amount) });
  });
  const cashierRows = [...cashierMap.entries()].sort((a, b) => b[1].revenue - a[1].revenue);

  if (cashierRows.length > 0) {
    s1.mergeCells(`B${r}:F${r}`);
    s1.getCell(`B${r}`).value = '  PERFORMA KASIR';
    setSectionTitleRow(s1.getRow(r), COLOR.violet);
    r++;

    const cpHeader = s1.getRow(r);
    cpHeader.values = [null, 'Peringkat', 'Nama Kasir', 'Transaksi', 'Rata-rata', 'Total Pendapatan'];
    setHeaderRow(cpHeader);
    r++;

    cashierRows.forEach(([name, v], i) => {
      const avg = v.count > 0 ? v.revenue / v.count : 0;
      const row = s1.getRow(r);
      row.values = [null, i + 1, name, v.count, avg, v.revenue];
      row.height = 20;
      [2, 3, 4, 5, 6].forEach(col => {
        const cell = row.getCell(col);
        cell.fill = fillSolid(i === 0 ? COLOR.indigoSoft : (i % 2 === 0 ? COLOR.slate50 : COLOR.white));
        cell.font = { ...FONT, bold: i === 0, color: { argb: COLOR.slate800 } };
        cell.border = borderThin();
        cell.alignment = { vertical: 'middle', horizontal: col === 3 ? 'left' : 'right', indent: 1 };
      });
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(5).numFmt = IDR;
      row.getCell(6).numFmt = IDR;
      r++;
    });
    r += 2;
  }

  // Category breakdown
  if (categoryData.length > 0) {
    s1.mergeCells(`B${r}:F${r}`);
    s1.getCell(`B${r}`).value = '  RINGKASAN PER KATEGORI';
    setSectionTitleRow(s1.getRow(r), COLOR.rose);
    r++;

    const catHeader = s1.getRow(r);
    catHeader.values = [null, 'Kategori', 'Item Terjual', 'Pendapatan', 'Persentase', ''];
    setHeaderRow(catHeader);
    r++;

    categoryData.forEach((c, i) => {
      const row = s1.getRow(r);
      row.values = [null, c.name, c.count, c.amount, c.pct / 100, ''];
      row.height = 20;
      [2, 3, 4, 5, 6].forEach(col => {
        const cell = row.getCell(col);
        cell.fill = fillSolid(i % 2 === 0 ? COLOR.slate50 : COLOR.white);
        cell.font = { ...FONT, color: { argb: COLOR.slate800 } };
        cell.border = borderThin();
        cell.alignment = { vertical: 'middle', horizontal: col === 2 ? 'left' : 'right', indent: 1 };
      });
      row.getCell(4).numFmt = IDR;
      row.getCell(5).numFmt = PCT;
      r++;
    });
  }

  // Footer
  r += 2;
  s1.mergeCells(`B${r}:F${r}`);
  const footerCell = s1.getCell(`B${r}`);
  footerCell.value = 'Laporan otomatis dari Kasirnya POS';
  footerCell.font = { ...FONT, italic: true, size: 9, color: { argb: COLOR.slate400 } };
  footerCell.alignment = { horizontal: 'center' };

  // ═══════════════════════════════════════════════════════════
  // SHEET 2: DETAIL TRANSAKSI (flat table, pivot-friendly)
  // ═══════════════════════════════════════════════════════════
  const s2 = wb.addWorksheet('Detail Transaksi', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: false }],
  });

  s2.columns = [
    { header: 'Tanggal',          key: 'date',         width: 12 },
    { header: 'Waktu',            key: 'time',         width: 10 },
    { header: 'No. Order',        key: 'orderId',      width: 14 },
    { header: 'Customer',         key: 'customer',     width: 22 },
    { header: 'Kasir',            key: 'cashier',      width: 18 },
    { header: 'Metode Bayar',     key: 'method',       width: 14 },
    { header: 'Nama Produk',      key: 'product',      width: 30 },
    { header: 'Kategori',         key: 'category',     width: 16 },
    { header: 'Harga Satuan',     key: 'price',        width: 16, style: { numFmt: IDR } },
    { header: 'Qty',              key: 'qty',          width: 8 },
    { header: 'Subtotal Item',    key: 'itemSubtotal', width: 16, style: { numFmt: IDR } },
    { header: 'Catatan',          key: 'note',         width: 24 },
    { header: 'Subtotal Order',   key: 'orderSubtotal', width: 18, style: { numFmt: IDR } },
    { header: 'PPN 11%',          key: 'orderPPN',     width: 14, style: { numFmt: IDR } },
    { header: 'Total Order',      key: 'orderTotal',   width: 18, style: { numFmt: IDR } },
  ];

  setHeaderRow(s2.getRow(1), 30);

  const sortedTx = [...transactions].sort((a, b) => {
    const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
    const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
    return ta - tb;
  });

  let rowIdx = 2;
  sortedTx.forEach((tx, txIdx) => {
    const subtotalOrder = tx.items.reduce((s, it) => s + it.price * it.quantity, 0);
    const ppnOrder = subtotalOrder * 0.11;
    const d = tx.created_at ? new Date(tx.created_at) : null;
    const dateStr = d ? `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}` : '';
    const timeStr = d ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}` : '';

    tx.items.forEach((item) => {
      const row = s2.getRow(rowIdx);
      row.values = {
        date: dateStr,
        time: timeStr,
        orderId: tx.order_id,
        customer: tx.customer_name,
        cashier: tx.cashier_name || '—',
        method: tx.payment_method,
        product: item.name,
        category: item.category || '—',
        price: item.price,
        qty: item.quantity,
        itemSubtotal: item.price * item.quantity,
        note: item.note || '',
        orderSubtotal: subtotalOrder,
        orderPPN: ppnOrder,
        orderTotal: Number(tx.total_amount),
      };

      const fillColor = txIdx % 2 === 0 ? COLOR.white : COLOR.slate50;
      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        cell.fill = fillSolid(fillColor);
        cell.font = { ...FONT, color: { argb: COLOR.slate800 }, size: 10 };
        cell.border = borderThin();
        cell.alignment = {
          vertical: 'middle',
          horizontal: [9, 10, 11, 13, 14, 15].includes(colNumber) ? 'right' : 'left',
          indent: 1,
        };
      });

      // Highlight metode bayar
      const methodCell = row.getCell('method');
      if (tx.payment_method === 'Cash') {
        methodCell.fill = fillSolid(COLOR.emeraldSoft);
        methodCell.font = { ...FONT, bold: true, color: { argb: COLOR.emerald }, size: 10 };
        methodCell.alignment = { vertical: 'middle', horizontal: 'center' };
      } else if (tx.payment_method === 'QRIS') {
        methodCell.fill = fillSolid(COLOR.indigoSoft);
        methodCell.font = { ...FONT, bold: true, color: { argb: COLOR.indigo }, size: 10 };
        methodCell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      rowIdx++;
    });
  });

  // Grand total row
  if (rowIdx > 2) {
    const totalRow = s2.getRow(rowIdx + 1);
    totalRow.values = {
      product: 'GRAND TOTAL',
      itemSubtotal: totalSubtotal,
      orderSubtotal: totalSubtotal,
      orderPPN: totalPPN,
      orderTotal: totalRevenue,
    };
    totalRow.eachCell((cell, col) => {
      cell.fill = fillSolid(COLOR.indigoDark);
      cell.font = { ...FONT, bold: true, color: { argb: COLOR.white }, size: 11 };
      cell.border = borderThin(COLOR.indigoDark);
      cell.alignment = { vertical: 'middle', horizontal: col === 7 ? 'right' : 'right', indent: 1 };
      if ([11, 13, 14, 15].includes(col)) cell.numFmt = IDR;
    });
    totalRow.height = 26;
  }

  // Auto-filter on header
  s2.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 15 } };

  // ═══════════════════════════════════════════════════════════
  // SHEET 3: PIVOT PER PRODUK
  // ═══════════════════════════════════════════════════════════
  const s3 = wb.addWorksheet('Per Produk', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: false }],
  });

  const productMap = new Map<string, { category: string; qty: number; revenue: number; orders: Set<string> }>();
  transactions.forEach(tx => {
    tx.items.forEach(item => {
      const key = item.name.toLowerCase();
      const prev = productMap.get(key);
      if (prev) {
        prev.qty += item.quantity;
        prev.revenue += item.price * item.quantity;
        prev.orders.add(tx.order_id);
      } else {
        const cat = item.category || products.find(p => p.name.toLowerCase() === key)?.category || '—';
        productMap.set(key, {
          category: cat,
          qty: item.quantity,
          revenue: item.price * item.quantity,
          orders: new Set([tx.order_id]),
        });
      }
    });
  });

  s3.columns = [
    { header: 'Nama Produk',     key: 'name',     width: 32 },
    { header: 'Kategori',        key: 'category', width: 18 },
    { header: 'Qty Terjual',     key: 'qty',      width: 14 },
    { header: 'Jumlah Order',    key: 'orders',   width: 14 },
    { header: 'Total Pendapatan',key: 'revenue',  width: 22, style: { numFmt: IDR } },
    { header: 'Avg per Item',    key: 'avg',      width: 16, style: { numFmt: IDR } },
    { header: '% Pendapatan',    key: 'pct',      width: 14, style: { numFmt: PCT } },
  ];
  setHeaderRow(s3.getRow(1), 30);

  const prodRows = [...productMap.entries()]
    .map(([name, v]) => ({
      name: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      category: v.category,
      qty: v.qty,
      orders: v.orders.size,
      revenue: v.revenue,
      avg: v.qty > 0 ? v.revenue / v.qty : 0,
      pct: totalSubtotal > 0 ? v.revenue / totalSubtotal : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  prodRows.forEach((p, i) => {
    const row = s3.getRow(i + 2);
    row.values = p;
    row.eachCell((cell, col) => {
      cell.fill = fillSolid(i % 2 === 0 ? COLOR.white : COLOR.slate50);
      cell.font = { ...FONT, color: { argb: COLOR.slate800 }, size: 10, bold: i === 0 };
      cell.border = borderThin();
      cell.alignment = { vertical: 'middle', horizontal: col === 1 || col === 2 ? 'left' : 'right', indent: 1 };
    });
    if (i === 0) {
      row.eachCell(cell => { cell.fill = fillSolid(COLOR.amberSoft); });
    }
  });

  if (prodRows.length > 0) {
    const totalRow = s3.getRow(prodRows.length + 2);
    totalRow.values = {
      name: 'TOTAL',
      qty: prodRows.reduce((s, p) => s + p.qty, 0),
      orders: '',
      revenue: prodRows.reduce((s, p) => s + p.revenue, 0),
    };
    totalRow.eachCell((cell, col) => {
      cell.fill = fillSolid(COLOR.indigoDark);
      cell.font = { ...FONT, bold: true, color: { argb: COLOR.white }, size: 11 };
      cell.border = borderThin(COLOR.indigoDark);
      cell.alignment = { vertical: 'middle', horizontal: col === 1 ? 'left' : 'right', indent: 1 };
      if (col === 5) cell.numFmt = IDR;
    });
    totalRow.height = 26;
  }
  s3.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 7 } };

  // ═══════════════════════════════════════════════════════════
  // DOWNLOAD
  // ═══════════════════════════════════════════════════════════
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const safeStoreName = (storeName || 'outlet').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const safeRange = rangeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  a.download = `laporan-penjualan_${safeStoreName}_${safeRange}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
