import React, { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_SHIPMENTS, MOCK_CLIENTS, MOCK_DESTINATION_RATES } from '../constants';
import { Shipment, ShipmentStatus } from '../types';
import { Plus, Search, Filter, Package, Truck, CheckCircle, Clock, History, X, AlertCircle, Lock, Calendar, Star } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { calculateShipmentPrice, canModifyShipment, validateCustomerExists } from '../services/businessLogic';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { auditLog } from '../services/auditLog';

import { useData } from '../contexts/DataContext';

const Shipments: React.FC = () => {
  const { getItems, addItem, deleteItem } = useData();
  const shipments = getItems<Shipment>('shipments');
  const clients = getItems<any>('clients'); // Accessing raw users for now, or mapped clients
  // Use destinationRecords for the full detailed list
  const destinations = getItems<any>('destinationRecords');

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [historyViewShipment, setHistoryViewShipment] = useState<Shipment | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Form State
  const [formData, setFormData] = useState<{ clientId: string; destinationId: string; weight: number | string; volume: number | string; estimatedDelivery: string }>({
    clientId: '',
    destinationId: '',
    weight: 0,
    volume: 0,
    estimatedDelivery: ''
  });

  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const { addToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const auth = useAuth();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  // Group destinations logic adapted for live data
  const ALGERIAN_CITIES = new Set([
    'Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif', 'Bejaia', 'Tizi Ouzou'
  ]);

  // Memoize grouped destinations for the dropdown
  const { algerianDestinations, internationalDestinations } = useMemo(() => {
    const algerian = destinations.filter(d => ALGERIAN_CITIES.has(d.city) || d.country === 'Algeria');
    const international = destinations.filter(d => !ALGERIAN_CITIES.has(d.city) && d.country !== 'Algeria');
    return { algerianDestinations: algerian, internationalDestinations: international };
  }, [destinations]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    // Authorization: only Manager or Admin can create shipments in this mock
    if (!auth.authorize(['Manager', 'Admin', 'Client', 'User', 'driver'])) {
      const msg = 'Insufficient permissions to create shipments.';
      setErrors([msg]);
      try { addToast('error', msg); } catch (err) { }
      auditLog.log('create_shipment_forbidden', 'security', auth.user?.id ?? null, { attemptedBy: auth.user?.email });
      return;
    }

    if (!formData.clientId) {
      newErrors.push('Please select a client.');
    }
    if (!formData.destinationId) {
      newErrors.push('Please select a destination.');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      try { addToast('error', newErrors.join(' ')); } catch (err) { }
      return;
    }

    // Logic for price calculation should ideally be backend or based on rules
    // For now, we use a simple client-side placeholder or 0 if rates missing
    // We send data to backend via addItem

    // We get the selected destination object to find basic rates if needed (simulated)
    const selectedDest = destinations.find(d => d.id === formData.destinationId);
    // Placeholder price logic: distance * weight * 0.1
    const weight = Number(formData.weight) || 0;
    const volume = Number(formData.volume) || 0;
    const price = (selectedDest?.distanceKm || 100) * (weight * 0.05 + volume * 10); // Simple formula

    const payload = {
      clientId: formData.clientId,
      destinationId: formData.destinationId,
      weight,
      volume,
      price, // Backend might recalculate this
      status: ShipmentStatus.PENDING,
      estimatedDelivery: formData.estimatedDelivery
    };

    await addItem('shipments', payload);

    setShowModal(false);
    setErrors([]);
    setFormData({ clientId: '', destinationId: '', weight: 0, volume: 0, estimatedDelivery: '' });
    // Show success toast
    try { addToast('success', 'Shipment created successfully.'); } catch (err) { }
  };

  const handleDeleteShipment = (shipmentId: string) => {
    const shipment = shipments.find(s => s.id === shipmentId);

    // Rule 3: Prevent deletion if shipment is locked (assigned to route)
    if (shipment && !canModifyShipment(shipment)) {
      const msg = 'Cannot delete shipment that is assigned to a delivery route.';
      setErrors([msg]);
      try { addToast('error', msg); } catch (err) { }
      return;
    }

    // Authorization: only Admin can delete shipments
    if (!auth.hasRole('Admin')) {
      const msg = 'Only administrators can delete shipments.';
      setErrors([msg]);
      try { addToast('error', msg); } catch (err) { }
      auditLog.log('delete_shipment_forbidden', 'security', auth.user?.id ?? null, { shipmentId });
      return;
    }

    setShipments(shipments.filter(s => s.id !== shipmentId));
    setErrors([]);
    try { auditLog.log('delete_shipment', 'security', (JSON.parse(localStorage.getItem('evworld_user') || 'null')?.id) ?? null, { shipmentId }); } catch (e) { }
  };

  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case ShipmentStatus.DELIVERED:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-lime-400/10 text-lime-600 dark:text-lime-400 border border-lime-400/20"><CheckCircle size={12} className="mr-1" /> Delivered</span>;
      case ShipmentStatus.IN_TRANSIT:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"><Truck size={12} className="mr-1" /> In Transit</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"><Clock size={12} className="mr-1" /> {status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* hide spinner arrows on number inputs (weight & volume) for WebKit and Firefox */}
      <style>{`
        /* Chrome, Safari, Edge, Opera */
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        /* Firefox */
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Shipments</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage orders and pricing with automated calculations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-lime-400 text-slate-900 px-5 py-2.5 rounded-full hover:bg-lime-300 flex items-center transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] font-semibold"
        >
          <Plus size={20} className="mr-2" /> New Shipment
        </button>
      </div>

      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            {errors.map((error, idx) => (
              <p key={idx} className="text-sm text-red-700 dark:text-red-300">{error}</p>
            ))}
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex gap-4 transition-colors">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by ID, Client or City..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400/50 text-slate-900 dark:text-white placeholder-slate-500 transition-colors"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          )}
        </div>
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-48 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
          >
            <option value="All">All statuses</option>
            <option value={ShipmentStatus.PENDING}>{ShipmentStatus.PENDING}</option>
            <option value={ShipmentStatus.IN_TRANSIT}>{ShipmentStatus.IN_TRANSIT}</option>
            <option value={ShipmentStatus.DELIVERED}>{ShipmentStatus.DELIVERED}</option>
            <option value={ShipmentStatus.CANCELLED}>{ShipmentStatus.CANCELLED}</option>
            <option value={ShipmentStatus.DELAYED}>{ShipmentStatus.DELAYED}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-lg transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Destination</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Price (HT)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">ETA</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {/** Filter shipments by search term (ID, clientName, destination) */}
              {(() => {
                const term = searchTerm.trim().toLowerCase();
                let list = term
                  ? shipments.filter(s => (
                    s.id.toLowerCase().includes(term) ||
                    s.clientName.toLowerCase().includes(term) ||
                    s.destination.toLowerCase().includes(term)
                  ))
                  : [...shipments];
                if (selectedStatus && selectedStatus !== 'All') {
                  list = list.filter(s => s.status === selectedStatus);
                }

                if (list.length === 0) {
                  return (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        {shipments.length === 0 ? "No shipments found. Create one!" : "No shipments match your filters."}
                      </td>
                    </tr>
                  )
                }

                return list.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-lime-600 dark:text-lime-400">{shipment.id}</td>
                    <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-200">
                      <Link to={`/clients/${shipment.clientId}`} className="hover:text-lime-600 dark:hover:text-lime-400 transition-colors">
                        {shipment.clientName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{shipment.destination}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">{shipment.weight}kg</span>
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">{shipment.volume}m³</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">€{Number(shipment.price).toFixed(2)}</td>
                    <td className="px-6 py-4">{getStatusBadge(shipment.status)}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{shipment.estimatedDelivery}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex gap-2 justify-end">
                        {shipment.isLocked && (
                          <div className="inline-flex items-center px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-500" title="Assigned to route - cannot modify">
                            <Lock size={14} className="mr-1" /> Locked
                          </div>
                        )}
                        <button
                          onClick={() => setHistoryViewShipment(shipment)}
                          className="inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <History size={16} className="mr-2" /> History
                        </button>
                        {!shipment.isLocked && (
                          <button
                            onClick={() => handleDeleteShipment(shipment.id)}
                            className="inline-flex items-center text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      {historyViewShipment && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-in flex flex-col max-h-[90vh] border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-start mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold flex items-center text-slate-900 dark:text-white">
                  <History className="mr-2 text-lime-600 dark:text-lime-400" /> Tracking Timeline
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Shipment {historyViewShipment.id} • {historyViewShipment.destination}</p>
              </div>
              <button
                onClick={() => setHistoryViewShipment(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-2">
              <div className="relative pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-8 my-2">
                {historyViewShipment.history && historyViewShipment.history.length > 0 ? (
                  // Show chronological order (Pending -> Delivered)
                  historyViewShipment.history.map((event, index) => {
                    // Highlight the LATEST event (which is the last one in the chronological list)
                    const isLatest = index === historyViewShipment.history.length - 1;
                    return (
                      <div key={index} className="relative">
                        <div className={`absolute -left-[41px] p-1 bg-white dark:bg-slate-900`}>
                          <div className={`h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 shadow-sm ${isLatest ? 'bg-lime-400 ring-2 ring-lime-400/30' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                        </div>
                        <div className={`p-4 rounded-xl border transition-colors ${isLatest ? 'bg-white dark:bg-slate-900 border-lime-400/30 shadow-lg shadow-lime-400/5' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h4 className={`font-semibold text-sm ${isLatest ? 'text-lime-600 dark:text-lime-400' : 'text-slate-600 dark:text-slate-300'}`}>{event.status}</h4>
                            <span className="text-xs text-slate-500 whitespace-nowrap ml-2">{event.date}</span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center mb-2">
                            <span className="font-medium mr-1 text-slate-600 dark:text-slate-500">Loc:</span> {event.location}
                          </p>
                          {event.description && (
                            <p className="text-xs text-slate-500 italic border-t border-slate-200 dark:border-slate-800 pt-2 mt-1">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-slate-500 italic text-sm">No history available.</p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setHistoryViewShipment(null)}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-fade-in border border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-bold mb-6 flex items-center text-slate-900 dark:text-white"><Package className="mr-2 text-lime-600 dark:text-lime-400" /> New Shipment</h3>

            {errors.length > 0 && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
                {errors.map((error, idx) => (
                  <p key={idx} className="text-sm text-red-700 dark:text-red-300">{error}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Client (Must be registered)</label>
                <select
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-lime-400 transition-colors"
                  required
                  value={formData.clientId}
                  onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                >
                  <option value="">Select Client</option>
                  {clients.map((c: any) => <option key={c.id} value={c.id}>{c.name || c.username || c.first_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Destination (Affects pricing)</label>
                <select
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-lime-400 transition-colors"
                  required
                  value={formData.destinationId}
                  onChange={e => setFormData({ ...formData, destinationId: e.target.value })}
                >
                  <option value="">Select Destination</option>
                  {algerianDestinations.length > 0 && (
                    <optgroup label="Domestic — Algeria">
                      {algerianDestinations.map((d: any) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({d.city})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="International / Other">
                    {internationalDestinations.map((d: any) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.city})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Weight (kg)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-lime-400 transition-colors"
                    value={formData.weight}
                    onChange={e => {
                      const raw = e.target.value;
                      if (raw === '') {
                        setFormData({ ...formData, weight: '' });
                        return;
                      }
                      const parsed = Number(raw);
                      const safe = Number.isFinite(parsed) ? Math.max(0, parsed) : '';
                      setFormData({ ...formData, weight: safe });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Volume (m³)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-lime-400 transition-colors"
                    value={formData.volume}
                    onChange={e => {
                      const raw = e.target.value;
                      if (raw === '') {
                        setFormData({ ...formData, volume: '' });
                        return;
                      }
                      const parsed = Number(raw);
                      const safe = Number.isFinite(parsed) ? Math.max(0, parsed) : '';
                      setFormData({ ...formData, volume: safe });
                    }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Estimated Delivery</label>
                <div className="relative">
                  {/* hide native calendar icon and ensure consistent appearance */}
                  <style>{`\n                    /* Hide native calendar icon for webkit browsers */\n                    input[type='date']::-webkit-calendar-picker-indicator {\n                      opacity: 0;\n                      display: none;\n                      -webkit-appearance: none;\n                      appearance: none;\n                    }\n                    /* Firefox: remove inner spin/button */\n                    input[type='date']::-moz-calendar-picker-indicator {\n                      display: none;\n                    }\n                  `}</style>
                  <input
                    ref={dateInputRef}
                    type="date"
                    className="w-full pr-12 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-lime-400 transition-colors"
                    required
                    value={formData.estimatedDelivery}
                    onChange={e => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = dateInputRef.current;
                      if (!input) return;
                      try {
                        // showPicker is available in some browsers
                        // @ts-ignore
                        if (typeof input.showPicker === 'function') {
                          // @ts-ignore
                          input.showPicker();
                          return;
                        }
                      } catch (err) {
                        // ignore
                      }
                      input.focus();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-md p-2 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:shadow-md hover:scale-105 transition-transform duration-150"
                    aria-label="Open calendar"
                  >
                    <span className="sr-only">Open calendar</span>
                    <Calendar size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl flex justify-between items-center border border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-600 dark:text-slate-300">Calculated Price:</span>
                <span className="font-bold text-lime-600 dark:text-lime-400 text-xl">
                  €{calculateShipmentPrice(formData.destination, formData.weight, formData.volume, MOCK_DESTINATION_RATES).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setErrors([]);
                  }}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-lime-400 text-slate-900 font-semibold rounded-lg hover:bg-lime-300 transition-colors shadow-lg shadow-lime-400/20"
                >
                  Create Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shipments;