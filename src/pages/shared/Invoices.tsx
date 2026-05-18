import InvoicesSection from '../../sections/invoices/InvoicesSection';

interface InvoicesProps {
  storeId: number;
  refreshTrigger: number;
  setActiveTab: (tab: string) => void;
}

export default function Invoices({ storeId, refreshTrigger, setActiveTab }: InvoicesProps) {
  return (
    <InvoicesSection
      storeId={storeId}
      refreshTrigger={refreshTrigger}
      setActiveTab={setActiveTab}
    />
  );
}
