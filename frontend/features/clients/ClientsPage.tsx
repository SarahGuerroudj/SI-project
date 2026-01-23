import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ClientsList from './ClientsList';
import Modal from '../../components/ui/shared/Modal';
import ClientForm from './ClientForm';
import { useData } from '../../contexts/DataContext';
import { Client } from '../../types';
import { Plus, Users, DollarSign, TrendingUp, TrendingDown, Search, X, Filter } from 'lucide-react';

const ClientsPage: React.FC = () => {
  const { getItems, addItem, updateItem, deleteItem } = useData();
  const allClients = getItems<Client>('clients');

  console.log('ClientsPage: Rendering');
  console.log('ClientsPage: allClients:', allClients);
  console.log('ClientsPage: isArray?', Array.isArray(allClients));

  const [searchTerm, setSearchTerm] = useState('');
  const [balanceFilter, setBalanceFilter] = useState<'all' | 'positive' | 'negative' | 'zero'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  // Filter clients based on search and balance filter
  const clients = useMemo(() => {
    let filtered = allClients;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower) ||
        client.phone.toLowerCase().includes(searchLower) ||
        client.address.toLowerCase().includes(searchLower) ||
        client.id.toLowerCase().includes(searchLower)
      );
    }

    // Apply balance filter
    if (balanceFilter === 'positive') {
      filtered = filtered.filter(client => client.balance > 0);
    } else if (balanceFilter === 'negative') {
      filtered = filtered.filter(client => client.balance < 0);
    } else if (balanceFilter === 'zero') {
      filtered = filtered.filter(client => client.balance === 0);
    }

    return filtered;
  }, [allClients, searchTerm, balanceFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalBalance = allClients.reduce((sum, client) => sum + (parseFloat(client.balance as unknown as string) || 0), 0);
    const positiveBalance = allClients.filter(c => c.balance > 0).length;
    const negativeBalance = allClients.filter(c => c.balance < 0).length;
    const zeroBalance = allClients.filter(c => c.balance === 0).length;

    return {
      total: allClients.length,
      totalBalance,
      positiveBalance,
      negativeBalance,
      zeroBalance,
    };
  }, [allClients]);

  const handleOpenModal = (client: Client | null = null) => {
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingClient(null);
    setIsModalOpen(false);
  };

  const handleOpenDeleteModal = (client: Client) => {
    setDeletingClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeletingClient(null);
    setIsDeleteModalOpen(false);
  };

  const handleSaveClient = async (clientData: Omit<Client, 'id'> | Client) => {
    if ('id' in clientData) {
      await updateItem('clients', clientData);
    } else {
      await addItem('clients', clientData);
    }
    handleCloseModal();
  };

  const handleDeleteClient = async () => {
    if (deletingClient) {
      await deleteItem('clients', deletingClient.id);
      handleCloseDeleteModal();
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Clients</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your client relationships and track balances</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 bg-lime-400 text-slate-900 rounded-full hover:bg-lime-300 flex items-center gap-2 shadow-sm hover:shadow-md transition-all font-semibold hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Add Client
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
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium uppercase tracking-wide">Total Clients</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-slate-200 dark:border-slate-800 hover:border-blue-400/50 transition-all hover:-translate-y-1 duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <DollarSign className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium uppercase tracking-wide">Total Balance</div>
            <div className={`text-3xl font-bold ${stats.totalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              ${stats.totalBalance.toFixed(2)}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-slate-200 dark:border-slate-800 hover:border-green-400/50 transition-all hover:-translate-y-1 duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <TrendingUp className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium uppercase tracking-wide">Positive Balance</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.positiveBalance}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm p-5 border border-slate-200 dark:border-slate-800 hover:border-red-400/50 transition-all hover:-translate-y-1 duration-300 group">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                <TrendingDown className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium uppercase tracking-wide">Negative Balance</div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.negativeBalance}</div>
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
                placeholder="Search clients by name, email, phone, address, or ID..."
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

            {/* Balance Filter */}
            <div className="flex items-center gap-2">
              <Filter className="text-slate-400" size={18} />
              <select
                value={balanceFilter}
                onChange={(e) => setBalanceFilter(e.target.value as any)}
                className="px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option value="all">All Balances</option>
                <option value="positive">Positive Balance</option>
                <option value="negative">Negative Balance</option>
                <option value="zero">Zero Balance</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          {clients.length !== allClients.length && (
            <div className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Showing {clients.length} of {allClients.length} clients
            </div>
          )}
        </div>
      </div>

      {/* Clients List */}
      <ClientsList clients={clients} onEdit={handleOpenModal} onDelete={handleOpenDeleteModal} />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingClient ? 'Edit Client' : 'Add Client'}>
        <ClientForm client={editingClient} onSubmit={handleSaveClient} onCancel={handleCloseModal} />
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} title="Delete Client">
        {deletingClient && (
          <div>
            <p className="text-slate-700 dark:text-slate-300">
              Are you sure you want to delete <strong>{deletingClient.name}</strong>?
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClient}
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

export default ClientsPage;
