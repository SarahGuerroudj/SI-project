import React, { useState } from 'react';
import { Incident } from '../types';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import { AlertTriangle, CheckCircle, Clock, Plus, X, Trash2 } from 'lucide-react';

import Modal from '../components/ui/shared/Modal';

const Incidents: React.FC = () => {
  const { getItems, addItem, updateItem, deleteItem } = useData();
  const { addToast } = useToast();
  const incidents = getItems<Incident>('incidents');

  const [showModal, setShowModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [newIncident, setNewIncident] = useState<Partial<Incident>>({
    type: 'Accident',
    description: '',
    date: new Date().toISOString().split('T')[0],
    resolved: false,
    related_entity_id: '',
    photo: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this incident?')) return;
    try {
      await deleteItem('incidents', id);
      addToast('success', 'Incident deleted successfully');
      if (selectedIncident?.id === id) {
        setSelectedIncident(null);
      }
    } catch (error) {
      console.error(error);
      addToast('error', 'Failed to delete incident');
    }
  };

  const handleResolve = async (incident: Incident) => {
    try {
      await updateItem('incidents', { ...incident, resolved: true });
      addToast('success', 'Incident marked as resolved');
      if (selectedIncident?.id === incident.id) {
        setSelectedIncident({ ...incident, resolved: true });
      }
    } catch (error) {
      console.error(error);
      addToast('error', 'Failed to update incident');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Pass the file object directly if selected
      const incidentData = {
        ...newIncident,
        photoFile: selectedFile // Add this property to pass the File object
      };

      await addItem('incidents', incidentData);
      addToast('success', 'Incident reported successfully');
      setShowModal(false);
      setNewIncident({
        type: 'Accident',
        description: '',
        date: new Date().toISOString().split('T')[0],
        resolved: false,
        related_entity_id: '',
        photo: ''
      });
      setSelectedFile(null);
    } catch (error) {
      console.error(error);
      addToast('error', 'Failed to report incident');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Incidents & Claims</h2>
          <p className="text-slate-500 dark:text-slate-400">Track operational issues</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 text-red-500 dark:text-red-400 px-5 py-2.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 shadow-lg transition-colors flex items-center font-medium"
        >
          <AlertTriangle size={18} className="mr-2" /> Report Incident
        </button>
      </div>

      <div className="grid gap-4">
        {incidents.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Incidents Reported</h3>
            <p className="text-slate-500 dark:text-slate-400">Great job! Operations are running smoothly.</p>
          </div>
        ) : (
          incidents.map((inc) => (
            <div key={inc.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div className="flex items-start mb-4 md:mb-0">
                <div className={`p-3 rounded-full mr-5 border ${inc.resolved ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900' : 'bg-red-100 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-200 dark:border-red-900'}`}>
                  {inc.resolved ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{inc.type}</h3>
                  <p className="text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{inc.description}</p>
                  <div className="flex items-center mt-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock size={14} className="mr-1" /> {inc.date}
                    {inc.related_entity_id && (
                      <> • Ref: <span className="text-slate-500 ml-1">{inc.related_entity_id}</span></>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {!inc.resolved && (
                  <button
                    onClick={() => handleResolve(inc)}
                    className="px-5 py-2 border border-green-200 dark:border-green-600/50 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-sm font-medium"
                  >
                    Mark Resolved
                  </button>
                )}
                <button
                  onClick={() => setSelectedIncident(inc)}
                  className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
                >
                  Details
                </button>
                <button
                  onClick={() => handleDelete(inc.id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Delete Incident"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Incident Details Modal */}
      <Modal
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        title="Incident Details"
      >
        {selectedIncident && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
              <div className={`p-3 rounded-full border ${selectedIncident.resolved ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900' : 'bg-red-100 dark:bg-red-900/20 text-red-500 dark:text-red-400 border-red-200 dark:border-red-900'}`}>
                {selectedIncident.resolved ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</p>
                <p className={`font-bold ${selectedIncident.resolved ? 'text-green-600' : 'text-red-500'}`}>
                  {selectedIncident.resolved ? 'Resolved' : 'Critical / Pending'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Incident Type</p>
                <p className="font-bold text-slate-900 dark:text-white">{selectedIncident.type}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Date Reported</p>
                <div className="flex items-center text-slate-600 dark:text-slate-300">
                  <Clock size={14} className="mr-1.5" />
                  <span className="font-medium">{selectedIncident.date}</span>
                </div>
              </div>
            </div>

            {selectedIncident.related_entity_id && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Related Object ID</p>
                <p className="font-mono text-sm bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block">
                  {selectedIncident.related_entity_id}
                </p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Description</p>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed italic">
                "{selectedIncident.description}"
              </div>
            </div>

            {selectedIncident.photo && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Photo Evidence</p>
                <div className="relative group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
                  <img
                    src={selectedIncident.photo}
                    alt="Evidence"
                    className="w-full h-auto max-h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </div>
            )}

            {!selectedIncident.resolved && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                <button
                  onClick={() => handleResolve(selectedIncident)}
                  className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/20"
                >
                  Confirm Resolution
                </button>
                <button
                  onClick={() => handleDelete(selectedIncident.id)}
                  className="px-4 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
                  title="Delete Incident"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            )}
            {selectedIncident.resolved && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleDelete(selectedIncident.id)}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} /> Delete Record
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Report Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Report New Incident</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={newIncident.type}
                    onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value as any })}
                    className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 py-2.5 px-3"
                  >
                    <option value="Accident">Accident</option>
                    <option value="Breakdown">Breakdown</option>
                    <option value="Delay">Delay</option>
                    <option value="Lost Cargo">Lost Cargo</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={newIncident.date}
                    onChange={(e) => setNewIncident({ ...newIncident, date: e.target.value })}
                    className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 py-2.5 px-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Related ID (Optional)</label>
                  <input
                    type="text"
                    value={newIncident.related_entity_id}
                    onChange={(e) => setNewIncident({ ...newIncident, related_entity_id: e.target.value })}
                    placeholder="Route or Shipment ID"
                    className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 py-2.5 px-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Photo Evidence</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 dark:border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {selectedFile ? (
                        <p className="text-sm text-lime-600 dark:text-lime-400 font-medium">{selectedFile.name}</p>
                      ) : (
                        <>
                          <svg className="w-8 h-8 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                          <p className="text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold">Click to upload</span></p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    value={newIncident.description}
                    onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                    required
                    rows={3}
                    className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 py-2.5 px-3"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow-sm hover:shadow-md transition-all flex justify-center items-center gap-2"
                >
                  Submit Report
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;