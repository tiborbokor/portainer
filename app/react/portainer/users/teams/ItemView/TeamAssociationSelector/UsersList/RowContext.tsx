import { UserId } from '@/portainer/users/types';

import { createRowContext } from '@@/datatables/RowContext';

interface RowContext {
  onClick: (userId: UserId) => void;
  disabled?: boolean;
}

const { RowProvider, useRowContext } = createRowContext<RowContext>();

export { RowProvider, useRowContext };
