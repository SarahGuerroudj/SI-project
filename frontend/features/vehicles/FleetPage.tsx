import React, { useState, useMemo } from 'react';
import VehicleList from './VehicleList';
import Modal from '../../components/ui/shared/Modal';
import VehicleForm from './VehicleForm';
import { useData } from '../../contexts/DataContext';
import { Vehicle } from '../../types';
import { Plus, Truck, CheckCircle, AlertCircle, Wrench, Search, X, Filter, Package } from 'lucide-react';

const FleetPage: React.FC = () => {
  const { getItems, addItem, updateItem, deleteItem } = useData();
  const allVehicles = getItems<Vehicle>('vehicles');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Available' | 'In Use' | 'Maintenance'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);

  // Filter vehicles based on search and status filter
  const vehicles = useMemo(() => {
    let filtered = allVehicles;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(vehicle =>
        vehicle.plate.toLowerCase().includes(searchLower) ||
        vehicle.model.toLowerCase().includes(searchLower) ||
        vehicle.id.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === statusFilter);
    }

    return filtered;
  }, [allVehicles, searchTerm, statusFilter]);

  const handleOpenModal = (vehicle: Vehicle | null = null) => {
    setEditingVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingVehicle(null);
    setIsModalOpen(false);
  };

  const handleOpenDeleteModal = (vehicle: Vehicle) => {
    setDeletingVehicle(vehicle);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeletingVehicle(null);
    setIsDeleteModalOpen(false);
  };

  const handleSaveVehicle = (vehicleData: Omit<Vehicle, 'id'> | Vehicle) => {
    if ('id' in vehicleData) {
      updateItem('vehicles', vehicleData);
    } else {
      addItem('vehicles', vehicleData);
    }
    handleCloseModal();
  };

  const handleDeleteVehicle = () => {
    if (deletingVehicle) {
      deleteItem('vehicles', deletingVehicle.id);
      handleCloseDeleteModal();
    }
  };

  // Calculate vehicle statistics
  const stats = useMemo(() => {
    const available = allVehicles.filter(v => v.status === 'Available').length;
    const inUse = allVehicles.filter(v => v.status === 'In Use').length;
    const maintenance = allVehicles.filter(v => v.status === 'Maintenance').length;
    const totalCapacity = allVehicles.reduce((sum, v) => sum + v.capacityKg, 0);
    const availableCapacity = allVehicles
      .filter(v => v.status === 'Available')
      .reduce((sum, v) => sum + v.capacityKg, 0);

    return {
      total: allVehicles.length,
      available,
      inUse,
      maintenance,
      totalCapacity,
      availableCapacity,
      utilizationRate: allVehicles.length > 0 ? ((inUse / allVehicles.length) * 100).toFixed(1) : '0',
    };
  }, [allVehicles]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Fleet Management</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your vehicle fleet and track availability</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-lime-400 text-slate-900 rounded-full hover:bg-lime-300 flex items-center gap-2 shadow-sm hover:shadow-md transition-all font-semibold hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Add Vehicle
          </button>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-slate-200 dark:border-slate-800 hover:border-lime-400/50 transition-all hover:-translate-y-1 duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-lime-100 dark:bg-lime-900/30 rounded-xl group-hover:bg-lime-200 dark:group-hover:bg-lime-900/50 transition-colors">
                <Truck className="text-lime-600 dark:text-lime-400" size={24} />
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium uppercase tracking-wide">Total Vehicles</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-slate-200 dark:border-slate-800 hover:border-green-400/50 transition-all hover:-translate-y-1 duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium uppercase tracking-wide">Available</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.available}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats.availableCapacity.toLocaleString()} kg capacity
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-slate-200 dark:border-slate-800 hover:border-blue-400/50 transition-all hover:-translate-y-1 duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <AlertCircle className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium uppercase tracking-wide">In Use</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.inUse}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats.utilizationRate}% utilization
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-slate-200 dark:border-slate-800 hover:border-yellow-400/50 transition-all hover:-translate-y-1 duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
                <Wrench className="text-yellow-600 dark:text-yellow-400" size={24} />
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium uppercase tracking-wide">Maintenance</div>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.maintenance}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats.maintenance > 0 ? 'Needs attention' : 'All operational'}
            </div>
          </div>
        </div>

        {/* Capacity Summary */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Package className="text-slate-400" size={20} />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fleet Capacity</p>
              </div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {stats.totalCapacity.toLocaleString()} <span className="text-lg text-slate-500 dark:text-slate-400">kg</span>
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {stats.availableCapacity.toLocaleString()} kg available for use
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
              <Truck className="text-slate-400 dark:text-slate-500" size={40} />
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-4 border border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search vehicles by plate, model, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="text-slate-400" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          {vehicles.length !== allVehicles.length && (
            <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Showing {vehicles.length} of {allVehicles.length} vehicles
            </div>
          )}
        </div>
      </div>

      {/* Vehicles Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Vehicles</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your vehicle fleet and track their status
            </p>
          </div>
        </div>
        <VehicleList vehicles={vehicles} onEdit={handleOpenModal} onDelete={handleOpenDeleteModal} />
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}>
        <VehicleForm vehicle={editingVehicle} onSubmit={handleSaveVehicle} onCancel={handleCloseModal} />
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} title="Delete Vehicle">
        {deletingVehicle && (
          <div>
            <p className="text-slate-700 dark:text-slate-300">
              Are you sure you want to delete vehicle <strong>{deletingVehicle.plate}</strong> ({deletingVehicle.model})?
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteVehicle}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default FleetPage;

