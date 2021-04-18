import React from "react";
import {
    GoogleMap,
    Marker,
    Circle,
    InfoWindow
} from "@react-google-maps/api";
import mapsStyles from "./MapStyles";
import '../App.css'

const mapContainerStyle = {
    width: '99vw',
    height: '99vh',
}


/**
 * Constant storing resulting Map configuration and its behaviour
 */
class MyMap extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            range: 6000,
            selected: null
        }
        this.markers = [];

        this.options = {
            styles: mapsStyles,
            zoomControl: true,
            mapTypeControl: true,
        }

    };

    /**
     * Shows distance between user current location and a target location
     * @param {number} lat2 latitude of target location
     * @param {number} lng2 longitude of target location
     * @returns {number} distance to target location 
     */
    distanceBetweenCoordinates(lat2, lng2) {
        return window.google.maps.geometry.spherical.computeDistanceBetween(new window.google.maps.LatLng({ lat: this.props.lat, lng: this.props.lng }),
            new window.google.maps.LatLng({ lat: lat2, lng: lng2 }));
    }

    displayMarkers() {
        const self = this;
        var markerList;
        markerList = this.markers.map(marker => {
            if (self.distanceBetweenCoordinates(marker.props.lat, marker.props.lng) < parseFloat(self.range))
                return marker;
            return null;
        })
        return markerList;

    }
    // Turn string locations into google markers objects
    // createMarkers(locations)

    // Handles the change of the range slider
    handRangeChange(event) {
        this.setState({ range: event.target.value })
    }

    render() {

        return (
            <div className="map-Container">
                <div className="slider-container">
                    <input className="slider" type="range" min="1000" max="100000" step="500" value={this.state.range} onChange={this.handRangeChange.bind(this)} />
                </div>
                <GoogleMap
                    id="radarin-map"
                    mapContainerStyle={mapContainerStyle}
                    zoom={15}
                    center={{ lat: this.props.lat, lng: this.props.lng }}
                    options={this.options}
                >
                    {/* User current location marker */}
                    <Marker
                        position={{ lat: this.props.lat, lng: this.props.lng, }}
                        icon={{
                            url: this.props.myIcon,
                            scaledSize: new window.google.maps.Size(36, 36)
                        }}
                    />
                    <FriendsMarkers friends={this.props.friends} setSelected={this.setSelected} />
                    <FriendsMarkers friends={this.props.locations} setSelected={this.setSelected} />
                    {/* Visualization of range selected by the user */}
                    <Circle center={{ lat: this.props.lat, lng: this.props.lng }} radius={parseFloat(this.state.range)} />
                    {/* Only shows friends inside the range selected by the user */}
                    {this.displayMarkers()}
                </GoogleMap>
            </div>
        )
    }
}

// Another code refactoring thing done by Fran, one Saturday at 2 AM.
class FriendsMarkers extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selected: null
        }
    }
    render() {
        var self = this;
        return this.props.friends.map((friend) => {
            return (
                <div>
                    <Marker
                        key={friend.pod}
                        position={{
                            lat: parseFloat(friend.lat),
                            lng: parseFloat(friend.lng)
                        }}
                        icon={{ // If user has a profile image we select it, otherwise we user a default one
                            url: friend.photo === undefined ? "/user.png" : friend.photo,
                            scaledSize: new window.google.maps.Size(20, 20)
                        }}
                        onClick={() => self.setState({ selected: friend })}
                    />
                    {
                        this.state.selected === friend ?
                            <InfoWindow position={{ lat: parseFloat(friend.lat), lng: parseFloat(friend.lng) }}
                                onCloseClick={() => self.setState({ selected: null })} >
                                <div>
                                    {friend.name}
                                </div>
                            </InfoWindow>
                            : null
                    }
                </div>
            );
        });
    }

}
export default MyMap;