import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import ReactDOM from 'react-dom';
import SideMenu from '../SideMenu';

// declare which API requests to mock
const server = setupServer(
  // capture "GET /link" requests
  rest.get('https://uo264270.inrupt.net/radarin/stored_locations.json', (req, res, ctx) => {
    // respond using a mocked JSON body
    return res(ctx.json({"lat":43.368448,"lng":-5.8327040000000006,"name":"Ovi","photo":"./logo192.png"}))
  })
);

it("Renders without crashing", () => {
    const div = document.createElement("div");

    ReactDOM.render(<SideMenu></SideMenu>, div);
});

test("Shows the friends list", () => {
    const div = document.createElement("div");
    let friend = {
        name : "Juan"
    };
    let friends = {friend}; 
    render(<SideMenu friends={friends} ></SideMenu>, div);
    // Opens the menu
    fireEvent.click(screen.getByTestId("ShowMenu"));
});

test("Shows the locations list", () => {
    const div = document.createElement("div");
    render(<SideMenu></SideMenu>, div);
    // Opens the menu
    fireEvent.click(screen.getByTestId("ShowMenu"));
});


test("Shows the log in button", () => {
    const div = document.createElement("div");
    render(<SideMenu></SideMenu>, div);
    // Opens the menu
    fireEvent.click(screen.getByTestId("ShowMenu"));
    expect(screen.getAllByRole('button')[0]).toHaveTextContent("Log in");
});
