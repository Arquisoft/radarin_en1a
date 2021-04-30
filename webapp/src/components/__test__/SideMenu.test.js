import React from 'react';
import ReactDOM from 'react-dom';
import SideMenu from '../SideMenu';

it("Renders without crashing", () => {
    const div = document.createElement("div");

    ReactDOM.render(<SideMenu></SideMenu>, div);
})