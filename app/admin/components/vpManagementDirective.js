;(function () {
    'use strict';

    angular.module('app.admin')
        .controller('VpManagementController', ['commonService', 'adminService', 'authService', '$log', 'FileUploader', 'API', function (commonService, adminService, authService, $log, FileUploader, API) {
            var self = this;
            self.activeVendor = '';
            self.activeProduct = '';
            self.activeVersion = '';
            self.activeCP = '';
            self.isChplAdmin = authService.isChplAdmin();
            self.isAcbAdmin = authService.isAcbAdmin();
            self.uploadingCps = [];
            self.inspectingCp = '';
            self.workType = 'upload';

            self.refreshPending = function () {
                commonService.getUploadingCps()
                    .then(function (cps) {
                        self.uploadingCps = [].concat(cps.pendingCertifiedProducts);
                    })
            };

            if (self.isAcbAdmin) {
                self.refreshPending();
                self.uploader = new FileUploader({
                    url: API + '/certified_products/upload',
                    removeAfterUpload: true,
                    headers: { Authorization: 'Bearer ' + authService.getToken() }
                });
                self.uploader.onSuccessItem = function(fileItem, response, status, headers) {
                    $log.info('onSuccessItem', fileItem, response, status, headers);
                    self.uploadingCps = self.uploadingCps.concat(response.pendingCertifiedProducts);
                    self.workType = 'confirm';
                };
                self.uploader.onErrorItem = function(fileItem, response, status, headers) {
                    $log.info('onErrorItem', fileItem, response, status, headers);
                };
            }

            commonService.getVendors()
                .then(function (vendors) {
                    self.vendors = vendors.vendors;
                });

            self.selectVendor = function () {
                if (self.vendorSelect) {
                    if (self.vendorSelect.length === 1) {
                        self.activeVendor = [self.vendorSelect[0]];
                        commonService.getProductsByVendor(self.activeVendor[0].vendorId)
                            .then(function (products) {
                                self.products = products.products;
                            });
                    } else { // merging
                        self.activeVendor = [].concat(self.vendorSelect);
                        self.mergeVendor = angular.copy(self.activeVendor[0]);
                        delete self.mergeVendor.vendorId;
                        delete self.mergeVendor.lastModifiedDate;
                    }
                }
            };
            self.selectProduct = function () {
                if (self.productSelect) {
                    if (self.productSelect.length === 1) {
                        self.activeProduct = [self.productSelect[0]];
                        self.activeProduct[0].vendorId = self.activeVendor[0].vendorId;
                        commonService.getVersionsByProduct(self.activeProduct[0].productId)
                            .then(function (versions) {
                                self.versions = versions;
                            });
                    } else { //merging
                        self.activeProduct = [].concat(self.productSelect);
                        self.mergeProduct = angular.copy(self.activeProduct[0]);
                        delete self.mergeProduct.productId;
                        delete self.mergeProduct.lastModifiedDate;
                    }
                }
            };
            self.selectVersion = function () {
                if (self.versionSelect) {
                    if (self.versionSelect.length === 1) {
                        self.activeVersion = [self.versionSelect[0]];
                        self.activeVersion[0].productId = self.activeProduct[0].productId;
                        commonService.getProductsByVersion(self.activeVersion[0].versionId)
                            .then(function (cps) {
                                self.cps = cps;
                            });
                    } else { //merging
                        self.activeVersion = [].concat(self.versionSelect);
                        self.mergeVersion = angular.copy(self.activeVersion[0]);
                        delete self.mergeVersion.versionId;
                        delete self.mergeVersion.lastModifiedDate;
                    }
                }
            };
            self.selectCP = function () {
                if (self.cpSelect) {
                    self.activeCP = {};
                    self.activeCP.classificationType = {};
                    self.activeCP.certifyingBody = {};
                    self.activeCP.practiceType = {};
                    commonService.getProduct(self.cpSelect[0])
                        .then(function (cp) {
                            self.activeCP = cp;
                            if (self.activeCP.visibleOnChpl === undefined)
                                self.activeCP.visibleOnChpl = true;
                            self.activeCP.certDate = new Date(self.activeCP.certificationDate.split(' ')[0]);
                        });
                }
            };

            self.populateData = function () {
                commonService.getSearchOptions()
                    .then(function (options) {
                        self.editions = options.editions;
                        self.classifications = options.productClassifications;
                        self.practices = options.practiceTypeNames;
                        self.bodies = options.certBodyNames;
                        //                        self.statuses = options.certificationStatuses;
                        self.editions = [{id: '1', name: '2011'},{id: '2', name: '2014'}];
                        self.classifications = [{name: 'Modular EHR', id: '1'},{name: 'Complete EHR', id: '2'}];
                        self.practices = [{name: 'Ambulatory', id: '1'},{name: 'Inpatient', id: '2'}];
                        self.bodies = [{id: 1, name: 'InfoGard'},
                                       {id: 2, name: 'CCHIT'},
                                       {id: 3, name: 'Drummond Group Inc.'},
                                       {id: 4, name: 'SLI Global'},
                                       {id: 5, name: 'Surescripts LLC'},
                                       {id: 6, name: 'ICSA Labs'},
                                       {id: 7, name: 'Pending'}];
                        self.statuses = [{id: '1', name: 'Active'},{id: '2', name: 'Retired'},
                                         {id: '3', name: 'Withdrawn'},{id: '4', name: 'Decertified'},
                                         {id: '5', name: 'Pending'}];
                    });
            };
            self.populateData();

            self.getStatusText = function (statusId) {
                for (var i = 0; i < self.statuses.length; i++) {
                    if (self.statuses[i].id === statusId) {
                        return self.statuses[i].name;
                    }
                }
                return 'Unknown';
            }
            self.parseCertificationDate = function (certDate) {
                if (certDate && certDate.indexOf(' ') > 0) {
                    return certDate.split(' ')[0];
                } else {
                    return certDate;
                }
            }
            self.concatAddlSw = function (addlSw) {
                var retval = '';
                if (addlSw) {
                    for (var i = 0; i < addlSw.length; i++) {
                        retval += addlSw[i].name + ', ';
                    }
                    retval = retval.substring(0,retval.length - 2)
                }
                return retval;
            }

            self.inspectCp = function (cpId) {
                var cp;
                for (var i = 0; i < self.uploadingCps.length; i++) {
                    if (cpId === self.uploadingCps[i].id) {
                        self.inspectingCp = self.uploadingCps[i];
                        cp = self.inspectingCp;
                    }
                }
                self.activeVendor = [cp.vendor];
                self.activeVendor[0].address = cp.vendorAddress;
                self.activeProduct = [cp.product];
                self.activeVersion = [cp.product];
                self.activeCP = cp;
                self.activeCP.certificationStatus = {id: 5, name: 'Pending'};
                self.activeCP.certificationDate = new Date(parseInt(cp.certificationDate));
                self.activeCP.certDate = self.activeCP.certificationDate;
                self.activeCP.certificationStatusId = '5';

                if (!cp.product.versionId && cp.product.id) {
                    commonService.getVersionsByProduct(cp.product.id)
                        .then(function (versions) {
                            self.versions = versions;
                        });
                }
                if (!cp.product.id && cp.vendor.id) {
                    commonService.getProductsByVendor(cp.vendor.id)
                        .then(function (products) {
                            self.products = products.products;
                        });
                }
            };

            self.selectInspectingVendor = function () {
                self.activeVendor = [self.vendorSelect];
                self.inspectingCp.vendor.id = self.activeVendor[0].vendorId;
                commonService.getProductsByVendor(self.activeVendor[0].vendorId)
                    .then(function (products) {
                        self.products = products.products;
                        for (var i = 0; i < self.products.length; i++) {
                            if (self.products[i].name === self.inspectingCp.product.name) {
                                self.inspectingCp.product.id = self.products[i].productId;
                                self.activeProduct = [angular.copy(self.inspectingCp.product)];
                                self.activeProduct[0].productId = self.inspectingCp.product.id;
                                commonService.getVersionsByProduct(self.activeProduct[0].productId)
                                    .then(function (versions) {
                                        self.versions = versions;
                                        for (var j = 0; j < self.versions.length; j++) {
                                            if (self.versions[j].version === self.inspectingCp.product.version) {
                                                self.inspectingCp.product.versionId = self.versions[j].versionId;
                                                self.activeVersion = [angular.copy(self.inspectingCp.product)];
                                                self.activeVersion[0].versionId = self.inspectingCp.product.versionId;
                                                break;
                                            }
                                        }
                                    });
                                break;
                            }
                        }
                    });
                self.activeVendor[0].id = self.activeVendor[0].vendorId;
            };

            self.selectInspectingProduct = function () {
                self.activeProduct = [self.productSelect];
                commonService.getVersionsByProduct(self.activeProduct[0].productId)
                    .then(function (versions) {
                        self.versions = versions;
                        for (var j = 0; j < self.versions.length; j++) {
                            if (self.versions[j].version === self.inspectingCp.product.version) {
                                self.inspectingCp.product.versionId = self.versions[j].versionId;
                                self.activeVersion = [angular.copy(self.inspectingCp.product)];
                                self.activeVersion[0].versionId = self.inspectingCp.product.versionId;
                                break;
                            }
                        }
                    });
                self.activeProduct[0].id = self.activeProduct[0].productId;
            };

            self.selectInspectingVersion = function () {
                self.activeVersion = [self.versionSelect];
                self.inspectingCp.product.versionId = self.activeVersion[0].versionId;
            };

            self.confirmCp = function (cpId) {
                $log.debug(self.inspectingCp);

                delete(self.inspectingCp.vendor.address);
                adminService.confirmPendingCp(self.inspectingCp)
                    .then(self.refreshPending);

                self.inspectingCp = '';
                self.activeVendor = '';
                self.activeProduct = '';
                self.activeVersion = '';
                self.activeCP = '';
            };

            self.cancelCp = function () {
                self.inspectingCp = '';
                self.activeVendor = '';
                self.activeProduct = '';
                self.activeVersion = '';
                self.activeCP = '';
            };

            self.rejectCp = function (cpId) {
                adminService.rejectPendingCp(cpId)
                    .then(self.refreshPending);

                self.inspectingCp = '';
                self.activeVendor = '';
                self.activeProduct = '';
                self.activeVersion = '';
                self.activeCP = '';
            };

            self.cancelVendor = function () {
                // todo: figure out how to actually cancel the edits
                self.activeVendor = '';
                self.vendorMessage = null;
                self.editVendor = false;
                self.selectVendor();
            };

            self.cancelProduct = function () {
                self.activeProduct = '';
                self.productMessage = null;
                self.editProduct = false;
                self.selectProduct();
            };

            self.cancelVersion = function () {
                self.activeVersion = '';
                self.versionMessage = null;
                self.editVersion = false;
                self.selectVersion();
            };

/*            self.startEditingCp(shouldStart) {
                if (shouldStart) {
                    self.isEditing = */
            self.cancelCP = function () {
                self.activeCP = '';
                self.cpMessage = null;
                self.editCP = false;
                self.selectCP();
            };

            self.mergeAddressRequired = function () {
                return self.addressCheck(self.mergeVendor);
            }

            self.addressRequired = function () {
                return self.addressCheck(self.activeVendor[0]);
            };

            self.addressCheck = function (v) {
                if (v.address === null) return false;
                if (v.address.line1 && v.address.line1.length > 0) return true;
                if (v.address.line2 && v.address.line2.length > 0) return true;
                if (v.address.city && v.address.city.length > 0) return true;
                if (v.address.region && v.address.region.length > 0) return true;
                if (v.address.country && v.address.country.length > 0) return true;
                return false;
            };

            self.saveVendor = function () {
                if (self.inspectingCp) {
                    $log.info(self.inspectingCp, self.activeVendor[0]);
                    self.inspectingCp.vendor = self.activeVendor[0];
                    self.editVendor = false;
                } else {
                    self.updateVendor = {vendorIds: []};

                    for (var i = 0; i < self.activeVendor.length; i++) {
                        self.updateVendor.vendorIds.push(self.activeVendor[i].vendorId);
                    }
                    if (self.activeVendor.length === 1) {
                        self.updateVendor.vendor = self.activeVendor[0];
                    } else {
                        self.updateVendor.vendor = self.mergeVendor;
                    }

                    adminService.updateVendor(self.updateVendor)
                        .then(function (response) {
                            if (!response.status || response.status === 200) {
                                var newVendor = response;
                                self.vendorMessage = null;
                                self.editVendor = false;
                                commonService.getVendors()
                                    .then(function (vendors) {
                                        self.vendors = vendors.vendors;
                                        self.activeVendor = [newVendor];
                                        //todo: re-select active vendor in vendorSelect
                                        commonService.getProductsByVendor(newVendor.vendorId)
                                            .then(function (products) {
                                                self.products = products.products;
                                            });
                                    });
                            } else {
                                self.vendorMessage = 'An error occurred. Please check your entry and try again.';
                            }
                        });
                }
            };

            self.saveProduct = function () {
                if (self.inspectingCp) {
                    self.inspectingCp.product = self.activeProduct[0];
                    $log.info(self.inspectingCp, self.activeProduct[0]);
                    self.editProduct = false;
                } else {
                    self.updateProduct = {productIds: []};

                    for (var i = 0; i < self.activeProduct.length; i++) {
                        self.updateProduct.productIds.push(self.activeProduct[i].productId);
                    }
                    if (self.activeProduct.length === 1) {
                        self.updateProduct.product = self.activeProduct[0];
                        self.updateProduct.newVendorId = self.activeProduct[0].vendorId;
                    } else {
                        self.updateProduct.product = self.mergeProduct;
                        self.updateProduct.newVendorId = self.activeVendor[0].vendorId;
                    }

                    adminService.updateProduct(self.updateProduct)
                        .then(function (response) {
                            if (!response.status || response.status === 200) {
                                var newProduct = response;
                                self.productMessage = null;
                                self.editProduct = false;
                                commonService.getProductsByVendor(self.activeVendor[0].vendorId)
                                    .then(function (products) {
                                        self.products = products.products;
                                        self.activeProduct = [newProduct];
                                        //todo: re-select active vendor in vendorSelect
                                        commonService.getVersionsByProduct(newProduct.productId)
                                            .then(function (versions) {
                                                self.versions = versions;
                                            });
                                    });
                            } else {
                                self.productMessage = 'An error occurred. Please check your entry and try again.';
                            }
                        });
                }
            };
            self.saveVersion = function () {
                if (self.inspectingCp) {
                    self.inspectingCp.product.version = self.activeVersion[0].version;
                    self.inspectingCp.product.versionId = self.activeVersion[0].versionId;
                    $log.info(self.inspectingCp, self.activeVersion[0]);
                    self.editVersion = false;
                } else {
                    self.updateVersion = {versionIds: []};

                    for (var i = 0; i < self.activeVersion.length; i++) {
                        self.updateVersion.versionIds.push(self.activeVersion[i].versionId);
                    }
                    self.updateVersion.newProductId = self.activeProduct[0].productId;
                    if (self.activeVersion.length === 1) {
                        self.updateVersion.version = self.activeVersion[0];
                    } else {
                        self.updateVersion.version = self.mergeVersion;
                    }

                    adminService.updateVersion(self.updateVersion)
                        .then(function (response) {
                            if (!response.status || response.status === 200) {
                                var newVersion = response;
                                self.versionMessage = null;
                                self.editVersion = false;
                                commonService.getVersionsByProduct(self.activeProduct[0].productId)
                                    .then(function (versions) {
                                        self.versions = versions.versions;
                                        self.activeVersion = [newVersion];
                                        //todo: re-select active version in versionSelect
                                        commonService.getProductsByVersion(newVersion.versionId)
                                            .then(function (cps) {
                                                self.cps = cps;
                                            });
                                    });
                            } else {
                                self.versionMessage = 'An error occurred. Please check your entry and try again.';
                            }
                        });
                }
            };

            self.saveCP = function () {
                if (self.inspectingCp) {
                    self.editCP = false;
                } else {
                    self.updateCP = {};

                    self.updateCP.id = self.activeCP.id;
                    self.updateCP.certificationBodyId = self.activeCP.certifyingBody.id;
                    self.updateCP.practiceTypeId = self.activeCP.practiceType.id;
                    self.updateCP.productClassificationTypeId = self.activeCP.classificationType.id;
                    self.updateCP.certificationStatusId = self.activeCP.certificationStatusId;
                    self.updateCP.chplProductNumber = self.activeCP.chplProductNumber;
                    self.updateCP.reportFileLocation = self.activeCP.reportFileLocation;
                    self.updateCP.qualityManagementSystemAtt = self.activeCP.qualityManagementSystemAtt;
                    self.updateCP.acbCertificationId = self.activeCP.acbCertificationId;
                    self.updateCP.otherAcb = self.activeCP.otherAcb;
                    self.updateCP.testingLabId = self.activeCP.testingLabId;
                    self.updateCP.isChplVisible = self.activeCP.visibleOnChpl;

                    self.editCP = false;
                    $log.debug(self.updateCP);

                    adminService.updateCP(self.activeCP)
                        .then(function (response) {
                            if (!response.status || response.status === 200) {
                                self.editCP = false;
                                self.activeCP = response;
                                self.activeCP.certDate = new Date(self.activeCP.certificationDate.split(' ')[0]);
                            } else {
                                self.cpMessage = 'An error occurred. Please check your entry and try again.';
                            }
                        });
                }
            };

        }]);

    angular.module('app.admin')
        .directive('aiVpManagement', function () {
            return {
                restrict: 'E',
                replace: true,
                templateUrl: 'admin/components/vpManagement.html',
                scope: {},
                controllerAs: 'vm',
                controller: 'VpManagementController'
            };
        });
})();
