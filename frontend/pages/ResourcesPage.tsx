import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DriversList from '../features/drivers/DriversList';
import Modal from '../components/ui/shared/Modal';
import DriverForm from '../features/drivers/DriverForm';
import { useData } from '../contexts/DataContext';
import { Driver } from '../types';
import { Plus, Users, Truck, User, Tag, DollarSign } from 'lucide-react';

const ResourcesPage: React.FC = () => {
  const { getItems, addItem, updateItem, deleteItem } = useData();
  const drivers = getItems<Driver>('drivers');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [deletingDriver, setDeletingDriver] = useState<Driver | null>(null);

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

  // Calculate driver statistics
  const availableDrivers = drivers.filter(d => d.status === 'Available').length;
  const onRouteDrivers = drivers.filter(d => d.status === 'On Route').length;
  const offDutyDrivers = drivers.filter(d => d.status === 'Off Duty').length;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Resource Management</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage drivers, clients, and fleet resources</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Drivers</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{drivers.length}</p>
            </div>
            <div className="p-3 bg-lime-100 dark:bg-lime-900/30 rounded-lg">
              <Users className="text-lime-600 dark:text-lime-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Available</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{availableDrivers}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <User className="text-green-600 dark:text-green-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">On Route</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{onRouteDrivers}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Truck className="text-blue-600 dark:text-blue-400" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link
          to="/clients"
          className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-800 hover:border-lime-500 dark:hover:border-lime-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Clients</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage client information</p>
            </div>
            <Users className="text-slate-400 dark:text-slate-500" size={24} />
          </div>
        </Link>

        <Link
          to="/fleet"
          className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-800 hover:border-lime-500 dark:hover:border-lime-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Fleet</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage vehicle fleet</p>
            </div>
            <Truck className="text-slate-400 dark:text-slate-500" size={24} />
          </div>
        </Link>

        <Link
          to="/service-types"
          className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-800 hover:border-lime-500 dark:hover:border-lime-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Service Types</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Standard, Express, International</p>
            </div>
            <Tag className="text-slate-400 dark:text-slate-500" size={24} />
          </div>
        </Link>

        <Link
          to="/pricing"
          className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-800 hover:border-lime-500 dark:hover:border-lime-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pricing</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Service + destination pricing</p>
            </div>
            <DollarSign className="text-slate-400 dark:text-slate-500" size={24} />
          </div>
        </Link>
      </div>

      {/* Drivers Section */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 border border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Drivers</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your driver resources and their availability
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2 bg-lime-500 text-white rounded-md hover:bg-lime-600 flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add Driver
          </button>
        </div>
        <DriversList drivers={drivers} onEdit={handleOpenModal} onDelete={handleOpenDeleteModal} />
      </div>

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

export default ResourcesPage;

