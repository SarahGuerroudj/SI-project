import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { Activity, DollarSign, Package, TrendingUp, AlertTriangle, Sparkles, ArrowRight, User, BarChart3, Calculator, Target, TrendingDown } from 'lucide-react';
import { getLogisticsForecast } from '../services/geminiService';
import { useTheme } from '../contexts/ThemeContext';
import { useData } from '../contexts/DataContext';
import { Shipment, Incident, PaymentRecord, Route, Driver, Client, Invoice } from '../types';

const Dashboard: React.FC = () => {
  const { getItems, isLoading } = useData();
  const { theme } = useTheme();

  const shipments = getItems<Shipment>('shipments');
  const incidents = getItems<Incident>('incidents');
  const payments = getItems<PaymentRecord>('payments');
  const drivers = getItems<Driver>('drivers');
  const routes = getItems<Route>('routes');
  const invoices = getItems<Invoice>('invoices');
  const clients = getItems<Client>('clients');

  const [forecast, setForecast] = useState<string | null>(null);
  const [loadingForecast, setLoadingForecast] = useState(false);

  // Derived stats
  const totalRevenue = useMemo(() => shipments.reduce((sum, s) => sum + (s.price || 0), 0), [shipments]);
  const activeIncidents = useMemo(() => incidents.filter(i => !i.resolved).length, [incidents]);
  const deliveryRate = useMemo(() => {
    return shipments.length > 0
      ? (shipments.filter(s => s.status === 'Delivered').length / shipments.length) * 100
      : 0;
  }, [shipments]);

  // Calculate fleet utilization (drivers on route / total drivers)
  const fleetUtilization = useMemo(() => {
    // A driver is utilizing if they are assigned to an active route
    // Or we can rely on driver status if we trusting it updates
    const busyDrivers = drivers.filter(d => d.status === 'On Route').length;
    return drivers.length > 0 ? (busyDrivers / drivers.length) * 100 : 0;
  }, [drivers]);

  // Shipments / Revenue per month (group by YYYY-MM)
  // We need dateCreated on shipment. If missing, default to now or ignore.
  const groupedByMonth = useMemo(() => {
    const map: Record<string, { shipments: number; revenue: number }> = {};
    shipments.forEach((s) => {
      // Assuming dateCreated or date fields exists. If not, use '2023-01' fallback or similar
      const dateStr = s.dateCreated || (s as any).date || new Date().toISOString().split('T')[0];
      const key = dateStr.slice(0, 7); // YYYY-MM
      if (!map[key]) map[key] = { shipments: 0, revenue: 0 };
      map[key].shipments += 1;
      map[key].revenue += (s.price || 0);
    });
    const months = Object.keys(map).sort();
    return months.map(m => ({ month: m, shipments: map[m].shipments, revenue: map[m].revenue }));
  }, [shipments]);

  const dataShipmentsLine = groupedByMonth.map(g => ({ name: g.month, val: g.shipments }));

  // Top destinations
  const destinationCounts = useMemo(() => {
    const m: Record<string, number> = {};
    shipments.forEach(s => {
      if (s.destination) m[s.destination] = (m[s.destination] || 0) + 1;
    });
    return Object.entries(m)
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [shipments]);

  // Top chauffeurs: compute from Routes -> count shipments per driver
  const driversRank = useMemo(() => {
    const map: Record<string, { id: string; name: string; score: number }> = {};
    drivers.forEach(d => { map[d.id] = { id: d.id, name: d.name, score: 0 }; });

    routes.forEach(r => {
      const count = r.shipmentIds ? r.shipmentIds.length : 0;
      // Driver might be an ID string or object
      const dId = typeof r.driverId === 'object' ? (r.driverId as any).id : r.driverId;

      if (dId && map[dId]) {
        map[dId].score += count;
      }
    });
    return Object.values(map).sort((a, b) => b.score - a.score).slice(0, 8);
  }, [drivers, routes]);

  // Latest 5 shipments
  const latestShipments = useMemo(() => {
    return [...shipments]
      .sort((a, b) => ((b.dateCreated || '') > (a.dateCreated || '') ? 1 : -1))
      .slice(0, 5)
      .map(s => {
        const clientName = clients.find(c => c.id.toString() === s.clientId.toString())?.name || s.clientId;
        return { ...s, clientName };
      });
  }, [shipments, clients]);

  const dataStatus = [
    { name: 'Delivered', value: shipments.filter(s => s.status === 'Delivered').length, color: '#a3e635' }, // lime-400
    { name: 'In Transit', value: shipments.filter(s => s.status === 'In Transit').length, color: '#3b82f6' }, // blue-500
    { name: 'Pending', value: shipments.filter(s => s.status === 'Pending').length, color: '#f59e0b' }, // amber-500
  ];

  const handleGenerateForecast = async () => {
    setLoadingForecast(true);
    const context = {
      totalShipments: shipments.length,
      revenue: totalRevenue,
      activeIncidents: activeIncidents,
      recentDestinations: shipments.map(s => s.destination).slice(0, 5),
    };
    try {
      const result = await getLogisticsForecast(context);
      setForecast(result);
    } catch (e) {
      console.error("AI Error", e);
      setForecast("AI currently unavailable.");
    }
    setLoadingForecast(false);
  };

  const chartTickColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const chartGridColor = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tooltipBg = theme === 'dark' ? '#0f172a' : '#ffffff';
  const tooltipBorder = theme === 'dark' ? '#334155' : '#e2e8f0';
  const tooltipText = theme === 'dark' ? '#fff' : '#0f172a';

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400">Welcome to the future of logistics management.</p>
        </div>
        <button
          onClick={handleGenerateForecast}
          disabled={loadingForecast}
          className="group flex items-center justify-center px-6 py-3 bg-lime-400 text-slate-900 rounded-full hover:bg-lime-300 transition-all hover:shadow-[0_0_20px_rgba(163,230,53,0.4)] disabled:opacity-70 font-semibold"
        >
          <Sparkles size={18} className="mr-2 group-hover:rotate-12 transition-transform" />
          {loadingForecast ? 'Processing Data...' : 'AI Analyses'}
        </button>
      </div>

      {/* AI Forecast Section */}
      {forecast && (
        <div className="bg-white dark:bg-slate-900 border border-lime-400/30 p-8 rounded-2xl shadow-lg animate-fade-in relative overflow-hidden transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <h3 className="text-xl font-bold text-lime-600 dark:text-lime-400 mb-4 flex items-center">
            <Sparkles size={20} className="mr-2" /> AI Mission Insight
          </h3>
          <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-line leading-relaxed">
            {forecast}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`€${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={<DollarSign className="text-lime-600 dark:text-lime-400" size={24} />}
          trend="Based on active shipments"
          trendUp={true}
        />
        <StatCard
          title="Total Shipments"
          value={shipments.length.toString()}
          icon={<Package className="text-blue-500 dark:text-blue-400" size={24} />}
          trend="All time"
          trendUp={true}
        />
        <StatCard
          title="Delivery Success"
          value={`${deliveryRate.toFixed(1)}%`}
          icon={<Activity className="text-purple-500 dark:text-purple-400" size={24} />}
          trend="Completion rate"
          trendUp={deliveryRate > 80}
        />
        <StatCard
          title="Active Incidents"
          value={activeIncidents.toString()}
          icon={<AlertTriangle className="text-red-500 dark:text-red-400" size={24} />}
          trend={activeIncidents > 0 ? "Requires attention" : "All clear"}
          trendUp={activeIncidents === 0}
          alert={activeIncidents > 0}
        />
      </div>

      {/* Charts Row: Shipments and Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden transition-colors">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Expéditions per Month</h3>
            {/* <button className="text-xs text-lime-600 dark:text-lime-400 hover:text-lime-500 flex items-center">View Report <ArrowRight size={12} className="ml-1" /></button> */}
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataShipmentsLine}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: chartTickColor }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: chartTickColor }} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderRadius: '12px', border: `1px solid ${tooltipBorder}`, color: tooltipText }} />
                <Line type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative transition-colors">
          <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">Shipment Status</h3>
          <div className="h-64 w-full flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {dataStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, color: tooltipText }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {dataStatus.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Charts Row: Top Destinations & Chauffeurs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Top Destinations</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destinationCounts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                <XAxis type="number" tick={{ fill: chartTickColor }} />
                <YAxis dataKey="destination" type="category" width={100} tick={{ fill: chartTickColor }} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderRadius: '8px', border: `1px solid ${tooltipBorder}`, color: tooltipText }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Top Chauffeurs</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
            {driversRank.length === 0 ? <p className="text-slate-500 text-sm">No driver data</p> :
              <ol className="space-y-2">
                {driversRank.map((d, idx) => (
                  <li key={d.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-950 rounded-lg">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-lime-600" />
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{d.name}</div>
                        <div className="text-xs text-slate-500">#{idx + 1}</div>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">{d.score} runs</div>
                  </li>
                ))}
              </ol>
            }
          </div>
        </div>
      </div>

      {/* Tables & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">📝 Latest Expéditions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-xs text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Client</th>
                  <th className="px-4 py-2">Destination</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {latestShipments.length === 0 ? (
                  <tr><td colSpan={5} className="p-4 text-center text-slate-500">No shipments found</td></tr>
                ) : (
                  latestShipments.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-sm text-lime-600">{s.id.slice(0, 8)}...</td>
                      <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{s.clientName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{s.destination}</td>
                      <td className="px-4 py-3 text-sm dark:text-slate-300">€{s.price?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${s.status === 'Delivered' ? 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400' :
                          s.status === 'In Transit' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          }`}>{s.status}</span>
                      </td>
                    </tr>
                  )))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">⚠️ Recent Incidents</h3>
          <div className="space-y-3">
            {incidents.length === 0 ? <p className="text-slate-500 text-sm">No incidents reported</p> :
              incidents.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(inc => (
                <div key={inc.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">{inc.type} • {inc.date}</div>
                      <div className="text-xs text-slate-500">Ref: {inc.related_entity_id || 'N/A'}</div>
                    </div>
                    <div className={`text-xs font-semibold ${inc.resolved ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{inc.resolved ? 'Resolved' : 'Open'}</div>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 truncate">{inc.description}</p>
                </div>
              ))}
          </div>
        </div>
      </div>

    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
  trendUp: boolean;
  alert?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp, alert }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-lime-400/50 transition-all hover:-translate-y-1 duration-300 group shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-slate-200 dark:group-hover:bg-slate-800/80 transition-colors">{icon}</div>
      {alert && <span className="flex h-3 w-3 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </span>}
    </div>
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">{title}</p>
      <h4 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</h4>
      <div className={`flex items-center mt-3 text-sm font-medium ${trendUp ? 'text-lime-600 dark:text-lime-400' : 'text-red-500 dark:text-red-400'}`}>
        <TrendingUp size={16} className={`mr-1 ${!trendUp && 'rotate-180'}`} />
        <span>{trend}</span>
      </div>
    </div>
  </div>
);

export default Dashboard;