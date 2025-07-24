import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';

import { retrieveArtworks } from '../utils/fetcher';
import { type ArtData } from '../types/artwork';

const itemsPerPage = 10;

const ArtworkGrid = () => {
  const [entries, setEntries] = useState<ArtData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedItems, setSelectedItems] = useState<Record<number, ArtData>>({});
  const [selectionCount, setSelectionCount] = useState<number | null>(null);
  useEffect(() => {
    loadPage(currentPage + 1);
  }, [currentPage]);

  const loadPage = async (pageNum: number) => {
    const response = await retrieveArtworks(pageNum);
    setEntries(response.data);
    setTotalItems(response.pagination.total);

  const updated: Record<number, ArtData> = {};
for (const item of response.data) {
  if (selectedItems && selectedItems[item.id]) {
    updated[item.id] = item;
  }
}

    setSelectedItems(prev => ({ ...prev, ...updated }));
  };

  const handleRowSelect = (e: any) => {
    const updated = { ...selectedItems };
    const currentIds = entries.map((item) => item.id);
    currentIds.forEach((id) => delete updated[id]);
    if (Array.isArray(e.value)) {
      e.value.forEach((item: ArtData) => {
        updated[item.id] = item;
      });
    }

    setSelectedItems(updated);
  };

  const getSelectedEntries = () => {
    return entries.filter((item) => selectedItems[item.id]);
  };
const handleAutoSelect = async () => {
  if (!selectionCount || selectionCount <= 0) return;

  const pagesToFetch = Math.ceil(selectionCount / itemsPerPage);
  const selected: Record<number, ArtData> = {};
  let totalSelected = 0;

  for (let page = 1; page <= pagesToFetch && totalSelected < selectionCount; page++) {
    const response = await retrieveArtworks(page);

    for (const item of response.data) {
      if (totalSelected < selectionCount) {
        selected[item.id] = item;
        totalSelected++;
      } else {
        break;
      }
    }
  }

  setSelectedItems(selected);
};


  return (
    <div className="card">
      <div className="flex gap-3 align-items-center mb-3">
        <Button label="Select Rows" onClick={handleAutoSelect} />
        <InputNumber
          value={selectionCount ?? undefined}
          onValueChange={(e) => setSelectionCount(e.value?? null)}
          placeholder="Enter Value"
        />
        
        <span>Selected: {Object.keys(selectedItems).length}</span>
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
        selection={getSelectedEntries()}
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
        <h5>Selected Artworks</h5>
        <ul>
          {Object.values(selectedItems).map((item) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ArtworkGrid;
