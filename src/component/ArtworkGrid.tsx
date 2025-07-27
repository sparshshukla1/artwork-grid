import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { retrieveArtworks } from '../utils/fetcher';
import type { ArtData } from '../types/artwork';

const itemsPerPage = 10;

const ArtworkGrid = () => {
  const [entries, setEntries] = useState<ArtData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedMap, setSelectedMap] = useState<Map<number, ArtData>>(new Map());
  const [autoSelectCount, setAutoSelectCount] = useState<number>(0);

  useEffect(() => {
    fetchPage(currentPage + 1);
  }, [currentPage]);

  const fetchPage = async (page: number): Promise<ArtData[]> => {
    const res = await retrieveArtworks(page);
    if (page === currentPage + 1) {
      setEntries(res.data);
      setTotalItems(res.pagination.total);
    }
    return res.data;
  };

  const getCurrentPageSelection = () =>
    entries.filter((item) => selectedMap.has(item.id));

  const handleSelectionChange = (e: any) => {
    const updated = new Map(selectedMap);
    const currentPageIds = entries.map((item) => item.id);
    currentPageIds.forEach((id) => updated.delete(id));

    const selectedItems = Array.isArray(e.value) ? e.value : [];
    selectedItems.forEach((item: ArtData) => {
      updated.set(item.id, item);
    });

    setSelectedMap(updated);
  };

  const handleAutoSelect = async () => {
    if (autoSelectCount <= 0) return;

    const newSelected = new Map<number, ArtData>();
    let totalSelected = 0;
    let page = 1;

    while (totalSelected < autoSelectCount) {
      const data = await retrieveArtworks(page);
      for (const item of data.data) {
        if (totalSelected >= autoSelectCount) break;
        newSelected.set(item.id, item);
        totalSelected++;
      }
      if (data.data.length === 0) break; // No more data
      page++;
    }

    setSelectedMap(newSelected);
  };

  return (
    <div className="card p-4">
      <h4>Selected on Page {currentPage + 1}: {getCurrentPageSelection().length}</h4>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAutoSelect();
        }}
        style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}
      >
        <input
          type="number"
          placeholder="Select top N"
          value={autoSelectCount || ''}
          onChange={(e) => setAutoSelectCount(Number(e.target.value))}
        />
        <button type="submit" disabled={autoSelectCount <= 0}>
          Select Top N Across Pages
        </button>
      </form>

      <DataTable
        value={entries}
        paginator
        rows={itemsPerPage}
        totalRecords={totalItems}
        lazy
        first={currentPage * itemsPerPage}
        onPage={(e: any) => setCurrentPage(e.page ?? 0)}
        dataKey="id"
        selection={getCurrentPageSelection()}
        onSelectionChange={handleSelectionChange}
        selectionMode="multiple"
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: '3em' }}
          {...({ showSelectAll: true } as any)}
        />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="inscriptions" header="Notes" />
        <Column field="date_start" header="Start Year" />
        <Column field="date_end" header="End Year" />
      </DataTable>

    </div>
  );
};

export default ArtworkGrid;
