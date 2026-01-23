/**
 * Client Dashboard
 * ================
 * Simplified shipment tracking interface for clients
 */
import React, { useMemo } from 'react';
import { Package, TrendingUp, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Shipment } from '../../types';
import { Link } from 'react-router-dom';

const ClientDashboard: React.FC = () => {
    const { getItems } = useData();
    const { user } = useAuth();
    const shipments = getItems<Shipment>('shipments');

    // Filter to only current user's shipments
    const myShipments = useMemo(() => {
        return shipments.filter(s => s.clientId === user?.id || s.client?.id === user?.id || s.client?.user_details?.id === user?.id);
    }, [shipments, user]);

    // Categorize shipments
    const pending = myShipments.filter(s => s.status === 'Pending');
    const inTransit = myShipments.filter(s => s.status === 'In Transit');
    const delivered = myShipments.filter(s => s.status === 'Delivered');

    const stats = [
        { label: 'Pending', count: pending.length, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
        { label: 'In Transit', count: inTransit.length, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { label: 'Delivered', count: delivered.length, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Shipments</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Track and manage your deliveries</p>
                </div>
                <Link
                    to="/shipments?action=create"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-lime-400 hover:bg-lime-500 text-slate-900 font-semibold rounded-xl transition-colors"
                >
                    <Plus size={20} />
                    New Shipment
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.bg}`}>
                                    <Icon className={stat.color} size={24} />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
                                    <p className="text-3xl font-bold text-slate-900 dark:text-white">{stat.count}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Recent Shipments */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Shipments</h2>
                </div>

                {myShipments.length === 0 ? (
                    <div className="p-12 text-center">
                        <Package className="mx-auto text-slate-300 dark:text-slate-700 mb-4" size={64} />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No shipments yet</h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">Create your first shipment to get started</p>
                        <Link
                            to="/shipments?action=create"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-lime-400 hover:bg-lime-500 text-slate-900 font-semibold rounded-xl transition-colors"
                        >
                            <Plus size={20} />
                            Create Shipment
                        </Link>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200 dark:divide-slate-800">
                        {myShipments.slice(0, 10).map((shipment) => (
                            <div key={shipment.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                                Shipment #{shipment.id}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${shipment.status === 'Delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    shipment.status === 'Pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                {shipment.status}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Destination</p>
                                                <p className="font-medium text-slate-900 dark:text-white">{shipment.destination || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Weight</p>
                                                <p className="font-medium text-slate-900 dark:text-white">{shipment.weight} kg</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Price</p>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {shipment.price?.toFixed(2)} {shipment.currency || 'EUR'}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Est. Delivery</p>
                                                <p className="font-medium text-slate-900 dark:text-white">
                                                    {shipment.estimatedDelivery || 'TBD'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Link
                                        to={`/shipments/${shipment.id}`}
                                        className="ml-4 px-4 py-2 text-sm font-medium text-lime-600 dark:text-lime-400 hover:bg-lime-50 dark:hover:bg-lime-900/20 rounded-lg transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                    to="/shipments"
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-lime-400 dark:hover:border-lime-500 transition-colors group"
                >
                    <Package className="text-lime-500 mb-3" size={32} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">All Shipments</h3>
                    <p className="text-slate-600 dark:text-slate-400">View complete shipment history and tracking</p>
                </Link>

                <Link
                    to="/complaints"
                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:border-lime-400 dark:hover:border-lime-500 transition-colors group"
                >
                    <AlertCircle className="text-lime-500 mb-3" size={32} />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Support</h3>
                    <p className="text-slate-600 dark:text-slate-400">File complaints or contact support</p>
                </Link>
            </div>
        </div>
    );
};

export default ClientDashboard;
