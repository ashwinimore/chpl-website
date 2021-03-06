import OrganizationPage from './organization.po';
import Hooks from '../../../utilities/hooks';
import AddressComponent from '../../../components/address/address.po';
import LoginComponent from '../../../components/login/login.po';
import UsersPage from '../../users/user.po';

let address;
let hooks;
let login;
let page;
let user;

describe('the ONC-ATL Management page', () => {
  const timestamp = Date.now();
  const websiteUrl = `http://www.example${timestamp}.com`;
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const atlAddress = {
    address: `address${timestamp}`,
    city: `city${timestamp}`,
    state: `state${timestamp}`,
    zip: `11111${timestamp}`,
    country: `country${timestamp}`,
  };

  beforeEach(async () => {
    browser.setWindowSize(1600, 1024); // demo of a bigger screen (esp. useful for screenshots)
    browser.setWindowRect(0, 0, 1600, 1024); // not sure if both are required
    page = new OrganizationPage();
    hooks = new Hooks();
    login = new LoginComponent();
    address = new AddressComponent();
    user = new UsersPage();
    await hooks.open('#/organizations/onc-atls');
  });

  it('should have at least 7 ATL organizations', () => {
    expect(page.organizationListCount()).toBeGreaterThanOrEqual(7);
  });

  it('should display ATL organizations in alphabetical order', () => {
    const atlCount = page.organizationListCount();
    let i;
    for (i = 1; i < atlCount; i += 1) {
      expect(page.organizationListValue(i - 1).getText()).toBeLessThan(page.organizationListValue(i).getText());
    }
  });

  describe('when impersonating as UL', () => {
    beforeEach(() => {
      const userID = '41';
      login.logIn('onc');
      hooks.open('#/users');
      hooks.waitForSpinnerToDisappear();
      user.impersonateUser(userID).scrollIntoView({ block: 'center', inline: 'center' });
      user.impersonateUser(userID).click();
      hooks.waitForSpinnerToDisappear();
      hooks.open('#/organizations/onc-atls');
      hooks.waitForSpinnerToDisappear();
    });

    afterEach(() => {
      login.logOut();
    });

    it('should display registered users under UL', () => {
      const atl = 'UL LLC';
      page.organizationNameButton(atl).click();
      expect(page.manageUsersPanelHeader).toBeDisplayed();
      expect(page.manageUsersPanel.getText()).toContain('Role: ROLE_ATL');
      expect(page.manageUsersPanel.getText()).toContain('Organization: UL LLC');
    });

    it('should not present the option to edit ATL details for Drummond Group', () => {
      const atl = 'Drummond Group';
      page.organizationNameButton(atl).click();
      expect(page.organizationEditButton.isDisplayed()).toBe(false);
    });

    it('should not display registered users under Drummond Group ', () => {
      const atl = 'Drummond Group';
      page.organizationNameButton(atl).click();
      expect(page.manageUsersPanelHeader.isDisplayed()).toBe(false);
    });
  });

  describe('when logged in as ONC', () => {
    beforeEach(() => {
      login.logIn('onc');
    });

    afterEach(() => {
      login.logOut();
    });

    it('should allow user to unretire and retire existing ATL', () => {
      const atl = 'CCHIT';
      const organizationType = 'ATL';
      const atlId = '2';
      hooks.open('#/organizations/onc-atls');
      hooks.waitForSpinnerToDisappear();
      page.organizationNameButton(atl).click();
      hooks.waitForSpinnerToDisappear();
      page.organizationEditButton.click();
      page.retireOrganizationCheckbox.click();
      page.organizationWebsite.setValue(websiteUrl);
      address.set(atlAddress);
      page.saveOrganizationButton.click();
      hooks.waitForSpinnerToDisappear();
      expect(page.generalInformation(organizationType, atlId).getText()).toContain('Retired: No');
      hooks.open('#/organizations/onc-atls');
      hooks.waitForSpinnerToDisappear();
      page.organizationNameButton(atl).click();
      hooks.waitForSpinnerToDisappear();
      page.organizationEditButton.click();
      page.retireOrganizationCheckbox.click();
      page.retirementDate.setValue(today);
      page.saveOrganizationButton.click();
      hooks.waitForSpinnerToDisappear();
      expect(page.generalInformation(organizationType, atlId).getText()).toContain('Retired: Yes');
    });
  });
});
