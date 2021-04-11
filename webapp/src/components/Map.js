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
    console.log("Locations in Map: " + locations);
    const [selected, setSelected] = React.useState(null);
    const markers = [];
    
    const {isLoaded,loadError} = useLoadScript({
        googleMapsApiKey : process.env.REACT_APP_GOOGLE_KEY,
        libraries,
    });

    function distanceBetweenCoordinates(lat2, lng2){
        return window.google.maps.geometry.spherical.computeDistanceBetween(new window.google.maps.LatLng({lat: lat,lng: lng}),
            new window.google.maps.LatLng({lat:lat2,lng:lng2}));
    }

    if(loadError){
        console.log("Error loading map");
        return "Error loading map";
    }
    if(!isLoaded) {
        
        console.log("Error loading map");
        return "Map not loaded";
    }

    // Turn string locations into google markers
    Object.keys(locations).map((x) =>{
        var location = locations[x];
        markers.push(<Marker 
        key={location.split(",")[0]} 
        position={{
            lat: parseFloat(location.split(",")[0]), 
            lng: parseFloat(location.split(",")[1])
        }}
        icon={{
            url: '/user.png', 
            scaledSize: new window.google.maps.Size(15,15)
        }}
        onClick={() => setSelected(location)}
    />)})

    return(
        <GoogleMap 
            id="radarin-map"
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
            {selected ? (<InfoWindow key={1} position={{lat:parseFloat(selected.split(",")[0]),lng: parseFloat(selected.split(",")[1])}} onCloseClick={()=>setSelected(null)} ><div>INFO HERE</div></InfoWindow> ) : null}
        </GoogleMap>
    )
}
export default Map;