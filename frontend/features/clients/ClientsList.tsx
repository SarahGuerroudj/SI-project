import React from 'react';
import { Link } from 'react-router-dom';
import { Client } from '../../types';
import { Edit, Trash2, ExternalLink, Mail, Phone, MapPin, DollarSign, Users } from 'lucide-react';

interface ClientsListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

const ClientsList: React.FC<ClientsListProps> = ({ clients, onEdit, onDelete }) => {
  const getBalanceColor = (balance: number) => {
    if (balance > 0) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (balance < 0) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    return 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800';
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return '↑';
    if (balance < 0) return '↓';
    return '—';
  };

  if (clients.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
        <Users className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No clients found</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Get started by adding your first client
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Address</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Balance</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {clients.map(client => (
              <tr
                key={client.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-white font-semibold text-sm">
                      {client.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">{client.name}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">{client.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Mail size={14} className="text-slate-400" />
                      <span className="truncate max-w-[200px]">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Phone size={14} className="text-slate-400" />
                      <span>{client.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2 max-w-[250px]">{client.address}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-sm ${getBalanceColor(client.balance)}`}>
                    <DollarSign size={14} />
                    <span>{Math.abs(client.balance).toFixed(2)}</span>
                    <span className="text-xs">{getBalanceIcon(client.balance)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      to={`/clients/${client.id}`}
                      className="p-2 text-slate-400 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-lime-50 dark:hover:bg-lime-900/20 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <ExternalLink size={18} />
                    </Link>
                    <button
                      onClick={() => onEdit(client)}
                      className="p-2 text-slate-400 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-lime-50 dark:hover:bg-lime-900/20 rounded-lg transition-colors"
                      title="Edit Client"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(client)}
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete Client"
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
    </div>
  );
};

export default ClientsList;
