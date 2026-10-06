const ExcelJS = require('exceljs');
const orderModel = require('../models/orderModel');

const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = String(d.getDate()).padStart(2, '0');
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

const orderService = {
  async getAllOrders(params) {
    const page = parseInt(params.page, 10) || 1;
    const limit = parseInt(params.limit, 10) || 10;
    const search = params.search || '';
    const status = params.status || '';
    const startDate = params.startDate || '';
    const endDate = params.endDate || '';
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'DESC';

    const orders = await orderModel.findOrders({
      page,
      limit,
      search,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder
    });

    const total = await orderModel.countOrders({ search, status, startDate, endDate });
    const totalPages = Math.ceil(total / limit) || 1;

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  },

  async getOrderById(id) {
    const order = await orderModel.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    const items = await orderModel.findOrderItems(id);
    return {
      ...order,
      items
    };
  },

  async updateOrderStatus(id, status) {
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const order = await orderModel.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    await orderModel.updateStatus(id, status);
    return await orderModel.findById(id);
  },

  async exportOrders(params) {
    const search = params.search || '';
    const status = params.status || '';
    const startDate = params.startDate || '';
    const endDate = params.endDate || '';
    const sortBy = params.sortBy || 'created_at';
    const sortOrder = params.sortOrder || 'DESC';

    // Retrieve all matching records across all pages
    const orders = await orderModel.findAllOrdersForExport({
      search,
      status,
      startDate,
      endDate,
      sortBy,
      sortOrder
    });

    if (!orders || orders.length === 0) {
      return { count: 0, buffer: null, filename: null };
    }

    // Initialize Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Admin Analytics Dashboard';
    workbook.created = new Date();
    workbook.properties.date1904 = false;

    const worksheet = workbook.addWorksheet('Orders', {
      pageSetup: { orientation: 'landscape', fitToPage: true }
    });

    // 1. Report Title
    const titleRow = worksheet.addRow(['Orders Report']);
    titleRow.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FF1E293B' } };
    titleRow.height = 28;

    // 2. Generation Timestamp
    const genTimeStr = formatDate(new Date());
    const genRow = worksheet.addRow([`Generated: ${genTimeStr}`]);
    genRow.font = { name: 'Calibri', size: 10, italic: true, color: { argb: 'FF64748B' } };

    // 3. Active Filters
    const filterParts = [];
    if (search) filterParts.push(`Search: ${search}`);
    if (status) filterParts.push(`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`);
    if (startDate) filterParts.push(`From: ${startDate}`);
    if (endDate) filterParts.push(`To: ${endDate}`);

    const filterText = filterParts.length > 0 ? `Filters: ${filterParts.join(' | ')}` : 'Filters: All Orders (No filters applied)';
    const filterRow = worksheet.addRow([filterText]);
    filterRow.font = { name: 'Calibri', size: 10, color: { argb: 'FF475569' } };

    // 4. Blank spacing row
    worksheet.addRow([]);

    // 5. Table Header Row (Row 5)
    const headerRow = worksheet.addRow([
      'Order ID',
      'Customer Name',
      'Customer Email',
      'Amount',
      'Order Status',
      'Payment Method',
      'Payment Status',
      'Order Date'
    ]);
    const headerRowIndex = headerRow.number;
    headerRow.height = 26;

    headerRow.eachCell((cell) => {
      cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1E293B' } // Professional Dark Slate
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF0F172A' } },
        bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
        left: { style: 'thin', color: { argb: 'FF334155' } },
        right: { style: 'thin', color: { argb: 'FF334155' } }
      };
    });

    // 6. Data Rows
    let totalRevenue = 0;
    orders.forEach((order, index) => {
      const amountVal = parseFloat(order.total_amount) || 0;
      totalRevenue += amountVal;

      const row = worksheet.addRow([
        `#${order.id}`,
        order.customer_name || 'N/A',
        order.customer_email || 'N/A',
        amountVal,
        (order.status || 'pending').toUpperCase(),
        order.payment_method || 'Online',
        (order.payment_status || 'pending').toUpperCase(),
        formatDate(order.created_at)
      ]);
      row.height = 20;

      // Cell alignments and formats
      row.getCell(1).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(2).alignment = { vertical: 'middle', horizontal: 'left' };
      row.getCell(3).alignment = { vertical: 'middle', horizontal: 'left' };
      row.getCell(4).alignment = { vertical: 'middle', horizontal: 'right' };
      row.getCell(4).numFmt = '"$"#,##0.00';
      row.getCell(5).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(6).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(7).alignment = { vertical: 'middle', horizontal: 'center' };
      row.getCell(8).alignment = { vertical: 'middle', horizontal: 'center' };

      const isEven = index % 2 === 0;
      row.eachCell((cell) => {
        cell.font = { name: 'Calibri', size: 10 };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
        if (!isEven) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF8FAFC' } // Subtle alternate row zebra striping
          };
        }
      });
    });

    // 7. Totals Section
    worksheet.addRow([]); // Blank row

    const totalOrdersRow = worksheet.addRow(['Total Orders:', orders.length]);
    totalOrdersRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
    totalOrdersRow.getCell(1).alignment = { horizontal: 'left' };
    totalOrdersRow.getCell(2).alignment = { horizontal: 'left' };

    const totalRevenueRow = worksheet.addRow(['Total Revenue:', totalRevenue]);
    totalRevenueRow.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FF0F172A' } };
    totalRevenueRow.getCell(1).alignment = { horizontal: 'left' };
    totalRevenueRow.getCell(2).alignment = { horizontal: 'left' };
    totalRevenueRow.getCell(2).numFmt = '"$"#,##0.00';

    // 8. Auto-filter on header
    worksheet.autoFilter = {
      from: { row: headerRowIndex, column: 1 },
      to: { row: headerRowIndex, column: 8 }
    };

    // 9. Freeze panes below header
    worksheet.views = [{ state: 'frozen', ySplit: headerRowIndex }];

    // 10. Auto-fit column widths
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
        if (rowNumber >= headerRowIndex) {
          const val = cell.value !== undefined && cell.value !== null ? cell.value.toString() : '';
          if (val.length > maxLength) {
            maxLength = val.length;
          }
        }
      });
      column.width = Math.min(Math.max(maxLength + 4, 14), 35);
    });

    // Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `orders_${currentDate}.xlsx`;

    return {
      count: orders.length,
      buffer,
      filename
    };
  }
};

module.exports = orderService;
