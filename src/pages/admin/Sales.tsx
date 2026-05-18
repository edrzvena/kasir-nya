import SalesSection from '../../sections/sales/SalesSection';

interface SalesProps {
  storeId: number;
  refreshTrigger: number;
}

export default function Sales({ storeId, refreshTrigger }: SalesProps) {
  return (
    <SalesSection
      storeId={storeId}
      refreshTrigger={refreshTrigger}
    />
  );
}
