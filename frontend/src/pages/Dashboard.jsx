import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  Clock,
  UserPlus,
  AlertCircle,
  ArrowRight,
  ExternalLink
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

import dashboardService from '../services/dashboardService';
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

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, revRes, userRes, orderRes, prodRes] = await Promise.all([
        dashboardService.getStats(),
        analyticsService.getRevenueAnalytics(),
        analyticsService.getUserAnalytics(),
        analyticsService.getOrderAnalytics(),
        analyticsService.getProductAnalytics()
      ]);

      setStats(statsRes);
      setRevenueData(revRes.monthly || []);
      setUserData(userRes.monthly || []);
      setOrdersData(orderRes.monthly || []);
      setStatusData(orderRes.statusBreakdown || []);
      setTopProducts(prodRes.topSelling?.slice(0, 5) || []);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError(err.message || 'Failed to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatCurrency = (val) => `$${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const getStatusBadge = (status) => {
    const styles = {
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
      processing: 'bg-blue-50 text-blue-700 border-blue-200/60',
      pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
      cancelled: 'bg-rose-50 text-rose-700 border-rose-200/60'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time business performance, revenue trends, and operation health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/analytics"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
          >
            Detailed Analytics
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          change={stats?.changes?.users}
          comparisonText="vs last month"
          colorScheme="indigo"
        />
        <StatCard
          title="Total Revenue"
          value={stats?.totalRevenue || 0}
          icon={DollarSign}
          isCurrency={true}
          change={stats?.changes?.revenue}
          comparisonText="vs last month"
          colorScheme="emerald"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders || 0}
          icon={ShoppingCart}
          change={stats?.changes?.orders}
          comparisonText="vs last month"
          colorScheme="blue"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts || 0}
          icon={Package}
          comparisonText={`${stats?.lowStockProducts || 0} items low in stock`}
          colorScheme="violet"
        />
        <StatCard
          title="Today's Revenue"
          value={stats?.todayRevenue || 0}
          icon={TrendingUp}
          isCurrency={true}
          comparisonText="Generated today"
          colorScheme="emerald"
        />
        <StatCard
          title="Today's Orders"
          value={stats?.todayOrders || 0}
          icon={ShoppingCart}
          comparisonText="Orders placed today"
          colorScheme="blue"
        />
        <StatCard
          title="New Users"
          value={stats?.newUsers || 0}
          icon={UserPlus}
          comparisonText="Past 30 days"
          colorScheme="indigo"
        />
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders || 0}
          icon={Clock}
          change={stats?.changes?.pending}
          comparisonText="Requires fulfillment"
          colorScheme="amber"
        />
      </div>

      {/* Primary Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Line/Area Chart */}
        <ChartCard
          title="Monthly Revenue Trend"
          subtitle="Gross sales generated over recent months"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip
                formatter={(value) => [formatCurrency(value), 'Revenue']}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* User Growth Line Chart */}
        <ChartCard
          title="User Registration Growth"
          subtitle="New customer acquisitions per month"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [value, 'New Users']}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Secondary Analytics Row: Orders Volume, Order Status, Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Bar Chart */}
        <ChartCard
          title="Orders by Month"
          subtitle="Monthly transaction volume"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ordersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="monthName" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                formatter={(value) => [value, 'Orders']}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Order Status Donut Chart */}
        <ChartCard
          title="Order Status Distribution"
          subtitle="Breakdown of order statuses"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name?.toLowerCase()] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [`${value} orders`, name]}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Selling Products Bar Chart */}
        <ChartCard
          title="Top 5 Products"
          subtitle="By total units sold"
          loading={loading}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              layout="vertical"
              data={topProducts}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={95}
                tickFormatter={(val) => (val.length > 14 ? `${val.slice(0, 14)}...` : val)}
              />
              <Tooltip
                formatter={(value, name, item) => [`${value} units ($${item.payload.totalRevenue})`, item.payload.name]}
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="totalSold" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent Orders Overview Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Transactions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest orders placed on the platform</p>
          </div>
          <Link
            to="/orders"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
          >
            <span>View All Orders</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Amount</th>
                <th className="px-5 py-3.5">Payment</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recentOrders?.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-slate-900">#{order.id}</td>
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-semibold text-slate-800">{order.customer_name}</p>
                      <p className="text-xs text-slate-400">{order.customer_email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {order.payment_method || 'Online'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">{getStatusBadge(order.status)}</td>
                  <td className="px-5 py-3.5 text-xs text-slate-500">
                    {new Date(order.created_at).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
