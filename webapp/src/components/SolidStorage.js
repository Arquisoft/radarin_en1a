import React from 'react';

class SolidStorage extends React.Component {

    // Renders the buttons of solid actions 
    render() {
      return (
        <div>
          <button onClick={() => this.props.loadFromSolid()}>Load from Solid</button>
          <button onClick={() => this.props.saveToSolid()}>Save to Solid</button>
          <button onClick={() => this.props.display()}>Display Saved locations</button>
  
        </div>
      );
    }
  }

  export default SolidStorage