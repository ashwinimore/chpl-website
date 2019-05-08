export const ReportsComponent = {
    templateUrl: 'chpl.admin/components/reports/reports.html',
    bindings: {
        workType: '<',
        productId: '<',
    },
    controller: class ReportsController {
        constructor ($filter, $log, $uibModal, ReportService, networkService, utilService) {
            'ngInject'
            this.$filter = $filter;
            this.$log = $log;
            this.$uibModal = $uibModal;
            this.ReportService = ReportService;
            this.networkService = networkService;
            this.utilService = utilService;
        }

        $onInit () {
            this.tab = 'cp';
            this.activityRange = { range: 30 };
            var start = new Date();
            var end = new Date();
            start.setDate(end.getDate() - this.activityRange.range + 1); // offset to account for inclusion of endDate in range
            this.activityRange.product = {
                startDate: angular.copy(start),
                endDate: angular.copy(end),
            };
            this.activityRange.acb = {
                startDate: angular.copy(start),
                endDate: angular.copy(end),
            };
            this.activityRange.atl = {
                startDate: angular.copy(start),
                endDate: angular.copy(end),
            };
            this.activityRange.announcement = {
                startDate: angular.copy(start),
                endDate: angular.copy(end),
            };
            this.activityRange.userActivity = {
                startDate: angular.copy(start),
                endDate: angular.copy(end),
            };
            this.activityRange.api_key = {
                startDate: angular.copy(start),
                endDate: angular.copy(end),
            };
            this.apiKey = {
                visiblePage: 1,
                pageSize: 100,
                startDate: angular.copy(this.activityRange.startDate),
                endDate: angular.copy(this.activityRange.endDate),
            };
            this.refreshActivity();
            this.filename = 'Reports_' + new Date().getTime() + '.csv';
        }

        $onChanges (changes) {
            if (!changes.workType.isFirstChange()) {
                let causeRefresh = false;
                if (changes.workType) {
                    this.workType = angular.copy(changes.workType.currentValue);
                    causeRefresh = true;
                }
                if (changes.productId) {
                    this.productId = angular.copy(changes.productId.currentValue);
                    causeRefresh = true;
                }
                if (causeRefresh) {
                    this.refreshActivity();
                }
            }
        }

        ////////////////////////////////////////////////////////////////////
        // Functions

        refreshActivity () {
            switch (this.workType) {
            case 'prod':
                this.refreshProduct();
                break;
            case 'acb':
                this.refreshAcb();
                break;
            case 'atl':
                this.refreshAtl();
                break;
            case 'announcement':
                this.refreshAnnouncement();
                break;
            case 'users':
                this.refreshUser();
                break;
            case 'api_key_management':
                this.refreshApi();
                break;
            case 'api_key_usage':
                this.refreshApiKeyUsage();
                break;
                // no default
            }
        }

        refreshProduct () {
            let ctrl = this;
            this.networkService.getProductActivity(this.dateAdjust(this.activityRange.product))
                .then(function (data) {
                    ctrl.searchedProducts = ctrl.interpretProducts(data);
                    ctrl.displayedProducts = [].concat(ctrl.searchedProducts);
                });
            this.networkService.getVersionActivity(this.dateAdjust(this.activityRange.product))
                .then(function (data) {
                    ctrl.searchedVersions = ctrl.interpretVersions(data);
                    ctrl.displayedVersions = [].concat(ctrl.searchedVersions);
                });
        }

        refreshAcb () {
            let ctrl = this;
            this.networkService.getAcbActivity(this.dateAdjust(this.activityRange.acb))
                .then(function (data) {
                    ctrl.searchedACBs = ctrl.interpretAcbs(data);
                    ctrl.displayedACBs = [].concat(ctrl.searchedACBs);
                });
        }

        refreshAtl () {
            let ctrl = this;
            this.networkService.getAtlActivity(this.dateAdjust(this.activityRange.atl))
                .then(function (data) {
                    ctrl.searchedATLs = ctrl.interpretAtls(data);
                    ctrl.displayedATLs = [].concat(ctrl.searchedATLs);
                });
        }

        refreshAnnouncement () {
            let ctrl = this;
            this.networkService.getAnnouncementActivity(this.dateAdjust(this.activityRange.announcement))
                .then(function (data) {
                    ctrl.searchedAnnouncements = ctrl.interpretAnnouncements(data);
                    ctrl.displayedAnnouncements = [].concat(ctrl.searchedAnnouncements);
                });
        }

        refreshUser () {
            let ctrl = this;
            this.networkService.getUserActivity(this.dateAdjust(this.activityRange.userActivity))
                .then(function (data) {
                    ctrl.searchedUsers = ctrl.interpretUsers(data);
                    ctrl.displayedUsers = [].concat(ctrl.searchedUsers);
                });
            this.networkService.getUserActivities(this.dateAdjust(this.activityRange.userActivity))
                .then(function (data) {
                    ctrl.searchedUserActivities = ctrl.interpretUserActivities(data);
                    ctrl.displayedUserActivities = [].concat(ctrl.searchedUserActivities);
                });
        }

        refreshApi () {
            let ctrl = this;
            this.networkService.getApiUserActivity(this.dateAdjust(this.activityRange.api_key))
                .then(function (data) {
                    ctrl.searchedApiActivity = data;
                    ctrl.displayedApiActivity = [].concat(ctrl.searchedApiActivity);
                });
        }

        refreshApiKeyUsage () {
            if (!this.apiKeys) {
                this.loadApiKeys();
            }
            let ctrl = this;
            this.apiKey.pageNumber = this.apiKey.visiblePage - 1;
            this.networkService.getApiActivity(this.dateAdjust(this.apiKey))
                .then(function (data) {
                    ctrl.searchedApi = data;
                });
        }

        clearApiKeyFilter () {
            this.apiKey = {
                visiblePage: 1,
                pageSize: 100,
                startDate: angular.copy(this.activityRange.startDate),
                endDate: angular.copy(this.activityRange.endDate),
            };
        }

        compareSurveillances (oldS, newS) {
            this.modalInstance = this.$uibModal.open({
                templateUrl: 'chpl.admin/components/reports/compareSurveillanceRequirements.html',
                controller: 'CompareSurveillanceRequirementsController',
                controllerAs: 'vm',
                animation: false,
                backdrop: 'static',
                keyboard: false,
                resolve: {
                    newSurveillance: function () { return newS; },
                    oldSurveillance: function () { return oldS; },
                },
                size: 'lg',
            });
        }

        loadApiKeys () {
            let ctrl = this;
            this.networkService.getApiUsers()
                .then(result => ctrl.apiKeys = result);
        }

        validDates (key) {
            var utcEnd = Date.UTC(
                this.activityRange[key].endDate.getFullYear(),
                this.activityRange[key].endDate.getMonth(),
                this.activityRange[key].endDate.getDate()
            );
            var utcStart = Date.UTC(
                this.activityRange[key].startDate.getFullYear(),
                this.activityRange[key].startDate.getMonth(),
                this.activityRange[key].startDate.getDate()
            );
            var diffDays = Math.floor((utcEnd - utcStart) / (1000 * 60 * 60 * 24));
            if (key === 'listing' && this.productId) {
                return (utcStart < utcEnd);
            }
            return (0 <= diffDays && diffDays < this.activityRange.range);
        }

        ////////////////////////////////////////////////////////////////////
        // Helper functions

        interpretProducts (data) {
            var ret = [];
            var change;

            var i, j;
            for (i = 0; i < data.length; i++) {
                var activity = {
                    id: data[i].id,
                    product: data[i].newData.name,
                    responsibleUser: this.getResponsibleUser(data[i].responsibleUser),
                    date: data[i].activityDate,
                };
                if (data[i].developer) {
                    activity.developer = data[i].developer.name;
                } else {
                    activity.developer = '';
                }
                activity.friendlyActivityDate = new Date(activity.date).toISOString().substring(0, 10)
                var wasChanged = false;
                if (data[i].originalData && !angular.isArray(data[i].originalData) && data[i].newData) { // both exist, originalData not an array: update
                    activity.name = data[i].newData.name;
                    activity.action = 'Update:<ul>';
                    change = this.compareItem(data[i].originalData, data[i].newData, 'name', 'Name');
                    if (change) {
                        activity.action += '<li>' + change + '</li>';
                        wasChanged = true;
                    }
                    change = this.compareItem(data[i].originalData, data[i].newData, 'developerName', 'Developer');
                    if (change) {
                        activity.action += '<li>' + change + '</li>';
                        wasChanged = true;
                    }
                    var contactChanges = this.compareContact(data[i].originalData.contact, data[i].newData.contact);
                    if (contactChanges && contactChanges.length > 0) {
                        activity.action += '<li>Contact changes<ul>' + contactChanges.join('') + '</ul></li>';
                        wasChanged = true;
                    }
                    if (!angular.equals(data[i].originalData.ownerHistory, data[i].newData.ownerHistory)) {
                        var action = '<li>Owner history changed. Was:<ul>';
                        if (data[i].originalData.ownerHistory.length === 0) {
                            action += '<li>No previous history</li>';
                        } else {
                            for (j = 0; j < data[i].originalData.ownerHistory.length; j++) {
                                action += '<li><strong>' + data[i].originalData.ownerHistory[j].developer.name + '</strong> on ' + this.$filter('date')(data[i].originalData.ownerHistory[j].transferDate,'mediumDate','UTC') + '</li>';
                            }
                        }
                        action += '</ul>Now:<ul>';
                        if (data[i].newData.ownerHistory.length === 0) {
                            action += '<li>No new history</li>';
                        } else {
                            for (j = 0; j < data[i].newData.ownerHistory.length; j++) {
                                action += '<li><strong>' + data[i].newData.ownerHistory[j].developer.name + '</strong> on ' + this.$filter('date')(data[i].newData.ownerHistory[j].transferDate,'mediumDate','UTC') + '</li>';
                            }
                        }
                        action += '</ul></li>';
                        activity.action += action;
                        wasChanged = true;
                    }
                    activity.action += '</ul>';
                } else {
                    this.interpretNonUpdate(activity, data[i], 'product');
                    wasChanged = true;
                }
                if (wasChanged) {
                    ret.push(activity);
                }
            }
            return ret;
        }

        interpretVersions (data) {
            var ret = [];
            var change;

            for (var i = 0; i < data.length; i++) {
                var activity = {date: data[i].activityDate};
                if (data[i].originalData && !angular.isArray(data[i].originalData) && data[i].newData) { // both exist, originalData not an array: update
                    activity.product = data[i].newData.productName;
                    activity.name = data[i].newData.version;
                    activity.action = 'Update:<ul>';
                    change = this.compareItem(data[i].originalData, data[i].newData, 'version', 'Version');
                    if (change) { activity.action += '<li>' + change + '</li>'; }
                    change = this.compareItem(data[i].originalData, data[i].newData, 'productName', 'Associated Product');
                    if (change) { activity.action += '<li>' + change + '</li>'; }
                    activity.action += '</ul>';
                } else {
                    if (data[i].newData) {
                        activity.product = data[i].newData.productName;
                    } else if (data[i].originalData) {
                        activity.product = data[i].originalData.productName;
                    }
                    this.interpretNonUpdate(activity, data[i], 'version', 'version');
                }
                ret.push(activity);
            }
            return ret;
        }

        interpretAcbs (data) {
            var ret = [];
            var change;

            for (var i = 0; i < data.length; i++) {
                var activity = {date: data[i].activityDate};
                if (data[i].originalData && !angular.isArray(data[i].originalData) && data[i].newData) { // both exist, originalData not an array: update
                    activity.name = data[i].newData.name;
                    if (data[i].originalData.deleted !== data[i].newData.deleted) {
                        activity.action = data[i].newData.deleted ? 'ACB was deleted' : 'ACB was restored';
                    } else {
                        activity.action = 'Update:<ul>';
                        change = this.compareItem(data[i].originalData, data[i].newData, 'name', 'Name');
                        if (change) { activity.action += '<li>' + change + '</li>'; }
                        change = this.compareItem(data[i].originalData, data[i].newData, 'website', 'Website');
                        if (change) { activity.action += '<li>' + change + '</li>'; }
                        change = this.compareAddress(data[i].originalData.address, data[i].newData.address);
                        if (change && change.length > 0) {
                            activity.action += '<li>Address changes<ul>' + change.join('') + '</ul></li>';
                        }
                        activity.action += '</ul>';
                    }
                } else {
                    this.interpretNonUpdate(activity, data[i], 'ACB');
                }
                ret.push(activity);
            }
            return ret;
        }

        interpretAtls (data) {
            var ret = [];
            var change;

            for (var i = 0; i < data.length; i++) {
                var activity = {date: data[i].activityDate};
                if (data[i].originalData && !angular.isArray(data[i].originalData) && data[i].newData) { // both exist, originalData not an array: update
                    activity.name = data[i].newData.name;
                    if (data[i].originalData.deleted !== data[i].newData.deleted) {
                        activity.action = data[i].newData.deleted ? 'ONC-ATL was deleted' : 'ONC-ATL was restored';
                    } else {
                        activity.action = 'Update:<ul>';
                        change = this.compareItem(data[i].originalData, data[i].newData, 'name', 'Name');
                        if (change) { activity.action += '<li>' + change + '</li>'; }
                        change = this.compareItem(data[i].originalData, data[i].newData, 'website', 'Website');
                        if (change) { activity.action += '<li>' + change + '</li>'; }
                        change = this.compareAddress(data[i].originalData.address, data[i].newData.address);
                        if (change && change.length > 0) {
                            activity.action += '<li>Address changes<ul>' + change.join('') + '</ul></li>';
                        }
                        activity.action += '</ul>';
                    }
                } else {
                    this.interpretNonUpdate(activity, data[i], 'ONC-ATL');
                }
                ret.push(activity);
            }
            return ret;
        }

        interpretAnnouncements (data) {
            var ret = data;
            return ret;
        }

        interpretUsers (data) {
            var ret = data;
            return ret;
        }

        interpretUserActivities (data) {
            var ret = data;
            return ret;
        }

        interpretNonUpdate (activity, data, text, key) {
            if (!key) { key = 'name'; }
            if (data.originalData && !data.newData) { // no new data: deleted
                activity.name = data.originalData[key];
                activity.action = ['"' + activity.name + '" has been deleted'];
            }
            if (!data.originalData && data.newData) { // no old data: created
                activity.name = data.newData[key];
                activity.action = ['"' + activity.name + '" has been created'];
            }
            if (data.originalData && data.originalData.length > 1 && data.newData) { // both exist, more than one originalData: merge
                activity.name = data.newData[key];
                activity.action = ['Merged ' + data.originalData.length + ' ' + text + 's to form ' + text + ': "' + activity.name + '"'];
            }
        }

        compareAddress (prev, curr) {
            var simpleFields = [
                {key: 'streetLineOne', display: 'Street Line 1'},
                {key: 'streetLineTwo', display: 'Street Line 2'},
                {key: 'city', display: 'City'},
                {key: 'state', display: 'State'},
                {key: 'zipcode', display: 'Zipcode'},
                {key: 'country', display: 'Country'},
            ];
            return this.compareObject(prev, curr, simpleFields);
        }

        compareContact (prev, curr) {
            var simpleFields = [
                {key: 'fullName', display: 'Full Name'},
                {key: 'friendlyName', display: 'Friendly Name'},
                {key: 'phoneNumber', display: 'Phone Number'},
                {key: 'title', display: 'Title'},
                {key: 'email', display: 'Email'},
            ];
            return this.compareObject(prev, curr, simpleFields);
        }

        compareObject (prev, curr, fields) {
            var ret = [];
            var change;

            for (var i = 0; i < fields.length; i++) {
                change = this.compareItem(prev, curr, fields[i].key, fields[i].display, fields[i].filter);
                if (change) { ret.push('<li>' + change + '</li>'); }
            }
            return ret;
        }

        analyzeAddress (activity, data) {
            if (data.originalData.address !== data.newData.address) {
                var change;
                activity.action += '<li>Address changes<ul>';
                change = this.compareAddress(data.originalData.address, data.newData.address);
                if (change && change.length > 0) {
                    activity.action += change.join('');
                }
                activity.action += '</ul></li>';
            }
        }

        compareArray (prev, curr, keys, root, nested, altRoot) {
            var ret = [];
            var change, i, j, k, l;
            if (prev !== null) {
                for (i = 0; i < prev.length; i++) {
                    for (j = 0; j < curr.length; j++) {
                        var obj = { name: curr[j][altRoot ? altRoot : root], changes: [] };
                        if (prev[i][root] === curr[j][root]) {
                            for (k = 0; k < keys.length; k++) {
                                change = this.compareItem(prev[i], curr[j], keys[k].key, keys[k].display);
                                if (change) { obj.changes.push('<li>' + change + '</li>'); }
                            }
                            if (nested) {
                                for (k = 0; k < nested.length; k++) {
                                    nested[k].changes = this.utilService.arrayCompare(prev[i][nested[k].key],curr[j][nested[k].key],nested[k].compareId);
                                    if (nested[k].changes.added.length > 0) {
                                        if (nested[k].countOnly) { obj.changes.push('<li>Added ' + nested[k].changes.added.length + ' ' + nested[k].display + (nested[k].changes.added.length !== 1 ? 's' : '') + '</li>') }
                                        else {
                                            obj.changes.push('<li>Added ' + nested[k].display + ':<ul>');
                                            for (l = 0; l < nested[k].changes.added.length; l++) {
                                                obj.changes.push('<li>' + nested[k].changes.added[l][nested[k].value] + '</li>');
                                            }
                                            obj.changes.push('</ul></li>');
                                        }
                                    }
                                    if (nested[k].changes.removed.length > 0) {
                                        if (nested[k].countOnly) { obj.changes.push('<li>Removed ' + nested[k].changes.removed.length + ' ' + nested[k].display + (nested[k].changes.removed.length !== 1 ? 's' : '') + '</li>') }
                                        else {
                                            obj.changes.push('<li>Removed ' + nested[k].display + ':<ul>');
                                            for (l = 0; l < nested[k].changes.removed.length; l++) {
                                                obj.changes.push('<li>' + nested[k].changes.removed[l][nested[k].value] + '</li>');
                                            }
                                            obj.changes.push('</ul></li>');
                                        }
                                    }
                                }
                            }
                            prev[i].evaluated = true;
                            curr[j].evaluated = true;
                        }
                        if (obj.changes.length > 0) {
                            ret.push(obj);
                        }
                    }
                    if (!prev[i].evaluated) {
                        ret.push({ name: prev[i][altRoot ? altRoot : root], changes: ['<li>' + prev[i][altRoot ? altRoot : root] + ' removed</li>']});
                    }
                }
                for (i = 0; i < curr.length; i++) {
                    if (!curr[i].evaluated) {
                        ret.push({ name: curr[i][altRoot ? altRoot : root], changes: ['<li>' + curr[i][altRoot ? altRoot : root] + ' added</li>']});
                    }
                }
            }
            return ret;
        }

        compareItem (oldData, newData, key, display, filter) {
            if (oldData && oldData[key] && newData && newData[key] && oldData[key] !== newData[key]) {
                if (filter) {
                    return display + ' changed from ' + this.$filter(filter)(oldData[key],'mediumDate','UTC') + ' to ' + this.$filter(filter)(newData[key],'mediumDate','UTC');
                } else {
                    return display + ' changed from ' + oldData[key] + ' to ' + newData[key];
                }
            }
            if ((!oldData || !oldData[key]) && newData && newData[key]) {
                if (filter) {
                    return display + ' added: ' + this.$filter(filter)(newData[key],'mediumDate','UTC');
                } else {
                    return display + ' added: ' + newData[key];
                }
            }
            if (oldData && oldData[key] && (!newData || !newData[key])) {
                if (filter) {
                    return display + ' removed. Was: ' + this.$filter(filter)(oldData[key],'mediumDate','UTC');
                } else {
                    return display + ' removed. Was: ' + oldData[key];
                }
            }
        }

        nestedCompare (oldData, newData, key, subkey, display, filter) {
            return this.compareItem(oldData[key], newData[key], subkey, display, filter);
        }

        dateAdjust (obj) {
            var ret = angular.copy(obj);
            ret.startDate = this.coerceToMidnight(ret.startDate);
            ret.endDate = this.coerceToMidnight(ret.endDate, true);
            return ret;
        }

        coerceToMidnight (date, roundUp) {
            if (date) {
                date.setHours(0,0,0,0);
                if (roundUp) {
                    date.setDate(date.getDate() + 1);
                }
                return date;
            }
        }

        getResponsibleUser (user) {
            return user.fullName;
        }
    },
}

angular.module('chpl.admin')
    .component('aiReports', ReportsComponent);