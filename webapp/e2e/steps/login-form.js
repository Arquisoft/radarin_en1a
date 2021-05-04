const {defineFeature, loadFeature}=require('jest-cucumber');
const auth = require('solid-auth-client');
const feature = loadFeature('./features/login-form.feature');

defineFeature(feature, test => { 
  function waitTime(time) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  beforeAll(async () => {
    await global.page.goto('http://localhost:3000/')
  })
  
  test('The user is already registered in the site', ({ given, when, then }) => {
    
    //let webID;
    //let username;
    //let password;

    given('An already registered user', () => {
      /*
      webID = "https://radarintesten1a.inrupt.net/profile/card#me";
      username = "radarintesten1a"
      password = "Radarintest123$"
      */
    });

    when('I fill the data in the form and press submit', async () => {
      /*
      // Accedemos a la ventana de inicio de sesión  
      newPagePromise = new Promise(x => page.once(auth.popupLogin, x));
      popup = await newPagePromise;
      await page.toFill('input[type="url"]', webID);
      await expect(popup).toClick('[type="submit"]');
      await waitTime(5000);
      await expect(popup).toFill('input[name="username"]', username);
      await expect(popup).toFill('input[name="password"]', password);
      await expect(popup).toClick('[id="login"]');
      await waitTime(5000);
      */
    });

    then('I access to the home page correctly', async () => {
      //await expect(page).toMatch('Store your current location:');
    });
  
  });

});