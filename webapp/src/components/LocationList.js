import React from 'react';
// Obtains the list of locations and returns the html list of
// locations with a button to delete each one
class LocationListDisplay extends React.Component {

    render() {
        return (
            <table id="locations">
                {this.props.locations.map((location) => {
                    return (
                        <tr>
                            <th key={location.name}>
                                {location.name}</th>
                            <th><button className="button-delete-location" onClick={() => this.props.deleteLocation(location)}>➖</button></th>
                        </tr>
                    );
                })}
            </table>
        );
    }
}
export default LocationListDisplay