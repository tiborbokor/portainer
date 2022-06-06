import {
  PaginationTableSettings,
  SortableTableSettings,
} from '@@/datatables/types';

export interface TableSettings
  extends Omit<SortableTableSettings, 'setSortBy'>,
    Omit<PaginationTableSettings, 'setPageSize'> {}
