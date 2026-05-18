import CatalogSection from '../../sections/catalog/CatalogSection';

interface CatalogProps {
  storeId: number;
  refreshTrigger: number;
  triggerRefresh: () => void;
}

export default function Catalog({ storeId, refreshTrigger, triggerRefresh }: CatalogProps) {
  return (
    <CatalogSection
      storeId={storeId}
      refreshTrigger={refreshTrigger}
      triggerRefresh={triggerRefresh}
    />
  );
}
