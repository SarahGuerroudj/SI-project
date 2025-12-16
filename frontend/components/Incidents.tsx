import React, { useState } from 'react';
import { Incident } from '../types';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import { AlertTriangle, CheckCircle, Clock, Plus, X } from 'lucide-react';

const Incidents: React.FC = () => {
  const { getItems, addItem, updateItem } = useData();
  const { addToast } = useToast();
  const incidents = getItems<Incident>('incidents');

  const [showModal, setShowModal] = useState(false);
  const [newIncident, setNewIncident] = useState<Partial<Incident>>({
    type: 'Accident',
    description: '',
    date: new Date().toISOString().split('T')[0],
    resolved: false,
    relatedEntityId: ''
  });

  const handleResolve = async (incident: Incident) => {
    try {
      await updateItem('incidents', { ...incident, resolved: true });
      addToast('success', 'Incident marked as resolved');
    } catch (error) {
      console.error(error);
      addToast('error', 'Failed to update incident');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addItem('incidents', newIncident);
      addToast('success', 'Incident reported successfully');
      setShowModal(false);
      setNewIncident({
        type: 'Accident',
        description: '',
        date: new Date().toISOString().split('T')[0],
        resolved: false,
        relatedEntityId: ''
      });
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
                  <p className="text-slate-500 dark:text-slate-400 mt-1">{inc.description}</p>
                  <div className="flex items-center mt-2 text-sm text-slate-600 dark:text-slate-400">
                    <Clock size={14} className="mr-1" /> {inc.date}
                    {inc.relatedEntityId && (
                      <> • Ref: <span className="text-slate-500 ml-1">{inc.relatedEntityId}</span></>
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
                <button className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-medium">
                  Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

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
                    value={newIncident.relatedEntityId}
                    onChange={(e) => setNewIncident({ ...newIncident, relatedEntityId: e.target.value })}
                    placeholder="Route or Shipment ID"
                    className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 py-2.5 px-3"
                  />
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