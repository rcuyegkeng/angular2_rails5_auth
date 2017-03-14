import { AngularTokenAuthPage } from './app.po';

describe('angular-token-auth App', () => {
  let page: AngularTokenAuthPage;

  beforeEach(() => {
    page = new AngularTokenAuthPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
