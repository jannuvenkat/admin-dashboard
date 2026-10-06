import React, { useState } from 'react';
import {
  Shield,
  Database,
  Server,
  Lock,
  User,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Settings = () => {
  const { user } = useAuth();
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review application parameters, connected database environment, and administrator preferences.
        </p>
      </div>

      {savedNotification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Preferences updated successfully.</span>
        </div>
      )}

      {/* 1. Admin Profile Overview */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Administrator Profile</h3>
            <p className="text-xs text-slate-500">Your authenticated credentials and privileges</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Display Name</span>
            <span className="text-sm font-semibold text-slate-800">{user?.name}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Email Address</span>
            <span className="text-sm font-semibold text-slate-800">{user?.email}</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">System Role</span>
            <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide">
              {user?.role}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Member Since</span>
            <span className="text-sm font-semibold text-slate-800">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Database & Infrastructure Status */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Database Engine</h3>
            <p className="text-xs text-slate-500">MySQL Connection pool & parameters</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Database Name</span>
            <span className="text-sm font-mono font-semibold text-slate-800">admin_dashboard</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Engine & Host</span>
            <span className="text-sm font-semibold text-slate-800">MySQL 8.0 @ localhost:3306</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-400 block mb-1">Driver</span>
            <span className="text-sm font-semibold text-slate-800">mysql2 / promise pool</span>
          </div>
        </div>
      </div>

      {/* 3. Security Configuration */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Security & Authentication</h3>
            <p className="text-xs text-slate-500">JWT and password encryption configurations</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">Password Encryption</p>
              <p className="text-slate-400">bcryptjs salted hashing (cost factor 10)</p>
            </div>
            <span className="font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">Role-Based Authorization</p>
              <p className="text-slate-400">Strict check: role = 'admin' required on API routes</p>
            </div>
            <span className="font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">
              Enforced
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <p className="font-semibold text-slate-800">JWT Token Expiry</p>
              <p className="text-slate-400">Default session validity duration</p>
            </div>
            <span className="font-mono font-semibold text-slate-700 bg-slate-200/60 px-2.5 py-1 rounded-full">
              7 Days
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
