import React, { useState, useMemo } from 'react';
import DriversList from './DriversList';
import Modal from '../shared/Modal';
import DriverForm from './DriverForm';
import { useData } from '../../contexts/DataContext';
import { Driver } from '../../types';
import { Plus, Users, CheckCircle, Navigation, Clock, Search, X, Filter } from 'lucide-react';

const DriversPage: React.FC = () => {
  const { getItems, addItem, updateItem, deleteItem } = useData();
  const allDrivers = getItems<Driver>('drivers');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Available' | 'On Route' | 'Off Duty'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null);

  // Filter drivers based on search and status filter
  const drivers = useMemo(() => {
    let filtered = allDrivers;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(driver =>
        driver.name.toLowerCase().includes(searchLower) ||
        driver.licenseNumber.toLowerCase().includes(searchLower) ||
        driver.phone.toLowerCase().includes(searchLower) ||
        driver.id.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(driver => driver.status === statusFilter);
    }

    return filtered;
  }, [allDrivers, searchTerm, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const available = allDrivers.filter(d => d.status === 'Available').length;
    const onRoute = allDrivers.filter(d => d.status === 'On Route').length;
    const offDuty = allDrivers.filter(d => d.status === 'Off Duty').length;
    const utilizationRate = allDrivers.length > 0 ? ((onRoute / allDrivers.length) * 100).toFixed(1) : '0';

    return {
      total: allDrivers.length,
      available,
      onRoute,
      offDuty,
      utilizationRate,
    };
  }, [allDrivers]);

  const handleOpenModal = (driver: Driver | null = null) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingDriver(null);
    setIsModalOpen(false);
  };

  const handleOpenDeleteModal = (driver: Driver) => {
    setDeletingDriver(driver);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeletingDriver(null);
    setIsDeleteModalOpen(false);
  };

  const handleSaveDriver = (driverData: Omit<Driver, 'id'> | Driver) => {
    if ('id' in driverData) {
      updateItem('drivers', driverData);
    } else {
      addItem('drivers', driverData);
    }
    handleCloseModal();
  };

  const handleDeleteDriver = () => {
    if (deletingDriver) {
      deleteItem('drivers', deletingDriver.id);
      handleCloseDeleteModal();
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Drivers</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your driver team and track availability</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-lime-400 text-slate-900 rounded-full hover:bg-lime-300 flex items-center gap-2 shadow-sm hover:shadow-md transition-all font-semibold hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Add Driver
          </button>
        </div>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-slate-200 dark:border-slate-800 hover:border-lime-400/50 transition-all hover:-translate-y-1 duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-lime-100 dark:bg-lime-900/30 rounded-xl group-hover:bg-lime-200 dark:group-hover:bg-lime-900/50 transition-colors">
                <Users className="text-lime-600 dark:text-lime-400" size={24} />
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium uppercase tracking-wide">Total Drivers</div>
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
              Ready for assignment
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-slate-200 dark:border-slate-800 hover:border-blue-400/50 transition-all hover:-translate-y-1 duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <Navigation className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium uppercase tracking-wide">On Route</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.onRoute}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {stats.utilizationRate}% utilization
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-slate-200 dark:border-slate-800 hover:border-slate-400/50 transition-all hover:-translate-y-1 duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
                <Clock className="text-slate-600 dark:text-slate-400" size={24} />
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium uppercase tracking-wide">Off Duty</div>
            <div className="text-3xl font-bold text-slate-600 dark:text-slate-400">{stats.offDuty}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Not available
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
                placeholder="Search drivers by name, license number, phone, or ID..."
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
                <option value="On Route">On Route</option>
                <option value="Off Duty">Off Duty</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          {drivers.length !== allDrivers.length && (
            <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Showing {drivers.length} of {allDrivers.length} drivers
            </div>
          )}
        </div>
      </div>

      {/* Drivers List */}
      <DriversList drivers={drivers} onEdit={handleOpenModal} onDelete={handleOpenDeleteModal} />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingDriver ? 'Edit Driver' : 'Add Driver'}>
        <DriverForm driver={editingDriver} onSubmit={handleSaveDriver} onCancel={handleCloseModal} />
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} title="Delete Driver">
        {deletingDriver && (
          <div>
            <p className="text-slate-700 dark:text-slate-300">
              Are you sure you want to delete <strong>{deletingDriver.name}</strong>?
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteDriver}
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

export default DriversPage;
