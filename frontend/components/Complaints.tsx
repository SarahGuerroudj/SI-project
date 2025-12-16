import React, { useState, useMemo } from 'react';
import { Complaint, ComplaintItem, Client, Shipment, Invoice } from '../types';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import { AlertTriangle, Plus, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const Complaints: React.FC = () => {
  const { getItems, addItem, updateItem } = useData();
  const { addToast } = useToast();

  const complaints = getItems<Complaint>('complaints');
  const clients = getItems<Client>('clients');
  const shipments = getItems<Shipment>('shipments');
  const invoices = getItems<Invoice>('invoices');

  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    clientId: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    relatedItems: [] as ComplaintItem[]
  });

  const [selectedItemType, setSelectedItemType] = useState<'shipment' | 'invoice' | 'service'>('shipment');
  const [selectedItemId, setSelectedItemId] = useState('');

  const handleAddItem = () => {
    if (!selectedItemId && selectedItemType !== 'service') {
      setErrors(['Please select an item to add']);
      return;
    }

    // For service, we might not have an ID, or we generate one/allow text
    const entId = selectedItemId || (selectedItemType === 'service' ? 'Service issue' : '');

    if (formData.relatedItems.some(item => item.entityId === entId && item.type === selectedItemType)) {
      setErrors(['This item is already added']);
      return;
    }

    const newItem: ComplaintItem = {
      type: selectedItemType,
      entityId: entId,
      description: ''
    };

    setFormData({
      ...formData,
      relatedItems: [...formData.relatedItems, newItem]
    });
    setSelectedItemId('');
    setErrors([]);
  };

  const handleRemoveItem = (entityId: string) => {
    setFormData({
      ...formData,
      relatedItems: formData.relatedItems.filter(item => item.entityId !== entityId)
    });
  };

  const getAvailableItems = () => {
    if (selectedItemType === 'shipment') {
      return shipments.filter(s => s.clientId.toString() === formData.clientId.toString());
    } else if (selectedItemType === 'invoice') {
      return invoices.filter(inv => inv.clientId.toString() === formData.clientId.toString());
    }
    return [];
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: string[] = [];

    if (!formData.clientId) {
      newErrors.push('Client is required');
    }

    if (formData.relatedItems.length === 0) {
      newErrors.push('At least one related item must be added');
    }

    if (!formData.description.trim()) {
      newErrors.push('Description is required');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await addItem('complaints', {
        clientId: formData.clientId,
        description: formData.description,
        priority: formData.priority,
        relatedItems: formData.relatedItems,
        status: 'Open',
        date: new Date().toISOString().split('T')[0]
      });

      addToast('success', 'Complaint filed successfully');
      setShowModal(false);
      setErrors([]);
      setFormData({
        clientId: '',
        description: '',
        priority: 'Medium',
        relatedItems: []
      });
    } catch (error) {
      console.error(error);
      addToast('error', 'Failed to file complaint');
    }
  };

  const handleUpdateStatus = async (complaintId: string, newStatus: Complaint['status']) => {
    try {
      // Find the complaint object to update
      const complaint = complaints.find(c => c.id === complaintId);
      if (!complaint) return;

      await updateItem('complaints', { ...complaint, status: newStatus });
      addToast('success', `Complaint status updated to ${newStatus}`);
    } catch (error) {
      console.error(error);
      addToast('error', 'Failed to update status');
    }
  };

  const getClientName = (id: string) => clients.find(c => c.id.toString() === id.toString())?.name || 'Unknown';

  const getItemLabel = (item: ComplaintItem) => {
    if (item.type === 'shipment') {
      return `Shipment ${item.entityId}`;
    } else if (item.type === 'invoice') {
      // Look up invoice number if possible, or just ID
      const inv = invoices.find(i => i.id.toString() === item.entityId.toString());
      return inv ? `Invoice ${inv.id}` : `Invoice ${item.entityId}`;
    }
    return `Service: ${item.entityId}`;
  };

  const getPriorityBadge = (priority: Complaint['priority']) => {
    const colors = {
      Low: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      Medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      High: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  const getStatusBadge = (status: Complaint['status']) => {
    const colors = {
      Open: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
      'In Progress': 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      Resolved: 'bg-lime-100 dark:bg-lime-900/30 text-lime-600 dark:text-lime-400 border-lime-200 dark:border-lime-800',
      Closed: 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colors[status]}`}>
        {status === 'Open' && <AlertCircle size={12} className="mr-1" />}
        {status === 'In Progress' && <Clock size={12} className="mr-1" />}
        {status === 'Resolved' && <CheckCircle size={12} className="mr-1" />}
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Complaints & Claims</h2>
          <p className="text-slate-500 dark:text-slate-400">Track and manage customer complaints linked to items</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-500 dark:text-red-400 px-5 py-2.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 shadow-lg transition-colors flex items-center font-medium"
        >
          <Plus size={20} className="mr-2" /> New Complaint
        </button>
      </div>

      {/* Complaints Grid */}
      <div className="grid gap-4">
        {complaints.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <AlertCircle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Complaints</h3>
            <p className="text-slate-500 dark:text-slate-400">There are no open complaints at this time.</p>
          </div>
        ) : (
          complaints.map((complaint) => (
            <div
              key={complaint.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="text-red-500 dark:text-red-400 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Case #{complaint.id}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {getClientName(complaint.clientId)} • {complaint.date}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">{complaint.description}</p>

                  {/* Related Items */}
                  {complaint.relatedItems && complaint.relatedItems.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">
                        Related Items ({complaint.relatedItems.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {complaint.relatedItems.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          >
                            {getItemLabel(item)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 md:items-end">
                  {getPriorityBadge(complaint.priority)}
                  {getStatusBadge(complaint.status)}
                </div>
              </div>

              {/* Status Transitions */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
                {complaint.status === 'Open' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(complaint.id, 'In Progress')}
                      className="text-xs px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors font-medium"
                    >
                      Mark In Progress
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(complaint.id, 'Resolved')}
                      className="text-xs px-3 py-1.5 bg-lime-50 dark:bg-lime-900/20 text-lime-600 dark:text-lime-400 border border-lime-200 dark:border-lime-700 rounded-lg hover:bg-lime-100 dark:hover:bg-lime-900/40 transition-colors font-medium"
                    >
                      Resolve
                    </button>
                  </>
                )}
                {complaint.status === 'In Progress' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(complaint.id, 'Resolved')}
                      className="text-xs px-3 py-1.5 bg-lime-50 dark:bg-lime-900/20 text-lime-600 dark:text-lime-400 border border-lime-200 dark:border-lime-700 rounded-lg hover:bg-lime-100 dark:hover:bg-lime-900/40 transition-colors font-medium"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(complaint.id, 'Open')}
                      className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                    >
                      Reopen
                    </button>
                  </>
                )}
                {complaint.status === 'Resolved' && (
                  <button
                    onClick={() => handleUpdateStatus(complaint.id, 'Closed')}
                    className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-colors">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-8 animate-fade-in border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="text-red-500 dark:text-red-400" size={24} />
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">New Complaint</h3>
            </div>

            {errors.length > 0 && (
              <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
                {errors.map((error, idx) => (
                  <p key={idx} className="text-sm text-red-700 dark:text-red-300">{error}</p>
                ))}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Client</label>
                <select
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-red-400 transition-colors"
                  required
                  value={formData.clientId}
                  onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                >
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Priority</label>
                <select
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-red-400 transition-colors"
                  value={formData.priority}
                  onChange={e => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Description</label>
                <textarea
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-red-400 transition-colors h-24 resize-none"
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the complaint..."
                />
              </div>

              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Add Related Items</label>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">Item Type</label>
                    <select
                      className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                      value={selectedItemType}
                      onChange={e => {
                        setSelectedItemType(e.target.value as any);
                        setSelectedItemId('');
                      }}
                    >
                      <option value="shipment">Shipment</option>
                      <option value="invoice">Invoice</option>
                      <option value="service">Service</option>
                    </select>
                  </div>

                  {selectedItemType !== 'service' && (
                    <div>
                      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">Select {selectedItemType}</label>
                      <select
                        className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                        value={selectedItemId}
                        onChange={e => setSelectedItemId(e.target.value)}
                        disabled={!formData.clientId}
                      >
                        <option value="">{formData.clientId ? 'Choose...' : 'Select a client first'}</option>
                        {getAvailableItems().map(item => (
                          <option key={item.id} value={item.id}>
                            {item.id}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                  >
                    Add Item
                  </button>
                </div>

                {/* Added Items */}
                {formData.relatedItems.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.relatedItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
                      >
                        <span className="text-sm text-slate-700 dark:text-slate-300">{getItemLabel(item)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.entityId)}
                          className="text-slate-500 hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
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
                  className="px-5 py-2.5 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                >
                  File Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Complaints;
