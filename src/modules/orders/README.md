# Orders Module - Refactored Architecture

## 📋 Overview

The Orders module has been completely refactored into a modular, maintainable architecture with consistent UI/UX patterns across the warehouse management system.

## 🏗 Architecture

### Component Structure

```
src/modules/orders/
├── components/
│   ├── OrdersList.jsx          # Main orders list component
│   └── ui/                     # Reusable UI components
│       ├── OrderRow.jsx        # Individual order row
│       ├── OrdersHeader.jsx    # Header with actions
│       ├── OrdersSearchBar.jsx # Search and filters
│       ├── OrdersBulkActions.jsx # Bulk operations
│       ├── OrdersStatsCards.jsx # Priority stats
│       ├── OrdersTableHeader.jsx # Table header with sorting
│       ├── OrdersEmptyState.jsx # Empty state
│       ├── OrdersPagination.jsx # Pagination controls
│       └── index.js            # UI components export
├── hooks/
│   ├── useOrdersData.js        # Orders data management
│   ├── useSLAMonitoring.js     # SLA tracking and alerts
│   └── index.js                # Hooks export
├── utils/
│   ├── dateHelpers.js          # Date/time utilities
│   └── dataTransformers.js     # Data transformation
├── config/
│   └── constants.js            # Configuration constants
└── index.jsx                   # Module entry point
```

## 🎯 Key Features

### ✅ Modular Components

- **OrdersList**: Main component using all sub-components
- **OrderRow**: Reusable order row with consistent styling
- **OrdersHeader**: Action buttons and sync status
- **OrdersSearchBar**: Advanced search and filtering
- **OrdersBulkActions**: Bulk operations UI
- **OrdersStatsCards**: Priority-based statistics
- **OrdersTableHeader**: Sortable table headers
- **OrdersEmptyState**: User-friendly empty states
- **OrdersPagination**: Pagination controls

### ✅ Custom Hooks

- **useOrdersData**: Manages order data with auto-sync
- **useSLAMonitoring**: Real-time SLA tracking and alerts

### ✅ Utilities

- **dateHelpers**: Vietnamese locale date/time formatting
- **dataTransformers**: Google Sheets data transformation
- **constants**: Centralized configuration

### ✅ Consistent UI/UX

- Unified Badge, Modal, Toast, and Button components
- Consistent color schemes and typography
- Responsive design patterns
- Loading states and error handling

## 🚀 Usage Examples

### Basic Implementation

```jsx
import { OrdersList } from './modules/orders';

function OrdersPage() {
  return <OrdersList />;
}
```

### Custom Hook Usage

```jsx
import { useOrdersData, useSLAMonitoring } from './modules/orders';

function CustomOrdersDashboard() {
  const { orders, loading, updateOrder } = useOrdersData({
    autoSync: true,
    syncInterval: 30000,
  });

  const { alerts, metrics } = useSLAMonitoring(orders);

  return (
    <div>
      <h2>SLA Compliance: {metrics.complianceRate}%</h2>
      <p>Critical Alerts: {alerts.length}</p>
      {/* Custom UI */}
    </div>
  );
}
```

### Individual Component Usage

```jsx
import {
  OrdersHeader,
  OrdersStatsCards,
  OrderRow,
} from './modules/orders/components/ui';

function CustomOrdersView() {
  return (
    <div>
      <OrdersHeader
        orderCount={orders.length}
        onSync={handleSync}
        onExport={handleExport}
      />
      <OrdersStatsCards orders={orders} />
      {orders.map((order) => (
        <OrderRow
          key={order.id}
          order={order}
          onSelect={handleSelect}
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
}
```

## 🎨 UI Components

### Unified Design System

All components use the system's unified UI patterns:

- **Badge**: Consistent status and priority indicators
- **Modal**: Standardized dialog patterns
- **ToastNotification**: System-wide notification pattern
- **LoadingSpinner**: Consistent loading states
- **ConfirmDialog**: Standardized confirmation dialogs

### Color Scheme

- **P1 (Critical)**: Red variants
- **P2 (Warning)**: Yellow/Orange variants
- **P3 (Normal)**: Green variants
- **P4 (Low)**: Blue variants

### Typography

- Vietnamese locale support
- Consistent font weights and sizes
- Proper hierarchy and spacing

## 📊 Data Flow

```
1. OrdersList component mounts
2. useOrdersData hook initializes
3. Mock data loaded (replace with Google Sheets)
4. SLA calculations applied
5. Data filtered and sorted
6. UI renders with consistent patterns
7. User interactions trigger optimistic updates
8. Auto-sync keeps data fresh
```

## ⚙️ Configuration

### Constants (config/constants.js)

```jsx
export const ORDER_PRIORITIES = {
  P1: { name: 'Gấp 🚀', color: 'red', threshold: 120 },
  P2: { name: 'Cảnh báo ⚠️', color: 'yellow', threshold: 240 },
  P3: { name: 'Bình thường ✅', color: 'green', threshold: 480 },
  P4: { name: 'Chờ xử lý 🕒', color: 'blue', threshold: Infinity },
};
```

### Environment Variables

```env
REACT_APP_GOOGLE_SHEETS_ID=your_spreadsheet_id
REACT_APP_GOOGLE_API_KEY=your_api_key
REACT_APP_GOOGLE_CLIENT_ID=your_client_id
```

## 🔧 Development

### Running the Module

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Adding New Components

1. Create component in `components/ui/`
2. Follow naming convention: `Orders[Feature].jsx`
3. Export from `components/ui/index.js`
4. Use unified UI patterns from `components/ui/CommonComponents.jsx`

### Extending Functionality

1. Add new hooks to `hooks/` directory
2. Create utilities in `utils/` directory
3. Update constants in `config/constants.js`
4. Export from module `index.jsx`

## 🚨 Error Handling

### Component Level

- ErrorBoundary wraps the entire module
- Individual components handle loading states
- Toast notifications for user feedback

### Data Level

- Optimistic updates with rollback
- Automatic retry on network failures
- Graceful degradation for offline use

## 📈 Performance

### Optimizations

- React.memo for expensive components
- useCallback for stable function references
- Pagination to limit DOM nodes
- Debounced search input
- Lazy loading for large datasets

### Memory Management

- Cleanup intervals on component unmount
- Efficient state updates
- Proper dependency arrays in useEffect

## 🔮 Future Enhancements

### Planned Features

- [ ] Real Google Sheets integration
- [ ] Advanced filtering options
- [ ] Export functionality (CSV, Excel, PDF)
- [ ] Print-friendly order details
- [ ] Mobile-responsive design
- [ ] Offline support with sync
- [ ] Real-time WebSocket updates
- [ ] Advanced SLA analytics

### Integration Points

- [ ] Staff management module integration
- [ ] Inventory module integration
- [ ] Analytics dashboard integration
- [ ] Notification system integration

## 📝 Notes

### Breaking Changes from Previous Version

- Removed large monolithic OrdersList component
- Split into modular, reusable components
- Updated hook APIs for better usability
- Standardized UI patterns across components

### Migration Guide

1. Update imports to use new component structure
2. Replace old hook usage with new APIs
3. Update any custom styling to use new classes
4. Test all functionality with new modular structure

---

**Last Updated**: June 16, 2025
**Version**: 2.0.0
**Team**: MIA Warehouse Development Team
