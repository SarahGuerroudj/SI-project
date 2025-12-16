import React, { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  DollarSign,
  Globe2,
  Truck,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  MapPin,
  Zap,
  ToggleLeft,
  ToggleRight,
  Info,
} from 'lucide-react';
import Modal from './shared/Modal';
import { useData } from '../contexts/DataContext';
import { PricingRule, ServiceType } from '../types';

type SortKey = 'serviceTypeName' | 'zone' | 'basePrice' | 'pricePerKm';
type SortConfig = { key: SortKey; direction: 'asc' | 'desc' } | null;

const ITEMS_PER_PAGE = 8;

const urgencyBadge: Record<PricingRule['urgency'], string> = {
  Economy: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
  Standard: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Express: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Critical: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800',
};

const statusBadge: Record<PricingRule['status'], string> = {
  Active: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400 border-lime-200 dark:border-lime-700',
  Inactive: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
};

const PricingPage: React.FC = () => {
  const { getItems, addItem, updateItem, deleteItem } = useData();
  const pricingRules = getItems<PricingRule>('pricing');
  const serviceTypes = getItems<ServiceType>('serviceTypes');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'service' | 'zone' | 'vehicle'>('all');
  const [activeOnly, setActiveOnly] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'serviceTypeName', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);

  const serviceTypeMap = useMemo(
    () =>
      new Map(
        serviceTypes.map(st => [
          st.id,
          {
            name: st.name,
            category: st.category,
            model: st.pricingModel,
          },
        ])
      ),
    [serviceTypes]
  );

  const [formState, setFormState] = useState<Omit<PricingRule, 'id'>>({
    serviceTypeId: '',
    zone: '',
    region: '',
    basePrice: 0,
    pricePerKm: undefined,
    extraFees: {},
    minimumCharge: 0,
    maximumWeightKg: 0,
    estimatedTimeRange: '',
    status: 'Active',
    urgency: 'Standard',
    vehicleTypes: [],
    conditions: '',
    conflictsWith: [],
  });

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const decoratedRules = useMemo(
    () =>
      pricingRules.map(rule => {
        const meta = serviceTypeMap.get(rule.serviceTypeId);
        return {
          ...rule,
          serviceTypeName: meta?.name ?? 'Unknown service',
          serviceCategory: meta?.category ?? 'Delivery',
          pricingModel: meta?.model ?? 'Distance-based',
        } as PricingRule & { serviceTypeName: string; serviceCategory: ServiceType['category']; pricingModel?: ServiceType['pricingModel'] };
      }),
    [pricingRules, serviceTypeMap]
  );

  const filtered = useMemo(() => {
    let list = decoratedRules;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(r =>
        r.serviceTypeName.toLowerCase().includes(term) ||
        r.zone.toLowerCase().includes(term) ||
        r.region.toLowerCase().includes(term)
      );
    }

    if (filterType === 'service') {
      list = list.filter(r => r.serviceCategory === 'Delivery' || r.serviceCategory === 'Logistics');
    }
    if (filterType === 'zone') {
      list = list.filter(r => r.zone.toLowerCase().includes('algiers') || r.zone.toLowerCase().includes('oran'));
    }
    if (filterType === 'vehicle') {
      list = list.filter(r => r.vehicleTypes.includes('Van'));
    }

    if (activeOnly) {
      list = list.filter(r => r.status === 'Active');
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
  }, [decoratedRules, searchTerm, filterType, activeOnly, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const pageItems = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const hasConflict = (rule: PricingRule) => rule.conflictsWith && rule.conflictsWith.length > 0;

  const openModal = (rule: (PricingRule & { serviceTypeName?: string }) | null = null) => {
    if (rule) {
      setEditingRule(rule);
      setFormState({ ...rule });
    } else {
      setEditingRule(null);
      setFormState({
        serviceTypeId: '',
        zone: '',
        region: '',
        basePrice: 0,
        pricePerKm: undefined,
        extraFees: {},
        minimumCharge: 0,
        maximumWeightKg: 0,
        estimatedTimeRange: '',
        status: 'Active',
        urgency: 'Standard',
        vehicleTypes: [],
        conditions: '',
        conflictsWith: [],
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
      vehicleTypes: Array.isArray(formState.vehicleTypes)
        ? formState.vehicleTypes
        : String(formState.vehicleTypes)
          .split(',')
          .map(v => v.trim())
          .filter(Boolean),
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

  const isFlatRate = (serviceTypeMap.get(formState.serviceTypeId)?.model ?? 'Distance-based') === 'Flat';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-900/70 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            <DollarSign size={12} className="text-lime-500" />
            <span>Pricing rules</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Pricing</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Govern how services, zones, and vehicles translate into delivery pricing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveOnly(prev => !prev)}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300"
          >
            {activeOnly ? <ToggleRight size={16} className="text-lime-500" /> : <ToggleLeft size={16} className="text-slate-400" />}
            Show active only
          </button>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 rounded-full bg-lime-400 text-slate-900 px-5 py-3 text-sm font-semibold shadow-lg shadow-lime-500/20 hover:bg-lime-300 hover:-translate-y-0.5 transition"
          >
            <Plus size={16} />
            Add Pricing Rule
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 max-w-xl">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by service, zone, or region..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/60"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <Filter size={14} />
            <span>Filter</span>
          </div>
          <select
            value={filterType}
            onChange={e => {
              setFilterType(e.target.value as any);
              setCurrentPage(1);
            }}
            aria-label="Pricing filter"
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/70 text-sm text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-lime-400/60"
          >
            <option value="all">All rules</option>
            <option value="service">Service type</option>
            <option value="zone">Zone / region</option>
            <option value="vehicle">Vehicle type</option>
          </select>
        </div>
      </div>

      {/* Main content with right drawer */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)]">
        {/* Table */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
              <Globe2 size={14} />
              <span>Zone matrix</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {filtered.length} rules · page {currentPage} of {totalPages}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="text-xs uppercase tracking-wide text-slate-500 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3">
                    <button className="inline-flex items-center gap-1" onClick={() => handleSort('serviceTypeName')}>
                      Service
                      {sortConfig?.key === 'serviceTypeName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button className="inline-flex items-center gap-1" onClick={() => handleSort('zone')}>
                      Zone / region
                      {sortConfig?.key === 'zone' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
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
                  <th className="px-4 py-3">Extra fees</th>
                  <th className="px-4 py-3">Min charge</th>
                  <th className="px-4 py-3">Max weight</th>
                  <th className="px-4 py-3">ETA</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {pageItems.map(rule => (
                  <tr
                    key={rule.id}
                    onClick={() => setSelectedRule(rule)}
                    className={`cursor-pointer transition-colors ${selectedRule?.id === rule.id
                        ? 'bg-slate-100 dark:bg-slate-900/70'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-200">
                          <DollarSign size={14} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {serviceTypeMap.get(rule.serviceTypeId)?.name ?? 'Unknown service'}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {serviceTypeMap.get(rule.serviceTypeId)?.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-200">
                      <div className="flex flex-col">
                        <span>{rule.zone}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">{rule.region}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-100">
                      {rule.basePrice.toLocaleString()} DZD
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-200">
                      {rule.pricePerKm ? `${rule.pricePerKm.toLocaleString()} DZD/km` : '—'}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-600 dark:text-slate-200">
                      {Object.entries(rule.extraFees)
                        .filter(([, v]) => typeof v === 'number' && v! > 0)
                        .map(([k, v]) => `${k}: ${v} DZD`)
                        .join(' · ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-100">
                      {rule.minimumCharge.toLocaleString()} DZD
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-100">
                      {rule.maximumWeightKg.toLocaleString()} kg
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-semibold ${urgencyBadge[rule.urgency]}`}
                      >
                        <Clock size={12} className="mr-1" />
                        {rule.estimatedTimeRange}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-semibold ${statusBadge[rule.status]}`}
                      >
                        {rule.status}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      onClick={e => {
                        e.stopPropagation();
                      }}
                    >
                      <div className="inline-flex items-center gap-2">
                        {hasConflict(rule) && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 text-[11px] text-amber-700 dark:text-amber-300">
                            <AlertTriangle size={12} />
                            Overlap
                          </span>
                        )}
                        <button
                          onClick={() => openModal(rule)}
                          className="rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                          aria-label="Edit pricing rule"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(rule)}
                          className="rounded-full bg-rose-100 dark:bg-rose-900/40 p-1.5 text-rose-600 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/60"
                          aria-label="Delete pricing rule"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pageItems.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-sm text-slate-500">
                      No pricing rules match the current filters.
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

        {/* Right drawer */}
        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Info size={16} className="text-slate-400" />
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Pricing rule details</h2>
              </div>
              {selectedRule && (
                <span
                  className={`inline-flex items-center rounded-full border px-3 py-0.5 text-[11px] font-semibold ${statusBadge[selectedRule.status]}`}
                >
                  {selectedRule.status}
                </span>
              )}
            </div>
            {selectedRule ? (
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-1">
                    Service type
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {serviceTypeMap.get(selectedRule.serviceTypeId)?.name ?? 'Unknown service'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {serviceTypeMap.get(selectedRule.serviceTypeId)?.category}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-1">
                      Zone & region
                    </p>
                    <p>{selectedRule.zone}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{selectedRule.region}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-1">
                      Vehicle compatibility
                    </p>
                    <p>
                      {selectedRule.vehicleTypes.length ? selectedRule.vehicleTypes.join(', ') : 'Any'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-1">
                    Pricing formula
                  </p>
                  <p className="text-sm">
                    Base {selectedRule.basePrice.toLocaleString()} DZD
                    {selectedRule.pricePerKm && (
                      <> + distance × {selectedRule.pricePerKm.toLocaleString()} DZD/km</>
                    )}
                    .
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Minimum charge {selectedRule.minimumCharge.toLocaleString()} DZD · Max weight{' '}
                    {selectedRule.maximumWeightKg.toLocaleString()} kg
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-1">
                    Extra fees
                  </p>
                  <p>
                    {Object.entries(selectedRule.extraFees)
                      .filter(([, v]) => typeof v === 'number' && v! > 0)
                      .map(([k, v]) => `${k}: ${v} DZD`)
                      .join(' · ') || 'None'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-1">
                    Time range & urgency
                  </p>
                  <p className="inline-flex items-center gap-2 text-sm">
                    <Clock size={14} className="text-slate-400" />
                    {selectedRule.estimatedTimeRange}
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${urgencyBadge[selectedRule.urgency]}`}
                    >
                      {selectedRule.urgency}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-1">
                    Conditions & exceptions
                  </p>
                  <p className="whitespace-pre-line">
                    {selectedRule.conditions || 'No special conditions documented.'}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-1">
                    Zone preview
                  </p>
                  <div className="relative h-32 rounded-xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    <div className="absolute inset-0 opacity-60">
                      <div className="w-full h-full bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.35)_0%,_transparent_35%)]"></div>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-xs text-white">
                      <MapPin size={16} />
                      <span className="font-semibold">{selectedRule.zone}</span>
                      <span className="text-white/70">{selectedRule.region}</span>
                    </div>
                  </div>
                </div>
                {hasConflict(selectedRule) && (
                  <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-3 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                    <AlertTriangle size={14} className="mt-0.5" />
                    <p>
                      This rule overlaps with{' '}
                      <span className="font-semibold">{selectedRule.conflictsWith?.join(', ')}</span>. Review corridor vs
                      urban priorities.
                    </p>
                  </div>
                )}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() =>
                      updateItem('pricing', {
                        ...selectedRule,
                        status: selectedRule.status === 'Active' ? 'Inactive' : 'Active',
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-lime-400"
                  >
                    {selectedRule.status === 'Active' ? 'Deactivate rule' : 'Activate rule'}
                  </button>
                  <button
                    onClick={() => openModal(selectedRule)}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-xs font-semibold text-white px-3 py-1.5 dark:bg-slate-100 dark:text-slate-900"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                Select a pricing rule from the table to see its full breakdown.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={16} className="text-lime-400" />
              <h3 className="text-sm font-semibold">Routing hint</h3>
            </div>
            <p className="text-xs text-slate-300">
              Use higher urgency rules only on lanes where promised ETA is critical; pair economy pricing with backhaul
              routes to keep utilization high.
            </p>
          </div>
        </aside>
      </div>

      {/* Create / Edit pricing rule modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingRule ? 'Edit pricing rule' : 'Create pricing rule'}
      >
        <div className="space-y-4 text-sm text-slate-900 dark:text-slate-100">
          <div className="grid gap-3 md:grid-cols-2">
            <select
              value={formState.serviceTypeId}
              onChange={e => handleFormChange('serviceTypeId', e.target.value)}
              aria-label="Service type"
              className={modalControlClass}
            >
              <option value="">Select service type</option>
              {serviceTypes.map(st => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
            <select
              value={formState.urgency}
              onChange={e => handleFormChange('urgency', e.target.value as PricingRule['urgency'])}
              aria-label="Urgency"
              className={modalControlClass}
            >
              <option value="Economy">Economy</option>
              <option value="Standard">Standard</option>
              <option value="Express">Express</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={formState.zone}
              onChange={e => handleFormChange('zone', e.target.value)}
              placeholder="Zone (e.g., Algiers inner ring)"
              className={modalControlClass}
            />
            <input
              value={formState.region}
              onChange={e => handleFormChange('region', e.target.value)}
              placeholder="Region (e.g., Algiers · Blida)"
              className={modalControlClass}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="number"
              value={formState.basePrice}
              onChange={e => handleFormChange('basePrice', Number(e.target.value) || 0)}
              placeholder="Base price (DZD)"
              className={modalControlClass}
            />
            {!isFlatRate && (
              <input
                type="number"
                value={formState.pricePerKm ?? ''}
                onChange={e => handleFormChange('pricePerKm', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Price per km (DZD)"
                className={modalControlClass}
              />
            )}
            <input
              type="number"
              value={formState.maximumWeightKg}
              onChange={e => handleFormChange('maximumWeightKg', Number(e.target.value) || 0)}
              placeholder="Max weight (kg)"
              className={modalControlClass}
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="number"
              value={formState.minimumCharge}
              onChange={e => handleFormChange('minimumCharge', Number(e.target.value) || 0)}
              placeholder="Minimum charge (DZD)"
              className={modalControlClass}
            />
            <input
              value={formState.estimatedTimeRange}
              onChange={e => handleFormChange('estimatedTimeRange', e.target.value)}
              placeholder="Time estimate range (e.g., 24–48h)"
              className={modalControlClass}
            />
          </div>

          {/* Additional fees section: simple checklist via text inputs */}
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="number"
              value={formState.extraFees.fragile ?? ''}
              onChange={e =>
                handleFormChange('extraFees', {
                  ...formState.extraFees,
                  fragile: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="Fragile handling fee (DZD)"
              className={modalControlClass}
            />
            <input
              type="number"
              value={formState.extraFees.heavy ?? ''}
              onChange={e =>
                handleFormChange('extraFees', {
                  ...formState.extraFees,
                  heavy: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="Heavy cargo fee (DZD)"
              className={modalControlClass}
            />
            <input
              type="number"
              value={formState.extraFees.cod ?? ''}
              onChange={e =>
                handleFormChange('extraFees', {
                  ...formState.extraFees,
                  cod: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="COD fee (DZD)"
              className={modalControlClass}
            />
            <input
              type="number"
              value={formState.extraFees.night ?? ''}
              onChange={e =>
                handleFormChange('extraFees', {
                  ...formState.extraFees,
                  night: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="Night delivery fee (DZD)"
              className={modalControlClass}
            />
          </div>
          <input
            value={Array.isArray(formState.vehicleTypes) ? formState.vehicleTypes.join(', ') : (formState.vehicleTypes as any)}
            onChange={e => handleFormChange('vehicleTypes', e.target.value as any)}
            placeholder="Compatible vehicles (e.g., Van, Box truck, Reefer van)"
            className={modalControlClass}
          />
          <select
            value={formState.status}
            onChange={e => handleFormChange('status', e.target.value as PricingRule['status'])}
            aria-label="Pricing rule status"
            className={modalControlClass}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <textarea
            value={formState.conditions ?? ''}
            onChange={e => handleFormChange('conditions', e.target.value)}
            placeholder="Conditions & exceptions (optional)"
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
          {editingRule && hasConflict(editingRule) && (
            <div className="mt-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-100 flex items-start gap-2">
              <AlertTriangle size={12} className="mt-0.5" />
              <p>
                This rule overlaps with {editingRule.conflictsWith?.join(', ')}. Adjust zone or urgency to avoid
                ambiguous pricing at runtime.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PricingPage;


