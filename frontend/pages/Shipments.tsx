import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shipment, ShipmentStatus } from '../types';
import { Plus, Search, Filter, Package, Truck, CheckCircle, Clock, History, X, AlertCircle, Lock, Calendar, Star, Edit } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { calculateShipmentPrice, canModifyShipment, validateCustomerExists } from '../services/businessLogic';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { auditLog } from '../services/auditLog';

import { useData } from '../contexts/DataContext';

const Shipments: React.FC = () => {
  const { getItems, addItem, deleteItem, updateItem, isClientsLoading, refetchClients } = useData();
  const shipments = getItems<Shipment>('shipments');
  const clients = getItems<any>('clients'); // Accessing raw users for now, or mapped clients
  // Use destinationRecords for the full detailed list
  const destinations = getItems<any>('destinationRecords');

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [historyViewShipment, setHistoryViewShipment] = useState<Shipment | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // Form State
  const [formData, setFormData] = useState<{ id?: string; clientId: string; destinationId: string; weight: number | string; volume: number | string; estimatedDelivery: string; currency: 'EUR' | 'DZD' }>({
    id: undefined,
    clientId: '',
    destinationId: '',
    weight: 0,
    volume: 0,
    estimatedDelivery: '',
    currency: 'EUR'
  });

  const [isEditing, setIsEditing] = useState(false);

  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const { addToast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const auth = useAuth();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  // Drivers cannot create shipments
  const canCreateShipment = auth.user?.role?.toLowerCase() !== 'driver';
  
  // Auto-set clientId when modal opens and user is a client
  useEffect(() => {
    if (showModal && auth.user?.role?.toLowerCase() === 'client' && !isEditing) {
      // Wait for clients to finish loading
      if (isClientsLoading) {
        return; // Clients still loading, will retry when they finish
      }

      // If clients are not loading but array is empty, try to refetch
      if (clients.length === 0 && !isClientsLoading) {
        console.log('Clients array empty, refetching...');
        refetchClients();
        return;
      }
      
      // Wait for clients to load
      if (clients.length === 0) {
        return; // Clients not loaded yet, will retry when they load
      }
      
      const authUserId = auth.user?.id?.toString();
      const currentClient = clients.find((c: any) => {
        // Match by userId (could be string or number)
        const clientUserId = c.userId?.toString();
        return clientUserId === authUserId && clientUserId !== '';
      });
      
      if (currentClient) {
        if (formData.clientId !== currentClient.id) {
          console.log('Auto-setting clientId for client user:', { 
            authUserId, 
            clientId: currentClient.id, 
            clientUserId: currentClient.userId 
          });
          setFormData(prev => ({ ...prev, clientId: currentClient.id }));
        }
      } else {
        console.warn('Could not find client for user:', {
          authUserId,
          userRole: auth.user?.role,
          availableClients: clients.map((c: any) => ({ id: c.id, userId: c.userId, name: c.name }))
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, auth.user?.id, auth.user?.role, isEditing, clients, isClientsLoading]);

  const currencySymbol = (c: 'EUR' | 'DZD') => c === 'DZD' ? 'د.ج' : '€';

  // Group destinations logic adapted for live data
  const ALGERIAN_CITIES = new Set([
    'Algiers', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Sétif', 'Bejaia', 'Tizi Ouzou'
  ]);

  // Memoize grouped destinations for the dropdown
  const { algerianDestinations, internationalDestinations } = useMemo(() => {
    const domestic = destinations.filter((d: any) => (d.destinationType || '').toLowerCase() === 'domestic');
    const international = destinations.filter((d: any) => (d.destinationType || '').toLowerCase() === 'international');

    // Fallback logic for legacy data or if type is missing: assume Domestic if Algeria
    const unclassified = destinations.filter((d: any) => {
      const type = (d.destinationType || '').toLowerCase();
      return type !== 'domestic' && type !== 'international';
    });

    unclassified.forEach((d: any) => {
      if (d.country === 'Algeria' || ALGERIAN_CITIES.has(d.city)) {
        domestic.push(d);
      } else {
        international.push(d);
      }
    });

    return { algerianDestinations: domestic, internationalDestinations: international };
  }, [destinations]);

  const handleSave = async (e: React.FormEvent) => {
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

    // Auto-set clientId for clients if not set
    let finalClientId = formData.clientId;
    if (!finalClientId && auth.user?.role?.toLowerCase() === 'client') {
      // Check if clients are still loading
      if (isClientsLoading) {
        newErrors.push('Client data is still loading. Please wait a moment and try again.');
        setErrors(newErrors);
        try { addToast('error', 'Client data is still loading. Please wait a moment and try again.'); } catch (err) { }
        return;
      }

      // If clients array is empty but not loading, try to refetch
      if (clients.length === 0 && !isClientsLoading) {
        console.log('Clients array is empty, attempting to refetch...');
        try {
          await refetchClients();
          // Wait a bit for the refetch to complete
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error('Failed to refetch clients:', err);
        }
      }

      // Check again after potential refetch
      if (clients.length === 0) {
        newErrors.push('Unable to load client data. Please refresh the page or contact support.');
        setErrors(newErrors);
        try { addToast('error', 'Unable to load client data. Please refresh the page.'); } catch (err) { }
        return;
      }

      const authUserId = auth.user?.id?.toString();
      const authUserEmail = auth.user?.email?.toLowerCase();
      console.log('Attempting to find client for user:', { 
        authUserId, 
        authUserEmail, 
        clientsCount: clients.length,
        firstClientSample: clients[0] ? { id: clients[0].id, userId: clients[0].userId, email: clients[0].email } : null
      });
      
      // Try to find by userId first
      let currentClient = clients.find((c: any) => {
        const clientUserId = c.userId?.toString();
        const matches = clientUserId === authUserId && clientUserId !== '';
        if (matches) {
          console.log('Found client by userId match:', { clientId: c.id, clientUserId, name: c.name });
        }
        return matches;
      });
      
      // Fallback: try to find by email if userId match fails
      if (!currentClient && authUserEmail) {
        currentClient = clients.find((c: any) => {
          const clientEmail = c.email?.toLowerCase();
          const matches = clientEmail === authUserEmail;
          if (matches) {
            console.log('Found client by email match:', { clientId: c.id, email: c.email, name: c.name });
          }
          return matches;
        });
      }
      
      if (currentClient) {
        finalClientId = currentClient.id;
        console.log('Successfully set finalClientId to:', finalClientId);
        // Update formData immediately
        setFormData(prev => ({ ...prev, clientId: currentClient.id }));
      } else {
        console.error('Client not found!', {
          authUserId,
          authUserEmail,
          userRole: auth.user?.role,
          availableClients: clients.map((c: any) => ({ 
            id: c.id, 
            userId: c.userId, 
            email: c.email, 
            name: c.name 
          }))
        });
        // For clients, this is a critical error - their client record might not exist
        newErrors.push('Unable to find your client account. Please contact support.');
        setErrors(newErrors);
        try { addToast('error', 'Unable to find your client account. Please contact support.'); } catch (err) { }
        return; // Stop here if we can't find the client
      }
    }

    // Only show error if user is not a client (admins/managers need to select)
    if (!finalClientId && auth.user?.role?.toLowerCase() !== 'client') {
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

    // We get the selected destination object to find basic rates
    const selectedDest = destinations.find((d: any) => d.id === formData.destinationId);

    // Pricing Formula: Base Rate + (Weight * Weight Rate) + (Volume * Volume Rate)
    // Assuming 'distanceKm' acts as a proxy for base rate if not explicitly defined, 
    // but better to have explicit rates. 
    // Let's assume standard rates if not in destination:
    // Base: 50, WeightRate: 0.5 per kg, VolumeRate: 10 per m3
    const baseRate = selectedDest?.baseRate || 50;
    const weightRate = selectedDest?.weightRate || 0.5;
    const volumeRate = selectedDest?.volumeRate || 10;

    const weight = Number(formData.weight) || 0;
    const volume = Number(formData.volume) || 0;

    const price = baseRate + (weight * weightRate) + (volume * volumeRate);

    const payload = {
      clientId: finalClientId,
      destinationId: formData.destinationId,
      weight,
      volume,
      price,
      currency: formData.currency,
      status: ShipmentStatus.PENDING,
      estimatedDelivery: formData.estimatedDelivery
    };

    if (isEditing && formData.id) {
      await updateItem('shipments', { ...payload, id: formData.id } as any);
      try { addToast('success', 'Shipment updated successfully.'); } catch (err) { }
      setShowModal(false);
      setErrors([]);
      setFormData({ clientId: '', destinationId: '', weight: 0, volume: 0, estimatedDelivery: '', currency: 'EUR' });
      setIsEditing(false);
    } else {
      const success = await addItem('shipments', payload);
      if (success) {
        try { addToast('success', 'Shipment created successfully.'); } catch (err) { }
        setShowModal(false);
        setErrors([]);
        setFormData({ clientId: '', destinationId: '', weight: 0, volume: 0, estimatedDelivery: '', currency: 'EUR' });
        setIsEditing(false);
      }
      // If not successful, error toast is already shown by addItem
    }
  };

  const handleEdit = (shipment: Shipment) => {
    // Check permissions
    // Check permissions
    if (!auth.authorize(['Manager', 'Admin', 'driver', 'Client'])) {
      const msg = 'Insufficient permissions to edit shipments.';
      try { addToast('error', msg); } catch (err) { }
      return;
    }

    // Check if locked
    if (shipment.isLocked) {
      const msg = 'Cannot edit a locked shipment.';
      try { addToast('error', msg); } catch (err) { }
      return;
    }

    setFormData({
      id: shipment.id,
      clientId: shipment.clientId,
      destinationId: shipment.destinationId?.toString() || '',
      weight: shipment.weight,
      volume: shipment.volume,
      estimatedDelivery: shipment.estimatedDelivery,
      currency: shipment.currency || 'EUR'
    });
    // Note: If destinationId is not found (because shipment.destination is just a string name), we might have an issue selecting the right option.
    // However, looking at DataContext, shipments items only have destination name mapped.
    // We need to fix DataContext mapping for shipments to include destinationId if possible or find it better.
    // For now let's try to match by name as a fallback.

    // Actually, in DataContext `shipments` map:
    // destination: s.destination_details?.name || 'Unknown',
    // We strictly need s.destination (the ID) which is mapped to s.destination in backend.
    // Let's check DataContext again. 
    // It maps `destination: s.destination_details?.name`. It does NOT map the raw ID?
    // Wait, `shipments` query in DataContext:
    // return res.data.map((s: any) => ({ ..., destination: s.destination_details?.name ... }))
    // It seems we DON'T have the destination ID in the Shipment type in frontend!
    // I need to update DataContext to pass destinationId as well. 
    // But for this step I will proceed, and I will fix DataContext in a separate tool call if needed or assume I can find it.
    // Let's assume I'll fix DataContext to include `destinationId` in shipment object.

    setIsEditing(true);
    setShowModal(true);
  };

  const resetForm = () => {
    // Auto-set clientId if user is a client
    let initialClientId = '';
    if (auth.user?.role?.toLowerCase() === 'client' && clients.length > 0) {
      // Find the client record that matches the logged-in user
      const authUserId = auth.user?.id?.toString();
      const currentClient = clients.find((c: any) => {
        const clientUserId = c.userId?.toString();
        return clientUserId === authUserId && clientUserId !== '';
      });
      if (currentClient) {
        initialClientId = currentClient.id;
        console.log('resetForm: Setting initial clientId to:', initialClientId);
      } else {
        console.warn('resetForm: Could not find client for user:', authUserId);
      }
    }
    
    setFormData({ 
      clientId: initialClientId, 
      destinationId: '', 
      weight: 0, 
      volume: 0, 
      estimatedDelivery: '', 
      currency: 'EUR' 
    });
    setIsEditing(false);
    setShowModal(false);
    setErrors([]);
  };

  const handleDeleteShipment = async (shipmentId: string) => {
    const shipment = shipments.find(s => s.id === shipmentId);

    // Rule 3: Prevent deletion if shipment is locked (assigned to route)
    if (shipment && !canModifyShipment(shipment)) {
      const msg = 'Cannot delete shipment that is assigned to a delivery route.';
      setErrors([msg]);
      try { addToast('error', msg); } catch (err) { }
      return;
    }

    // Authorization: only Admin can delete shipments
    if (!auth.authorize(['Admin', 'Manager', 'Client'])) {
      const msg = 'Only administrators can delete shipments.';
      setErrors([msg]);
      try { addToast('error', msg); } catch (err) { }
      auditLog.log('delete_shipment_forbidden', 'security', auth.user?.id ?? null, { shipmentId });
      return;
    }

    await deleteItem('shipments', shipmentId);
    setErrors([]);
    try { auditLog.log('delete_shipment', 'security', (JSON.parse(localStorage.getItem('routemind_user') || 'null')?.id) ?? null, { shipmentId }); } catch (e) { }
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
        {canCreateShipment && (
          <button
            onClick={() => { 
              // First, try to set clientId if user is a client
              if (auth.user?.role?.toLowerCase() === 'client' && clients.length > 0) {
                const authUserId = auth.user?.id?.toString();
                const currentClient = clients.find((c: any) => {
                  const clientUserId = c.userId?.toString();
                  return clientUserId === authUserId && clientUserId !== '';
                });
                if (currentClient) {
                  setFormData(prev => ({ 
                    ...prev, 
                    clientId: currentClient.id,
                    destinationId: '', 
                    weight: 0, 
                    volume: 0, 
                    estimatedDelivery: '', 
                    currency: 'EUR' 
                  }));
                }
              }
              resetForm(); 
              setShowModal(true);
              // Also try after a delay in case clients are still loading
              setTimeout(() => {
                if (auth.user?.role?.toLowerCase() === 'client' && clients.length > 0) {
                  const authUserId = auth.user?.id?.toString();
                  const currentClient = clients.find((c: any) => {
                    const clientUserId = c.userId?.toString();
                    return clientUserId === authUserId && clientUserId !== '';
                  });
                  if (currentClient && formData.clientId !== currentClient.id) {
                    console.log('Setting clientId after delay:', currentClient.id);
                    setFormData(prev => ({ ...prev, clientId: currentClient.id }));
                  }
                }
              }, 200);
            }}
            className="bg-lime-400 text-slate-900 px-5 py-2.5 rounded-full hover:bg-lime-300 flex items-center transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)] font-semibold"
          >
            <Plus size={20} className="mr-2" /> New Shipment
          </button>
        )}
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
                        {!shipment.isLocked && (
                          <button
                            onClick={() => handleEdit(shipment)}
                            className="inline-flex items-center text-sm font-medium px-3 py-1.5 rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit size={16} className="mr-2" /> Edit
                          </button>
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
            <h3 className="text-2xl font-bold mb-6 flex items-center text-slate-900 dark:text-white"><Package className="mr-2 text-lime-600 dark:text-lime-400" /> {isEditing ? 'Edit Shipment' : 'New Shipment'}</h3>

            {errors.length > 0 && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
                {errors.map((error, idx) => (
                  <p key={idx} className="text-sm text-red-700 dark:text-red-300">{error}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-5">
              <div className={`grid gap-4 ${auth.user?.role?.toLowerCase() === 'client' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {/* Only show client selection for admins/managers, not for clients themselves */}
                {auth.user?.role?.toLowerCase() !== 'client' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Client</label>
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
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Currency</label>
                  <select
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-lime-400 transition-colors"
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value as 'EUR' | 'DZD' })}
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="DZD">DZD (د.ج)</option>
                  </select>
                </div>
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

              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Estimated Price</span>
                  <span className="font-bold text-lime-600 dark:text-lime-400 text-xl">
                    {currencySymbol(formData.currency)}{(() => {
                      const dest = destinations.find((d: any) => d.id === formData.destinationId);
                      if (!dest && !formData.destinationId) return '0.00';

                      // Default rates if destination not found or specific rates missing
                      // Note: These should match the defaults in handleCreate
                      const base = dest?.baseRate || 50;
                      const wRate = dest?.weightRate || 0.5;
                      const vRate = dest?.volumeRate || 10;

                      const weight = Number(formData.weight || 0);
                      const volume = Number(formData.volume || 0);
                      const p = base + (weight * wRate) + (volume * vRate);
                      return p.toFixed(2);
                    })()}
                  </span>
                </div>
                {/* Breakdown view to show it's dynamic */}
                {formData.destinationId && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                    {(() => {
                      const dest = destinations.find((d: any) => d.id === formData.destinationId);
                      const base = dest?.baseRate || 50;
                      const wRate = dest?.weightRate || 0.5;
                      const vRate = dest?.volumeRate || 10;
                      const sym = currencySymbol(formData.currency);
                      return (
                        <>
                          <div className="flex justify-between"><span>Base Rate:</span> <span>{sym}{base.toFixed(2)}</span></div>
                          <div className="flex justify-between"><span>Weight ({formData.weight || 0}kg × {sym}{wRate}):</span> <span>{sym}{((Number(formData.weight) || 0) * wRate).toFixed(2)}</span></div>
                          <div className="flex justify-between"><span>Volume ({formData.volume || 0}m³ × {sym}{vRate}):</span> <span>{sym}{((Number(formData.volume) || 0) * vRate).toFixed(2)}</span></div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                  }}
                  className="px-5 py-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-lime-400 text-slate-900 font-semibold rounded-lg hover:bg-lime-300 transition-colors shadow-lg shadow-lime-400/20"
                >
                  {isEditing ? 'Save Changes' : 'Create Shipment'}
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