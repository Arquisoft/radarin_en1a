import React from "react";
import { Point, Icon } from 'leaflet'
import { Marker, Popup } from 'react-leaflet'

export default class MyLMarkers extends React.Component {

    // SOURCE OF THIS ALGORITHM : https://www.movable-type.co.uk/scripts/latlong.html
    distanceTo(lat1, lon1) {

        const lat2 = this.props.pos[0];
        const lon2 = this.props.pos[1];

        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // in metres

    }

    render() {
        return this.props.friends.map(
            (friend) => {
                if (this.distanceTo(parseFloat(friend.lat), parseFloat(friend.lng)) < this.props.range) {
                    return (
                        <Marker position={[friend.lat, friend.lng]} icon={new Icon({
                            iconUrl: friend.photo === undefined ? "./user.png" : friend.photo,
                            iconSize: new Point(20, 20),
                        })}>
                            <Popup>
                                {friend.name}
                            </Popup>
                        </Marker>
                    )
                }
                else {
                    return null;
                }
            }
        )
    }
}