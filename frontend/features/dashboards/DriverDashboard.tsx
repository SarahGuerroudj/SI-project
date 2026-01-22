/**
 * Driver Dashboard
 * ================
 * Active route management and delivery completion interface
 */
import React, { useState, useMemo } from 'react';
import { MapPin, CheckCircle, AlertCircle, Package, Fuel, Clock, Navigation } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Route, Shipment } from '../../types';
import apiClient from '../../api/client';
import { useToast } from '../../contexts/ToastContext';

const DriverDashboard: React.FC = () => {
    const { getItems, updateItem } = useData();
    const { user } = useAuth();
    const { addToast } = useToast();
    const routes = getItems<Route>('routes');
    const shipments = getItems<Shipment>('shipments');

    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [completionData, setCompletionData] = useState({
        actual_distance_km: '',
        actual_duration_hours: '',
        fuel_consumed_liters: ''
    });

    // Filter to driver's routes
    const myRoutes = useMemo(() => {
        return routes.filter(r =>
            r.driver?.user?.id === user?.id ||
            r.driver?.id === user?.id ||
            r.driverId === user?.id
        );
    }, [routes, user]);

    const activeRoutes = myRoutes.filter(r => r.status === 'Pending' || r.status === 'In Progress');
    const completedToday = myRoutes.filter(r =>
        r.status === 'Completed' &&
        new Date(r.date).toDateString() === new Date().toDateString()
    );

    const handleCompleteDelivery = async () => {
        if (!selectedRoute) return;

        try {
            await apiClient.patch(`/api/v1/routes/${selectedRoute.id}/complete_delivery/`, {
                actual_distance_km: parseFloat(completionData.actual_distance_km) || undefined,
                actual_duration_hours: parseFloat(completionData.actual_duration_hours) || undefined,
                fuel_consumed_liters: parseFloat(completionData.fuel_consumed_liters) || undefined,
            });

            addToast('success', 'Delivery completed successfully!');
            setSelectedRoute(null);
            setCompletionData({ actual_distance_km: '', actual_duration_hours: '', fuel_consumed_liters: '' });

            // Refresh data
            window.location.reload();
        } catch (error: any) {
            addToast('error', error.response?.data?.detail || 'Failed to complete delivery');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Routes</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your deliveries and routes</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                            <MapPin className="text-blue-500" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Active Routes</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{activeRoutes.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                            <CheckCircle className="text-green-500" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Completed Today</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{completedToday.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                            <Package className="text-purple-500" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Total Routes</p>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{myRoutes.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Routes */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Today's Routes</h2>
                </div>

                {activeRoutes.length === 0 ? (
                    <div className="p-12 text-center">
                        <Navigation className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={64} />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No active routes</h3>
                        <p className="text-slate-600 dark:text-slate-400">Check back later for new assignments</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {activeRoutes.map((route) => (
                            <div key={route.id} className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                            Route #{route.id}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                            <Clock size={16} />
                                            <span>{route.date}</span>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${route.status === 'Completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            route.status === 'In Progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>
                                        {route.status}
                                    </span>
                                </div>

                                {/* Route Details */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Vehicle</p>
                                        <p className="font-medium text-slate-900 dark:text-white">{route.vehicle?.plate || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Distance</p>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {route.actual_distance_km || route.estimatedDistance || 'N/A'} km
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Duration</p>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {route.actual_duration_hours || route.estimatedDuration || 'N/A'} hrs
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Shipments</p>
                                        <p className="font-medium text-slate-900 dark:text-white">
                                            {route.shipments?.length || 0} items
                                        </p>
                                    </div>
                                </div>

                                {route.status !== 'Completed' && (
                                    <button
                                        onClick={() => setSelectedRoute(route)}
                                        className="w-full md:w-auto px-6 py-3 bg-lime-400 hover:bg-lime-500 text-slate-900 font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle size={20} />
                                        Complete Delivery
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Completion Modal */}
            {selectedRoute && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Complete Route #{selectedRoute.id}
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Actual Distance (km)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={completionData.actual_distance_km}
                                    onChange={(e) => setCompletionData({ ...completionData, actual_distance_km: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-lime-400 focus:outline-none"
                                    placeholder="0.0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Actual Duration (hours)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={completionData.actual_duration_hours}
                                    onChange={(e) => setCompletionData({ ...completionData, actual_duration_hours: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-lime-400 focus:outline-none"
                                    placeholder="0.0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    <div className="flex items-center gap-2">
                                        <Fuel size={16} />
                                        Fuel Consumed (liters)
                                    </div>
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={completionData.fuel_consumed_liters}
                                    onChange={(e) => setCompletionData({ ...completionData, fuel_consumed_liters: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:border-lime-400 focus:outline-none"
                                    placeholder="0.0"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedRoute(null)}
                                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCompleteDelivery}
                                className="flex-1 px-6 py-3 bg-lime-400 hover:bg-lime-500 text-slate-900 font-semibold rounded-xl transition-colors"
                            >
                                Confirm Completion
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverDashboard;
