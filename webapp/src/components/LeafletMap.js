
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
            range: 40000,
            myIcon: this.props.myIcon
        }
    }

    handleRangeChange(newRange) {
        this.setState({ range: newRange.target.value })
    }

    render() {
        return (
            <div className="map-Container"><div className="slider-container">
                <input type="range" min="1000" max="100000" step="500" value={this.state.range} onChange={this.handleRangeChange.bind(this)} />
            </div>
                <MapContainer center={this.state.pos} zoom={10} scrollWheelZoom={true}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={this.state.pos} icon={new Icon({
                        iconUrl: this.state.myIcon === undefined ? "./user.png" : this.props.myIcon,
                        iconSize: new Point(20, 20),
                    })}>
                    </Marker>
                    <MyMarkers friends={this.props.friends} pos={this.state.pos} range={this.state.range}/>
                    <MyMarkers friends={this.props.locations} pos={undefined} radius={Number.MAX_VALUE}/>
                    <Circle center={this.state.pos} radius={this.state.range} />

                </MapContainer>
            </div>
        )
    }
}

class MyMarkers extends React.Component {

    distanceTo(lat, lng) {
        if (this.props.pos === undefined)
            return 0;
        else
            return ( Math.sqrt(Math.pow(this.props.pos[0] - lat, 2) + Math.pow(this.props.pos[1] - lng, 2))*100000);
    }

    render() {
        return this.props.friends.map(
            (friend) => {
                if (this.distanceTo(parseFloat(friend.lat), parseFloat(friend.lng)) < this.props.range) {
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
                    return null;
                }
            }
        )
    }
}

export default MyMap;