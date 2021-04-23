import React from 'react';

class InputLocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: ""
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // Handles the value change of the state
  handleChangeName(event) {
    this.setState({ name: event.target.value });
  }

  // Handles the new location and adds it into the props
  handleSubmit(event) {
    this.props.addNewLocation(this.state.name);
    event.preventDefault();
  }

  // Renders the text input and the button that adds
  // the locations entered in the input
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" name="name" value={this.state.name} onChange={this.handleChangeName.bind(this)} placeholder="Name of the location"/>
        <input type="submit" value="+" />
      </form>
    );
  }

}

export default InputLocation