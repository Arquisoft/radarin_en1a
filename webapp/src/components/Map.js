import React from "react";
import {
   GoogleMap,
   useLoadScript,
   Marker,
   Circle
} from "@react-google-maps/api";
import mapsStyles from "./MapStyles";

const libraries = ["places"];
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
    const {isLoaded,loadError} = useLoadScript({
        googleMapsApiKey : process.env.REACT_APP_GOOGLE_KEY,
        libraries,
    });

    if(loadError) return "Error loading map";
    if(!isLoaded) return "Map not loaded";

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
            {locations.map(marker => 
                <Marker 
                    key={marker.split(",")[0]} 
                    position={{
                        lat: parseFloat(marker.split(",")[0]), 
                        lng: parseFloat(marker.split(",")[1])
                    }}
                    icon={{
                        url: '/user.png', 
                        scaledSize: new window.google.maps.Size(15,15) 
                    }}
                />)
            }
        </GoogleMap>
    )
}

export default Map;