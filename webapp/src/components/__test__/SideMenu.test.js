import React from 'react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import ReactDOM from 'react-dom';
import SideMenu from '../SideMenu';

// declare which API requests to mock
const server = setupServer(
  // capture "GET /greeting" requests
  rest.get('https://uo264270.inrupt.net/radarin/stored_locations.json', (req, res, ctx) => {
    // respond using a mocked JSON body
    return res(ctx.json({"lat":43.368448,"lng":-5.8327040000000006,"name":"Ovi","photo":"./logo192.png"}))
  })
)

it("Renders without crashing", () => {
    const div = document.createElement("div");

    ReactDOM.render(<SideMenu></SideMenu>, div);

});

test("Shows the locations list", () => {
    const div = document.createElement("div");
    let friend = {
        name : "Juan"
    };
    let friends = {friend}; 
    ReactDOM.render(<SideMenu friends={friends} ></SideMenu>, div);
    
});



