import React from 'react';
// Obtains the list of locations and returns the html list of
// locations with a button to delete each one
class LocationListDisplay extends React.Component {

    render() {
        return (
            <table className="locations">
                <tbody>
                {
                this.props.locations !== undefined ? 
                this.props.locations.map((location) => {
                    return (
                        <tr>
                            <th key={location.name} className={location.selected? "activeLocation": "inactiveLocation"}>
                                {location.name}</th>
                            <th><button className="button-delete-location" onClick={() => this.props.deleteLocation(location)}>➖</button></th>
                        </tr>
                    );
                }): null}
                </tbody>
            </table>
        );
    }
}
export default LocationListDisplay