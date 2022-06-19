import { PropsWithChildren } from 'react';

import { Icon } from '@/react/components/Icon';

interface Props {
  icon: string;
  label: string;
  featherIcon?: boolean;
}

export function TableTitle({
  icon,
  featherIcon,
  label,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div className="toolBar">
      <div className="toolBarTitle">
        <Icon icon={icon} feather={featherIcon} className="space-right" />

        {label}
      </div>
      {children}
    </div>
  );
}
