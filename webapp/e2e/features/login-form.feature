Feature: Login as an existing user

Scenario: The user is already registered in the site
  Given An already registered user
  When I fill the data in the form and press submit
  Then I access to the home page correctly 