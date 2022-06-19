import { TeamRole } from '@/react/portainer/users/teams/types';
import { UserId } from '@/portainer/users/types';

import { createRowContext } from '@@/datatables/RowContext';

export interface RowContext {
  getRole(userId: UserId): TeamRole;
  onRemoveClick(userId: UserId): void;
  onUpdateRoleClick(userId: UserId, role: TeamRole): void;
  disabled?: boolean;
}

const { RowProvider, useRowContext } = createRowContext<RowContext>();

export { RowProvider, useRowContext };
