import { Search, Plus } from 'lucide-react';
import type { Transaction } from '../../lib/db';

interface InvoicesTableProps {
  transactions: Transaction[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTxId: string | null;
  setSelectedTxId: (id: string | null) => void;
  onPOSClick: () => void;
}

export default function InvoicesTable({
  transactions,
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  selectedTxId,
  setSelectedTxId,
  onPOSClick
}: InvoicesTableProps) {

  // Search and status filters
  const filteredTx = transactions.filter(t => {
    const matchesSearch = t.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.customer_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeTab === 'All') return matchesSearch;
    return matchesSearch && t.status === activeTab;
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex-1 flex flex-col gap-6">

      {/* Search & Tabs */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        {/* Search Input */}
        <div className="relative md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
          <input
            type="text"
            placeholder="Search transactions by invoice or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-6 py-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-650 shadow-xs"
          />
        </div>

        {/* Tab filters */}
        <div className="flex gap-1.5 bg-slate-50 border border-slate-100 p-0.5 rounded-2xl overflow-x-auto self-start shadow-inner">
          {['All', 'Success', 'Pending', 'Refunded'].map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === status
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Datatable Wrapper */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                <th className="px-6 py-4">Invoice ID</th>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Amount Paid</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-400">
                    <span className="font-bold text-xs block">No transactions logged</span>
                    <button
                      onClick={onPOSClick}
                      className="mt-4 inline-flex items-center gap-1.5 bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl text-[10px] shadow-sm cursor-pointer hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Open Cashier POS</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTxId(tx.id)}
                    className={`cursor-pointer transition-colors duration-250 ${
                      selectedTxId === tx.id
                        ? 'bg-indigo-50/20 border-l-2 border-indigo-650'
                        : 'hover:bg-slate-50/30'
                    }`}
                  >
                    {/* ID */}
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono font-bold text-slate-700">{tx.order_id}</span>
                    </td>

                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 font-extrabold flex items-center justify-center text-[10px] shadow-inner shrink-0">
                          {getInitials(tx.customer_name)}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block leading-tight">{tx.customer_name}</span>
                        </div>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                      {formatDate(tx.created_at)}
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 text-xs font-extrabold text-slate-800">
                      Rp {new Intl.NumberFormat('id-ID').format(Number(tx.total_amount))}
                    </td>

                    {/* Method */}
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-slate-100 text-slate-600 uppercase tracking-wide">
                        {tx.payment_method}
                      </span>
                    </td>

                    {/* Status badge */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                        tx.status === 'Success'
                          ? 'bg-emerald-50 text-emerald-600'
                          : tx.status === 'Pending'
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-rose-50 text-rose-600'
                      }`}>
                        {tx.status}
                      </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
