const {defineFeature, loadFeature}=require('jest-cucumber');
const auth = require('solid-auth-client');
const feature = loadFeature('./features/homepage.feature');

defineFeature(feature, test => { 

  beforeAll(async () => {
    await global.page.goto('http://localhost:3000/')
  })
  
  test('The user enters the application', ({ given, when, then }) => {

    given('Our web application either in mobile or computer', () => {
      webID = "https://radarintesten1a.inrupt.net/profile/card#me";
      username = "radarintesten1a"
      password = "Radarintest123$"
    });

    when('I enter into the application', async () => {
      await expect(page).toClick('[class="button-Login"]');
    });

    then('I view correctly the homepage', async () => {
      await expect(page).toMatch("Lets meet!");
    });
  
  });

});