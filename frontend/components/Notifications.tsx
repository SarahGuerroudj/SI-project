import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, Filter, X, Package, Truck, AlertTriangle, DollarSign, Calendar, ArrowLeft } from 'lucide-react';

interface Notification {
    id: string;
    type: 'shipment' | 'vehicle' | 'incident' | 'payment' | 'general';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

const Notifications: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'shipment',
            title: 'New Shipment Received',
            message: 'Shipment #SH-1234 has been created and assigned to your route',
            timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
            read: false,
        },
        {
            id: '2',
            type: 'vehicle',
            title: 'Vehicle Maintenance Due',
            message: 'Vehicle TRK-789 requires maintenance scheduled for next week',
            timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
            read: false,
        },
        {
            id: '3',
            type: 'incident',
            title: 'Incident Reported',
            message: 'Driver reported a delay on Route RT-456 due to traffic',
            timestamp: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
            read: true,
        },
        {
            id: '4',
            type: 'payment',
            title: 'Payment Received',
            message: 'Payment of $2,450.00 received from Client ABC Corp',
            timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
            read: true,
        },
        {
            id: '5',
            type: 'general',
            title: 'System Update',
            message: 'RouteMind AI has been updated with new optimization features',
            timestamp: new Date(Date.now() - 24 * 60 * 60000).toISOString(),
            read: true,
        },
    ]);

    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    const getIcon = (type: string) => {
        switch (type) {
            case 'shipment':
                return <Package size={20} className="text-blue-500" />;
            case 'vehicle':
                return <Truck size={20} className="text-purple-500" />;
            case 'incident':
                return <AlertTriangle size={20} className="text-orange-500" />;
            case 'payment':
                return <DollarSign size={20} className="text-green-500" />;
            default:
                return <Bell size={20} className="text-slate-500" />;
        }
    };

    const getTimeAgo = (timestamp: string) => {
        const now = Date.now();
        const time = new Date(timestamp).getTime();
        const diff = now - time;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'unread') return !n.read;
        if (filter === 'read') return n.read;
        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="p-4 max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="p-2 bg-lime-100 dark:bg-lime-900/30 rounded-lg">
                            <Bell className="text-lime-600 dark:text-lime-400" size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Notifications
                            </h1>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Stay updated with your logistics operations
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats and Actions */}
                <div className="flex flex-wrap gap-3 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-lime-100 dark:bg-lime-900/30 rounded-lg">
                            <span className="text-sm font-semibold text-lime-700 dark:text-lime-400">
                                {unreadCount} Unread
                            </span>
                        </div>
                        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {notifications.length} Total
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={markAllAsRead}
                            disabled={unreadCount === 0}
                            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <CheckCheck size={16} />
                            Mark All Read
                        </button>
                        <button
                            onClick={clearAll}
                            disabled={notifications.length === 0}
                            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Clear All
                        </button>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 mt-3">
                    <Filter size={16} className="text-slate-400" />
                    <div className="flex gap-2">
                        {['all', 'unread', 'read'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as any)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${filter === f
                                    ? 'bg-lime-400 text-slate-900'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                            >
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-12 text-center">
                        <Bell className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            No notifications
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {filter === 'all'
                                ? "You're all caught up!"
                                : `No ${filter} notifications`}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`bg-white dark:bg-slate-900 rounded-xl shadow-sm border ${notification.read
                                ? 'border-slate-200 dark:border-slate-800'
                                : 'border-lime-400/50 dark:border-lime-500/50 bg-lime-50/50 dark:bg-lime-900/5'
                                } p-4 hover:shadow-md transition-all group`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
                                    {getIcon(notification.type)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                                            {notification.title}
                                        </h3>
                                        {!notification.read && (
                                            <span className="h-2 w-2 bg-lime-500 rounded-full flex-shrink-0 mt-1.5"></span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                        {notification.message}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500">
                                        <Calendar size={14} />
                                        {getTimeAgo(notification.timestamp)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!notification.read && (
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="p-2 text-slate-400 hover:text-lime-600 dark:hover:text-lime-400 hover:bg-lime-50 dark:hover:bg-lime-900/20 rounded-lg transition-colors"
                                            title="Mark as read"
                                        >
                                            <Check size={18} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
