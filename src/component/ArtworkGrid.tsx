import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { retrieveArtworks } from '../utils/fetcher';
import type { ArtData } from '../types/artwork';

const itemsPerPage = 15;

const ArtworkGrid = () => {
  const [entries, setEntries] = useState<ArtData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedMap, setSelectedMap] = useState<Map<number, ArtData>>(new Map());
  const [autoSelectCount, setAutoSelectCount] = useState<number>(0);

  useEffect(() => {
    fetchPage(currentPage + 1);
  }, [currentPage]);

  const fetchPage = async (page: number) => {
    const res = await retrieveArtworks(page);
    setEntries(res.data);
    setTotalItems(res.pagination.total);
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

  const handleAutoSelect = () => {
    const updated = new Map(selectedMap);
    for (let i = 0; i < Math.min(autoSelectCount, entries.length); i++) {
      const item = entries[i];
      updated.set(item.id, item);
    }
    setSelectedMap(updated);
  };

  return (
    <div className="card p-4">

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
          Select Top N on Page
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

      <div style={{ marginTop: '1rem' }}>
        <h5>Selected Items (Page {currentPage + 1})</h5>
        <ul>
          {entries
            .filter((item) => selectedMap.has(item.id))
            .map((item) => (
              <li key={item.id}>
                <strong>ID: {item.id}</strong> — {item.title}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default ArtworkGrid;
