import { useState, useEffect } from 'react';
import { dbService } from '../../lib/db';
import type { Transaction } from '../../lib/db';

// Import modular sections
import InvoicesTable from './InvoicesTable';
import ReceiptSidebar from './ReceiptSidebar';

interface InvoicesSectionProps {
  storeId: number;
  refreshTrigger: number;
  setActiveTab: (tab: string) => void;
}

export default function InvoicesSection({ storeId, refreshTrigger, setActiveTab }: InvoicesSectionProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState('All');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  // Fetch transactions from DB driver
  useEffect(() => {
    const fetchTransactions = async () => {
      const data = await dbService.getTransactions(storeId);
      setTransactions(data);
      // Reset receipt selection on database switch
      setSelectedTxId(null);
    };
    fetchTransactions();
  }, [storeId, refreshTrigger]);

  // Find currently selected transaction record details
  const currentTransaction = transactions.find(t => t.id === selectedTxId) || null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn">

      {/* Table grid directory (Left Side) */}
      <div className="flex-1 space-y-6 py-8">
        <div>
          <h2 className="font-extrabold text-slate-800 text-xl leading-none">Transactions & Invoices</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-medium">Verify sales history, billing statuses, and printed receipt logs.</p>
        </div>

        <InvoicesTable
          transactions={transactions}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeStatusTab}
          setActiveTab={setActiveStatusTab}
          selectedTxId={selectedTxId}
          setSelectedTxId={setSelectedTxId}
          onPOSClick={() => setActiveTab('dashboard')}
        />
      </div>

      {/* Receipts previewer sidebar drawer (Right Side) */}
      <ReceiptSidebar
        transaction={currentTransaction}
        onClose={() => setSelectedTxId(null)}
        storeId={storeId}
      />

    </div>
  );
}
