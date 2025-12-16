import React from 'react';
import { Vehicle } from '../../types';
import { Edit, Trash2, Truck, Package, CheckCircle, AlertCircle, Wrench } from 'lucide-react';

interface VehicleListProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'In Use':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Maintenance':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Available':
        return <CheckCircle size={14} />;
      case 'In Use':
        return <AlertCircle size={14} />;
      case 'Maintenance':
        return <Wrench size={14} />;
      default:
        return null;
    }
  };

  if (vehicles.length === 0) {
    return (
      <div className="p-12 text-center">
        <Truck className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No vehicles found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Get started by adding your first vehicle to the fleet
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Model</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Capacity</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {vehicles.map(vehicle => (
            <tr 
              key={vehicle.id}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center">
                    <Truck className="text-white" size={20} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-900 dark:text-white font-mono">{vehicle.plate}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{vehicle.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="font-medium text-sm text-slate-900 dark:text-white">{vehicle.model}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-slate-400" />
                  <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                    {vehicle.capacityKg.toLocaleString()} kg
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                  {getStatusIcon(vehicle.status)}
                  <span>{vehicle.status}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onEdit(vehicle)} 
                    className="p-2 text-slate-400 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-lime-50 dark:hover:bg-lime-900/20 rounded-lg transition-colors"
                    title="Edit Vehicle"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(vehicle)} 
                    className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete Vehicle"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleList;

