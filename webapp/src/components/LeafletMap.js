
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
            range: 40000
        }
    }

    handleRangeChange(newRange) {
        this.setState({ range: newRange.target.value })
    }

    render() {

        console.log(this.props.friends)
        return (
            <div className="map-Container">
                <h2>Radar radius: {this.state.range}</h2>
                <input type="range" min="4000" max="100000" step="500" value={this.state.range} onChange={this.handleRangeChange.bind(this)} />

                <MapContainer center={this.state.pos} zoom={10} scrollWheelZoom={true}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={this.state.pos} icon={new Icon({
                        iconUrl: this.state.myIcon === undefined ? "./user.png" : this.props.myIcon,
                        iconSize: new Point(20, 20),
                    })}>
                    </Marker>
                    <FriendMarkers friends={this.props.friends} />
                    <LocMarkers locations={this.props.locations} />
                    <Circle center={this.state.pos} radius={this.state.range} />

                </MapContainer>
            </div>
        )
    }
}

class FriendMarkers extends React.Component {


    render() {
        return this.props.friends.map(
            (friend) => {
                if (friend.lng !== null) {
                    console.log("Coords from " + friend.name + ": " + friend.lat + " : " + friend.lng)
                    return (
                        <Marker position={[friend.lat, friend.lng]} icon={new Icon({
                            iconUrl: friend.photo === undefined ? "./user.png" : friend.photo,
                            iconSize: new Point(18, 18),
                        })}>
                            <Popup>
                                {friend.name}
                            </Popup>
                        </Marker>
                    )
                }
                else {
                    console.log("Unable to get the location from " + friend.name)
                    return null;
                }
            }
        )
    }
}

class LocMarkers extends React.Component {


    render() {
        return this.props.locations.map(
            (location) => {
                console.log(location)
                return (
                    <Marker position={location}>
                    </Marker>
                )
            }
        )
    }
}

export default MyMap;