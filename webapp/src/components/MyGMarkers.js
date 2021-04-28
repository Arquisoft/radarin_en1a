import React from "react";
import {
    Marker,
    InfoWindow
} from "@react-google-maps/api";
import '../App.css'

class MyGMarkers extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selected: null
        }
    }

    /**
     * Shows distance between user current location and a target location
     * @param {number} lat2 latitude of target location
     * @param {number} lng2 longitude of target location
     * @returns {number} distance to target location 
     */
    distanceBetweenCoordinates(lat2, lng2) {
        const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng({ lat: this.props.lat, lng: this.props.lng }),
            new window.google.maps.LatLng({ lat: lat2, lng: lng2 }));
        return distance;
    }

    renderInfoView(location) {
        return (
            <InfoWindow position={{ lat: parseFloat(location.lat), lng: parseFloat(location.lng) }}
                onCloseClick={() => this.setState({ selected: null })} >
                <p>
                    {location.name}
                </p>
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
                                url: location.photo === undefined ? "/user.png" : location.photo,
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

export default MyGMarkers;