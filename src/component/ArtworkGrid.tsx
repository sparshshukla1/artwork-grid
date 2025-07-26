import { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { retrieveArtworks } from '../utils/fetcher';
import { type ArtData } from '../types/artwork';

const itemsPerPage = 10;

const ArtworkGrid = () => {
  const [entries, setEntries] = useState<ArtData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());
  const [selectionCount, setSelectionCount] = useState<number | null>(null);
  const selectionCountRef = useRef<number | null>(null);

  useEffect(() => {
    loadPage(currentPage + 1);
  }, [currentPage]);

  const loadPage = async (pageNum: number) => {
    const response = await retrieveArtworks(pageNum);
    setEntries(response.data);
    setTotalItems(response.pagination.total);
  };

  const getSelectedEntriesForCurrentPage = () =>
    entries.filter((item) => selectedItemIds.has(item.id));

  const handleRowSelect = (e: any) => {
    const newSelection = e.value as ArtData[];
    const updatedIds = new Set(selectedItemIds);
    const currentPageIds = entries.map((item) => item.id);

    currentPageIds.forEach((id) => updatedIds.delete(id));
    newSelection.forEach((item) => updatedIds.add(item.id));

    setSelectedItemIds(updatedIds);
  };

  const handleAutoSelect = async () => {
    const count = selectionCountRef.current;
    if (!count || count <= 0) return;

    const pagesNeeded = Math.ceil(count / itemsPerPage);
    const newSelectedIds = new Set<number>();
    let totalSelected = 0;

    for (let page = 1; page <= pagesNeeded && totalSelected < count; page++) {
      const response = await retrieveArtworks(page);
      for (const item of response.data) {
        if (totalSelected < count) {
          newSelectedIds.add(item.id);
          totalSelected++;
        } else {
          break;
        }
      }
    }

    setSelectedItemIds(newSelectedIds);
  };

  return (
    <div className="card">
      <div className="auto-select-wrapper">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAutoSelect();
          }}
          className="auto-select-box"
        >
          <input
            type="number"
            placeholder="Enter value"
            value={selectionCount ?? ''}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              const safeVal = isNaN(val) ? null : val;
              setSelectionCount(safeVal);
              selectionCountRef.current = safeVal;
            }}
          />
          <button
            type="submit"
            disabled={!selectionCount || selectionCount <= 0}
          >
            Auto Select
          </button>
        </form>
        <span className="selected-count">
          Selected: {selectedItemIds.size}
        </span>
      </div>

      <DataTable
        value={entries}
        paginator
        rows={itemsPerPage}
        totalRecords={totalItems}
        lazy
        first={currentPage * itemsPerPage}
        onPage={(e: any) => {
          if (e.page !== undefined) setCurrentPage(e.page);
        }}
        dataKey="id"
        selection={getSelectedEntriesForCurrentPage()}
        onSelectionChange={handleRowSelect}
        selectionMode="multiple"
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist Info" />
        <Column field="inscriptions" header="Notes" />
        <Column field="date_start" header="Start Year" />
        <Column field="date_end" header="End Year" />
      </DataTable>

      <div className="mt-4">
        <h5>Selected Artwork IDs</h5>
        <ul>
          {[...selectedItemIds].map((id) => (
            <li key={id}>Artwork ID: {id}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ArtworkGrid;
