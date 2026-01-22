import React, { useEffect, useMemo, useState } from 'react';
import {
  Trash2,
  Edit3,
  Plus,
  Search,
  Filter,
  MapPin,
  Sun,
  Moon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Modal from '../components/ui/shared/Modal';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { DestinationRecord, DestinationStatus, DestinationType } from '../types';

type SortKey = 'distanceKm' | 'type' | 'activeDeliveries';
type SortConfig = { key: SortKey; direction: 'asc' | 'desc' } | null;

const ITEMS_PER_PAGE = 6;

const mapPinColor: Record<DestinationType, string> = {
  'Stock Warehouse': 'bg-blue-500',
  'Main Hub': 'bg-green-500',
  Checkpoint: 'bg-orange-500',
  Regular: 'bg-emerald-500',
};

const typeBadgeColor: Record<DestinationType, string> = {
  'Stock Warehouse': 'text-blue-600 bg-blue-50 dark:bg-blue-900/40',
  'Main Hub': 'text-slate-700 bg-slate-100 dark:bg-slate-800/60',
  Checkpoint: 'text-orange-500 bg-orange-50 dark:bg-orange-900/30',
  Regular: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40',
};

const statusBadgeColor: Record<DestinationStatus, string> = {
  Active: 'text-lime-600 bg-lime-50 dark:bg-lime-900/30 border-lime-200',
  Inactive: 'text-slate-600 bg-slate-100 dark:bg-slate-700/40 border-slate-200',
};

const THEME_PULSE_MS = 650;

const DestinationsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { getItems, addItem, updateItem, deleteItem } = useData();
  const destinations = getItems<DestinationRecord>('destinationRecords');

  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState<'all' | string>('all');
  const [cityFilter, setCityFilter] = useState<'all' | string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | DestinationType>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | DestinationStatus>('all');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mapOpen, setMapOpen] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<DestinationRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DestinationRecord | null>(null);
  const [isThemeTransitioning, setIsThemeTransitioning] = useState(false);
  const [formState, setFormState] = useState<Omit<DestinationRecord, 'id' | 'linkedRoutes' | 'drivers'> & { linkedRoutes: string | string[]; drivers: string | string[] }>({
    name: '',
    country: '',
    city: '',
    deliveryZone: '',
    distanceKm: 0,
    type: 'Regular',
    packagesCapacity: undefined,
    availableSpace: undefined,
    activeDeliveries: 0,
    status: 'Active',
    mapPin: 'green',
    contact: '',
    serviceArea: '',
    linkedRoutes: [],
    drivers: [],
    operatingHours: undefined,
    dailyHandoffs: undefined,
  });

  useEffect(() => {
    if (!isThemeTransitioning) return;
    const timeout = setTimeout(() => setIsThemeTransitioning(false), THEME_PULSE_MS);
    return () => clearTimeout(timeout);
  }, [isThemeTransitioning]);

  const handleThemeToggle = () => {
    setIsThemeTransitioning(true);
    toggleTheme();
  };

  const countries = useMemo(() => Array.from(new Set(destinations.map(d => d.country))), [destinations]);
  const cities = useMemo(() => Array.from(new Set(destinations.map(d => d.city))), [destinations]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => {
      if (prev && prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  const lowCapacity = (record: DestinationRecord) =>
    record.type === 'Stock Warehouse' &&
    record.packagesCapacity &&
    record.availableSpace &&
    record.availableSpace / record.packagesCapacity <= 0.25;

  const statCards = useMemo(() => {
    const active = destinations.filter(dest => dest.status === 'Active').length;
    const inactive = destinations.filter(dest => dest.status === 'Inactive').length;
    const checkpoints = destinations.filter(dest => dest.type === 'Checkpoint').length;
    const total = destinations.length || 1;
    const avgDistance = Math.round(
      destinations.reduce((acc, dest) => acc + dest.distanceKm, 0) / total
    );
    const warehouseTotals = destinations.reduce(
      (acc, dest) => {
        if (dest.type === 'Stock Warehouse' && dest.packagesCapacity && dest.availableSpace !== undefined) {
          acc.capacity += dest.packagesCapacity;
          acc.available += dest.availableSpace ?? 0;
        }
        return acc;
      },
      { capacity: 0, available: 0 }
    );
    const utilization = warehouseTotals.capacity
      ? Math.round(
        ((warehouseTotals.capacity - warehouseTotals.available) / warehouseTotals.capacity) * 100
      )
      : 0;

    return [
      {
        label: 'Active nodes',
        value: active,
        helper: 'Live hubs & checkpoints',
        progress: active / total,
      },
      {
        label: 'Checkpoint ops',
        value: checkpoints,
        helper: 'Border & compliance',
        progress: total ? checkpoints / total : 0,
      },
      {
        label: 'Avg distance',
        value: `${avgDistance} km`,
        helper: 'Reach from HQ',
        progress: Math.min(avgDistance / 1200, 1),
      },
      {
        label: 'Utilization',
        value: `${utilization}%`,
        helper: 'Warehouse capacity',
        progress: utilization / 100,
      },
    ];
  }, [destinations]);

  const filtered = useMemo(() => {
    let list = destinations;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(dest =>
        dest.name.toLowerCase().includes(term) ||
        dest.country.toLowerCase().includes(term) ||
        dest.city.toLowerCase().includes(term)
      );
    }

    if (countryFilter !== 'all') {
      list = list.filter(dest => dest.country === countryFilter);
    }

    if (cityFilter !== 'all') {
      list = list.filter(dest => dest.city === cityFilter);
    }

    if (typeFilter !== 'all') {
      list = list.filter(dest => dest.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      list = list.filter(dest => dest.status === statusFilter);
    }

    if (sortConfig) {
      list = [...list].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal === bVal) return 0;
        if (sortConfig.direction === 'asc') {
          return aVal > bVal ? 1 : -1;
        }
        return aVal < bVal ? 1 : -1;
      });
    }

    return list;
  }, [destinations, searchTerm, countryFilter, cityFilter, typeFilter, statusFilter, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const currentPageRecords = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const paginationRange = useMemo(() => {
    const pages = new Set<number>([1, totalPages, currentPage]);
    if (currentPage - 1 > 1) pages.add(currentPage - 1);
    if (currentPage + 1 < totalPages) pages.add(currentPage + 1);
    if (currentPage - 2 > 1) pages.add(currentPage - 2);
    if (currentPage + 2 < totalPages) pages.add(currentPage + 2);
    return [...pages].filter(page => page >= 1 && page <= totalPages).sort((a, b) => a - b);
  }, [currentPage, totalPages]);

  const resetFilters = () => {
    setSearchTerm('');
    setCountryFilter('all');
    setCityFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const spotlightDestinations = useMemo(() => {
    if (!destinations.length) return [];
    if (selectedRecord) {
      return [selectedRecord, ...destinations.filter(dest => dest.id !== selectedRecord.id)].slice(0, 5);
    }
    return destinations.slice(0, 5);
  }, [destinations, selectedRecord]);

  const openModal = (record: DestinationRecord | null = null) => {
    if (record) {
      setEditingRecord(record);
      setFormState({ ...record });
    } else {
      setEditingRecord(null);
      setFormState({
        name: '',
        country: '',
        city: '',
        deliveryZone: '',
        distanceKm: 0,
        type: 'Regular',
        destinationType: 'Domestic',
        packagesCapacity: undefined,
        availableSpace: undefined,
        activeDeliveries: 0,
        status: 'Active',
        mapPin: 'green',
        contact: '',
        serviceArea: '',
        linkedRoutes: [],
        drivers: [],
        operatingHours: undefined,
        dailyHandoffs: undefined,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleFormChange = (field: keyof typeof formState, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    const payload: DestinationRecord = {
      id: editingRecord ? editingRecord.id : `DST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      ...formState,
      isActive: formState.status === 'Active',
      linkedRoutes: typeof formState.linkedRoutes === 'string'
        ? formState.linkedRoutes.split(',').map(route => route.trim()).filter(Boolean)
        : formState.linkedRoutes,
      drivers: typeof formState.drivers === 'string'
        ? formState.drivers.split(',').map(driver => driver.trim()).filter(Boolean)
        : formState.drivers,
      mapPin: formState.type === 'Stock Warehouse' ? 'blue' : formState.type === 'Checkpoint' ? 'orange' : 'green',
    };

    if (editingRecord) {
      updateItem('destinationRecords', payload);
    } else {
      addItem('destinationRecords', payload);
    }

    closeModal();
  };

  const handleDelete = (record: DestinationRecord) => {
    deleteItem('destinationRecords', record.id);
    if (selectedRecord?.id === record.id) {
      setSelectedRecord(null);
    }
  };

  const modalControlClass =
    'px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg w-full bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/60';

  return (
    <div className="relative">
      {isThemeTransitioning && (
        <div className="pointer-events-none absolute inset-0 z-0 animate-pulse rounded-3xl bg-gradient-to-br from-lime-300/20 via-transparent to-cyan-400/20"></div>
      )}
      <div className="relative z-10 p-6 space-y-6 text-slate-900 dark:text-slate-100 transition-colors duration-500">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">
              <Sparkles size={14} />
              <span>Network intelligence</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Destinations</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Cohesive view across hubs, warehouses, checkpoints, and Algerian city records.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 rounded-full bg-lime-400 text-slate-900 px-5 py-3 text-sm font-semibold shadow-lg shadow-lime-500/20 transition hover:bg-lime-300 hover:-translate-y-0.5"
            >
              <Plus size={16} />
              Add Destination
            </button>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md backdrop-blur space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="relative">
              <Search size={18} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchTerm}
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Search name · city · country"
                className="w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-lime-400/70"
              />
            </div>
            {[{ label: 'Country', value: countryFilter, options: countries }, { label: 'City', value: cityFilter, options: cities }].map(filter => (
              <select
                key={filter.label}
                value={filter.value}
                onChange={e => {
                  const setter = filter.label === 'Country' ? setCountryFilter : setCityFilter;
                  setter(e.target.value as any);
                  setCurrentPage(1);
                }}
                aria-label={filter.label}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-100 transition hover:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-400/60"
              >
                <option value="all">All {filter.label}s</option>
                {filter.options.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ))}
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value as any); setCurrentPage(1); }}
              aria-label="Destination type filter"
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900/60 text-slate-700 dark:text-slate-100 transition hover:border-lime-500 focus:outline-none focus:ring-2 focus:ring-lime-400/60"
            >
              <option value="all">All Types</option>
              {(['Stock Warehouse', 'Main Hub', 'Checkpoint', 'Regular'] as DestinationType[]).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              <Filter size={16} />
              Status
            </div>
            <div className="flex gap-2 flex-wrap">
              {(['all', 'Active', 'Inactive'] as ('all' | DestinationStatus)[]).map(status => (
                <button
                  key={status}
                  onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-sm border transition ${statusFilter === status
                    ? 'bg-lime-500 text-white border-lime-500 shadow'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-lime-400'
                    }`}
                >
                  {status === 'all' ? 'All statuses' : status}
                </button>
              ))}
            </div>
            <button
              onClick={resetFilters}
              className="mt-2 md:mt-0 md:ml-auto text-slate-500 dark:text-slate-400 hover:text-lime-500 text-sm"
            >
              Reset filters
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          {statCards.map(card => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-5 shadow-sm space-y-3 hover:-translate-y-1 hover:border-lime-400/50 hover:shadow-md transition-all duration-300 group"
            >
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">{card.label}</p>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">{card.value}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">{card.helper}</p>
              <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                <span
                  className="block h-full rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 transition-all"
                  style={{ width: `${Math.min(1, Math.max(card.progress, 0)) * 100}%` }}
                ></span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)]">
          {/* Left column: list-style destinations, similar to reference UI */}
          <div className="bg-white/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm backdrop-blur flex flex-col">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Track destinations</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {filtered.length} total · {currentPageRecords.length} on this page
                </p>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-900/70 px-2 py-1 text-[11px] text-slate-500 dark:text-slate-400">
                <button
                  onClick={() => handleSort('distanceKm')}
                  className={`px-2 py-0.5 rounded-full ${sortConfig?.key === 'distanceKm' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100' : ''
                    }`}
                >
                  km
                </button>
                <button
                  onClick={() => handleSort('activeDeliveries')}
                  className={`px-2 py-0.5 rounded-full ${sortConfig?.key === 'activeDeliveries' ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100' : ''
                    }`}
                >
                  activity
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto border-b border-slate-100 dark:border-slate-800">
              {currentPageRecords.map(record => {
                const isSelected = selectedRecord?.id === record.id;
                return (
                  <button
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between gap-4 transition-colors ${isSelected
                      ? 'bg-slate-100 dark:bg-slate-900/60'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'
                      }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                          {record.city.slice(0, 2).toUpperCase()}
                        </span>
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {record.name}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {record.city}, {record.country} · {record.deliveryZone}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium border border-transparent ${typeBadgeColor[record.type]}`}>
                          {record.type}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium border ${record.destinationType === 'International' ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300' : 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'}`}>
                          {record.destinationType || 'Domestic'}
                        </span>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-medium border ${statusBadgeColor[record.status]}`}>
                          {record.status}
                        </span>
                        {lowCapacity(record) && (
                          <span className="inline-flex items-center rounded-full bg-rose-50 dark:bg-rose-900/40 px-2 py-0.5 font-semibold text-rose-600 dark:text-rose-300">
                            Low space
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-xs">
                      <div className="rounded-full bg-slate-100 dark:bg-slate-900/70 px-3 py-1 text-slate-700 dark:text-slate-100">
                        {record.distanceKm} km
                      </div>
                      <div className="text-slate-500 dark:text-slate-300">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {record.activeDeliveries}
                        </span>{' '}
                        active
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            openModal(record);
                          }}
                          className="rounded-full bg-slate-100 dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                          aria-label="Edit destination"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDelete(record);
                          }}
                          className="rounded-full bg-rose-100 dark:bg-rose-900/40 p-1.5 text-rose-600 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/60"
                          aria-label="Delete destination"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </button>
                );
              })}
              {currentPageRecords.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-slate-500">
                  No destinations match the selected filters.
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
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
                {paginationRange.map((page, index) => {
                  const previous = paginationRange[index - 1];
                  const showEllipsis = index > 0 && previous !== undefined && page - previous > 1;
                  return (
                    <React.Fragment key={page}>
                      {showEllipsis && <span className="px-2 text-slate-400 dark:text-slate-600">…</span>}
                      <button
                        onClick={() => setCurrentPage(page)}
                        className={`min-w-[36px] rounded-full px-3 py-1 border ${currentPage === page
                          ? 'bg-lime-500 border-lime-500 text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                          }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}
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

          {/* Right column: map + detail drawer */}
          <div className="space-y-4">
            <div className="bg-white/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm backdrop-blur">
              <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-500/15 text-lime-500">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white">Map overview</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Consistent atlas card shared with dashboard.</p>
                  </div>
                </div>
                <button onClick={() => setMapOpen(prev => !prev)} className="text-xs text-slate-500 dark:text-slate-400 hover:text-lime-500">
                  {mapOpen ? 'Collapse' : 'Expand'}
                </button>
              </div>
              {mapOpen && (
                <div className="p-4 space-y-4">
                  <div className="relative h-56 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                    <div className="absolute inset-0 opacity-60">
                      <div className="w-full h-full bg-[radial-gradient(circle_at_top,_rgba(74,222,128,0.35)_0%,_transparent_35%)]"></div>
                    </div>
                    <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-white">
                      {spotlightDestinations.map(dest => (
                        <div
                          key={`map-pill-${dest.id}`}
                          className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur"
                        >
                          <span className={`w-2 h-2 rounded-full ${mapPinColor[dest.type]}`}></span>
                          <span>{dest.city}</span>
                          <span className="text-white/70">{dest.distanceKm} km</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {spotlightDestinations.map(dest => (
                      <div
                        key={`legend-${dest.id}`}
                        className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${mapPinColor[dest.type]}`}></span>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{dest.name}</span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200">
                            {dest.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {dest.deliveryZone}
                          </span>
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{dest.activeDeliveries} live</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedRecord && (
              <div className="bg-white/90 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-4 space-y-4 backdrop-blur">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Destination details</p>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{selectedRecord.name}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {selectedRecord.city}, {selectedRecord.country} · {selectedRecord.deliveryZone}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full text-center border ${statusBadgeColor[selectedRecord.status]}`}>
                    {selectedRecord.status}
                  </span>
                </div>
                <div className="grid gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <p><strong>Contact:</strong> {selectedRecord.contact || '—'}</p>
                  <p><strong>Service area:</strong> {selectedRecord.serviceArea || '—'}</p>
                  <p><strong>Linked routes:</strong> {selectedRecord.linkedRoutes.length ? selectedRecord.linkedRoutes.join(', ') : 'None'}</p>
                  <p><strong>Drivers:</strong> {selectedRecord.drivers.length ? selectedRecord.drivers.join(', ') : 'Unassigned'}</p>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 p-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2">Warehouse health</p>
                    {selectedRecord.type === 'Stock Warehouse' ? (
                      <>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Capacity: {selectedRecord.packagesCapacity ?? '—'} pkgs</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">Available: {selectedRecord.availableSpace ?? '—'} pkgs</p>
                        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                          <span
                            className={`block h-full rounded-full ${lowCapacity(selectedRecord) ? 'bg-rose-500' : 'bg-lime-500'}`}
                            style={{
                              width:
                                selectedRecord.packagesCapacity && selectedRecord.availableSpace !== undefined
                                  ? `${Math.min(
                                    1,
                                    (selectedRecord.packagesCapacity - (selectedRecord.availableSpace ?? 0)) /
                                    selectedRecord.packagesCapacity
                                  ) * 100}%`
                                  : '0%',
                            }}
                          ></span>
                        </div>
                        {lowCapacity(selectedRecord) && (
                          <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-400">Auto warning: low stock space</p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">Warehouse telemetry only shows for stock sites.</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 p-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2">Checkpoint ops</p>
                    {selectedRecord.type === 'Checkpoint' ? (
                      <>
                        <p className="text-sm">Operating hours: {selectedRecord.operatingHours ?? '—'}</p>
                        <p className="text-sm">Daily handoffs: {selectedRecord.dailyHandoffs ?? '—'}</p>
                      </>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">Operational data available when node is a checkpoint.</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/40 p-3">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-2">Engagement</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>Active deliveries</span>
                      <strong className="text-slate-900 dark:text-slate-100">{selectedRecord.activeDeliveries}</strong>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Distance</span>
                      <strong className="text-slate-900 dark:text-slate-100">{selectedRecord.distanceKm} km</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingRecord ? 'Update destination' : 'Create destination'}>
        <div className="space-y-4 text-slate-900 dark:text-slate-100">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={formState.name}
              onChange={e => handleFormChange('name', e.target.value)}
              placeholder="Destination name"
              className={modalControlClass}
            />
            <input
              value={formState.country}
              onChange={e => handleFormChange('country', e.target.value)}
              placeholder="Country"
              className={modalControlClass}
            />
            <input
              value={formState.city}
              onChange={e => handleFormChange('city', e.target.value)}
              placeholder="City"
              className={modalControlClass}
            />
            <input
              value={formState.deliveryZone}
              onChange={e => handleFormChange('deliveryZone', e.target.value)}
              placeholder="Delivery zone"
              className={modalControlClass}
            />
            <input
              type="number"
              value={formState.distanceKm}
              onChange={e => handleFormChange('distanceKm', Number(e.target.value))}
              placeholder="Distance (km)"
              className={modalControlClass}
            />
            <select
              value={formState.type}
              onChange={e => handleFormChange('type', e.target.value as DestinationType)}
              aria-label="Destination type"
              className={modalControlClass}
            >
              {(['Stock Warehouse', 'Main Hub', 'Checkpoint', 'Regular'] as DestinationType[]).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              value={formState.destinationType || 'Domestic'}
              onChange={e => handleFormChange('destinationType', e.target.value)}
              aria-label="Domestic or International"
              className={modalControlClass}
            >
              <option value="Domestic">Domestic</option>
              <option value="International">International</option>
            </select>
          </div>
          {/* Detailed number fields removed as per user request */}
          {/* Additional number/text fields removed as per request to simplify form */}
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-xl bg-lime-500 text-slate-900 px-6 py-2 text-sm font-semibold shadow-lg shadow-lime-500/20 transition hover:bg-lime-400 hover:scale-[1.02] active:scale-[0.98]"
            >
              {editingRecord ? 'Save Changes' : 'Create Destination'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DestinationsPage;
