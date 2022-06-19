import {
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from 'react-table';
import { useMemo, useState } from 'react';

import { User, UserId } from '@/portainer/users/types';

import { PageSelector } from '@@/PaginationControls/PageSelector';
import { Button } from '@@/buttons';
import { Table } from '@@/datatables';
import { Widget } from '@@/Widget';
import { TableFooter } from '@@/datatables/TableFooter';
import { Input } from '@@/form-components/Input';

import { name } from './name-column';
import { RowProvider } from './RowContext';

const columns = [name];

interface Props {
  users: User[];
  onAddUsers(users: UserId[]): void;
  disabled?: boolean;
}

export function UsersList({ users, onAddUsers, disabled }: Props) {
  const [search, setSearch] = useState('');
  const [pageSize, setPageSize] = useState(10);

  const isAdmin = true;
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    gotoPage,
    setPageSize: setPageSizeInternal,
    setGlobalFilter: setGlobalFilterInternal,
    state: { pageIndex },
    setSortBy,
    rows,
  } = useTable(
    {
      defaultCanFilter: false,
      columns,
      data: users,
      initialState: {
        pageSize,

        sortBy: [{ id: 'name', desc: false }],
        globalFilter: search,
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const tableProps = getTableProps();
  const tbodyProps = getTableBodyProps();
  const rowContext = useMemo(
    () => ({ onClick: (userId: UserId) => onAddUsers([userId]), disabled }),
    [onAddUsers, disabled]
  );
  return (
    <Widget>
      <Widget.Title icon="fa-users" title="Users">
        Items per page:
        <select
          value={pageSize}
          onChange={handlePageSizeChange}
          className="space-left"
        >
          <option value={Number.MAX_SAFE_INTEGER}>All</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </Widget.Title>
      <Widget.Taskbar className="col-sm-12 nopadding">
        <div className="col-sm-12 col-md-6 nopadding">
          {isAdmin && (
            <Button
              onClick={() => onAddUsers(rows.map((row) => row.original.Id))}
              disabled={disabled || rows.length === 0}
            >
              <i className="fa fa-user-plus space-right" aria-hidden="true" />
              Add all users
            </Button>
          )}
        </div>
        <div className="col-sm-12 col-md-6 nopadding">
          <Input
            type="text"
            id="filter-users"
            value={search}
            onChange={handleSearchBarChange}
            placeholder="Filter..."
            className="input-sm"
          />
        </div>
      </Widget.Taskbar>
      <Widget.Body className="nopadding">
        <Table
          className={tableProps.className}
          role={tableProps.role}
          style={tableProps.style}
        >
          <thead>
            {headerGroups.map((headerGroup) => {
              const { key, className, role, style } =
                headerGroup.getHeaderGroupProps();

              return (
                <Table.HeaderRow<User>
                  key={key}
                  className={className}
                  role={role}
                  style={style}
                  headers={headerGroup.headers}
                  onSortChange={handleSortChange}
                />
              );
            })}
          </thead>
          <tbody
            className={tbodyProps.className}
            role={tbodyProps.role}
            style={tbodyProps.style}
          >
            <Table.Content
              emptyContent="No users."
              prepareRow={prepareRow}
              rows={page}
              renderRow={(row, { key, className, role, style }) => (
                <RowProvider context={rowContext} key={key}>
                  <Table.Row<User>
                    cells={row.cells}
                    key={key}
                    className={className}
                    role={role}
                    style={style}
                  />
                </RowProvider>
              )}
            />
          </tbody>
        </Table>
        <TableFooter>
          {pageSize !== 0 && (
            <div className="pagination-controls">
              <PageSelector
                maxSize={5}
                onPageChange={(p) => gotoPage(p - 1)}
                currentPage={pageIndex + 1}
                itemsPerPage={pageSize}
                totalCount={rows.length}
              />
            </div>
          )}
        </TableFooter>
      </Widget.Body>
    </Widget>
  );

  function handlePageSizeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const pageSize = parseInt(e.target.value, 10);
    setPageSize(pageSize);
    setPageSizeInternal(pageSize);
  }

  function handleSearchBarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setSearch(value);
    setGlobalFilterInternal(value);
  }

  function handleSortChange(id: string, desc: boolean) {
    setSortBy([{ id, desc }]);
  }
}
