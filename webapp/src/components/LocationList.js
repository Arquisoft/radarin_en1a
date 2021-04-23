import React from 'react';
// Obtains the list of locations and returns the html list of
// locations with a button to delete each one
class LocationListDisplay extends React.Component {

    render() {
        return (
                <ul key="LocationListDisplayTableBody">
                {this.props.locations.map((location) => {
                    return (
                            <li key={location.name}>
                                {location.name}
                                <button onClick={() => this.props.deleteLocation(location)}>-</button>
                            </li>
                    );
                })}
                </ul>
        );
    }
}
export default LocationListDisplay