// Utility functions for Warehouse Map
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatNumber = (number) => {
  if (typeof number !== 'number') return '0';
  return number.toLocaleString('vi-VN');
};

export const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0 ₫';
  return amount.toLocaleString('vi-VN') + ' ₫';
};

export const generateLocationCode = (zone, floor, section, position) => {
  return `${zone}${floor}-${String(section).padStart(2, '0')}-${String(position).padStart(3, '0')}`;
};

export const parseLocationCode = (code) => {
  if (!code || typeof code !== 'string') return null;

  const match = code.match(/^([A-Z])(\d+)-(\d{2})-(\d{3})$/);
  if (!match) return null;

  return {
    zone: match[1],
    floor: parseInt(match[2]),
    section: parseInt(match[3]),
    position: parseInt(match[4])
  };
};

export const calculateUtilization = (used, total) => {
  if (!total || total === 0) return 0;
  return Math.round((used / total) * 100);
};

export const getStatusText = (status) => {
  const statusMap = {
    'available': 'Có sẵn',
    'occupied': 'Đã sử dụng',
    'maintenance': 'Bảo trì',
    'reserved': 'Đã đặt trước',
    'in-stock': 'Còn hàng',
    'low-stock': 'Sắp hết',
    'out-of-stock': 'Hết hàng'
  };
  return statusMap[status] || status;
};

export const getCategoryText = (category) => {
  const categoryMap = {
    'electronics': 'Điện tử',
    'clothing': 'Thời trang',
    'food': 'Thực phẩm',
    'books': 'Sách',
    'furniture': 'Nội thất',
    'tools': 'Công cụ'
  };
  return categoryMap[category] || category;
};

export const filterBySearch = (items, searchTerm) => {
  if (!searchTerm) return items;

  const term = searchTerm.toLowerCase();
  return items.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(term)
    )
  );
};

export const sortByField = (items, field, direction = 'asc') => {
  return [...items].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Handle numbers
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    // Handle strings
    aVal = String(aVal).toLowerCase();
    bVal = String(bVal).toLowerCase();

    if (direction === 'asc') {
      return aVal.localeCompare(bVal);
    } else {
      return bVal.localeCompare(aVal);
    }
  });
};

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !data.length) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        return typeof value === 'string' && value.includes(',')
          ? `"${value}"`
          : value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const validateLocationCode = (code) => {
  if (!code || typeof code !== 'string') return false;
  return /^[A-Z]\d+-\d{2}-\d{3}$/.test(code);
};

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
