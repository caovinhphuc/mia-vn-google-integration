/**
 * Modern Warehouse Map Page - Using Modular Architecture
 * Fully integrated with new libs, components, and UX system
 */

import React, { useState, useEffect } from 'react';

// Core Libraries
import { WarehouseStateProvider, useWarehouseState } from './libs/core';
import { WarehouseVisualizer } from './libs/visualization';
import { DataProcessor } from './libs/data-processing';

// UI Components
import { WarehouseHeader, StatisticsCards, QuickActions } from './components/ui';
import { LocationForm, InventoryForm } from './components/ui/forms';
import { Modal, LocationDetailsModal } from './components/ui/modals';
import { DataTable } from './components/ui/tables';

// UX Components
import { FadeTransition, LoadingSpinner, SlideTransition } from './components/ux/animations';

// Sample data
import { generateSampleLocations, generateSampleInventory, generateSampleZones } from './data/sampleData';
import logger from "../../utils/logger";

// Main Warehouse Map Component
function WarehouseMapContent() {
  const { state, actions } = useWarehouseState();
  const [activeView, setActiveView] = useState('map'); // 'map', 'locations', 'inventory', 'analytics'
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [visualizer, setVisualizer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // Generate sample data
        const locations = generateSampleLocations(20);
        const inventory = generateSampleInventory(50);
        const zones = generateSampleZones(6);

        // Update state
        actions.setLocations(locations);
        actions.setInventory(inventory);
        actions.setZones(zones);

        // Update statistics
        const processor = new DataProcessor();
        const warehouseStats = processor.analyze(locations, 'warehouse');
        const inventoryStats = processor.analyze(inventory, 'inventory');

        actions.updateStatistics({
          ...warehouseStats.warehouseStats,
          ...inventoryStats.inventoryStats
        });

      } catch (error) {
        actions.setError({ message: 'Failed to initialize warehouse data', type: 'initialization' });
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [actions]);

  // Initialize visualizer
  useEffect(() => {
    const mapContainer = document.getElementById('warehouse-map-container');
    if (mapContainer && !visualizer) {
      const viz = new WarehouseVisualizer(mapContainer, {
        width: 800,
        height: 600,
        enableZoom: true,
        enablePan: true
      });

      viz.on('elementClick', ({ type, data }) => {
        if (type === 'location') {
          setSelectedLocation(data);
          actions.openModal('locationDetails', data, 'view');
        }
      });

      setVisualizer(viz);
    }

    return () => {
      if (visualizer) {
        visualizer.destroy();
      }
    };
  }, [visualizer, actions]);

  // Update visualizer when data changes
  useEffect(() => {
    if (visualizer && state.locations.size > 0) {
      const locationData = Array.from(state.locations.values());
      const zoneData = Array.from(state.zones.values());

      visualizer.render({
        locations: locationData,
        zones: zoneData
      });
    }
  }, [visualizer, state.locations, state.zones]);

  const handleLocationSubmit = async (locationData) => {
    try {
      if (state.modal.mode === 'create') {
        actions.addLocation(locationData);
      } else {
        actions.updateLocation(locationData);
      }
      actions.closeModal();
    } catch (error) {
      actions.setError({ message: 'Failed to save location', type: 'location' });
    }
  };

  const handleInventorySubmit = async (inventoryData) => {
    try {
      actions.addInventory(inventoryData);
      actions.closeModal();
    } catch (error) {
      actions.setError({ message: 'Failed to save inventory', type: 'inventory' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" color="blue" />
          <p className="mt-4 text-gray-600">Đang tải dữ liệu kho...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <WarehouseHeader
        onViewChange={setActiveView}
        activeView={activeView}
      />

      <div className="px-6 py-6 space-y-6">
        {/* Statistics */}
        <FadeTransition show={true} duration={500}>
          <StatisticsCards statistics={state.statistics} />
        </FadeTransition>

        {/* Quick Actions */}
        <SlideTransition show={true} direction="down" duration={300} delay={200}>
          <QuickActions
            onAddLocation={() => actions.openModal('location', null, 'create')}
            onAddInventory={() => actions.openModal('inventory', null, 'create')}
            onExport={() => logger.info('Export data')}
            onImport={() => logger.info('Import data')}
            onGenerateReport={() => logger.info('Generate report')}
          />
        </SlideTransition>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Primary Content Area */}
          <div className="xl:col-span-3">
            <FadeTransition show={activeView === 'map'} duration={300}>
              {activeView === 'map' && (
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Interactive Warehouse Map
                    </h2>
                    <p className="text-gray-600">
                      Click on locations to view details
                    </p>
                  </div>
                  <div className="p-6">
                    <div id="warehouse-map-container" className="border rounded-lg" />
                  </div>
                </div>
              )}
            </FadeTransition>

            <FadeTransition show={activeView === 'locations'} duration={300}>
              {activeView === 'locations' && (
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Location Management
                    </h2>
                  </div>
                  <div className="p-6">
                    <DataTable
                      data={Array.from(state.locations.values())}
                      columns={[
                        { key: 'code', title: 'Mã vị trí', sortable: true },
                        { key: 'name', title: 'Tên vị trí', sortable: true },
                        { key: 'status', title: 'Trạng thái', sortable: true },
                        { key: 'capacity', title: 'Sức chứa', sortable: true, type: 'number' },
                        { key: 'currentStock', title: 'Hiện tại', sortable: true, type: 'number' },
                        {
                          key: 'utilizationRate',
                          title: 'Tỷ lệ sử dụng',
                          sortable: true,
                          type: 'percent',
                          render: (value, row) => `${((row.currentStock / row.capacity) * 100).toFixed(1)}%`
                        }
                      ]}
                      searchable={true}
                      sortable={true}
                      selectable={true}
                      onRowClick={(location) => {
                        setSelectedLocation(location);
                        actions.openModal('locationDetails', location, 'view');
                      }}
                    />
                  </div>
                </div>
              )}
            </FadeTransition>

            <FadeTransition show={activeView === 'inventory'} duration={300}>
              {activeView === 'inventory' && (
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Inventory Management
                    </h2>
                  </div>
                  <div className="p-6">
                    <DataTable
                      data={Array.from(state.inventory.values())}
                      columns={[
                        { key: 'sku', title: 'SKU', sortable: true },
                        { key: 'name', title: 'Tên sản phẩm', sortable: true },
                        { key: 'category', title: 'Danh mục', sortable: true },
                        { key: 'quantity', title: 'Số lượng', sortable: true, type: 'number' },
                        { key: 'price', title: 'Giá', sortable: true, type: 'currency' },
                        { key: 'value', title: 'Tổng giá trị', sortable: true, type: 'currency' }
                      ]}
                      searchable={true}
                      sortable={true}
                      selectable={true}
                    />
                  </div>
                </div>
              )}
            </FadeTransition>

            <FadeTransition show={activeView === 'analytics'} duration={300}>
              {activeView === 'analytics' && (
                <div className="bg-white rounded-xl shadow-sm border">
                  <div className="p-6 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Analytics & Reports
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <h3 className="font-medium text-gray-900 mb-2">Utilization Chart</h3>
                        <p className="text-gray-600">Chart component will be rendered here</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <h3 className="font-medium text-gray-900 mb-2">Inventory Distribution</h3>
                        <p className="text-gray-600">Chart component will be rendered here</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </FadeTransition>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1">
            <SlideTransition show={true} direction="left" duration={400} delay={300}>
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Quick Info
                </h3>
                <div className="space-y-4">
                  <div className="text-sm">
                    <p className="text-gray-600">Selected Location:</p>
                    <p className="font-medium">
                      {selectedLocation ? selectedLocation.name : 'None'}
                    </p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600">View Mode:</p>
                    <p className="font-medium capitalize">{activeView}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600">Last Updated:</p>
                    <p className="font-medium">
                      {new Date().toLocaleTimeString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>
            </SlideTransition>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={state.modal.isOpen && state.modal.type === 'location'}
        onClose={actions.closeModal}
        title={state.modal.mode === 'create' ? 'Thêm Vị Trí Mới' : 'Chỉnh Sửa Vị Trí'}
        size="large"
      >
        <LocationForm
          location={state.modal.data}
          zones={Array.from(state.zones.values())}
          onSubmit={handleLocationSubmit}
          onCancel={actions.closeModal}
          mode={state.modal.mode}
        />
      </Modal>

      <Modal
        isOpen={state.modal.isOpen && state.modal.type === 'inventory'}
        onClose={actions.closeModal}
        title={state.modal.mode === 'create' ? 'Thêm Sản Phẩm Mới' : 'Chỉnh Sửa Sản Phẩm'}
        size="xlarge"
      >
        <InventoryForm
          item={state.modal.data}
          locations={Array.from(state.locations.values())}
          categories={['Electronics', 'Food', 'Clothing', 'Books', 'Furniture']}
          onSubmit={handleInventorySubmit}
          onCancel={actions.closeModal}
          mode={state.modal.mode}
        />
      </Modal>

      <LocationDetailsModal
        isOpen={state.modal.isOpen && state.modal.type === 'locationDetails'}
        onClose={actions.closeModal}
        location={state.modal.data}
        inventory={state.modal.data ? Array.from(state.inventory.values()).filter(
          item => item.locationId === state.modal.data.id
        ) : []}
        onEdit={(location) => actions.openModal('location', location, 'edit')}
      />

      {/* Error Display */}
      {state.error.message && (
        <FadeTransition show={true} duration={300}>
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-sm">
            <div className="flex items-center justify-between">
              <span>{state.error.message}</span>
              <button
                onClick={actions.clearError}
                className="ml-2 text-red-700 hover:text-red-900"
              >
                ×
              </button>
            </div>
          </div>
        </FadeTransition>
      )}
    </div>
  );
}

// Main wrapper with state provider
const ModernWarehouseMapPage = () => {
  return (
    <WarehouseStateProvider>
      <WarehouseMapContent />
    </WarehouseStateProvider>
  );
};

export default ModernWarehouseMapPage;
