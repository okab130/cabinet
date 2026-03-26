import { useState } from 'react';
import {
  useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel,
  getPaginationRowModel, ColumnDef, flexRender, SortingState,
} from '@tanstack/react-table';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  Paper, TextField, Box, TableSortLabel, Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Props<T extends object> {
  data: T[];
  columns: ColumnDef<T, unknown>[];
  globalFilter?: boolean;
  pageSize?: number;
}

function DataTable<T extends object>({ data, columns, globalFilter = true, pageSize = 10 }: Props<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filter, setFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: filter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  return (
    <Box>
      {globalFilter && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
          <SearchIcon color="action" />
          <TextField size="small" placeholder="キーワード検索..." value={filter} onChange={(e) => setFilter(e.target.value)} sx={{ width: 280 }} />
          <Typography variant="body2" color="text.secondary">{table.getFilteredRowModel().rows.length} 件</Typography>
        </Box>
      )}
      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableCell key={header.id} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {header.column.getCanSort() ? (
                      <TableSortLabel
                        active={!!header.column.getIsSorted()}
                        direction={header.column.getIsSorted() === 'asc' ? 'asc' : 'desc'}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableSortLabel>
                    ) : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow><TableCell colSpan={columns.length} align="center" sx={{ py: 4, color: 'text.secondary' }}>データがありません</TableCell></TableRow>
            ) : table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} sx={{ whiteSpace: 'nowrap' }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={table.getFilteredRowModel().rows.length}
        page={table.getState().pagination.pageIndex}
        rowsPerPage={table.getState().pagination.pageSize}
        onPageChange={(_, p) => table.setPageIndex(p)}
        onRowsPerPageChange={(e) => table.setPageSize(Number(e.target.value))}
        rowsPerPageOptions={[5, 10, 20, 50]}
        labelRowsPerPage="表示件数:"
      />
    </Box>
  );
}

export default DataTable;
