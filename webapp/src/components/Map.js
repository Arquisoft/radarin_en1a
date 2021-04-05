import React, { useState } from "react";
import {
   GoogleMap,
   useLoadScript,
   Marker,
   Circle,
   InfoWindow
} from "@react-google-maps/api";
import mapsStyles from "./MapStyles";

const libraries = ["places","geometry"];
const mapContainerStyle = {
    width: '68vw',
    height: '68vh',
}
const options = {
    styles: mapsStyles,
    disableDefaultUI: true,
    zoomControl: true,
}

const Map = ( {lat,lng,locations,range} ) => {    
    const markers = [];
    
    const {isLoaded,loadError} = useLoadScript({
        googleMapsApiKey : process.env.REACT_APP_GOOGLE_KEY,
        libraries,
    });

    function distanceBetweenCoordinates(lat2, lng2){
        return window.google.maps.geometry.spherical.computeDistanceBetween(new window.google.maps.LatLng({lat: lat,lng: lng}),
            new window.google.maps.LatLng({lat:lat2,lng:lng2}));
    }

    if(loadError) return "Error loading map";
    if(!isLoaded) return "Map not loaded";

    // Turn string locations into google markers
    locations.map((location) => markers.push(<Marker 
        key={location.split(",")[0]} 
        position={{
            lat: parseFloat(location.split(",")[0]), 
            lng: parseFloat(location.split(",")[1])
        }}
        icon={{
            url: '/user.png', 
            scaledSize: new window.google.maps.Size(15,15)
        }}
    />))

    return(
        <GoogleMap 
            mapContainerStyle={mapContainerStyle} 
            zoom={12} 
            center={{lat:lat, lng:lng}}
            options={options}>
            <Marker 
                position={{lat:lat, lng:lng,}} 
                icon={{
                    url: '/user.png', 
                    scaledSize: new window.google.maps.Size(36,36) 
                }}
            />
            <Circle center={{lat:lat, lng:lng}} radius={parseFloat(range)}/>
            {markers.map(marker => {
                    if(distanceBetweenCoordinates(marker.props.position.lat, marker.props.position.lng) < parseFloat(range)) 
                        return marker;
                })
            }
        </GoogleMap>
    )
}
export default Map;