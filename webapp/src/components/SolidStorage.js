import React from 'react';

class SolidStorage extends React.Component {

    // Renders the buttons of solid actions 
    render() {
      return (
        <div>
          <p> Edit your saved locations </p>
          <button onClick={() => this.props.saveToSolid()}>Save to Solid</button>
        </div>
      );
    }
  }

  export default SolidStorage