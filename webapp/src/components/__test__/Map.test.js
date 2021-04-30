import React from 'react';
import ReactDOM from 'react-dom';
import GMap from '../Map';
import LMap from '../LeafletMap';
import { LoadScript } from "@react-google-maps/api"
import App from '../../App';

it("Google maps render correcty", () => {
    const div = document.createElement("div");
        
    ReactDOM.render(<GMap></GMap>, div);
})

it("Leaflet maps render correcty", () => {
    const div = document.createElement("div");

    ReactDOM.render(<LMap></LMap>, div);
})