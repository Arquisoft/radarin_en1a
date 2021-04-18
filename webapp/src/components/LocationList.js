import React from 'react';
// Obtains the list of locations and returns the html list of
// locations with a button to delete each one
class LocationListDisplay extends React.Component {

    constructor(props) {
        super(props);
    }
    render() {
        return (
            <table key="LocationListDisplayTable">
                <tbody key="LocationListDisplayTableBody">
                {this.props.locations.map((location) => {
                    return (
                        <tr key="LocationListDisplayTableRow">
                            <td key={location.name}>
                                {location.name}
                                <button onClick={() => this.props.deleteLocation(location)}>-</button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        );
    }
}
export default LocationListDisplay