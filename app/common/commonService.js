;(function () {
    'use strict';

    angular.module('app.common')
        .service('commonService', function ($http, $q, devAPI, API, $log) {
            var self = this;

            self.simpleApiCall = function (endpoint, workingApi) {
                return $http.get(workingApi + endpoint)
                    .then(function(response) {
                        if (typeof response.data === 'object') {
                            return response.data;
                        } else {
                            return $q.reject(response.data);
                        }
                    }, function (response) {
                        return $q.reject(response.data);
                    });
            };

            self.postApiCall = function (endpoint, workingApi, postObject) {
                return $http.post(workingApi + endpoint, postObject)
                    .then(function (response) {
                        if (typeof response.data === 'object') {
                            return response.data;
                        } else {
                            return $q.reject(response);
                        }
                    }, function (response) {
                        return $q.reject(response);
                    });
            };

            self.search = function (queryObj, pageNum, pageSize) {
                return self.postApiCall('/advanced_search', API, queryObj);
//                return self.postApiCall('/search', API, queryObj);
            };

            self.getSearchOptions = function () {
                return self.simpleApiCall('/populate_search_options', API);
            };

            self.getProduct = function (productId) {
                return self.simpleApiCall('/certified_product/get_certified_product?certifiedProductId=' + productId, API);
            };

            self.getVendors = function () {
                return self.simpleApiCall('/vendor/list_vendors', API);
            };

            self.getProductsByVendor = function (vendorId) {
                return self.simpleApiCall('/product/list_products_by_vendor?vendorId=' + vendorId, API);
            };

            self.getVersionsByProduct = function (productId) {
                return self.simpleApiCall('/product/version/list_versions_by_product?productId=' + productId, API);
            };

            self.getProductsByVersion = function (versionId) {
                return self.simpleApiCall('/certified_product/list_certified_products_by_version?versionId=' + versionId, API);
            };
/*
            self.getCerts = function () {
                return self.simpleApiCall('/list_certs', devAPI);
            };

            self.getCQMs = function () {
                return self.simpleApiCall('/list_cqms', devAPI);
            };
*/
            self.getEditions = function () {
                return self.simpleApiCall('/list_editions', devAPI);
            };

            self.getClassifications = function () {
                return self.simpleApiCall('/list_classifications', devAPI);
            };

            self.getPractices = function () {
                return self.simpleApiCall('/list_practices', devAPI);
            };
/*
            self.getVendorNames = function () {
                return self.simpleApiCall('/list_vendor_names', API);
            };

            self.getProductNames = function () {
                return self.simpleApiCall('/list_product_names', API);
            };
*/
            self.getCertBodies = function () {
                return self.simpleApiCall('/list_certBodies', devAPI);
            };
/*
            self.getCertsNCQMs = function () {
                return self.simpleApiCall('/list_filterCerts', devAPI);
            };
*/
            self.getCertifiedProductActivity = function () {
                return self.simpleApiCall('/list_certifiedProductActivity', devAPI);
            };

            self.getVendorActivity = function () {
                return self.simpleApiCall('/list_vendorActivity', devAPI);
            };

            self.getProductActivity = function () {
                return self.simpleApiCall('/list_productActivity', devAPI);
            };

            self.getAcbActivity = function () {
                return self.simpleApiCall('/list_acbActivity', devAPI);
            };

            self.getUploadingCps = function () {
                return self.simpleApiCall('/certified_product/get_pending', API);
            };
        });
})();