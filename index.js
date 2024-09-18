const fs = require('fs');
 
class SalesData {
  constructor(date, sku, unitPrice, quantity, totalPrice) {
    this.date = date;
    this.sku = sku;
    this.unitPrice = unitPrice;
    this.quantity = quantity;
    this.totalPrice = totalPrice;
  }

  getMonth() {
    return this.date.substring(0, 7);
  }
}

function summarizeSales() {
  const fileName = 'dataset.txt';
  const salesList = []; 
  const monthWiseSales = {}; 
  const monthItemQuantity = {};
  const monthItemRevenue = {}; 

  let fileData;
  try {
    fileData = fs.readFileSync(fileName, 'utf8');
  } catch (err) {
    console.error("Error reading file:", err);
    return;
  }

  const lines = fileData.trim().split('\n');
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const date = values[0];
    const sku = values[1];
    const unitPrice = parseInt(values[2], 10);
    const quantity = parseInt(values[3], 10);
    const totalPrice = parseFloat(values[4]);

    const salesData = new SalesData(date, sku, unitPrice, quantity, totalPrice);
    salesList.push(salesData);
  }

  let totalSales = 0.0;

  salesList.forEach((sale) => {
    const month = sale.getMonth();
    totalSales += sale.totalPrice;

    monthWiseSales[month] = (monthWiseSales[month] || 0) + sale.totalPrice;

    if (!monthItemQuantity[month]) {
      monthItemQuantity[month] = {};
    }
    monthItemQuantity[month][sale.sku] = (monthItemQuantity[month][sale.sku] || 0) + sale.quantity;

    if (!monthItemRevenue[month]) {
      monthItemRevenue[month] = {};
    }
    monthItemRevenue[month][sale.sku] = (monthItemRevenue[month][sale.sku] || 0) + sale.totalPrice;
  });

  console.log("Total sales of the store:", totalSales.toFixed(2));

  console.log("\nMonth-wise sales totals:");
  Object.entries(monthWiseSales).forEach(([month, sales]) => {
    console.log(`Month: ${month} - Sales: ${sales.toFixed(2)}`);
  });

  console.log("\nMost popular item (most quantity sold) in each month:");
  Object.keys(monthItemQuantity).forEach((month) => {
    const items = monthItemQuantity[month];
    const popularItem = Object.keys(items).reduce((a, b) => (items[a] > items[b] ? a : b));
    console.log(`Month: ${month} - Most Popular Item: ${popularItem} - Quantity Sold: ${items[popularItem]}`);
  });

  console.log("\nItems generating most revenue in each month:");
  Object.keys(monthItemRevenue).forEach((month) => {
    const items = monthItemRevenue[month];
    const topRevenueItem = Object.keys(items).reduce((a, b) => (items[a] > items[b] ? a : b));
    console.log(`Month: ${month} - Top Revenue Item: ${topRevenueItem} - Revenue: ${items[topRevenueItem].toFixed(2)}`);
  });

  console.log("\nMin, max, and average number of orders for the most popular item in each month:");
  Object.keys(monthItemQuantity).forEach((month) => {
    const items = monthItemQuantity[month];
    const popularItem = Object.keys(items).reduce((a, b) => (items[a] > items[b] ? a : b));

    const quantities = salesList
      .filter(sale => sale.getMonth() === month && sale.sku === popularItem)
      .map(sale => sale.quantity);

    const minOrders = Math.min(...quantities);
    const maxOrders = Math.max(...quantities);
    const avgOrders = quantities.reduce((sum, q) => sum + q, 0) / quantities.length;

    console.log(`Month: ${month} - Popular Item: ${popularItem} - Min Orders: ${minOrders} - Max Orders: ${maxOrders} - Avg Orders: ${avgOrders.toFixed(2)}`);
  });
}

summarizeSales();