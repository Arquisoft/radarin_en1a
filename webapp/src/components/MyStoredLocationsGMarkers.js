import React from "react";
import MyGMarkers from "./MyGMarkers.js"
import {
    Marker,
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
                    {location.photo !== "./logo192.png" ?
                        <img className="popup-img" src={location.photo} alt="error loading"></img> : null}
                </div>
            </InfoWindow>
        )
    }
    render() {
        var self = this;
        return this.props.locations.map((location) => {
            if (self.distanceBetweenCoordinates(parseFloat(location.lat), parseFloat(location.lng)) < parseFloat(self.props.range)) {
                return (
                    <div>
                        <Marker

                            title={location.name}
                            key={location.pod}
                            position={{
                                lat: parseFloat(location.lat),
                                lng: parseFloat(location.lng)
                            }}
                            icon={{ // If user has a profile image we select it, otherwise we user a default one
                                url: "./logo192.png",
                                scaledSize: new window.google.maps.Size(20, 20)
                            }}
                            onClick={() => self.setState({ selected: location })}
                        />
                        {
                            this.state.selected === location ?
                                <div>{self.renderInfoView(location)}</div>
                                : null
                        }
                    </div>
                );
            }
            return null;
        });
    }
}
export default MyStoredLocationsGMarkers;