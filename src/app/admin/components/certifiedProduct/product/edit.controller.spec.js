(function () {
    'use strict';

    describe('chpl.admin.EditProductController.controller', function () {
        var vm, scope, $log, $q, commonService, Mock;

        beforeEach(function () {
            module('chpl.mock', 'chpl.admin', function ($provide) {
                $provide.decorator('commonService', function ($delegate) {
                    $delegate.getDevelopers = jasmine.createSpy('getDevelopers');
                    $delegate.updateProduct = jasmine.createSpy('updateProduct');
                    return $delegate;
                });
            });

            inject(function ($controller, _$log_, _$q_, $rootScope, _Mock_, _commonService_) {
                $log = _$log_;
                $q = _$q_;
                Mock = _Mock_;
                commonService = _commonService_;
                commonService.getDevelopers.and.returnValue($q.when({developers: Mock.developers}));
                commonService.updateProduct.and.returnValue($q.when({}));

                scope = $rootScope.$new();
                vm = $controller('EditProductController', {
                    activeProduct: Mock.products[0],
                    $uibModalInstance: Mock.modalInstance
                });
                scope.$digest();
            });
        });

        afterEach(function () {
            if ($log.debug.logs.length > 0) {
                //console.debug('\n Debug: ' + $log.debug.logs.join('\n Debug: '));
            }
        });

        describe('housekeeping', function () {
            it('should exist', function () {
                expect(vm).toBeDefined();
            });

            it('should have a way to close the modal', function () {
                expect(vm.cancel).toBeDefined();
                vm.cancel();
                expect(Mock.modalInstance.dismiss).toHaveBeenCalled();
            });
        });

        describe('previous owner history', function () {
            it('should add previous owner objects when told', function () {
                var initLength = vm.product.ownerHistory.length;
                vm.addPreviousOwner();
                expect(vm.product.ownerHistory.length).toBe(initLength + 1);
                expect(vm.product.ownerHistory[initLength]).toEqual({});
            });

            it('should remove previous statuses', function () {
                vm.addPreviousOwner();
                var initLength = vm.product.ownerHistory.length;
                vm.removePreviousOwner(0);
                expect(vm.product.ownerHistory.length).toBe(initLength - 1);
            });

            it('should add the current owner as a previous one when changed', function () {
                var initLength = vm.product.ownerHistory.length;
                vm.changeCurrent('newId');
                expect(vm.product.ownerHistory[initLength].developer.developerId).toBe('newId');
                expect(vm.product.ownerHistory[initLength].transferDate).toBeDefined();
            });
        });

        describe('saving the product', function () {
            beforeEach(function () {
                vm.product.ownerHistory = [{developer: {developerId: 1}, transferDate: new Date(1490644248445)}];
            });

            it('should call the common service', function () {
                var updateProduct = {product: vm.product, newDeveloperId: vm.product.developerId, productIds: [vm.product.productId]};
                vm.save();
                scope.$digest();
                expect(commonService.updateProduct).toHaveBeenCalledWith(updateProduct);
            });

            it('should close the modal', function () {
                vm.save();
                scope.$digest();
                expect(Mock.modalInstance.close).toHaveBeenCalled();
            });

            it('should dismiss the modal on error', function () {
                commonService.updateProduct.and.returnValue($q.when({status: 500}));
                vm.save();
                scope.$digest();
                expect(Mock.modalInstance.dismiss).toHaveBeenCalled();
            });

            it('should dismiss the modal on error', function () {
                commonService.updateProduct.and.returnValue($q.reject({data: {error: 'bad thing'}}));
                vm.save();
                scope.$digest();
                expect(Mock.modalInstance.dismiss).toHaveBeenCalledWith('bad thing');
            });
        });

        describe('contact information', function () {
            it('should not require a contact by default', function () {
                expect(vm.isContactRequired()).toBe(false);
            });

            it('should require a contact if any elements of the contact exist', function () {
                vm.product.contact = {};
                expect(vm.isContactRequired()).toBe(false);

                vm.product.contact.firstName = 'John';
                expect(vm.isContactRequired()).toBe(true);
                vm.product.contact = {};
                expect(vm.isContactRequired()).toBe(false);

                vm.product.contact.lastName = 'Smith';
                expect(vm.isContactRequired()).toBe(true);
                vm.product.contact = {};
                expect(vm.isContactRequired()).toBe(false);

                vm.product.contact.title = 'Mr.';
                expect(vm.isContactRequired()).toBe(true);
                vm.product.contact = {};
                expect(vm.isContactRequired()).toBe(false);

                vm.product.contact.email = 'sample@example.com';
                expect(vm.isContactRequired()).toBe(true);
                vm.product.contact = {};
                expect(vm.isContactRequired()).toBe(false);

                vm.product.contact.phoneNumber = '123-123-1234';
                expect(vm.isContactRequired()).toBe(true);
                vm.product.contact = {};
                expect(vm.isContactRequired()).toBe(false);
            });
        });
    });
})();
