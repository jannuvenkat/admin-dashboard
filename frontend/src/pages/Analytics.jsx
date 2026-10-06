import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  Percent,
  Calendar,
  AlertTriangle,
  Package,
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

import analyticsService from '../services/analyticsService';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import ErrorMessage from '../components/ErrorMessage';

const STATUS_COLORS = {
  completed: '#10B981',
  processing: '#3B82F6',
  pending: '#F59E0B',
  cancelled: '#EF4444'
};

const CATEGORY_COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

export const Analytics = () => {
  // Preset date filters
  const [activePreset, setActivePreset] = useState('30days'); // today, 7days, 30days, thisMonth, thisYear, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data states
  const [revenueStats, setRevenueStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [orderStats, setOrderStats] = useState(null);
  const [productStats, setProductStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Compute dates when preset changes
  const applyPreset = (preset) => {
    setActivePreset(preset);
    const now = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    let start = '';
    let end = formatDate(now);

    if (preset === 'today') {
      start = formatDate(now);
    } else if (preset === '7days') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      start = formatDate(d);
    } else if (preset === '30days') {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      start = formatDate(d);
    } else if (preset === 'thisMonth') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      start = formatDate(d);
    } else if (preset === 'thisYear') {
      const d = new Date(now.getFullYear(), 0, 1);
      start = formatDate(d);
    } else if (preset === 'custom') {
      return; // Keep user chosen dates
    }

    setStartDate(start);
    setEndDate(end);
  };

  // Initialize with 30days
  useEffect(() => {
    applyPreset('30days');
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const [rev, usr, ord, prd] = await Promise.all([
        analyticsService.getRevenueAnalytics(params),
        analyticsService.getUserAnalytics(params),
        analyticsService.getOrderAnalytics(params),
        analyticsService.getProductAnalytics()
      ]);

      setRevenueStats(rev);
      setUserStats(usr);
      setOrderStats(ord);
      setProductStats(prd);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (activePreset !== 'custom' || (startDate && endDate)) {
      fetchAnalytics();
    }
  }, [fetchAnalytics, activePreset, startDate, endDate]);

  const formatCurrency = (val) => `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const presets = [
    { id: 'today', label: 'Today' },
    { id: '7days', label: 'Last 7 Days' },
    { id: '30days', label: 'Last 30 Days' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'thisYear', label: 'This Year' },
    { id: 'custom', label: 'Custom Range' },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header & Date Range Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics & Intelligence</h1>
          <p className="text-sm text-slate-500 mt-1">
            Dynamic business KPIs computed directly from database records.
          </p>
        </div>

        {/* Date Filter Controls */}
        <div className="bg-white p-2 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-2">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activePreset === p.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {p.label}
            </button>
          ))}

          {activePreset === 'custom' && (
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700"
              />
            </div>
          )}
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchAnalytics} />}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Period Revenue"
          value={revenueStats?.totalRevenue || 0}
          isCurrency={true}
          change={revenueStats?.revenueGrowth}
          comparisonText="Growth rate"
          icon={DollarSign}
          colorScheme="emerald"
        />
        <StatCard
          title="Average Order Value"
          value={orderStats?.averageOrderValue || 0}
          isCurrency={true}
          comparisonText="AOV across all orders"
          icon={TrendingUp}
          colorScheme="indigo"
        />
        <StatCard
          title="Order Completion Rate"
          value={`${orderStats?.completionRate || 0}%`}
          comparisonText="Completed vs total"
          icon={Percent}
          colorScheme="blue"
        />
        <StatCard
          title="New Users Joined"
          value={userStats?.newUsers || 0}
          change={userStats?.userGrowth}
          comparisonText="Growth vs prior period"
          icon={Users}
          colorScheme="violet"
        />
      </div>

      {/* 1. Revenue Analytics Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Revenue Analytics</h2>
          <span className="text-xs font-medium text-slate-500">
            Total sales: {formatCurrency(revenueStats?.totalRevenue)}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard
            title="Revenue Timeline"
            subtitle="Gross income aggregated daily"
            loading={loading}
            className="lg:col-span-2"
          >
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueStats?.daily || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDailyRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDailyRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Weekly Distribution"
            subtitle="Sales volume grouped by calendar week"
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueStats?.weekly?.slice(-8) || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="week" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* 2. Order & User Growth Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Acquisition */}
        <ChartCard
          title="User Registrations"
          subtitle="New customer accounts created over time"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={userStats?.daily || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [value, 'New Users']}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3, fill: '#6366f1' }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Order Status Breakdown */}
        <ChartCard
          title="Order Fulfillment Ratios"
          subtitle="Proportion of completed, processing, pending & cancelled orders"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={orderStats?.statusBreakdown || []}
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
              >
                {(orderStats?.statusBreakdown || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name?.toLowerCase()] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} orders`, name]}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* 3. Product & Inventory Intelligence */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Product & Inventory Performance</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <ChartCard
            title="Top 10 Best Sellers"
            subtitle="Products ranked by revenue contribution"
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                layout="vertical"
                data={productStats?.topSelling || []}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={110}
                  tickFormatter={(val) => (val.length > 15 ? `${val.slice(0, 15)}...` : val)}
                />
                <Tooltip
                  formatter={(value, name, item) => [`$${value} (${item.payload.totalSold} sold)`, item.payload.name]}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="totalRevenue" fill="#3b82f6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Category Revenue Breakdown */}
          <ChartCard
            title="Revenue by Category"
            subtitle="Sales distribution across catalog departments"
            loading={loading}
          >
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={productStats?.categoryRevenue || []}
                margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="categoryName"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value), 'Revenue']}
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="totalRevenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Low Stock Watchlist */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Low Stock Inventory Alert</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Items requiring immediate replenishment (10 units or fewer remaining)
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              {productStats?.lowStockCount || 0} Alert Items
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Unit Price</th>
                  <th className="px-5 py-3">Current Stock</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {productStats?.lowStock?.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-semibold text-slate-800">{item.name}</td>
                    <td className="px-5 py-3 text-slate-500">{item.category_name}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      ${parseFloat(item.price).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full ${
                          item.stock === 0
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.stock} left
                      </span>
                    </td>
                    <td className="px-5 py-3 capitalize text-slate-500">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
