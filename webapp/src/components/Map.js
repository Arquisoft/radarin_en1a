import React from "react";
import {
    GoogleMap,
    useLoadScript,
    Marker,
    Circle,
    InfoWindow
} from "@react-google-maps/api";
import mapsStyles from "./MapStyles";

//Libraries to be used by GoogleMaps API
const libraries = ["places", "geometry"];

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
            range: props.range,
            myIcon: props.myIcon,
            selected : null
        }
        this.markers = [];

        /**
         * Load GoogleMaps API key and used libraries
         */
        const { isLoaded, loadError } = useLoadScript({
            googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY,
            libraries,
        });

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

    friendsMapLocations(friends) {
        const map = new Map();
        for (let i = 0; i < friends.length; i++) {
            map.set(friends[i], [data[friends[i]].name.value, data[friends[i]]["vcard:hasPhoto"].value]);
        }
        return map;
    }

    async getLocations(friendsLocations) {
        friendsLocations.map((friend) => {

            var location = friend.split('profile')[0] // We have to do this because friends are saved with the full WebID (example.inrupt.net/profile/card#me)
            location = fetch(location + '/radarin/last.txt').then((x) => { //Fetch the file from the pod's storage
                if (x.status === 200)  // if the file exists, return the text
                    return x.text()
            });

            if (location != null) { //TODO: validate what we have before pushing it (it has to be two doubles separated by a comma)
                return (location)
            }

        })
    }

    async createMarkers() {

        //const locations = getLocations();
        this.friendsLocations = this.friendsMapLocations(this.state.friends);
        this.markers = [];
        var self = this;
        this.locations.map((location) => {
            return (self.markers.push(<Marker
                key={self.friendsLocations.get(location)}
                position={{
                    lat: parseFloat(location.split(",")[0]),
                    lng: parseFloat(location.split(",")[1])
                }}
                icon={{ // If user has a profile image we select it, otherwise we user a default one
                    url: location === null ? "/user.png" : (self.friendsLocations.get(location)[1] === undefined ? "/user.png" : self.friendsLocations.get(location)[1]),
                    scaledSize: new window.google.maps.Size(20, 20)
                }}
                onClick={() => this.setSelected(location)}
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

    render() {

        return <GoogleMap onchange={this.createMarkers()}
            id="radarin-map"
            mapContainerStyle={mapContainerStyle}
            zoom={12}
            center={{ lat: this.state.lat, lng: this.state.lng }}
            options={options}>
            {/* User current location marker */}
            <Marker
                position={{ lat: this.state.lat, lng: this.state.lng, }}
                icon={{
                    url: this.state.propsmyIcon,
                    scaledSize: new window.google.maps.Size(36, 36)
                }}
            />
            {/* Visualization of range selected by the user */}
            <Circle center={{ lat: this.state.lat, lng: this.state.lng }} radius={parseFloat(this.state.range)} />
            {/* Only shows friends inside the range selected by the user */}
            {this.displayMarkers()}
            {/* Show friends information when click on its marker */}
            {(this.selected && this.friendsLocations.get(this.selected)) ? (<InfoWindow position={{ lat: parseFloat(this.selected.split(",")[0]), lng: parseFloat(this.selected.split(",")[1]) }} onCloseClick={() => this.setSelected(null)} ><div>{this.friendsLocations.get(this.selected)[0]}</div></InfoWindow>) : null}
        </GoogleMap>
    }
}
export default MyMap;