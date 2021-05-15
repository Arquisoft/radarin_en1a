import React from "react";
import { Point, Icon } from 'leaflet'
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet'
import MyLMarkers from "./MyLMarkers.js"
import MyStoredLocationsLMarkers from "./MyStoredLocationsLMarkers.js"
import MarkerClusterGroup from 'react-leaflet-markercluster';
require('leaflet/dist/leaflet.css'); // inside .js file
require('react-leaflet-markercluster/dist/styles.min.css'); // inside .js file

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

    handlePopupClose(e) {
        console.log(e.popup)
      }

    render() {
        return (
            <MapContainer center={this.state.pos} zoom={this.props.zoom} scrollWheelZoom={true}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
                    //url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
                />
                <Marker position={this.state.pos} icon={new Icon({
                        iconUrl: this.state.myIcon === undefined ? "./user.png" : this.props.myIcon,
                        iconSize: new Point(36, 36),
                    })}>
                    </Marker>
                <MarkerClusterGroup>
                    <MyLMarkers friends={this.props.friends} pos={this.state.pos} range={this.props.range} />
                    <MyStoredLocationsLMarkers locations={this.props.locations} pos={this.state.pos} range={this.props.range} />
                </MarkerClusterGroup>
                <Circle center={this.state.pos} radius={this.props.range} />

            </MapContainer>
        )
    }
}

export default MyMap;