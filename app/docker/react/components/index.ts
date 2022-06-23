import angular from 'angular';

import { r2a } from '@/react-tools/react2angular';
import { StackContainersDatatable } from '@/react/docker/stacks/ItemView/StackContainersDatatable';
import { ContainerQuickActions } from '@/react/docker/containers/components/ContainerQuickActions';

export const componentsModule = angular
  .module('portainer.docker.react.components', [])
  .component(
    'containerQuickActions',
    r2a(ContainerQuickActions, [
      'containerId',
      'nodeName',
      'state',
      'status',
      'taskId',
    ])
  )
  .component(
    'stackContainersDatatable',
    r2a(StackContainersDatatable, ['environment', 'stackName'])
  ).name;
