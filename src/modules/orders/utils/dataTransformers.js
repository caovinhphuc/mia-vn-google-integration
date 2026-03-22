// ==================== DATA TRANSFORMERS ====================
// File: src/modules/orders/utils/dataTransformers.js
// Data transformation utilities for Google Sheets integration

export const transformSheetsData = (ordersData, productsData) => {
  const orders = ordersData.map((row) => {
    const [
      id,
      platform,
      customerId,
      priority,
      status,
      createdAt,
      slaDeadline,
      assignedTo,
      totalValue,
      notes,
      carrierName,
      updatedAt,
      updatedBy,
    ] = row;

    return {
      id,
      platform,
      customerId,
      priority,
      status,
      createdAt: new Date(createdAt),
      slaDeadline: new Date(slaDeadline),
      assignedTo: assignedTo || null,
      totalValue: parseFloat(totalValue) || 0,
      notes: notes || '',
      carrierName: carrierName || '',
      updatedAt: new Date(updatedAt || createdAt),
      updatedBy: updatedBy || 'System',
      items: [],
    };
  });

  // Group products by order ID
  const productsByOrder = {};
  productsData.forEach((row) => {
    const [
      orderId,
      sku,
      productName,
      quantity,
      location,
      stockLevel,
      pickingOrder,
      pickedAt,
      pickedBy,
    ] = row;

    if (!productsByOrder[orderId]) {
      productsByOrder[orderId] = [];
    }

    productsByOrder[orderId].push({
      sku,
      product: productName,
      quantity: parseInt(quantity) || 1,
      location,
      stockLevel,
      pickingOrder: parseInt(pickingOrder) || 999,
      pickedAt: pickedAt ? new Date(pickedAt) : null,
      pickedBy: pickedBy || null,
    });
  });

  // Attach products to orders
  orders.forEach((order) => {
    if (productsByOrder[order.id]) {
      order.items = productsByOrder[order.id].sort(
        (a, b) => a.pickingOrder - b.pickingOrder
      );
    }
  });

  return orders;
};

export const transformToSheetsFormat = (orders) => {
  const ordersData = orders.map((order) => [
    order.id,
    order.platform,
    order.customerId,
    order.priority,
    order.status,
    order.createdAt.toISOString(),
    order.slaDeadline.toISOString(),
    order.assignedTo || '',
    order.totalValue.toString(),
    order.notes || '',
    order.carrierName || '',
    order.updatedAt.toISOString(),
    order.updatedBy || 'System',
  ]);

  const productsData = [];
  orders.forEach((order) => {
    order.items.forEach((item) => {
      productsData.push([
        order.id,
        item.sku,
        item.product,
        item.quantity.toString(),
        item.location,
        item.stockLevel,
        item.pickingOrder?.toString() || '',
        item.pickedAt?.toISOString() || '',
        item.pickedBy || '',
      ]);
    });
  });

  return {
    orders: ordersData,
    products: productsData,
  };
};
