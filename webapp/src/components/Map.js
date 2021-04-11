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
const MyMap = ({ lat, lng, locations, range, friendsNames, friendsPhotos, myIcon}) => {
    const [selected, setSelected] = React.useState(null);
    const markers = [];

    /**
     * Load GoogleMaps API key and used libraries
     */
    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.REACT_APP_GOOGLE_KEY,
        libraries,
    });

    /**
     * Shows distance between user current location and a target location
     * @param {number} lat2 latitude of target location
     * @param {number} lng2 longitude of target location
     * @returns {number} distance to target location 
     */
    function distanceBetweenCoordinates(lat2, lng2) {
        return window.google.maps.geometry.spherical.computeDistanceBetween(new window.google.maps.LatLng({ lat: lat, lng: lng }),
            new window.google.maps.LatLng({ lat: lat2, lng: lng2 }));
    }

    // Prompts if error detected while loading map
    if (loadError) return "Error loading map";
    if (!isLoaded) return "Map not loaded";

    /**
     * Map associating locations with user's last location, their names and profile photos
     * @param {String[]} locations 
     * @param {String[]} friendsNames 
     * @param {String[]} friendsPhotos 
     * @returns {Map<String,String[]>}
     */
    const friendsMapLocations = (locations, friendsNames, friendsPhotos) => {
        const map = new Map();
        for (let i = 0; i < locations.length; i++) {
            map.set(locations[i], [friendsNames[i], friendsPhotos[i]]);
        }
        return map;
    }

    /**
     * Map storing friends locations ( Key: userLocation, Values: [userName,userPhoto] )
     */
    const friendsLocations = friendsMapLocations(locations, friendsNames, friendsPhotos);

    // Turn string locations into google markers objects
        locations.map((location) => {
            markers.push(<Marker
                key={friendsLocations.get(location)}
                position={{
                    lat: parseFloat(location.split(",")[0]),
                    lng: parseFloat(location.split(",")[1])
                }}
                icon={{ // If user has a profile image we select it, otherwise we user a default one
                    url: location === null ? "/user.png" : ( friendsLocations.get(location)[1] === undefined? "/user.png" : friendsLocations.get(location)[1] ),
                    scaledSize: new window.google.maps.Size(20, 20)
                }}
                onClick={() => setSelected(location)}
            />)
        })
    return (
        <GoogleMap
            id="radarin-map"
            mapContainerStyle={mapContainerStyle}
            zoom={12}
            center={{ lat: lat, lng: lng }}
            options={options}>
            {/* User current location marker */}
            <Marker
                position={{ lat: lat, lng: lng, }}
                icon={{
                    url: myIcon,
                    scaledSize: new window.google.maps.Size(36, 36)
                }}
            />
            {/* Visualization of range selected by the user */}
            <Circle center={{ lat: lat, lng: lng }} radius={parseFloat(range)} />
            {/* Only shows friends inside the range selected by the user */}
            {markers.map(marker => {
                if (distanceBetweenCoordinates(marker.props.position.lat, marker.props.position.lng) < parseFloat(range))
                    return marker;
                return null;
            })
            }
            {/* Show friends information when click on its marker */}
            {selected ? (<InfoWindow position={{ lat: parseFloat(selected.split(",")[0]), lng: parseFloat(selected.split(",")[1]) }} onCloseClick={() => setSelected(null)} ><div>{friendsLocations.get(selected)[0]}</div></InfoWindow>) : null}
        </GoogleMap>
    )
}
export default MyMap;