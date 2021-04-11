import React from 'react';
// Obtains the list of locations and returns the html list of
// locations with a button to delete each one
class LocationListDisplay extends React.Component {

    constructor(props) {
        super(props);
        this.props = props;
    }
    render() {
        this.LocationList(this.props.locations);
        return (
            this.props.locations.map(t => {
                return (
                    <li key={t}>
                        {t}<button onClick={() => this.props.deleteLocation(t)}>-</button>
                    </li>
                );
            })
        );
    }

    // Returns the list of locations obtained from the input
    LocationList(input) {
        var data =
            input.map(l => { // l es cada location
                var tp = l.split(',');
                var d = {
                    lat: parseInt(tp[0]),
                    lng: parseInt(tp[1])
                }
                return d;
            });
        return data;
    }
}
export default LocationListDisplay