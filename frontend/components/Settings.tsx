import React, { useState } from 'react';
import { Bell, Shield, Smartphone, Globe, Moon, Sun, Save } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false
  });

  const [system, setSystem] = useState({
    autoSave: true,
    locationTracking: true
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSystem = (key: keyof typeof system) => {
    setSystem(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h2>
        <p className="text-slate-500 dark:text-slate-400">Manage your application preferences and system configurations</p>
      </div>

      {/* Notifications Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-lime-600 dark:text-lime-400">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Notifications</h3>
            <p className="text-xs text-slate-500">Control how you receive alerts</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-700 dark:text-slate-200 font-medium">Email Notifications</p>
              <p className="text-slate-500 text-sm">Receive daily summaries and invoices</p>
            </div>
            <button 
              onClick={() => toggleNotification('email')}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications.email ? 'bg-lime-400' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className={`absolute top-1 left-1 bg-white dark:bg-slate-900 w-4 h-4 rounded-full transition-transform ${notifications.email ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-700 dark:text-slate-200 font-medium">SMS Alerts</p>
              <p className="text-slate-500 text-sm">Urgent incident reports sent to mobile</p>
            </div>
            <button 
              onClick={() => toggleNotification('sms')}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications.sms ? 'bg-lime-400' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className={`absolute top-1 left-1 bg-white dark:bg-slate-900 w-4 h-4 rounded-full transition-transform ${notifications.sms ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-700 dark:text-slate-200 font-medium">Push Notifications</p>
              <p className="text-slate-500 text-sm">Real-time browser updates for shipments</p>
            </div>
            <button 
              onClick={() => toggleNotification('push')}
              className={`w-12 h-6 rounded-full transition-colors relative ${notifications.push ? 'bg-lime-400' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className={`absolute top-1 left-1 bg-white dark:bg-slate-900 w-4 h-4 rounded-full transition-transform ${notifications.push ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* System Preferences */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-blue-500 dark:text-blue-400">
            <Smartphone size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">System Preferences</h3>
            <p className="text-xs text-slate-500">Application behavior and localization</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon size={18} className="text-slate-400" /> : <Sun size={18} className="text-slate-400" />}
              <div>
                <p className="text-slate-700 dark:text-slate-200 font-medium">Dark Mode</p>
                <p className="text-slate-500 text-sm">Toggle application theme</p>
              </div>
            </div>
            <button 
              onClick={toggleTheme}
              className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-lime-400' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className={`absolute top-1 left-1 bg-white dark:bg-slate-900 w-4 h-4 rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
              <Globe size={18} className="text-slate-400" />
              <div>
                <p className="text-slate-700 dark:text-slate-200 font-medium">Language</p>
                <p className="text-slate-500 text-sm">Select interface language</p>
              </div>
            </div>
            <select className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-1.5 text-sm focus:border-lime-400 outline-none transition-colors">
              <option>English (US)</option>
              <option>French (FR)</option>
              <option>Spanish (ES)</option>
            </select>
          </div>
        </div>
      </div>

       {/* Security & Data */}
       <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-red-500 dark:text-red-400">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Privacy & Data</h3>
            <p className="text-xs text-slate-500">Manage data collection settings</p>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-700 dark:text-slate-200 font-medium">Live Location Tracking</p>
              <p className="text-slate-500 text-sm">Allow real-time fleet position updates</p>
            </div>
            <button 
              onClick={() => toggleSystem('locationTracking')}
              className={`w-12 h-6 rounded-full transition-colors relative ${system.locationTracking ? 'bg-lime-400' : 'bg-slate-200 dark:bg-slate-700'}`}
            >
              <span className={`absolute top-1 left-1 bg-white dark:bg-slate-900 w-4 h-4 rounded-full transition-transform ${system.locationTracking ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button className="flex items-center px-6 py-3 bg-lime-400 text-slate-900 rounded-full font-bold hover:bg-lime-300 transition-all shadow-[0_0_15px_rgba(163,230,53,0.3)]">
          <Save size={18} className="mr-2" /> Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;