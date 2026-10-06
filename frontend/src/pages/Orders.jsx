import React, { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart,
  Eye,
  CheckCircle,
  Clock,
  RotateCcw,
  XCircle,
  CreditCard,
  Calendar,
  User,
  Package,
  FileSpreadsheet
} from 'lucide-react';
import orderService from '../services/orderService';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import ErrorMessage from '../components/ErrorMessage';
import Spinner from '../components/Loading';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Modals
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await orderService.getOrders({
        page: pagination.page,
        limit: pagination.limit,
        search,
        status: statusFilter,
        startDate,
        endDate,
        sortBy,
        sortOrder
      });
      setOrders(res.orders);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, startDate, endDate, sortBy, sortOrder]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(columnKey);
      setSortOrder('ASC');
    }
  };

  const openViewModal = async (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
    setOrderDetails(null);
    try {
      const details = await orderService.getOrderById(order.id);
      setOrderDetails(details);
    } catch (err) {
      console.error('Failed to load order items:', err);
    }
  };

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    setSubmittingStatus(true);
    try {
      await orderService.updateOrderStatus(selectedOrder.id, newStatus);
      setIsStatusModalOpen(false);
      fetchOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleExportExcel = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportError(null);
    try {
      const { blob, filename } = await orderService.exportOrders({
        search,
        status: statusFilter,
        startDate,
        endDate,
        sortBy,
        sortOrder
      });

      // Trigger temporary download URL and click
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setExportError(err.message || 'Unable to export orders. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      completed: {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
        icon: CheckCircle
      },
      processing: {
        bg: 'bg-blue-50 text-blue-700 border-blue-200/60',
        icon: RotateCcw
      },
      pending: {
        bg: 'bg-amber-50 text-amber-700 border-amber-200/60',
        icon: Clock
      },
      cancelled: {
        bg: 'bg-rose-50 text-rose-700 border-rose-200/60',
        icon: XCircle
      }
    };

    const item = config[status] || config.pending;
    const Icon = item.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${item.bg}`}
      >
        <Icon className="w-3.5 h-3.5" />
        <span className="capitalize">{status}</span>
      </span>
    );
  };

  const columns = [
    {
      key: 'id',
      title: 'Order ID',
      sortable: true,
      render: (row) => <span className="font-bold text-slate-900">#{row.id}</span>
    },
    {
      key: 'customer',
      title: 'Customer',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-slate-800">{row.customer_name}</p>
          <p className="text-xs text-slate-400">{row.customer_email}</p>
        </div>
      )
    },
    {
      key: 'total_amount',
      title: 'Amount',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-slate-900">
          ${parseFloat(row.total_amount).toFixed(2)}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Order Status',
      sortable: true,
      render: (row) => getStatusBadge(row.status)
    },
    {
      key: 'payment',
      title: 'Payment',
      render: (row) => (
        <div className="text-xs">
          <p className="font-medium text-slate-700">{row.payment_method || 'Card'}</p>
          <span
            className={`inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
              row.payment_status === 'completed'
                ? 'text-emerald-700 bg-emerald-50'
                : row.payment_status === 'pending'
                ? 'text-amber-700 bg-amber-50'
                : 'text-rose-700 bg-rose-50'
            }`}
          >
            {row.payment_status || 'Pending'}
          </span>
        </div>
      )
    },
    {
      key: 'created_at',
      title: 'Date',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500">
          {new Date(row.created_at).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => openViewModal(row)}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="View Order Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => openStatusModal(row)}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
          >
            Update Status
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track order fulfillments, filter by date ranges, and inspect line items.
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchOrders} />}
      {exportError && (
        <ErrorMessage
          message={exportError}
          onDismiss={() => setExportError(null)}
          className="mb-2"
        />
      )}

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={orders}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        searchValue={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        searchPlaceholder="Search order ID, name, or email..."
        filterSlot={
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>

            {/* Date Filters */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
              <span className="text-[11px] text-slate-400 font-medium">From</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="text-xs bg-transparent text-slate-700 focus:outline-none"
              />
              <span className="text-[11px] text-slate-400 font-medium">To</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
                className="text-xs bg-transparent text-slate-700 focus:outline-none"
              />
            </div>

            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-indigo-600 hover:underline px-1"
              >
                Clear Dates
              </button>
            )}

            {/* Export Excel Button */}
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export filtered orders to Excel (.xlsx)"
            >
              {isExporting ? (
                <>
                  <Spinner size="sm" className="border-emerald-600" />
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Excel</span>
                </>
              )}
            </button>
          </div>
        }
      />

      {/* View Order Details Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`Order Details #${selectedOrder?.id}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-6">
          {/* Order Summary Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Customer</span>
              <p className="font-bold text-slate-800">{selectedOrder?.customer_name}</p>
              <p className="text-slate-500">{selectedOrder?.customer_email}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Status</span>
              <div>{selectedOrder && getStatusBadge(selectedOrder.status)}</div>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Order Placed</span>
              <p className="font-semibold text-slate-800">
                {selectedOrder && new Date(selectedOrder.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Purchased Items
            </h4>
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 font-semibold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-2.5">Item</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5 text-center">Qty</th>
                    <th className="px-4 py-2.5 text-right">Price</th>
                    <th className="px-4 py-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!orderDetails ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center">
                        <Spinner size="sm" />
                      </td>
                    </tr>
                  ) : orderDetails.items?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-4 text-center text-slate-400">
                        No line items recorded
                      </td>
                    </tr>
                  ) : (
                    orderDetails.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {item.product_name}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {item.category_name || 'General'}
                        </td>
                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">
                          ${parseFloat(item.price).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900">
                          ${parseFloat(item.subtotal).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment & Grand Total */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-xs">
              <span className="text-slate-400 block mb-0.5">Payment Details</span>
              <p className="font-semibold text-slate-700">
                Method: {selectedOrder?.payment_method || 'Online'}
              </p>
              <p className="text-slate-500">
                Status: <span className="capitalize font-medium">{selectedOrder?.payment_status || 'Pending'}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Grand Total</span>
              <span className="text-2xl font-black text-slate-900">
                ${parseFloat(selectedOrder?.total_amount || 0).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsViewModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Update Order Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Update Status: Order #${selectedOrder?.id}`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select New Order Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingStatus}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow transition-colors flex items-center gap-1.5"
            >
              {submittingStatus && <Spinner size="sm" className="border-white" />}
              <span>Update Status</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Orders;
