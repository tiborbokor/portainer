import { CellProps, Column } from 'react-table';

import { User } from '@/portainer/users/types';
import { useUser as useCurrentUser } from '@/portainer/hooks/useUser';
import { TeamRole } from '@/react/portainer/users/teams/types';

import { Button } from '@@/buttons';

import { useRowContext } from './RowContext';

export const teamRole: Column<User> = {
  Header: 'Team Role',
  accessor: 'Id',
  id: 'role',
  Cell: RoleCell,
  disableFilters: true,
  Filter: () => null,
  canHide: false,
  sortType: 'string',
};

export function RoleCell({ row: { original: user } }: CellProps<User>) {
  const { onUpdateRoleClick, getRole, disabled } = useRowContext();
  const role = getRole(user.Id);

  const { isAdmin } = useCurrentUser();

  const Cell = role === TeamRole.Leader ? LeaderCell : MemberCell;

  return (
    <Cell
      isAdmin={isAdmin}
      onClick={() => onUpdateRoleClick(user.Id, TeamRole.Member)}
      disabled={disabled}
    />
  );
}

interface LeaderCellProps {
  isAdmin: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function LeaderCell({ isAdmin, onClick, disabled }: LeaderCellProps) {
  return (
    <>
      <i className="fa fa-user-plus space-right" aria-hidden="true" /> Leader
      {isAdmin && (
        <Button
          color="link"
          className="nopadding"
          onClick={onClick}
          disabled={disabled}
        >
          <i className="fa fa-user-times space-right" aria-hidden="true" />
          Member
        </Button>
      )}
    </>
  );
}

interface MemberCellProps {
  onClick: () => void;
  disabled?: boolean;
}

function MemberCell({ onClick, disabled }: MemberCellProps) {
  return (
    <>
      <i className="fa fa-user space-right" aria-hidden="true" /> Member
      <Button
        color="link"
        className="nopadding"
        onClick={onClick}
        disabled={disabled}
      >
        <i className="fa fa-user-plus space-right" aria-hidden="true" />
        Leader
      </Button>
    </>
  );
}
