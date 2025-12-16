import React, { useState, useMemo } from 'react';
import { Route, ShipmentStatus } from '../types';
import { Map, User, Truck, Package, Save, ArrowLeft, Calendar, CheckCircle, Navigation, ChevronDown, ChevronUp, Search, X, Clock, Play, Filter } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useData } from '../contexts/DataContext';

const Routes: React.FC = () => {
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedShipments, setSelectedShipments] = useState<string[]>([]);
  const [shipmentSearch, setShipmentSearch] = useState('');
  const [viewingRoute, setViewingRoute] = useState<Route | null>(null);

  // UI state: collapsible sections
  const [driversOpen, setDriversOpen] = useState(true);
  const [vehiclesOpen, setVehiclesOpen] = useState(true);
  const [shipmentsOpen, setShipmentsOpen] = useState(true);

  const { addToast } = useToast();
  const { getItems, addItem } = useData();

  // Get data from context
  const drivers = getItems('drivers');
  const vehicles = getItems('vehicles');
  const shipments = getItems('shipments');
  const routes = getItems('routes');

  // Filter out shipments that are already assigned to a route (based on backend status OR local calculation if needed)
  // For now, we assume backend updates shipment status to 'In Transit' or 'Planned' if assigned.
  // We can also double check against existing routes' shipmentIds if critical.

  // NOTE: Simple check: if shipment.status is 'Pending', it's available.
  const availableShipments = useMemo(() => {
    const term = shipmentSearch.trim().toLowerCase();
    return shipments.filter(s => {
      // Must be pending to be assigned
      const isPending = s.status === 'Pending';
      if (!isPending) return false;

      // Filter by search
      if (!term) return true;
      return (
        s.destination.toLowerCase().includes(term) ||
        s.clientName.toLowerCase().includes(term) ||
        s.id.toLowerCase().includes(term)
      );
    });
  }, [shipments, shipmentSearch]);

  const handleToggleShipment = (id: string) => {
    if (selectedShipments.includes(id)) {
      setSelectedShipments(selectedShipments.filter(s => s !== id));
    } else {
      setSelectedShipments([...selectedShipments, id]);
    }
  };

  const handleSaveRoute = async () => {
    if (!selectedDriver || !selectedVehicle || selectedShipments.length === 0) {
      try { addToast('error', 'Please select driver, vehicle and at least one shipment.'); } catch (err) { }
      return;
    }

    try {
      await addItem('routes', {
        driverId: selectedDriver,
        vehicleId: selectedVehicle,
        shipmentIds: selectedShipments,
        date: new Date().toISOString().split('T')[0],
        status: 'Planned'
      });

      // Reset selection
      setSelectedShipments([]);
      setSelectedDriver('');
      setSelectedVehicle('');

      try { addToast('success', 'Route created successfully.'); } catch (err) { }

      // Optionally switch to the newly created route if we could identify it, 
      // but simple refresh is fine for now.
    } catch (error) {
      console.error(error);
      try { addToast('error', 'Failed to create route.'); } catch (err) { }
    }
  };

  const handleViewRoute = (route: Route) => {
    setViewingRoute(route);
  };

  const handleBackToPlanning = () => {
    setViewingRoute(null);
  };

  // Helper to get details for the detail view
  const getDriver = (id: string) => drivers.find((d: any) => d.id.toString() === id.toString());
  const getVehicle = (id: string) => vehicles.find((v: any) => v.id.toString() === id.toString());
  const getShipments = (ids: string[]) => shipments.filter(s => ids.includes(s.id));

  // Calculate total weight and volume for selected shipments
  const selectedShipmentsData = useMemo(() => {
    const selected = shipments.filter(s => selectedShipments.includes(s.id));
    return {
      totalWeight: selected.reduce((sum, s) => sum + s.weight, 0),
      totalVolume: selected.reduce((sum, s) => sum + s.volume, 0),
      count: selected.length
    };
  }, [selectedShipments, shipments]);

  // Get vehicle capacity
  const selectedVehicleData = selectedVehicle ? getVehicle(selectedVehicle) : null;
  const isCapacityExceeded = selectedVehicleData && selectedShipmentsData.totalWeight > selectedVehicleData.capacityKg;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planned':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Completed':
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left sidebar: Active Routes */}
      <aside className="lg:col-span-3 col-span-1 bg-transparent">
        <div className="sticky top-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Map className="text-lime-600" size={18} /> Routes
              </h4>
              {routes.length > 0 && (
                <span className="text-xs bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 px-2 py-1 rounded-full font-medium">
                  {routes.length}
                </span>
              )}
            </div>
            <div className="space-y-2 max-h-[calc(100vh-250px)] overflow-y-auto">
              {routes.length === 0 ? (
                <div className="text-center py-8">
                  <Map className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={32} />
                  <p className="text-sm text-slate-500 dark:text-slate-400">No routes created yet</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Create your first route to get started</p>
                </div>
              ) : (
                routes.map(route => {
                  const driver = getDriver(route.driverId);
                  const vehicle = getVehicle(route.vehicleId);
                  const isActive = viewingRoute?.id === route.id;

                  return (
                    <button
                      key={route.id}
                      onClick={() => handleViewRoute(route)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${isActive
                          ? 'bg-lime-50 dark:bg-lime-900/20 border-lime-300 dark:border-lime-700 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-lime-300 dark:hover:border-lime-700 hover:shadow-sm'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-sm text-slate-900 dark:text-white">{route.id}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(route.status)}`}>
                          {route.status}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <User size={12} />
                          <span>{driver?.name || (route as any).driverName || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <Truck size={12} />
                          <span>{vehicle?.plate || (route as any).vehiclePlate || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mt-2">
                          <Package size={12} />
                          <span className="font-medium">{route.shipmentIds.length} shipment{route.shipmentIds.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Calendar size={10} />
                          <span>{new Date(route.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:col-span-9 col-span-1 flex flex-col gap-6">
        {/* Planning panel */}
        {!viewingRoute ? (
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col">
            <header className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Plan New Route</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Select driver, vehicle, and shipments to create a route</p>
                </div>
              </div>

              {/* Selection Summary */}
              {(selectedDriver || selectedVehicle || selectedShipments.length > 0) && (
                <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedDriver ? 'bg-lime-100 dark:bg-lime-900/30' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        <User className={selectedDriver ? 'text-lime-600 dark:text-lime-400' : 'text-slate-400'} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Driver</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {selectedDriver ? getDriver(selectedDriver)?.name : 'Not selected'}
                        </div>
                      </div>
                      {selectedDriver && (
                        <button onClick={() => setSelectedDriver('')} className="text-slate-400 hover:text-red-500">
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedVehicle ? 'bg-lime-100 dark:bg-lime-900/30' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        <Truck className={selectedVehicle ? 'text-lime-600 dark:text-lime-400' : 'text-slate-400'} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Vehicle</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {selectedVehicle ? getVehicle(selectedVehicle)?.plate : 'Not selected'}
                        </div>
                      </div>
                      {selectedVehicle && (
                        <button onClick={() => setSelectedVehicle('')} className="text-slate-400 hover:text-red-500">
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${selectedShipments.length > 0 ? 'bg-lime-100 dark:bg-lime-900/30' : 'bg-slate-200 dark:bg-slate-700'}`}>
                        <Package className={selectedShipments.length > 0 ? 'text-lime-600 dark:text-lime-400' : 'text-slate-400'} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-slate-500 dark:text-slate-400">Shipments</div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {selectedShipments.length} selected
                        </div>
                      </div>
                      {selectedShipments.length > 0 && (
                        <button onClick={() => setSelectedShipments([])} className="text-slate-400 hover:text-red-500">
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Capacity Warning */}
                  {selectedVehicle && selectedShipments.length > 0 && (
                    <div className={`mt-3 p-3 rounded-lg ${isCapacityExceeded ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'}`}>
                      <div className="flex items-center justify-between text-sm">
                        <span className={isCapacityExceeded ? 'text-red-700 dark:text-red-400' : 'text-blue-700 dark:text-blue-400'}>
                          Total Weight: {selectedShipmentsData.totalWeight.toLocaleString()} kg
                        </span>
                        <span className={isCapacityExceeded ? 'text-red-700 dark:text-red-400 font-semibold' : 'text-blue-700 dark:text-blue-400'}>
                          Capacity: {selectedVehicleData?.capacityKg.toLocaleString()} kg
                        </span>
                      </div>
                      {isCapacityExceeded && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">⚠️ Capacity exceeded! Please reduce shipment weight.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </header>

            <div className="space-y-4 overflow-y-auto pr-2 flex-1">
              {/* Drivers */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <button onClick={() => setDriversOpen(!driversOpen)} className="w-full flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedDriver ? 'bg-lime-100 dark:bg-lime-900/30' : 'bg-white dark:bg-slate-900'}`}>
                      <User className={selectedDriver ? 'text-lime-600 dark:text-lime-400' : 'text-slate-400'} size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">Select Driver</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Choose an available driver</div>
                    </div>
                  </div>
                  <div className="text-slate-400">{driversOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
                </button>

                {driversOpen && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {drivers.map((driver: any) => {
                      const isSelected = selectedDriver === driver.id;
                      const isAvailable = driver.status === 'Available';

                      return (
                        <button
                          key={driver.id}
                          onClick={() => isAvailable && setSelectedDriver(driver.id)}
                          disabled={!isAvailable}
                          className={`text-left p-4 rounded-lg border-2 transition-all ${isSelected
                              ? 'border-lime-500 bg-lime-50 dark:bg-lime-900/20 shadow-md'
                              : isAvailable
                                ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-lime-300 dark:hover:border-lime-700 hover:shadow-sm'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 opacity-60 cursor-not-allowed'
                            }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">{driver.name}</div>
                            {isSelected && <CheckCircle className="text-lime-600 dark:text-lime-400" size={16} />}
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-slate-500 dark:text-slate-400">License: {driver.licenseNumber}</div>
                            <div className="flex items-center gap-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${driver.status === 'Available'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : driver.status === 'On Route'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                }`}>
                                {driver.status}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Vehicles */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800">
                <button onClick={() => setVehiclesOpen(!vehiclesOpen)} className="w-full flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedVehicle ? 'bg-lime-100 dark:bg-lime-900/30' : 'bg-white dark:bg-slate-900'}`}>
                      <Truck className={selectedVehicle ? 'text-lime-600 dark:text-lime-400' : 'text-slate-400'} size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">Select Vehicle</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Choose a vehicle for the route</div>
                    </div>
                  </div>
                  <div className="text-slate-400">{vehiclesOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
                </button>

                {vehiclesOpen && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {vehicles.map((vehicle: any) => {
                      const isSelected = selectedVehicle === vehicle.id;
                      const isAvailable = vehicle.status === 'Available';

                      return (
                        <button
                          key={vehicle.id}
                          onClick={() => isAvailable && setSelectedVehicle(vehicle.id)}
                          disabled={!isAvailable}
                          className={`text-left p-4 rounded-lg border-2 transition-all ${isSelected
                              ? 'border-lime-500 bg-lime-50 dark:bg-lime-900/20 shadow-md'
                              : isAvailable
                                ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-lime-300 dark:hover:border-lime-700 hover:shadow-sm'
                                : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 opacity-60 cursor-not-allowed'
                            }`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="text-sm font-semibold text-slate-900 dark:text-white">{vehicle.model}</div>
                              <div className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-1">{vehicle.plate}</div>
                            </div>
                            {isSelected && <CheckCircle className="text-lime-600 dark:text-lime-400" size={16} />}
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-slate-500 dark:text-slate-400">Capacity: {vehicle.capacityKg.toLocaleString()} kg</div>
                            <div className="flex items-center gap-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${vehicle.status === 'Available'
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : vehicle.status === 'In Use'
                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                {vehicle.status}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Shipments */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex-1 min-h-[200px] flex flex-col">
                <button onClick={() => setShipmentsOpen(!shipmentsOpen)} className="w-full flex items-center justify-between py-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedShipments.length > 0 ? 'bg-lime-100 dark:bg-lime-900/30' : 'bg-white dark:bg-slate-900'}`}>
                      <Package className={selectedShipments.length > 0 ? 'text-lime-600 dark:text-lime-400' : 'text-slate-400'} size={20} />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        Shipments
                        {selectedShipments.length > 0 && (
                          <span className="ml-2 text-xs bg-lime-100 dark:bg-lime-900/30 text-lime-700 dark:text-lime-400 px-2 py-0.5 rounded-full">
                            {selectedShipments.length} selected
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Select pending shipments to assign</div>
                    </div>
                  </div>
                  <div className="text-slate-400">{shipmentsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
                </button>

                {shipmentsOpen && (
                  <div className="flex-1 flex flex-col">
                    {/* Search Bar */}
                    <div className="mb-3 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search by destination, client, or ID..."
                        value={shipmentSearch}
                        onChange={(e) => setShipmentSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                      />
                      {shipmentSearch && (
                        <button
                          onClick={() => setShipmentSearch('')}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {/* Shipments List */}
                    <div className="flex-1 space-y-2 overflow-y-auto pr-2">
                      {availableShipments.length === 0 ? (
                        <div className="text-center py-8">
                          <Package className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={32} />
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {shipmentSearch ? 'No shipments match your search' : 'No pending shipments available'}
                          </p>
                        </div>
                      ) : (
                        availableShipments.map(shipment => {
                          const isSelected = selectedShipments.includes(shipment.id);

                          return (
                            <div
                              key={shipment.id}
                              className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all cursor-pointer ${isSelected
                                  ? 'border-lime-500 bg-lime-50 dark:bg-lime-900/20 shadow-sm'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-lime-300 dark:hover:border-lime-700 hover:shadow-sm'
                                }`}
                              onClick={() => handleToggleShipment(shipment.id)}
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`mt-1 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isSelected
                                    ? 'bg-lime-500 border-lime-500'
                                    : 'border-slate-300 dark:border-slate-600'
                                  }`}>
                                  {isSelected && <CheckCircle className="text-white" size={14} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-sm text-slate-900 dark:text-white">{shipment.destination}</div>
                                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {shipment.clientName} • <span className="font-mono">{shipment.id}</span>
                                  </div>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                      📦 {shipment.weight} kg
                                    </span>
                                    <span className="text-xs text-slate-600 dark:text-slate-400">
                                      📏 {shipment.volume} m³
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4 flex-shrink-0">
                                <div className="text-right">
                                  <div className="text-xs font-semibold text-slate-900 dark:text-white mb-1">
                                    ${shipment.price.toFixed(2)}
                                  </div>
                                  <div className={`text-xs px-2 py-1 rounded-full ${isSelected
                                      ? 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400'
                                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                    {isSelected ? 'Selected' : 'Click to select'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {selectedShipments.length > 0 && selectedVehicle && (
                  <span className={isCapacityExceeded ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}>
                    Total: {selectedShipmentsData.totalWeight.toLocaleString()} kg / {selectedVehicleData?.capacityKg.toLocaleString()} kg
                  </span>
                )}
              </div>
              <button
                onClick={handleSaveRoute}
                disabled={!selectedDriver || !selectedVehicle || selectedShipments.length === 0 || isCapacityExceeded}
                className="px-6 py-3 rounded-lg bg-lime-500 hover:bg-lime-600 text-white font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save size={18} />
                Create Route
              </button>
            </div>
          </section>
        ) : (
          // Detail view
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Route Details</h2>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(viewingRoute!.status)}`}>
                    {viewingRoute?.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(viewingRoute!.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Package size={14} />
                    <span>{viewingRoute!.shipmentIds.length} shipment{viewingRoute!.shipmentIds.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleBackToPlanning}
                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Planning
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <User className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver</div>
                </div>
                <div className="font-semibold text-lg text-slate-900 dark:text-white mb-1">{getDriver(viewingRoute!.driverId)?.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">License: {getDriver(viewingRoute!.driverId)?.licenseNumber}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Phone: {getDriver(viewingRoute!.driverId)?.phone}</div>
              </div>
              <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Truck className="text-purple-600 dark:text-purple-400" size={20} />
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle</div>
                </div>
                <div className="font-semibold text-lg text-slate-900 dark:text-white mb-1">{getVehicle(viewingRoute!.vehicleId)?.model}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Plate: <span className="font-mono">{getVehicle(viewingRoute!.vehicleId)?.plate}</span></div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Capacity: {getVehicle(viewingRoute!.vehicleId)?.capacityKg.toLocaleString()} kg</div>
              </div>
              <div className="p-5 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-lime-100 dark:bg-lime-900/30 rounded-lg">
                    <Package className="text-lime-600 dark:text-lime-400" size={20} />
                  </div>
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Summary</div>
                </div>
                <div className="font-semibold text-lg text-slate-900 dark:text-white mb-1">{viewingRoute?.shipmentIds.length} Shipments</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Route ID: <span className="font-mono">{viewingRoute?.id}</span></div>
                {(() => {
                  const shipments = getShipments(viewingRoute!.shipmentIds);
                  const totalWeight = shipments.reduce((sum, s) => sum + s.weight, 0);
                  return (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Weight: {totalWeight.toLocaleString()} kg</div>
                  );
                })()}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Shipments in Route</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Details of all shipments assigned to this route</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Destination</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Weight</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Volume</th>
                      <th className="px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {getShipments(viewingRoute!.shipmentIds).map(s => (
                      <tr key={s.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">{s.id}</td>
                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">{s.clientName}</td>
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{s.destination}</td>
                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200 text-right">{s.weight.toLocaleString()} kg</td>
                        <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200 text-right">{s.volume} m³</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.status === 'Delivered'
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : s.status === 'In Transit'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : s.status === 'Pending'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Route created on {new Date(viewingRoute!.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-lime-500 hover:bg-lime-600 text-white font-medium shadow-sm hover:shadow-md transition-all">
                <Navigation size={18} />
                Start Navigation
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Routes;