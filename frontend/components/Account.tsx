import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Phone, Lock, Camera, LogOut, Edit2, Save, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auditLog } from '../services/auditLog';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

const Account: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<string | undefined>(undefined);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (user) {
      const parts = user.username.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setRole(user.role || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setAvatar(user.avatar);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Not Logged In</h2>
        <p className="text-slate-500 mb-4">Please sign in to view your profile.</p>
      </div>
    );
  }

  const validateEmail = (e: string) => /\S+@\S+\.\S+/.test(e);

  const onSave = () => {
    if (!firstName.trim()) {
      addToast('error', 'First name is required');
      return;
    }
    if (!validateEmail(email)) {
      addToast('error', 'Please provide a valid email');
      return;
    }

    const newName = `${firstName.trim()}${lastName ? ' ' + lastName.trim() : ''}`;
    const updates: any = {
      name: newName,
      email: email.trim(),
      role: role.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
    };
    if (avatar) updates.avatar = avatar;

    updateProfile(updates);

    // add to recent activity
    try {
      const entries = JSON.parse(localStorage.getItem('evworld_activity') || '[]');
      entries.unshift({ id: Date.now(), text: 'Profile updated', time: new Date().toISOString() });
      localStorage.setItem('evworld_activity', JSON.stringify(entries.slice(0, 20)));
    } catch (e) { }

    addToast('success', 'Profile updated');
    setEditing(false);
  };

  const onCancel = () => {
    if (user) {
      const parts = user.username.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setRole(user.role || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setAvatar(user.avatar);
    }
    setEditing(false);
  };

  const triggerFile = () => fileRef.current?.click();

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(f);
  };

  const recentActivity = (() => {
    try {
      return JSON.parse(localStorage.getItem('evworld_activity') || '[]');
    } catch (e) { return []; }
  })();

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">My Account</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your personal information and security</p>
        </div>
        <div className="flex items-center gap-3">
          {!editing ? (
            <button onClick={() => setEditing(true)} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 flex items-center gap-2">
              <Edit2 size={16} /> Edit
            </button>
          ) : (
            <>
              <button onClick={onSave} className="px-3 py-2 bg-lime-400 text-slate-900 rounded-md flex items-center gap-2">
                <Save size={16} /> Save
              </button>
              <button onClick={onCancel} className="px-3 py-2 bg-transparent border border-slate-200 dark:border-slate-700 rounded-md flex items-center gap-2">
                <X size={16} /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-56 flex-shrink-0 flex flex-col items-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center text-3xl font-bold text-lime-600 dark:text-lime-400 overflow-hidden">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{user.username.substring(0, 2).toUpperCase()}</span>
                )}
              </div>
              <button onClick={triggerFile} className="absolute -bottom-1 -right-1 bg-lime-400 text-slate-900 p-2 rounded-full shadow-md">
                <Camera size={16} />
              </button>
              <input ref={fileRef} onChange={onFile} type="file" accept="image/*" className="hidden" />
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 text-center">Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1">First Name</label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={!editing} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-lime-400 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Last Name</label>
                <input value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={!editing} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-lime-400 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Job Title</label>
                <input value={role} onChange={(e) => setRole(e.target.value)} disabled={!editing} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-lime-400 outline-none transition-colors" />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editing} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-lime-400 outline-none transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-500 mb-1">Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} disabled={!editing} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-lime-400 outline-none transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-slate-500 mb-1">Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} disabled={!editing} rows={3} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-white focus:border-lime-400 outline-none transition-colors"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
          <h4 className="font-bold mb-3 text-slate-900 dark:text-white flex items-center gap-2"><Lock size={16} /> Security</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Change your password or manage recovery options.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Current password" type="password" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5" />
            <input placeholder="New password" type="password" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg p-2.5" />
            <div className="md:col-span-2 pt-2">
              <button onClick={() => {
                auditLog.log('password_change_requested', 'security', user?.id ?? null, { email: user?.email });
                addToast('info', 'Password change requested (mock).');
              }} className="px-4 py-2 bg-lime-400 text-slate-900 font-bold rounded-lg hover:bg-lime-300 transition-colors">Change Password</button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-lg">
          <h4 className="font-bold text-slate-900 dark:text-white mb-3">Recent activity</h4>
          {recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500">No recent activity</p>
          ) : (
            <ul className="space-y-3">
              {recentActivity.map((a: any) => (
                <li key={a.id} className="text-sm text-slate-700 dark:text-slate-200">
                  <div className="flex items-center justify-between">
                    <span>{a.text}</span>
                    <span className="text-xs text-slate-400">{new Date(a.time).toLocaleString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="pt-4">
            <button onClick={handleLogout} className="w-full p-3 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors font-bold flex items-center justify-center gap-2">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;