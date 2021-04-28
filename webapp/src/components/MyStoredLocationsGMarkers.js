import React from "react";
import MyGMarkers from "./MyGMarkers.js"
import {
    InfoWindow
} from "@react-google-maps/api";

class MyStoredLocationsGMarkers extends MyGMarkers {

    renderInfoView(location) {
        location.selected = true;
        return (
            <InfoWindow position={{ lat: parseFloat(location.lat), lng: parseFloat(location.lng) }}
                onCloseClick={() => { this.setState({ selected: null }); location.selected = false }}>
                <div>
                    <p>{location.name}</p>
                </div>
            </InfoWindow>
        )
    }
}
export default MyStoredLocationsGMarkers;