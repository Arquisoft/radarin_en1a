import React from "react";
import {
    GoogleMap,
    withScriptjs, //embeded js code map function
    withGoogleMap,
    Marker,
    Circle
} from "react-google-maps";
//import mapStyles from "./mapStyles"

const Map = ( {lat,lng,locations} ) => {    
    const WrappedMap = withScriptjs(withGoogleMap((props) => 
        <GoogleMap 
            defaultZoom={10} 
            defaultCenter={{ lat: lat, lng: lng }}
        >
            {locations.forEach((loc) => (
                <Marker 
                    position={{ lat: loc.lat, lng: loc.lng }} 
                    icon = {{ 
                        url: '/user.png', 
                        scaledSize: new window.google.maps.Size(30,30) }
                    }
                />
            ))}
            <Marker
                position={{ lat: lat, lng: lng }}
                icon = {{ 
                    url: '/user.png', 
                    scaledSize: new window.google.maps.Size(30,30) }
                }
            />
            <Circle
                defaultCenter={{ lat: lat, lng: lng }}
                draggable={false}
                radius={15000}
            />
        </GoogleMap>    
    )); 
    return( 
        <div className="map-section">
            <WrappedMap googleMapURL = {`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${process.env.REACT_APP_GOOGLE_KEY}`} 
                loadingElement={<div style={{ height: `100%` }} />} 
                containerElement={<div style={{ height: `400px` }} />}
                mapElement={<div style={{ height: `160%` }} />}
            />
        </div> 
    );
}

export default Map;