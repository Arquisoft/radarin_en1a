import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
/**
 * Constant storing resulting Map configuration and its behaviour
 */
class MyMap extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            pos: [props.lat, props.lng],
            friends: props.friends
        }
    }

    render() {
        return <MapContainer center={this.state.pos} zoom={13} scrollWheelZoom={true}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={this.state.pos}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
            </Marker>
            <FriendMarkers friends ={this.state.friends}/>
        </MapContainer>
    }
}

class FriendMarkers extends React.Component {

    constructor(props) {
        super(props)
        this.friends = props.friends;
    }
    render() {

        return this.friends.map(
            (friend) => {
                <Marker position={friend.location}>
                    <Popup>
                        {friend.name}
          </Popup>
                </Marker>
            }
        );
    }
}

export default MyMap;