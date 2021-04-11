import React from 'react';

class InputLocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: "",
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // Handles the value change of the state
  handleChange(event) {
    this.setState({ value: event.target.value });
    //this.state.myLocations;
  }

  // Handles the new location and adds it into the props
  handleSubmit(event) {
    this.props.addNewLocation(this.state.value);
    event.preventDefault();
  }

  // Renders the text input and the button that adds
  // the locations entered in the input
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" name="location" value={this.state.value} onChange={this.handleChange} />
        <input type="submit" value="+" />
      </form>
    );
  }

}

export default InputLocation