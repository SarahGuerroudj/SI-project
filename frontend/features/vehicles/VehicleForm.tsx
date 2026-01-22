import React, { useState, useEffect } from 'react';
import { Vehicle } from '../../types';

interface VehicleFormProps {
  vehicle?: Vehicle | null;
  onSubmit: (vehicle: Omit<Vehicle, 'id'> | Vehicle) => void;
  onCancel: () => void;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ vehicle, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    plate: '',
    model: '',
    capacityKg: 0,
    status: 'Available' as 'Available' | 'In Use' | 'Maintenance',
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        plate: vehicle.plate,
        model: vehicle.model,
        capacityKg: vehicle.capacityKg,
        status: vehicle.status,
      });
    } else {
      setFormData({
        plate: '',
        model: '',
        capacityKg: 0,
        status: 'Available',
      });
    }
  }, [vehicle]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (vehicle) {
      onSubmit({ ...vehicle, ...formData });
    } else {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">License Plate</label>
          <input
            type="text"
            name="plate"
            value={formData.plate}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm font-mono"
            required
            placeholder="TR-123-A"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Model</label>
          <input
            type="text"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm"
            required
            placeholder="Volvo FH16"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Capacity (kg)</label>
          <input
            type="number"
            name="capacityKg"
            value={formData.capacityKg}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm"
            required
            min="0"
            step="1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-lime-500 focus:border-lime-500 sm:text-sm"
          >
            <option>Available</option>
            <option>In Use</option>
            <option>Maintenance</option>
          </select>
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-lime-600 rounded-md hover:bg-lime-700"
        >
          {vehicle ? 'Update Vehicle' : 'Create Vehicle'}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;

