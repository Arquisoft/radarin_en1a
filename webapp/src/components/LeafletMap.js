
import React from "react";
import { Point, Icon } from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
/**
 * Constant storing resulting Map configuration and its behaviour
 */
class MyMap extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            pos: [props.lat, props.lng],
            myIcon: this.props.myIcon
        }
    }

    handleRangeChange(newRange) {
        this.setState({ range: newRange.target.value })
    }

    render() {
        return (
            <MapContainer center={this.state.pos} zoom={this.props.zoom} scrollWheelZoom={true}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={this.state.pos} icon={new Icon({
                    iconUrl: this.state.myIcon === undefined ? "./user.png" : this.props.myIcon,
                    iconSize: new Point(36, 36),
                })}>
                </Marker>
                <MyMarkers friends={this.props.friends} pos={this.state.pos} range={this.props.range} />
                <MyMarkers friends={this.props.locations} pos={undefined} radius={Number.MAX_VALUE} />
                <Circle center={this.state.pos} radius={this.props.range} />

            </MapContainer>
        )
    }
}

class MyMarkers extends React.Component {

    // SOURCE OF THIS ALGORITHM : https://www.movable-type.co.uk/scripts/latlong.html
    distanceTo(lat1, lon1) {
        if (this.props.pos === undefined)
            return 0;
        else {
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

export default MyMap;