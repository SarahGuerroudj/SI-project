import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Tag,
  Clock,
  DollarSign,
  Zap,
  Layers,
  Globe2,
  ShieldCheck,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Info,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import Modal from '../components/ui/shared/Modal';
import { useData } from '../contexts/DataContext';
import { ServiceType } from '../types';

type SortKey = 'name' | 'category' | 'basePrice' | 'pricePerKm' | 'estimatedDeliveryTime';
type SortConfig = { key: SortKey; direction: 'asc' | 'desc' } | null;

const ITEMS_PER_PAGE = 7;

const categoryIcon: Record<ServiceType['category'], React.ReactNode> = {
  Delivery: <Tag size={14} />,
  Logistics: <Globe2 size={14} />,
  Handling: <ShieldCheck size={14} />,
  Extras: <Layers size={14} />,
};

const statusBadge: Record<ServiceType['status'], string> = {
  Active: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400 border-lime-200 dark:border-lime-700',
  Inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

const ServiceTypesPage: React.FC = () => {
  const { getItems, addItem, updateItem, deleteItem } = useData();
  const serviceTypes = getItems<ServiceType>('serviceTypes') || [];

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ServiceType['category']>('all');
  const [activeOnly, setActiveOnly] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceType | null>(null);

  const [formState, setFormState] = useState<Omit<ServiceType, 'id'>>({
    name: '',
    description: '',
    category: 'Delivery',
    basePrice: 0,
    pricePerKm: undefined,
    estimatedDeliveryTime: '',
    requirements: [],
    status: 'Active',
    pricingModel: 'Distance-based',
    additionalFees: 0,
    allowedPackageSizes: [],
    driverNotes: '',
  });

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const filtered = useMemo(() => {
    let list = serviceTypes;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term)
      );
    }

    if (categoryFilter !== 'all') {
      list = list.filter(s => s.category === categoryFilter);
    }

    if (activeOnly) {
      list = list.filter(s => s.status === 'Active');
    }

    if (sortConfig) {
      list = [...list].sort((a, b) => {
        const { key, direction } = sortConfig;
        const aVal = a[key] ?? '';
        const bVal = b[key] ?? '';
        if (aVal === bVal) return 0;
        if (direction === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });
    }

    return list;
  }, [serviceTypes, searchTerm, categoryFilter, activeOnly, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const openModal = (service: ServiceType | null = null) => {
    if (service) {
      setEditingService(service);
      setFormState({
        ...service,
        status: service.status || (service.isActive ? 'Active' : 'Inactive'),
        requirements: service.requirements ? [...service.requirements] : [],
        allowedPackageSizes: service.allowedPackageSizes ? [...service.allowedPackageSizes] : []
      });
    } else {
      setEditingService(null);
      setFormState({
        name: '',
        description: '',
        category: 'Delivery',
        basePrice: 0,
        pricePerKm: undefined,
        estimatedDeliveryTime: '',
        requirements: [],
        status: 'Active',
        pricingModel: 'Distance-based',
        additionalFees: 0,
        allowedPackageSizes: [],
        driverNotes: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = <K extends keyof typeof formState>(field: K, value: (typeof formState)[K]) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const payload: ServiceType = {
      id: editingService ? editingService.id : `SRV-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      ...formState,
      isActive: formState.status === 'Active',
      requirements: Array.isArray(formState.requirements)
        ? formState.requirements
        : String(formState.requirements)
          .split(',')
          .map(req => req.trim())
          .filter(Boolean),
      allowedPackageSizes: Array.isArray(formState.allowedPackageSizes)
        ? formState.allowedPackageSizes
        : String(formState.allowedPackageSizes)
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
    };

    if (editingService) {
      await updateItem('serviceTypes', payload);
    } else {
      await addItem('serviceTypes', payload);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (service: ServiceType) => {
    await deleteItem('serviceTypes', service.id);
    if (selectedService?.id === service.id) {
      setSelectedService(null);
    }
  };

  const modalControlClass =
    'px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg w-full bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/60 text-sm';

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            <Zap size={12} className="text-lime-500" />
            <span>Configuration</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Service Types</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Structured catalogue of delivery and logistics services across your network.
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
            Add Service Type
          </button>
        </div>
      </div>

      {/* Controls row */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 max-w-xl">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search service types, categories, descriptions..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/60"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <Filter size={14} />
            <span>Category</span>
          </div>
          <select
            aria-label="Service category filter"
            value={categoryFilter}
            onChange={e => {
              setCategoryFilter(e.target.value as any);
              setCurrentPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-sm text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-lime-400/60"
          >
            <option value="all">All categories</option>
            <option value="Delivery">Delivery</option>
            <option value="Logistics">Logistics</option>
            <option value="Handling">Handling</option>
            <option value="Extras">Extras</option>
          </select>
        </div>
      </div>

      {/* Main content with right drawer */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]">
        {/* Main table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
              <Layers size={14} />
              <span>Service catalogue</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {filtered.length} total · sorted by{' '}
              <span className="font-semibold">{sortConfig?.key ?? 'name'}</span>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="text-xs uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">
                    <button className="inline-flex items-center gap-1" onClick={() => handleSort('name')}>
                      Service
                      {sortConfig?.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button className="inline-flex items-center gap-1" onClick={() => handleSort('category')}>
                      Category
                      {sortConfig?.key === 'category' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button className="inline-flex items-center gap-1" onClick={() => handleSort('basePrice')}>
                      Base price
                      {sortConfig?.key === 'basePrice' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button className="inline-flex items-center gap-1" onClick={() => handleSort('pricePerKm')}>
                      Price / km
                      {sortConfig?.key === 'pricePerKm' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button className="inline-flex items-center gap-1" onClick={() => handleSort('estimatedDeliveryTime')}>
                      Est. time
                      {sortConfig?.key === 'estimatedDeliveryTime' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="px-4 py-3">Requirements</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pageItems.map(service => (
                  <tr
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`cursor-pointer transition-colors ${selectedService?.id === service.id
                      ? 'bg-slate-100 dark:bg-slate-900/70'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          <DollarSign size={16} />
                        </div>
                        <div className="min-w-0">
                          <div
                            className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate"
                            title={service.description}
                          >
                            {service.name}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-900/60 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-200">
                        {categoryIcon[service.category]}
                        <span>{service.category}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-100">
                      {service.basePrice.toLocaleString()} DZD
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-200">
                      {service.pricePerKm ? `${service.pricePerKm.toLocaleString()} DZD/km` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-200">
                      <div className="inline-flex items-center gap-1">
                        <Clock size={14} className="text-slate-400" />
                        <span>{service.estimatedDeliveryTime}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-200">
                      {service.requirements?.length ? service.requirements.join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold ${statusBadge[service.status || (service.isActive ? 'Active' : 'Inactive')]}`}
                      >
                        {service.status || (service.isActive ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      onClick={e => {
                        e.stopPropagation();
                      }}
                    >
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openModal(service)}
                          className="rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                          aria-label="Edit service type"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(service)}
                          className="rounded-full bg-rose-100 dark:bg-rose-900/40 p-1.5 text-rose-600 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/60"
                          aria-label="Delete service type"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                      No service types match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
              >
                <ChevronLeft size={14} />
                Prev
              </button>
              <span className="px-2 text-slate-500 dark:text-slate-400">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1 disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right drawer / sidebar */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 shadow-sm p-4 hover:-translate-y-1 hover:border-lime-400/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Service details</h2>
              </div>
              {selectedService && (
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-semibold ${statusBadge[selectedService.status || (selectedService.isActive ? 'Active' : 'Inactive')]}`}
                >
                  {selectedService.status || (selectedService.isActive ? 'Active' : 'Inactive')}
                </span>
              )}
            </div>
            {selectedService ? (
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-1">
                    Name
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">{selectedService.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {selectedService.description}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-1">
                      Pricing logic
                    </p>
                    <p className="text-sm">
                      {selectedService.pricingModel || 'Not specified'}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Base: {selectedService.basePrice.toLocaleString()} DZD
                      {selectedService.pricePerKm && (
                        <> · {selectedService.pricePerKm.toLocaleString()} DZD/km</>
                      )}
                    </p>
                    {typeof selectedService.additionalFees === 'number' && selectedService.additionalFees > 0 && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Additional fees: {selectedService.additionalFees.toLocaleString()} DZD
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-1">
                      Delivery promise
                    </p>
                    <p className="inline-flex items-center gap-1 text-sm">
                      <Clock size={14} className="text-slate-400" />
                      {selectedService.estimatedDeliveryTime}
                    </p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Category: {selectedService.category}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-1">
                    Requirements
                  </p>
                  <p className="text-sm">
                    {selectedService.requirements?.length ? selectedService.requirements.join(', ') : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-1">
                    Allowed package sizes
                  </p>
                  <p className="text-sm">
                    {selectedService.allowedPackageSizes && selectedService.allowedPackageSizes.length
                      ? selectedService.allowedPackageSizes.join(', ')
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-1">
                    Notes for drivers
                  </p>
                  <p className="text-sm whitespace-pre-line">
                    {selectedService.driverNotes || 'No special notes for this service.'}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={async () => {
                      const isCurrentlyActive = selectedService.isActive !== false;
                      const newStatus = isCurrentlyActive ? 'Inactive' : 'Active';
                      const newIsActive = !isCurrentlyActive;

                      const updatedItem = {
                        ...selectedService,
                        isActive: newIsActive,
                        status: newStatus as any,
                      };

                      await updateItem('serviceTypes', updatedItem);
                      setSelectedService(updatedItem);
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-lime-400"
                  >
                    {selectedService.isActive !== false ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => openModal(selectedService)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-xs font-semibold text-white px-3 py-1.5 dark:bg-slate-100 dark:text-slate-900"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                Select a service type from the table to see full details.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 shadow-sm p-4 hover:-translate-y-1 hover:border-lime-400/50 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={16} className="text-lime-400" />
              <h3 className="text-sm font-semibold">Operational hints</h3>
            </div>
            <p className="text-xs text-slate-300">
              Use Express + COD combinations sparingly on long-haul routes to avoid cash risk and burnout.
              Pair refrigerated runs with high-density urban drops where possible.
            </p>
          </div>
        </aside>
      </div>

      {/* Modal for create / edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingService ? 'Edit service type' : 'Create service type'}
      >
        <div className="space-y-4 text-sm text-slate-900 dark:text-slate-100">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={formState.name}
              onChange={e => handleFormChange('name', e.target.value)}
              placeholder="Service name"
              className={modalControlClass}
            />
            <select
              value={formState.category}
              onChange={e => handleFormChange('category', e.target.value as ServiceType['category'])}
              aria-label="Service category"
              className={modalControlClass}
            >
              <option value="Delivery">Delivery</option>
              <option value="Logistics">Logistics</option>
              <option value="Handling">Handling</option>
              <option value="Extras">Extras</option>
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <select
              value={formState.pricingModel || 'Distance-based'}
              onChange={e => handleFormChange('pricingModel', e.target.value as ServiceType['pricingModel'])}
              aria-label="Pricing model"
              className={modalControlClass}
            >
              <option value="Flat">Flat</option>
              <option value="Distance-based">Distance-based</option>
              <option value="Tiered">Tiered</option>
            </select>
            <input
              type="number"
              value={formState.basePrice}
              onChange={e => handleFormChange('basePrice', Number(e.target.value) || 0)}
              placeholder="Base price (DZD)"
              className={modalControlClass}
            />
            <input
              type="number"
              value={formState.pricePerKm ?? ''}
              onChange={e => handleFormChange('pricePerKm', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="Price per km (DZD)"
              className={modalControlClass}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="number"
              value={formState.additionalFees ?? ''}
              onChange={e => handleFormChange('additionalFees', e.target.value ? Number(e.target.value) : 0)}
              placeholder="Additional fees (DZD)"
              className={modalControlClass}
            />
            <input
              value={formState.estimatedDeliveryTime}
              onChange={e => handleFormChange('estimatedDeliveryTime', e.target.value)}
              placeholder="Estimated delivery time"
              className={modalControlClass}
            />
            <select
              value={formState.status}
              onChange={e => handleFormChange('status', e.target.value as ServiceType['status'])}
              aria-label="Service status"
              className={modalControlClass}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <input
            value={Array.isArray(formState.requirements) ? formState.requirements.join(', ') : (formState.requirements as any)}
            onChange={e => handleFormChange('requirements', e.target.value as any)}
            placeholder="Requirements (comma separated)"
            className={modalControlClass}
          />
          <input
            value={
              Array.isArray(formState.allowedPackageSizes)
                ? formState.allowedPackageSizes.join(', ')
                : (formState.allowedPackageSizes as any)
            }
            onChange={e => handleFormChange('allowedPackageSizes', e.target.value as any)}
            placeholder="Allowed package sizes (e.g., XS, S, M, L, XL)"
            className={modalControlClass}
          />
          <textarea
            value={formState.description}
            onChange={e => handleFormChange('description', e.target.value)}
            placeholder="Short description"
            className={`${modalControlClass} min-h-[80px] resize-none`}
          />
          <textarea
            value={formState.driverNotes ?? ''}
            onChange={e => handleFormChange('driverNotes', e.target.value)}
            placeholder="Notes for drivers (optional)"
            className={`${modalControlClass} min-h-[80px] resize-none`}
          />
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-slate-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-lime-500 to-emerald-500 text-sm font-semibold text-white shadow-lg shadow-lime-500/30"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceTypesPage;


