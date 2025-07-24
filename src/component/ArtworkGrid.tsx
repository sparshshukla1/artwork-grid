import { useEffect, useState, type SetStateAction } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { retrieveArtworks } from '../utils/fetcher';
import type { ArtData } from '../types/artwork';

const items_in_page = 10;

const ArtworkGrid = () => {
  const [artList, setArtList] = useState<ArtData[]>([]);
  const [selected, setSelected] = useState<ArtData[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCache, setPageCache] = useState<Record<number, ArtData[]>>({});
  const [selectCount, setSelectCount] = useState('');

  useEffect(() => {
    loadPage(currentPage + 1);
  }, [currentPage]);

  const loadPage = async (page: number) => {
 
    if (pageCache[page]) {
      setArtList(pageCache[page]);
      return;
    }

    const response = await retrieveArtworks(page);
    const updatedCache = { ...pageCache, [page]: response.data };

    setPageCache(updatedCache);
    setArtList(response.data);
    setTotal(response.pagination.total);
  };


  const handleSelect = async () => {
    const count = parseInt(selectCount, 10);
    if (isNaN(count) || count <= 0) return;

    const requiredPages = Math.ceil(count / items_in_page);
    const missingPages: number[] = [];

    for (let i = 1; i <= requiredPages; i++) {
      if (!pageCache[i]) {
        missingPages.push(i);
      }
    }
    const fetchMissing = await Promise.all(
      missingPages.map(page => retrieveArtworks(page))
    );

    const newCache = { ...pageCache };
    fetchMissing.forEach((res, index) => {
      const page = missingPages[index];
      newCache[page] = res.data;
    });

    setPageCache(newCache);

    const fullList = Object.keys(newCache)
      .map(Number)
      .sort((a, b) => a - b)
      .flatMap(page => newCache[page]);

    setSelected(fullList.slice(0, count));
  };

  return (
    <div className="card">
      <h4>Selected Items: {selected.length}</h4>

      <div className="flex align-items-center gap-2 mb-3">
        <span>Select Count:</span>
        <InputText
          placeholder="Enter Value"
          value={selectCount}
          onChange={(e) => setSelectCount(e.target.value)}
          style={{ width: '100px' }}
        />
        <Button
          label="Apply"
          icon="pi pi-check"
          onClick={handleSelect}
          severity="success"
        />
      </div>
      <DataTable
        value={artList}
        paginator
        rows={items_in_page}
        totalRecords={total}
        lazy
        first={currentPage * items_in_page}
        onPage={(e: { page: SetStateAction<number>; }) => setCurrentPage(e.page)}
        dataKey="id"
        selection={selected}
        onSelectionChange={(e: { value: SetStateAction<ArtData[]>; }) => setSelected(e.value)}
      >
        <Column selectionMode="multiple" headerStyle={{ width: '3em' }} />
        <Column field="title" header="Title" />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist Info" />
        <Column field="inscriptions" header="Notes" />
        <Column field="date_start" header="Start Year" />
        <Column field="date_end" header="End Year" />
      </DataTable>
      {selected.length > 0 && (
        <div className="mt-3">
          <h5>Selected Titles</h5>
          <ul>
            {selected.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
export default ArtworkGrid;
