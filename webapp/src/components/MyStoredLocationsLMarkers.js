import React from "react";
import { Point, Icon } from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import MyLMarkers from "./MyLMarkers.js"

export default class MyStoredLocationsLMarkers extends MyLMarkers {

    render() {
        return this.props.locations.map(
            (location) => {
                if (this.distanceTo(parseFloat(location.lat), parseFloat(location.lng)) < this.props.range) {
                    return (
                        <Marker position={[location.lat, location.lng]} icon={new Icon({
                            iconUrl: "./logo192.png",
                            iconSize: new Point(20, 20),
                        })}>
                            <Popup>
                                <p>{location.name}</p>
                                {location.photo !== "./logo192.png" ?
                                    <img className="popup-img" src={location.photo} alt="error loading"></img> : null}
                            </Popup>
                        </Marker>
                    )
                }
                else {
                    return null;
                }
            }
        )
    }
}