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
            selected: null,
            lat: this.props.lat,
            lng: this.props.lng
        }

        this.options = {
            styles: mapsStyles,
            zoomControl: true,
            mapTypeControl: true,
            mapTypeControlOptions: {
                position: window.google.maps.ControlPosition.TOP_CENTER,
                style: window.google.maps.MapTypeControlStyle.DROPDOWN_MENU,
                //Default layer styles, if some layer must be removed delete it from here 
                mapTypeIds: [window.google.maps.MapTypeId.HYBRID, window.google.maps.MapTypeId.ROADMAP,
                window.google.maps.MapTypeId.SATELLITE, window.google.maps.MapTypeId.TERRAIN]
            }
        }
    };

    render() {

        return (
            <div className="map-Container">
                <GoogleMap
                    id="radarin-map"
                    mapContainerStyle={mapContainerStyle}
                    zoom={15}
                    center={{ lat: this.state.lat, lng: this.state.lng }}
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
                    <MyMarkers friends={this.props.friends} setSelected={this.setSelected} lat={this.props.lat} lng={this.props.lng} range={this.props.range} />
                    <MyMarkers friends={this.props.locations} setSelected={this.setSelected} range = {Number.MAX_VALUE}/>
                    {/* Visualization of range selected by the user */}
                    <Circle center={{ lat: this.props.lat, lng: this.props.lng }} radius={parseFloat(this.props.range)} />
                </GoogleMap>
            </div>
        )
    }
}

// Another code refactoring thing done by Fran, one Saturday at 2 AM.
class MyMarkers extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selected: null,
            lat: parseFloat(this.props.lat),
            lng: parseFloat(this.props.lng)
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
            new window.google.maps.LatLng({ lat: this.state.lat, lng: this.state.lng }),
            new window.google.maps.LatLng({ lat: lat2, lng: lng2 }));
        return distance;
    }

    render() {
        var self = this;
        return this.props.friends.map((friend) => {
            if (self.distanceBetweenCoordinates(parseFloat(friend.lat), parseFloat(friend.lng)) < parseFloat(self.props.range)) {
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
            }
        });
    }

}
export default MyMap;