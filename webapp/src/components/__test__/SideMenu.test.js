import React from 'react';
import ReactDOM from 'react-dom';
import SideMenu from '../SideMenu';

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
    ReactDOM.render(<SideMenu friends={friends} ></SideMenu>, div);
    
});

