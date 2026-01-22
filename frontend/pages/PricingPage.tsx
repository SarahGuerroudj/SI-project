
import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  Globe2,
  Edit3,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Info,
  MapPin,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import Modal from '../components/ui/shared/Modal';
import { useData } from '../contexts/DataContext';
import { PricingRule, ServiceType, DestinationRecord } from '../types';

type SortKey = 'serviceTypeName' | 'destinationName' | 'basePrice' | 'pricePerKm';
type SortConfig = { key: SortKey; direction: 'asc' | 'desc' } | null;

const ITEMS_PER_PAGE = 8;

const PricingPage: React.FC = () => {
  const { getItems, addItem, updateItem, deleteItem } = useData();
  const pricingRules = getItems<PricingRule>('pricing') || [];
  const serviceTypes = getItems<ServiceType>('serviceTypes') || [];
  const destinations = getItems<DestinationRecord>('destinationRecords') || []; // Assuming 'destinations' key in context

  const [searchTerm, setSearchTerm] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'serviceTypeName', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  // Maps for quick lookup
  const serviceTypeMap = useMemo(() => new Map(serviceTypes.map(st => [st.id, st])), [serviceTypes]);
  const destinationMap = useMemo(() => new Map(destinations.map(d => [d.id, d])), [destinations]);

  const [formState, setFormState] = useState<Omit<PricingRule, 'id'>>({
    serviceTypeId: '',
    destinationId: '',
    basePrice: 0,
    pricePerKm: undefined,
    isActive: true,
  });

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const decoratedRules = useMemo(() => {
    return pricingRules.map(rule => {
      const service = serviceTypeMap.get(rule.serviceTypeId);
      const destination = destinationMap.get(rule.destinationId);
      return {
        ...rule,
        serviceTypeName: service?.name ?? 'Unknown Service',
        destinationName: destination?.name ?? 'Unknown Destination',
        destinationCity: destination?.city ?? '',
      } as PricingRule & { serviceTypeName: string; destinationName: string; destinationCity: string };
    });
  }, [pricingRules, serviceTypeMap, destinationMap]);

  const filtered = useMemo(() => {
    let list = decoratedRules;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(r =>
        r.serviceTypeName.toLowerCase().includes(term) ||
        r.destinationName.toLowerCase().includes(term) ||
        r.destinationCity.toLowerCase().includes(term)
      );
    }

    if (activeOnly) {
      list = list.filter(r => r.isActive);
    }

    if (sortConfig) {
      list = [...list].sort((a, b) => {
        const { key, direction } = sortConfig;
        const aVal = (a as any)[key] ?? '';
        const bVal = (b as any)[key] ?? '';
        if (aVal === bVal) return 0;
        if (direction === 'asc') return aVal > bVal ? 1 : -1;
        return aVal < bVal ? 1 : -1;
      });
    }

    return list;
  }, [decoratedRules, searchTerm, activeOnly, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const openModal = (rule: (PricingRule & { serviceTypeName?: string }) | null = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormState({ ...rule });
    } else {
      setEditingRule(null);
      setFormState({
        serviceTypeId: '',
        destinationId: '',
        basePrice: 0,
        pricePerKm: undefined,
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleFormChange = <K extends keyof typeof formState>(field: K, value: (typeof formState)[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const payload: PricingRule = {
      id: editingRule ? editingRule.id : `PRC-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      ...formState,
    };

    if (editingRule) {
      updateItem('pricing', payload);
    } else {
      addItem('pricing', payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (rule: PricingRule) => {
    deleteItem('pricing', rule.id);
    if (selectedRule?.id === rule.id) {
      setSelectedRule(null);
    }
  };

  const modalControlClass =
    'px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg w-full bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/60 text-sm';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            <DollarSign size={12} className="text-lime-500" />
            <span>Pricing Strategy</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Pricing Rules</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define specific pricing for Service Types to specific Destinations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveOnly(prev => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300"
          >
            {activeOnly ? <ToggleRight size={16} className="text-lime-500" /> : <ToggleLeft size={16} className="text-slate-400" />}
            Active only
          </button>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 rounded-full bg-lime-400 text-slate-900 px-5 py-3 text-sm font-semibold shadow-lg shadow-lime-500/20 hover:bg-lime-300 hover:-translate-y-0.5 transition"
          >
            <Plus size={16} />
            Add Rule
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start max-w-full">
        {/* Table Section */}
        <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 shadow-sm overflow-hidden">

          {/* Simple Toolbar */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/50"
                placeholder="Search rules..."
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {filtered.length} rules found
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="text-xs uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300" onClick={() => handleSort('serviceTypeName')}>
                    Service {sortConfig?.key === 'serviceTypeName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300" onClick={() => handleSort('destinationName')}>
                    Destination {sortConfig?.key === 'destinationName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300" onClick={() => handleSort('basePrice')}>
                    Base Price {sortConfig?.key === 'basePrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 cursor-pointer hover:text-slate-700 dark:hover:text-slate-300" onClick={() => handleSort('pricePerKm')}>
                    Price/KM {sortConfig?.key === 'pricePerKm' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pageItems.map(rule => (
                  <tr
                    key={rule.id}
                    onClick={() => setSelectedRule(rule)}
                    className={`cursor-pointer transition-colors ${selectedRule?.id === rule.id ? 'bg-lime-50 dark:bg-lime-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-900/30'
                      }`}
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {serviceTypeMap.get(rule.serviceTypeId)?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-slate-400" />
                        <span>{destinationMap.get(rule.destinationId)?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-200">
                      {rule.basePrice.toLocaleString()} DZD
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {rule.pricePerKm ? `${rule.pricePerKm.toLocaleString()} DZD/km` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {rule.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-lime-600 dark:text-lime-400 bg-lime-100 dark:bg-lime-900/30 px-2 py-0.5 rounded-full">
                          <CheckCircle size={10} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                          <XCircle size={10} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); openModal(rule); }}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(rule); }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors ml-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-500">
                      No pricing rules found. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Simplified Right Sidebar Details */}
        {selectedRule && (
          <aside className="w-full lg:w-80 space-y-4">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 shadow-sm p-5 hover:-translate-y-1 hover:border-lime-400/50 hover:shadow-md transition-all duration-300">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                <Info size={16} /> Rule Details
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Service Type</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">
                    {serviceTypeMap.get(selectedRule.serviceTypeId)?.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {serviceTypeMap.get(selectedRule.serviceTypeId)?.description}
                  </div>
                </div>

                <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>

                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400 mb-1">Destination</div>
                  <div className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <Globe2 size={14} className="text-lime-500" />
                    {destinationMap.get(selectedRule.destinationId)?.name}
                  </div>
                  <div className="text-sm text-slate-500 ml-6">
                    {destinationMap.get(selectedRule.destinationId)?.city}, {destinationMap.get(selectedRule.destinationId)?.country}
                  </div>
                </div>

                <div className="my-2 border-t border-slate-100 dark:border-slate-800"></div>

                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                  <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">Cost Breakdown</div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Base Cost</span>
                    <span className="font-mono font-medium">{selectedRule.basePrice} DZD</span>
                  </div>
                  {selectedRule.pricePerKm && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Per KM</span>
                      <span className="font-mono font-medium">{selectedRule.pricePerKm} DZD</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingRule ? 'Edit Rule' : 'New Pricing Rule'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Service Type</label>
            <select
              className={modalControlClass}
              value={formState.serviceTypeId}
              onChange={e => handleFormChange('serviceTypeId', e.target.value)}
            >
              <option value="">Select a Service...</option>
              {serviceTypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Destination</label>
            <select
              className={modalControlClass}
              value={formState.destinationId}
              onChange={e => handleFormChange('destinationId', e.target.value)}
            >
              <option value="">Select a Destination...</option>
              {destinations.map(d => <option key={d.id} value={d.id}>{d.name} ({d.city})</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Base Price (DZD)</label>
              <input
                type="number"
                className={modalControlClass}
                value={formState.basePrice}
                onChange={e => handleFormChange('basePrice', Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Price per KM (Optional)</label>
              <input
                type="number"
                className={modalControlClass}
                value={formState.pricePerKm ?? ''}
                onChange={e => handleFormChange('pricePerKm', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeConfig"
              checked={formState.isActive}
              onChange={e => handleFormChange('isActive', e.target.checked)}
              className="rounded border-slate-300 text-lime-500 focus:ring-lime-500"
            />
            <label htmlFor="activeConfig" className="text-sm text-slate-700 dark:text-slate-300">Rule is active</label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button onClick={closeModal} className="px-4 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition">Cancel</button>
            <button onClick={handleSave} className="px-6 py-2 rounded-lg text-sm font-semibold bg-lime-400 text-slate-900 hover:bg-lime-300 transition shadow-lg shadow-lime-500/20">Save Rule</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PricingPage;
