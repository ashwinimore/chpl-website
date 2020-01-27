export const CertificationCriteriaViewComponent = {
    templateUrl: 'chpl.components/listing/details/criteria/view.html',
    bindings: {
        accessibilityStandards: '<',
        cert: '<',
        hasIcs: '<',
        isConfirming: '<',
        isEditing: '<',
        onChange: '&',
        qmsStandards: '<',
        refreshSed: '&',
        resources: '<',
        viewAll: '<',
    },
    controller: class CertificationCriteriaViewController {
        constructor ($analytics, $log, $uibModal, authService, featureFlags) {
            'ngInject'
            this.$analytics = $analytics;
            this.$log = $log;
            this.$uibModal = $uibModal;
            this.hasAnyRole = authService.hasAnyRole;
            this.isOn = featureFlags.isOn;
        }

        $onChanges (changes) {
            if (changes.cert) {
                this.cert = angular.copy(changes.cert.currentValue);
            }
            if (changes.resources) {
                this.resources = angular.copy(changes.resources.currentValue);
            }
        }

        canEdit () {
            return this.isEditing // in editing mode
                && (this.cert.success // can always remove success
                    || this.hasAnyRole(['ROLE_ADMIN', 'ROLE_ONC']) // can always edit
                    || !this.cert.criterion.removed // ROLE_ACB can only edit when not removed criteria
                    || !this.isOn('effective-rule-date-plus-one-week')); // unless it's the grace period right after RED
        }

        editCert () {
            var backupCert = angular.copy(this.cert);
            const cert = this.cert;
            const hasIcs = this.hasIcs;
            const resources = this.resources;
            const isConfirming = this.isConfirming;
            this.editUibModalInstance = this.$uibModal.open({
                component: 'chplCertificationCriteriaEdit',
                animation: false,
                backdrop: 'static',
                keyboard: false,
                size: 'lg',
                resolve: {
                    cert: () => cert,
                    hasIcs: () => hasIcs,
                    isConfirming: () => isConfirming,
                    resources: () => resources,
                },
            });
            this.editUibModalInstance.result.then(response => {
                this.cert = response;
                this.onChange({cert: this.cert});
                this.refreshSed();
            }, () => {
                this.cert = angular.copy(backupCert);
            });
        }

        hasPhantomData () {
            var ret =
                (this.cert.additionalSoftware && this.cert.additionalSoftware.length > 0) ||
                (this.cert.apiDocumentation && this.cert.apiDocumentation.length > 0) ||
                (this.cert.gap) ||
                (this.cert.privacySecurityFramework && this.cert.privacySecurityFramework.length > 0) ||
                (this.cert.sed) ||
                (this.cert.testDataUsed && this.cert.testDataUsed.length > 0) ||
                (this.cert.testFunctionality && this.cert.testFunctionality.length > 0) ||
                (this.cert.testProcedures && this.cert.testProcedures.length > 0) ||
                (this.cert.testStandards && this.cert.testStandards.length > 0) ||
                (this.cert.testToolsUsed && this.cert.testToolsUsed.length > 0) ||
                false;
            return ret;
        }

        showViewDetailsLink () {
            return (this.cert.success && this.cert.additionalSoftware !== null) ||
                ((!this.cert.success) &&
                 ((this.cert.g1MacraMeasures && this.cert.g1MacraMeasures.length > 0) ||
                  (this.cert.g2MacraMeasures && this.cert.g2MacraMeasures.length > 0)) ||
                 this.cert.g1Success !== null ||
                 this.cert.g2Success !== null);
        }

        toggleCriteria () {
            if (!this.showDetails) {
                this.$analytics.eventTrack('Viewed criteria details', { category: 'Listing Details', label: this.cert.criterion.number });
            }
            this.showDetails = !this.showDetails
        }
    },
}

angular.module('chpl.components')
    .component('chplCertificationCriteria', CertificationCriteriaViewComponent);