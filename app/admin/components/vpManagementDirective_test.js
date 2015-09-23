;(function () {
    'use strict';

    describe('app.admin.vpManagement.directive', function () {

        var element, scope, $log, commonService, mockCommonService, mockFileUploader, ctrl, FileUploader;

        beforeEach(function () {
            mockCommonService = {};
            mockFileUploader = function(){};

            module('app.admin', function($provide) {
                $provide.value('commonService', mockCommonService);
                $provide.value('FileUploader', mockFileUploader);
            });

            module('app/admin/components/vpManagement.html');

            inject(function($q) {
                mockCommonService.vendors = {vendors: ['Vendor 1', 'Vendor 2']};
                mockCommonService.products = [{name: 'Prod', lastModifiedDate: '2014-05-02'}, 'Product 2'];
                mockCommonService.certs = ['Cert 1', 'Cert 2'];
                mockCommonService.cqms = ['CQM 1', 'CQM 2'];
                mockCommonService.editions = ['Edition 1', 'Edition 2'];
                mockCommonService.classifications = ['Classification 1', 'Classification 2'];
                mockCommonService.practices  = ['Practice 1', 'Practice 2'];
                mockCommonService.certBodies  = ['CB 1', 'CB 2'];

                mockCommonService.getVendors = function () {
                    var defer = $q.defer();
                    defer.resolve(this.vendors);
                    return defer.promise;
                };

                mockCommonService.getProducts = function () {
                    var defer = $q.defer();
                    defer.resolve(this.products);
                    return defer.promise;
                };

                mockCommonService.getProduct = function (prodId) {
                    var defer = $q.defer();
                    defer.resolve(this.products[0]);
                    return defer.promise;
                };

                mockCommonService.getProductsByVendor = function (vendorId) {
                    var defer = $q.defer();
                    defer.resolve(this.products);
                    return defer.promise;
                };

                mockCommonService.getVersionsByProduct = function (vendorId) {
                    var defer = $q.defer();
                    defer.resolve(this.products);
                    return defer.promise;
                };

                mockCommonService.getEditions = function () {
                    var defer = $q.defer();
                    defer.resolve(this.editions);
                    return defer.promise;
                };

                mockCommonService.getClassifications = function () {
                    var defer = $q.defer();
                    defer.resolve(this.classifications);
                    return defer.promise;
                };

                mockCommonService.getPractices = function () {
                    var defer = $q.defer();
                    defer.resolve(this.practices);
                    return defer.promise;
                };

                mockCommonService.getCertBodies = function () {
                    var defer = $q.defer();
                    defer.resolve(this.certBodies);
                    return defer.promise;
                };

                mockCommonService.getUploadingCps = function () {
                    var defer = $q.defer();
                    defer.resolve(this.uploadingCps);
                    return defer.promise;
                };
            });
        });

        beforeEach(inject(function ($compile, $rootScope, _$log_, $templateCache, $httpBackend) {
            $log = _$log_;
            scope = $rootScope.$new();

            var template = $templateCache.get('app/admin/components/vpManagement.html');
            $templateCache.put('admin/components/vpManagement.html', template);

            $httpBackend.whenGET('common/components/certs.html')
                .respond(200, '<div></div>');
            $httpBackend.whenGET('admin/components/additionalSoftware.html')
                .respond(200, '<div></div>');
            element = angular.element('<ai-vp-management></ai-vp-management');
            $compile(element)(scope);
            scope.$digest();
        }));

        afterEach(function () {
            if ($log.debug.logs.length > 0) {
                console.log('\n Debug: ' + $log.debug.logs.join('\n Debug: '));
            }
        });

        describe('controller', function () {

            var fileUploader;

            beforeEach(inject(function ($controller, _commonService_, $q, _FileUploader_) {
                commonService = _commonService_;
                FileUploader = _FileUploader_;

                spyOn(commonService, 'getProduct').and.callFake(function () {
                    var defer = $q.defer();
                    defer.resolve({});
                    return defer.promise;
                });

                spyOn(commonService, 'getProductsByVendor').and.callFake(function () {
                    var defer = $q.defer();
                    defer.resolve({});
                    return defer.promise;
                });

                spyOn(commonService, 'getVersionsByProduct').and.callFake(function () {
                    var defer = $q.defer();
                    defer.resolve({});
                    return defer.promise;
                });

                ctrl = $controller('VpManagementController', {
                    $scope: scope,
                    $element: null,
                    commonService: commonService,
                    FileUploader: FileUploader});
                scope.$digest();
            }));

            it('should exist', function() {
                expect(ctrl).toBeDefined();
            });

            it('should have vendors at load', function () {
                expect(ctrl.vendors.length).toBe(2);
            });

            it('shouldn\'t do anything if no vendor is selected', function () {
                ctrl.selectVendor();
                expect(ctrl.activeVendor).toBe('');
                expect(ctrl.mergeVendor).toBeUndefined();
            });

            it('should set the activeVendor and call getProductsByVendor if there\'s one selected vendor', function () {
                expect(ctrl.activeVendor).toEqual('');
                ctrl.vendorSelect = [{vendor: 'vendor1'}];
                ctrl.selectVendor();
                expect(ctrl.activeVendor).toEqual([{vendor: 'vendor1'}]);
                expect(commonService.getProductsByVendor).toHaveBeenCalled();
            });

            it('should create a mergeVendor if more than one vendor is selected', function () {
                expect(ctrl.mergeVendor).toBeUndefined();
                ctrl.vendorSelect = [{vendor: 'vendor1'}, {vendor: 'vendor2'}];
                ctrl.selectVendor();
                expect(ctrl.mergeVendor).toEqual({vendor: 'vendor1'});
            });

            it('shouldn\'t do anything if no product is selected', function () {
                ctrl.selectProduct();
                expect(ctrl.activeProduct).toBe('');
                expect(ctrl.mergeProduct).toBeUndefined();
            });

            it('should set the activeProduct and call getVersionsByProduct if there\'s one selected product', function () {
                expect(ctrl.activeProduct).toBe('');
                ctrl.productSelect = [{product: 'product1'}];
                ctrl.activeVendor = [].concat({vendorId: '123'});
                ctrl.selectProduct();
                expect(ctrl.activeProduct).toEqual([{product: 'product1', vendorId: '123'}]);
                expect(commonService.getVersionsByProduct).toHaveBeenCalled();
            });

            it('should create a mergeProduct if more than one product is selected', function () {
                expect(ctrl.mergeProduct).toBeUndefined();
                ctrl.productSelect = [{product: 'product1'}, {product: 'product2'}];
                ctrl.selectProduct();
                expect(ctrl.mergeProduct).toEqual({product: 'product1'});
            });

            it('should know when address fields are required', function () {
                var vendor = {name: 'name', address: null};
                expect(ctrl.addressCheck(vendor)).toBeFalsy();
                vendor.address = {};
                vendor.address.line1 = '';
                expect(ctrl.addressCheck(vendor)).toBeFalsy();
                vendor.address.line1 = 'line';
                expect(ctrl.addressCheck(vendor)).toBeTruthy();
                delete(vendor.address.line1);
                vendor.address.line2 = '';
                expect(ctrl.addressCheck(vendor)).toBeFalsy();
                vendor.address.line2 = 'line';
                expect(ctrl.addressCheck(vendor)).toBeTruthy();
                delete(vendor.address.line2);
                vendor.address.city = '';
                expect(ctrl.addressCheck(vendor)).toBeFalsy();
                vendor.address.city = 'line';
                expect(ctrl.addressCheck(vendor)).toBeTruthy();
                delete(vendor.address.city);
                vendor.address.region = '';
                expect(ctrl.addressCheck(vendor)).toBeFalsy();
                vendor.address.region = 'line';
                expect(ctrl.addressCheck(vendor)).toBeTruthy();
                delete(vendor.address.region);
                vendor.address.country = '';
                expect(ctrl.addressCheck(vendor)).toBeFalsy();
                vendor.address.country = 'line';
                expect(ctrl.addressCheck(vendor)).toBeTruthy();
                delete(vendor.address.country);
            });
        });
    });
})();