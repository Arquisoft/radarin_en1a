import React from 'react';
import ReactDOM from 'react-dom';
import App from '../../App';
import Adapter from 'enzyme-adapter-react-16';
import { shallow, configure } from 'enzyme';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import MyMap, { MyMarkers } from '../Map';
import { LoadScript } from "@react-google-maps/api";

configure({adapter: new Adapter()});
let lat = 43.361522, lng = -5.850836;

let friends = [{pod:"Usuario 1",lat:43.361358,lng:-5.856326}, //Closed ones
    {pod:"Usuario 2",lat:43.364229,lng:-5.844903},
    {pod:"Usuario 3",lat:43.358550,lng:-5.847222},
    {pod:"Usuario 4",lat:43.570939,lng:-5.741263}, //Far one
]

it("Friends count testing", () => {
    window.open = () => {};
    const div = document.createElement("div");

    ReactDOM.render(<LoadScript
        id="script-loader"
        googleMapsApiKey={process.env.REACT_APP_GOOGLE_KEY}
        libraries={["places", "geometry"]}> </LoadScript>
    ,div);

    setTimeout(function() { //Making sure google maps API is loaded correctly
        const application = shallow(<App></App>);
        const map = shallow(<MyMap lat={lat} lng={lng} friends={friends}></MyMap>)
        application.setState({ currentLat: lat, currentLng:lng, friends: friends });
        expect(map.find(MyMarkers).length).toBe(3); //3 markers visible
    }, 5000);
});