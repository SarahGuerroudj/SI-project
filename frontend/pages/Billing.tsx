import React, { useState, useMemo } from 'react';
import { Invoice, PaymentRecord, Client } from '../types';
import { FileText, Download, Check, AlertCircle, Plus, Trash2, Eye, Search, X, Filter, DollarSign, TrendingUp, Calendar } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useToast } from '../contexts/ToastContext';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Billing: React.FC = () => {
  const { getItems, addItem, deleteItem } = useData();
  const { addToast } = useToast();

  const allInvoices = getItems<Invoice>('invoices');
  const clients = getItems<Client>('clients');
  const allPayments = getItems<PaymentRecord>('payments');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    amountHT: 0,
    tvaRate: 19,
    date: new Date().toISOString().split('T')[0],
    currency: 'EUR' as 'EUR' | 'DZD'
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Partial' | 'Unpaid'>('all');
  const [currencyFilter, setCurrencyFilter] = useState<'all' | 'EUR' | 'DZD'>('all');

  const getClientName = (id: string) => clients.find(c => c.id.toString() === id.toString())?.name || 'Unknown';
  const currencySymbol = (currency?: Invoice['currency']) => currency === 'DZD' ? 'د.ج' : '€';

  // Filter invoices... (unchanged)
  const invoices = useMemo(() => {
    let filtered = allInvoices;
    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(inv =>
        inv.id.toString().toLowerCase().includes(searchLower) ||
        getClientName(inv.clientId).toLowerCase().includes(searchLower) ||
        inv.date.toLowerCase().includes(searchLower)
      );
    }
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => inv.status === statusFilter);
    }
    // Apply currency filter
    if (currencyFilter !== 'all') {
      filtered = filtered.filter(inv => (inv.currency || 'EUR') === currencyFilter);
    }
    return filtered;
  }, [allInvoices, searchTerm, statusFilter, currencyFilter, clients]);

  // Stats... (unchanged)
  const stats = useMemo(() => {
    const totalInvoices = allInvoices.length;
    const paidInvoices = allInvoices.filter(inv => inv.status === 'Paid').length;
    const partialInvoices = allInvoices.filter(inv => inv.status === 'Partial').length;
    const unpaidInvoices = allInvoices.filter(inv => inv.status === 'Unpaid').length;
    const totalOutstanding = allInvoices.reduce((sum, inv) => sum + inv.outstandingBalance, 0);
    const totalPaid = allInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const totalAmount = allInvoices.reduce((sum, inv) => sum + inv.amountTTC, 0);

    return { total: totalInvoices, paid: paidInvoices, partial: partialInvoices, unpaid: unpaidInvoices, totalOutstanding, totalPaid, totalAmount };
  }, [allInvoices]);

  const getTotalsByCurrency = () => {
    return allInvoices.reduce((acc: Record<string, number>, inv) => {
      const c = inv.currency || 'EUR';
      acc[c] = (acc[c] || 0) + (inv.outstandingBalance || 0);
      return acc;
    }, {} as Record<string, number>);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    const newErrors: string[] = [];
    if (paymentAmount <= 0) newErrors.push('Payment amount must be greater than 0');
    if (paymentAmount > selectedInvoice.outstandingBalance) newErrors.push(`Payment exceeds outstanding balance`);
    if (newErrors.length > 0) { setErrors(newErrors); return; }

    try {
      await addItem('payments', {
        invoiceId: selectedInvoice.id,
        amount: paymentAmount,
        date: new Date().toISOString().split('T')[0],
        method: 'Bank Transfer'
      });
      addToast('success', 'Payment recorded successfully');
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentAmount(0);
      setErrors([]);
    } catch (error) {
      console.error(error);
      addToast('error', 'Failed to record payment');
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvoice.clientId || newInvoice.amountHT <= 0) {
      addToast('error', 'Please fill in all required fields');
      return;
    }

    try {
      const amountHT = newInvoice.amountHT;
      const tva = amountHT * (newInvoice.tvaRate / 100);
      const amountTTC = amountHT + tva;

      // Backend expects snake_case normally, but specific addItem impl might differ.
      // Based on DataContext, if we use 'others' fallback, it sends item as is.
      // We will send snake_case to be safe for backend.
      const payload: any = {
        client: newInvoice.clientId,
        amount_ht: amountHT,
        amount_ttc: amountTTC,
        tva: tva,
        shipments: [],
        date: newInvoice.date,
        due_date: newInvoice.date, // Default due date same as date for now
        status: 'Unpaid',
        currency: newInvoice.currency
      };

      await addItem('invoices', payload);
      addToast('success', 'Invoice created successfully');
      setShowCreateModal(false);
      setNewInvoice({ clientId: '', amountHT: 0, tvaRate: 19, date: new Date().toISOString().split('T')[0], currency: 'EUR' });
    } catch (error) {
      console.error(error);
      addToast('error', 'Failed to create invoice');
    }
  };

  const handleDeleteInvoice = async (invoiceId: string) => {
    if (window.confirm(`Delete invoice ${invoiceId}? This action cannot be undone.`)) {
      try {
        await deleteItem('invoices', invoiceId);
        addToast('success', 'Invoice deleted successfully');
      } catch (error) {
        console.error(error);
        addToast('error', 'Failed to delete invoice');
      }
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text('Invoices Report', 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100);
      const dateStr = new Date().toLocaleDateString();
      doc.text(`Generated on: ${dateStr}`, 14, 30);

      const tableColumn = ["Invoice ID", "Client", "Date", "Amount", "Balance", "Status"];
      const tableRows = invoices.map(invoice => [
        invoice.invoiceNumber || invoice.id,
        getClientName(invoice.clientId),
        new Date(invoice.date).toLocaleDateString(),
        `${currencySymbol(invoice.currency)}${invoice.amountTTC.toFixed(2)}`,
        `${currencySymbol(invoice.currency)}${invoice.outstandingBalance.toFixed(2)}`,
        invoice.status
      ]);

      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 66, 66] }
      });

      doc.save("Invoices_Report.pdf");
      addToast('success', 'Report exported successfully');

    } catch (error) {
      console.error("PDF Export failed:", error);
      addToast('error', 'PDF Export failed');
    }
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'Paid': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800"><Check size={12} className="mr-1" /> Paid</span>;
      case 'Partial': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800"><AlertCircle size={12} className="mr-1" /> Partial</span>;
      case 'Unpaid': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 border border-red-200 dark:border-red-800"><AlertCircle size={12} className="mr-1" /> Unpaid</span>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Billing & Payments</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage invoices with partial payments and balance tracking</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-lime-500 text-white rounded-lg hover:bg-lime-600 shadow-sm hover:shadow-md transition-all font-medium flex items-center gap-2"
            >
              <Plus size={18} />
              Create Invoice
            </button>
            <button onClick={handleExportPDF} className="px-6 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-2 shadow-sm hover:shadow-md transition-all font-medium">
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        {/* Statistics Dashboard */}
        {/* ... existing stats ... */}
        {/* We can just keep the existing code, but I'm only replacing the header area properly first, 
            actually wait, I should target the return statement block better to insert the modal too.
            Let's split this into two replacements if possible, or one big one.
            I'll replace the Header button part first.
        */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* ... stats ... */}
          {/* For the sake of the tool, I will try to target the existing header button and replace it with TWO buttons */}

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-lime-100 dark:bg-lime-900/30 rounded-lg">
                <FileText className="text-lime-600 dark:text-lime-400" size={24} />
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Total Invoices</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Check className="text-green-600 dark:text-green-400" size={24} />
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Paid</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.paid}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {currencySymbol('EUR')}{stats.totalPaid.toFixed(2)}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <AlertCircle className="text-amber-600 dark:text-amber-400" size={24} />
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Partial</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.partial}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Requires attention
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertCircle className="text-red-600 dark:text-red-400" size={24} />
              </div>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">Unpaid</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.unpaid}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Action needed
            </div>
          </div>
        </div>

        {/* Outstanding Balance Summary */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 rounded-xl shadow-sm p-6 border border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="text-slate-400" size={20} />
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Outstanding Balance</p>
              </div>
              <div className="space-y-1">
                {Object.entries(getTotalsByCurrency()).map(([curr, total]) => (
                  <div key={curr} className="flex items-baseline gap-2">
                    <p className={`text-3xl font-bold ${total > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {currencySymbol(curr as Invoice['currency'])}{total.toFixed(2)}
                    </p>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{curr}</span>
                  </div>
                ))}
                {Object.keys(getTotalsByCurrency()).length === 0 && (
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {currencySymbol('EUR')}0.00
                  </p>
                )}
              </div>
            </div>
            <div className="p-4 bg-white dark:bg-slate-800 rounded-lg">
              <TrendingUp className="text-slate-400 dark:text-slate-500" size={40} />
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search invoices by ID, client name, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="text-slate-400" size={18} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Unpaid">Unpaid</option>
              </select>
            </div>

            {/* Currency Filter */}
            <div className="flex items-center gap-2">
              <select
                value={currencyFilter}
                onChange={(e) => setCurrencyFilter(e.target.value as any)}
                className="px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-transparent"
              >
                <option value="all">All Currencies</option>
                <option value="EUR">EUR (€)</option>
                <option value="DZD">DZD (د.ج)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recent Invoices Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Invoices</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">Invoice ID</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">Client</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400">Date</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 text-right">Amount</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 text-right">Balance</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 dark:text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      No invoices found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-400">
                        {invoice.invoiceNumber || invoice.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {getClientName(invoice.clientId)}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {new Date(invoice.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">
                        {currencySymbol(invoice.currency)}{invoice.amountTTC.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={invoice.outstandingBalance > 0 ? "text-red-600 dark:text-red-400 font-medium" : "text-green-600 dark:text-green-400"}>
                          {currencySymbol(invoice.currency)}{invoice.outstandingBalance.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="View Invoice"
                          >
                            <Eye size={18} />
                          </button>
                          {invoice.status !== 'Paid' && (
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setPaymentAmount(invoice.outstandingBalance); // Default to full amount
                                setShowPaymentModal(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                              title="Record Payment"
                            >
                              <DollarSign size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInvoice(invoice.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Delete Invoice"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Record Payment</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Invoice</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{selectedInvoice.invoiceNumber || selectedInvoice.id}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Client</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{getClientName(selectedInvoice.clientId)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Outstanding</span>
                  <span className="text-sm font-bold text-red-600 dark:text-red-400">
                    {currencySymbol(selectedInvoice.currency)}{selectedInvoice.outstandingBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              <form onSubmit={handlePayment}>
                {/* ... fields ... */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Payment Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 dark:text-slate-400 sm:text-sm">
                          {currencySymbol(selectedInvoice.currency)}
                        </span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max={selectedInvoice.outstandingBalance}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
                        className="pl-7 block w-full rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-lime-500 focus:ring-lime-500 sm:text-sm py-2.5"
                      />
                    </div>
                  </div>

                  {errors.length > 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                      <ul className="list-disc list-inside">
                        {errors.map((err, index) => (
                          <li key={index}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-4 bg-lime-500 hover:bg-lime-600 text-white rounded-lg font-semibold shadow-sm hover:shadow-md transition-all flex justify-center items-center gap-2"
                  >
                    Confirm Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Create New Invoice</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Currency</label>
                    <select
                      value={newInvoice.currency}
                      onChange={(e) => setNewInvoice({ ...newInvoice, currency: e.target.value as any })}
                      className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-2.5"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="DZD">DZD (د.ج)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={newInvoice.date}
                      onChange={(e) => setNewInvoice({ ...newInvoice, date: e.target.value })}
                      className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-2.5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client</label>
                  <select
                    value={newInvoice.clientId}
                    onChange={(e) => setNewInvoice({ ...newInvoice, clientId: e.target.value })}
                    className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-2.5"
                    required
                  >
                    <option value="">Select Client</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Amount HT</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={newInvoice.amountHT}
                      onChange={(e) => setNewInvoice({ ...newInvoice, amountHT: parseFloat(e.target.value) })}
                      className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-2.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">TVA Rate (%)</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={newInvoice.tvaRate}
                      onChange={(e) => setNewInvoice({ ...newInvoice, tvaRate: parseFloat(e.target.value) })}
                      className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-2.5"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Total TTC</span>
                    <span className="text-xl font-bold text-lime-600">
                      {currencySymbol(newInvoice.currency)}
                      {(newInvoice.amountHT * (1 + newInvoice.tvaRate / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-lime-500 hover:bg-lime-600 text-white rounded-lg font-semibold shadow-sm hover:shadow-md transition-all"
                >
                  Create Invoice
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;