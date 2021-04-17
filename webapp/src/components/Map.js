import React from "react";
import {
    GoogleMap,
    Marker,
    Circle,
    InfoWindow
} from "@react-google-maps/api";
import mapsStyles from "./MapStyles";

const auth = require('solid-auth-client');
const { default: data } = require('@solid/query-ldflex');
const fetch = auth.fetch;

const mapContainerStyle = {
    width: '68vw',
    height: '68vh',
}

// UI Options for displayed map
const options = {
    styles: mapsStyles,
    disableDefaultUI: true,
    zoomControl: true,
}


/**
 * Constant storing resulting Map configuration and its behaviour
 */
class MyMap extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            lat: props.lat,
            lng: props.lng,
            friends: props.friends,
            //range: props.range,
            myIcon: props.myIcon,
            selected: null
        }
        this.range = props.range;
        this.markers = [];
    };

    /**
     * Shows distance between user current location and a target location
     * @param {number} lat2 latitude of target location
     * @param {number} lng2 longitude of target location
     * @returns {number} distance to target location 
     */
    distanceBetweenCoordinates(lat2, lng2) {
        return window.google.maps.geometry.spherical.computeDistanceBetween(new window.google.maps.LatLng({ lat: this.state.lat, lng: this.state.lng }),
            new window.google.maps.LatLng({ lat: lat2, lng: lng2 }));
    }

    async createMarkers() {

        //const locations = getLocations();
        this.markers = [];
        var self = this;
        if (this.friends !== undefined)
            this.friends.map((friend) => {
                return (self.markers.push(<Marker
                    key={friend.pod}
                    position={{
                        lat: parseFloat(friend.location.split(",")[0]),
                        lng: parseFloat(friend.location.split(",")[1])
                    }}
                    icon={{ // If user has a profile image we select it, otherwise we user a default one
                        url: friend.photo === undefined ? "/user.png" : friend.photo,
                        scaledSize: new window.google.maps.Size(20, 20)
                    }}
                    onClick={() => this.setSelected(friend)}
                />)
                )
            })
    }


    displayMarkers() {
        const self = this;
        var markerList;
        markerList = this.markers.map(marker => {
            if (self.distanceBetweenCoordinates(marker.props.position.lat, marker.props.position.lng) < parseFloat(self.range))
                return marker;
            return null;
        })
        return markerList;

    }
    // Turn string locations into google markers objects
    // createMarkers(locations)

    // Handles the change of the range slider
    handRangeChange(event) {
        this.range = event.target.value;
    }

    render() {
        return (<div className="leaflet-container">
            <input type="range" min="4000" max="100000" step="500" value={this.range} onChange={this.handRangeChange.bind(this)} />

            <GoogleMap onchange={this.createMarkers()}
                id="radarin-map"
                mapContainerStyle={mapContainerStyle}
                zoom={12}
                center={{ lat: this.state.lat, lng: this.state.lng }}
                options={options}>
                {/* User current location marker */}
                <Marker
                    position={{ lat: this.state.lat, lng: this.state.lng, }}
                    icon={{
                        url: this.state.myIcon,
                        scaledSize: new window.google.maps.Size(36, 36)
                    }}
                />
                {/* Visualization of range selected by the user */}
                <Circle center={{ lat: this.state.lat, lng: this.state.lng }} radius={parseFloat(this.range)} />
                {/* Only shows friends inside the range selected by the user */}
                {this.displayMarkers()}
                {/* Show friends information when click on its marker */}
                {(this.selected && this.friendsLocations.get(this.selected)) ? (<InfoWindow position={{ lat: parseFloat(this.selected.split(",")[0]), lng: parseFloat(this.selected.split(",")[1]) }} onCloseClick={() => this.setSelected(null)} ><div>{this.friendsLocations.get(this.selected)[0]}</div></InfoWindow>) : null}
            </GoogleMap>
        </div>
        )
    }
}

export default MyMap;