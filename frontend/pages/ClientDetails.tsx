import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Client, Shipment } from '../types';
import { ArrowLeft, Mail, Phone, MapPin, DollarSign, Package, Calendar } from 'lucide-react';

const ClientDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getItems } = useData();
  const clients = getItems<Client>('clients');
  const shipments = getItems<Shipment>('shipments');
  const client = clients.find(c => c.id === id);

  if (!client) {
    return <Navigate to="/clients" replace />;
  }

  // Get shipments for this client
  const clientShipments = shipments.filter(s => s.clientId === client.id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Delayed':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200';
    }
  };

  return (
    <div className="p-6">
      <Link
        to="/clients"
        className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 mb-6"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Clients
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{client.name}</h1>
            <p className="text-slate-500 dark:text-slate-400">Client ID: {client.id}</p>
          </div>
          <div className={`px-4 py-2 rounded-md font-semibold ${client.balance >= 0
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
            Balance: {client.balance >= 0 ? '+' : ''}{client.balance.toFixed(2)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start">
            <Mail size={20} className="text-slate-400 mr-3 mt-1" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Email</p>
              <p className="text-slate-900 dark:text-white">{client.email}</p>
            </div>
          </div>

          <div className="flex items-start">
            <Phone size={20} className="text-slate-400 mr-3 mt-1" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Phone</p>
              <p className="text-slate-900 dark:text-white">{client.phone}</p>
            </div>
          </div>

          <div className="flex items-start md:col-span-2">
            <MapPin size={20} className="text-slate-400 mr-3 mt-1" />
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Address</p>
              <p className="text-slate-900 dark:text-white">{client.address}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Package size={20} className="text-slate-400 mr-2" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Shipments ({clientShipments.length})
          </h2>
        </div>

        {clientShipments.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400 text-center py-8">
            No shipments found for this client.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Weight
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {clientShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-4 py-3 text-sm font-mono text-slate-900 dark:text-white">
                      {shipment.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {shipment.destination}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {shipment.weight} kg
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      ${shipment.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor(shipment.status)}`}>
                        {shipment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                      {formatDate(shipment.dateCreated)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDetails;

