import React from 'react';

class InputLocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lat: "",lng: "",
      name: ""
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // Handles the value change of the state
  handleChangeLng(event) {
    this.setState({ lng: event.target.value });
  }
  handleChangeLat(event) {
    this.setState({ lat: event.target.value });
  }
  handleChangeName(event) {
    this.setState({ name: event.target.value });
  }

  // Handles the new location and adds it into the props
  handleSubmit(event) {
    this.props.addNewLocation(this.state.lat, this.state.lng, this.state.name);
    event.preventDefault();
  }

  // Renders the text input and the button that adds
  // the locations entered in the input
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" name="lat" value={this.state.lat} onChange={this.handleChangeLat.bind(this)} />
        <input type="text" name="lng" value={this.state.lng} onChange={this.handleChangeLng.bind(this)} />
        <input type="text" name="name" value={this.state.name} onChange={this.handleChangeName.bind(this)} />
        <input type="submit" value="+" />
      </form>
    );
  }

}

export default InputLocation