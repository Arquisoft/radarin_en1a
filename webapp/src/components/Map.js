import React from "react";
import {
    GoogleMap,
    Marker,
    Circle
} from "@react-google-maps/api";
import mapsStyles from "./MapStyles";
import '../App.css'
import MyGMarkers from './MyGMarkers.js'
import MyStoredLocationsGMarkers from './MyStoredLocationsGMarkers.js'

const mapContainerStyle = {
    width: '100vw',
    height: '100vh',
}

/**
 * Constant storing resulting Map configuration and its behaviour
 */
class MyMap extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            selected: null,
            center: { lat: this.props.lat, lng: this.props.lng },
            mapRef: null
        }

        if(window.google !== undefined){
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
        } else {
            this.options = {
                styles: mapsStyles,
                zoomControl: true,
                mapTypeControl: true
            }
        }
    }

    render() {

        return (
            <div className="map-Container">
                <GoogleMap
                    id="radarin-map"
                    onLoad={(map) => this.setState({ mapRef: map })}
                    mapContainerStyle={mapContainerStyle}
                    zoom={this.props.zoom}
                    center={this.state.center}
                    options={this.options}
                    onCenterChanged={() => this.state.mapRef !== null ? this.setState({ center: this.state.mapRef.getCenter() }) : false}
                >
                    {/* User current location marker */}
                    <Marker
                        position={{ lat: this.props.lat, lng: this.props.lng, }}
                        icon={{
                            url: this.props.myIcon,
                            scaledSize: new window.google.maps.Size(36, 36) 
                        }}
                    />
                    <MyGMarkers locations={this.props.friends} setSelected={this.setSelected} lat={this.props.lat} lng={this.props.lng} range={this.props.range} />
                    <MyStoredLocationsGMarkers locations={this.props.locations} setSelected={this.setSelected} lat={this.props.lat} lng={this.props.lng} range={this.props.range} 
                                                deleteLocation = {(location) => this.props.deleteLocation(location)}/>
                    {/* Visualization of range selected by the user */}
                    <Circle data-testid="friends-circle" center={{ lat: this.props.lat, lng: this.props.lng }} radius={parseFloat(this.props.range)} />
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
                                scaledSize:new window.google.maps.Size(20, 20) 
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
            return null;
        });
    }

}

export default MyMap;

export { MyMarkers }
