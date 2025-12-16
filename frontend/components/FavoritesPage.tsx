import React from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../contexts/FavoritesContext';
import FavoritesList from './shared/FavoritesList';
import { useAuth } from '../contexts/AuthContext';
import { Package, Activity, DollarSign, User, Zap } from 'lucide-react';

const FavoritesPage: React.FC = () => {
  const { favorites, removeFavorite } = useFavorites();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Favorites</h2>
        <p className="text-slate-500 dark:text-slate-400">Your saved shortcuts and frequently-used items</p>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="text-lime-500" size={20} />
            Quick Actions
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Fast access to common tasks</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="➕ Create Expédition"
            href="/shipments"
            icon={<Package size={20} />}
          />
          <QuickActionCard
            title="➕ Create Tournée"
            href="/routes"
            icon={<Activity size={20} />}
          />
          <QuickActionCard
            title="📄 Create Facture"
            href="/billing"
            icon={<DollarSign size={20} />}
          />
          <QuickActionCard
            title="👀 View All Clients"
            href="/clients"
            icon={<User size={20} />}
          />
        </div>
      </div>

      {/* Saved Favorites */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Saved Items</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Quick access to things you marked as favorite.</p>
          </div>
        </div>

        <FavoritesList items={favorites} onRemove={removeFavorite} variant="grid" />
      </div>
    </div>
  );
};

interface QuickActionCardProps {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ title, href, icon }) => {
  return (
    <Link
      to={href}
      className="block p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:shadow-md transition-all hover:-translate-y-1 hover:border-lime-400/50 dark:hover:border-lime-500/50 group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-20 h-20 bg-lime-400/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-lime-400/10 transition-colors"></div>
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 group-hover:border-lime-400/50 transition-colors">
            <div className="text-lime-600 dark:text-lime-400">
              {icon}
            </div>
          </div>
          <div className="text-lime-600 dark:text-lime-400 opacity-0 group-hover:opacity-100 transition-opacity">
            →
          </div>
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Quick action</div>
        </div>
      </div>
    </Link>
  );
};

export default FavoritesPage;

