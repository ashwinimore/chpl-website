;(function () {
    'use strict';

    describe('app.admin.acbManagement.directive', function () {

        var element, scope, $log, authService, ctrl, commonService;

        beforeEach(function () {
            var mockAuthService = {};
            var mockCommonService = {};
            var mockAdminService = {};

            module('app.admin', function($provide) {
                $provide.value('authService', mockAuthService);
                $provide.value('commonService', mockCommonService);
                $provide.value('adminService', mockAdminService);
            });

            module('app/admin/components/acbManagement.html');
            module('app/admin/components/userManagement.html');

            mockAdminService.acbs = {acbs: [{name: 'test', id: 1, address: {}}, {name: 'test2', id: 2, address: {}}]};

            inject(function($q) {
                mockAuthService.isAcbAdmin = function () {
                    return true;
                };

                mockAuthService.isChplAdmin = function () {
                    return true;
                };

                mockAdminService.getAcbs = function () {
                    var defer = $q.defer();
                    defer.resolve(mockAdminService.acbs);
                    return defer.promise;
                };

                mockAdminService.getUsersAtAcb = function (acbId) {
                    var defer = $q.defer();
                    defer.resolve({});
                    return defer.promise;
                };

                mockCommonService.simpleApiCall = function (endpoint) {
                    var defer = $q.defer();
                    defer.resolve({});
                    return defer.promise;
                };

                mockAdminService.getUsers = function (endpoint) {
                    var defer = $q.defer();
                    defer.resolve({data: {}});
                    return defer.promise;
                };
            });
        });

        beforeEach(inject(function ($compile, $rootScope, _$log_, $templateCache, $httpBackend) {
            $log = _$log_;
            scope = $rootScope.$new();

            scope.fakeFunction = function () {};

            var template = $templateCache.get('app/admin/components/acbManagement.html');
            $templateCache.put('admin/components/acbManagement.html', template);
            template = $templateCache.get('app/admin/components/userManagement.html');
            $templateCache.put('admin/components/userManagement.html', template);

            element = angular.element('<ai-acb-management create-acb="fakeFunction"></ai-acb-management');
            $compile(element)(scope);
            scope.$digest();
        }));

        afterEach(function () {
            if ($log.debug.logs.length > 0) {
                console.log('\n Debug: ' + $log.debug.logs.join('\n Debug: '));
            }
        });

        describe('controller', function () {

            beforeEach(inject(function ($controller, _commonService_, $q, $httpBackend) {
                commonService = _commonService_;

                ctrl = $controller('AcbManagementController', {
                    $scope: scope,
                    $element: null,
                    commonService: commonService});
                scope.$digest();
            }));

            it('should exist', function() {
                expect(ctrl).toBeDefined();
            });

            it('should have an empty ACB ready', function () {
                expect(ctrl.newACB).toEqual({address:{}});
            });

            it('should know if the logged in user is ACB and/or CHPL admin', function () {
                expect(ctrl.isAcbAdmin).toBeTruthy();
                expect(ctrl.isChplAdmin).toBeTruthy();
            });
        });
    });
})();