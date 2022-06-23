angular.module('portainer.app').factory(
  'EndpointProvider',
  /* @ngInject */
  function EndpointProviderFactory(LocalStorage) {
    const state = {
      currentEndpoint: null,
    };
    var service = {};
    var endpoint = {};

    service.initialize = function () {
      var endpointID = LocalStorage.getEndpointID();
      var offlineMode = LocalStorage.getOfflineMode();

      if (endpointID) {
        endpoint.ID = endpointID;
      }

      if (offlineMode) {
        endpoint.OfflineMode = offlineMode;
      }
    };

    service.clean = function () {
      LocalStorage.cleanEndpointData();
      endpoint = {};
    };

    service.endpoint = function () {
      return endpoint;
    };

    service.endpointID = function () {
      if (endpoint.ID === undefined) {
        endpoint.ID = LocalStorage.getEndpointID();
      }

      return endpoint.ID;
    };

    service.setEndpointID = function (id) {
      endpoint.ID = id;
      LocalStorage.storeEndpointID(id);
    };

    service.endpoints = function () {
      return LocalStorage.getEndpoints();
    };

    service.setEndpoints = function (data) {
      LocalStorage.storeEndpoints(data);
    };

    service.offlineMode = function () {
      return endpoint.OfflineMode;
    };

    service.setOfflineMode = function (isOffline) {
      endpoint.OfflineMode = isOffline;
      LocalStorage.storeOfflineMode(isOffline);
    };

    service.setOfflineModeFromStatus = function (status) {
      var isOffline = status !== 1;
      endpoint.OfflineMode = isOffline;
      LocalStorage.storeOfflineMode(isOffline);
    };

    service.currentEndpoint = function () {
      return state.currentEndpoint;
    };

    service.setCurrentEndpoint = function (endpoint) {
      state.currentEndpoint = endpoint;
    };

    return service;
  }
);
