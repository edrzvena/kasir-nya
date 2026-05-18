import POSSection from '../../sections/pos/POSSection';
import type { UserProfile } from '../../lib/db';

interface POSProps {
  storeId: number;
  refreshTrigger: number;
  triggerRefresh: () => void;
  currentUser: UserProfile;
}

export default function POS({ storeId, refreshTrigger, triggerRefresh, currentUser }: POSProps) {
  return (
    <POSSection
      storeId={storeId}
      refreshTrigger={refreshTrigger}
      triggerRefresh={triggerRefresh}
      currentUser={currentUser}
    />
  );
}
