import angular from 'angular';
import { StateRegistry } from '@uirouter/angularjs';

import { TeamView } from '@/react/portainer/users/teams/ItemView/TeamView';
import { r2a } from '@/react-tools/react2angular';
import { TeamsView } from '@/react/portainer/users/teams/ListView';

export const teamsModule = angular
  .module('portainer.app.teams', [])
  .config(config)
  .component('teamView', r2a(TeamView, []))
  .component('teamsView', r2a(TeamsView, [])).name;

/* @ngInject */
function config($stateRegistryProvider: StateRegistry) {
  $stateRegistryProvider.register({
    name: 'portainer.teams',
    url: '/teams',
    views: {
      'content@': {
        component: 'teamsView',
      },
    },
  });

  $stateRegistryProvider.register({
    name: 'portainer.teams.team',
    url: '/:id',
    views: {
      'content@': {
        component: 'teamView',
      },
    },
  });
}
