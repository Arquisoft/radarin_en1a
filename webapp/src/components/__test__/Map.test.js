import React from 'react';
import ReactDOM from 'react-dom';
import GMap from '../Map';
import LMap from '../LeafletMap';
import App from '../../App';
import { LoadScript } from "@react-google-maps/api";

it("Google maps render correcty", () => {
  const div = document.createElement("div");

  ReactDOM.render(<LoadScript
    id="script-loader"
    googleMapsApiKey={process.env.REACT_APP_GOOGLE_KEY}
    libraries={["places", "geometry"]}> </LoadScript>
  ,div);
/*
    function waitForCondition(conditionObj) {
        return new Promise(resolve => {
          var start_time = Date.now();
          function checkFlag() {
            if (conditionObj.arg === conditionObj.test) {
              resolve();
            } else if (Date.now() > start_time + 20000) {
              resolve();
            } else {
              window.setTimeout(checkFlag, 1000); 
            }
          }
          checkFlag();
        });
    }

    async function run() {
        waitForCondition({arg:window.google, test:!undefined})
        ReactDOM.render(<GMap lat={45} lng={45} zoom={8}></GMap>, div);
    }

    run();
*/
    setTimeout(function() { //Making sure google maps API is loaded correctly
        ReactDOM.render(<GMap lat={45} lng={45} zoom={8}></GMap>, div);
    }, 5000);
})

it("Leaflet maps render correcty", () => {
  const div = document.createElement("div");

  ReactDOM.render(<LMap></LMap>, div);
})