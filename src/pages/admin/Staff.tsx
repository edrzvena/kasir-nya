import StaffSection from '../../sections/staff/StaffSection';

interface StaffProps {
  storeId: number;
  refreshTrigger: number;
}

export default function Staff({ storeId, refreshTrigger }: StaffProps) {
  return (
    <StaffSection 
      storeId={storeId} 
      refreshTrigger={refreshTrigger}
    />
  );
}
