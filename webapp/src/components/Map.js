import React from "react";
import {
    GoogleMap,
    withScriptjs, //embeded js code map function
    withGoogleMap
} from "react-google-maps";

const Map = ( {lat,lng} ) => {    
    const WrappedMap = withScriptjs(withGoogleMap((props) => <GoogleMap defaultZoom={12} defaultCenter={{ lat: lat, lng: lng }}/>)); 
    return( 
        <div className="map-section">
            <WrappedMap googleMapURL = {"https://maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyDsA-n9wOmXIsXrka-BjCE7gKwuDvZ0f88"} 
                loadingElement={<div style={{ height: `100%` }} />} // Props needed for WrappedMap
                containerElement={<div style={{ height: `400px` }} />}
                mapElement={<div style={{ height: `160%` }} />}
            />
        </div> 
    );
}

export default Map;