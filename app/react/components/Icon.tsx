import clsx from 'clsx';
import { ComponentType, ReactNode, useEffect } from 'react';
import featherIcons from 'feather-icons';
import { isValidElementType } from 'react-is';

export interface IconProps {
  icon: ReactNode | ComponentType<unknown>;
  featherIcon?: boolean;
}

interface Props {
  icon: ReactNode | ComponentType<unknown>;
  feather?: boolean;
  className?: string;
  mode?:
    | 'alt'
    | 'info'
    | 'info-alt'
    | 'warn'
    | 'warn-alt'
    | 'error'
    | 'error-alt'
    | 'success'
    | 'success-alt';
}

export function Icon({ icon, feather, className, mode }: Props) {
  useEffect(() => {
    if (feather) {
      featherIcons.replace();
    }
  }, [feather]);

  if (typeof icon !== 'string') {
    const Icon = isValidElementType(icon) ? icon : null;

    return (
      <span className={className} aria-hidden="true" role="img">
        {Icon == null ? <>{icon}</> : <Icon />}
      </span>
    );
  }

  const classes = clsx(className, 'icon', { [`icon-${mode}`]: mode });

  if (feather) {
    return (
      <i
        data-feather={icon}
        className={classes}
        aria-hidden="true"
        role="img"
      />
    );
  }

  return (
    <i className={clsx('fa', icon, classes)} aria-hidden="true" role="img" />
  );
}
