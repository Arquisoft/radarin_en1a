import React from 'react';

class InputLocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      photo: "",
      fileOk: false
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // Handles the value change of the state
  handleChangeName(event) {
    this.setState({ name: event.target.value });
  }

  // Handles the new location and adds it into the props
  handleSubmit(event) {
    this.props.handleNewLocation(this.state.name, this.state.photo);
    document.getElementById("file-indicator").innerHTML = "";
    document.getElementById("file-input").value = "";
    document.getElementById("newLocationText").value = "";
    event.preventDefault();
  }
  // Handles the new location and adds it into the props
  async handleChangePhoto(event) {

    await this.loadImage(event.target.files[0], this.checkImage)
    event.preventDefault();
  }

  // Auxiliary function to get the file as string
  async loadImage(file) {
    // const fileReader = new FileReader();
    // const self = this;
    // fileReader.onloadend = () => callback(self, fileReader.result);
    // fileReader.readAsArrayBuffer(file);

    var type;

    switch (file.type) {
      case "image/png":
        type = ".png";
        break;
      case "image/gif":
        type = ".gif";
        break;
      case "image/jpeg":
        type = ".jpeg";
        break;
      default:
        type = false
    }
    if (type) {
      this.setState({ photo: { blob: file, type: type } });
      document.getElementById("file-indicator").innerHTML = "✔️";
    }
    else {
      this.props.warning();
      document.getElementById("file-indicator").innerHTML = "❌";
      document.getElementById("file-input").value = ""
    }
  }
  // Auxiliary function to check if the supplied file is a image (JPEG, GIF, PNG)
  async checkImage(self, e) {

    var type;

    /*
    const headerBytes = new Uint8Array(e.slice(0, 4));
    const header = headerBytes.map(x => x.toString(16)).join('');
    // We represent the file header as a hex string
    var hexArray = [];
    for (var n = 0, l = header.length; n < l; n++) {
      var hex = Number(header.charCodeAt(n)).toString(16);
      hexArray.push(hex);
    }
    var hexString = hexArray.join("");
 
    // And check if it matches the image file headers
    switch (hexString) {
      case "89504e47":
        type = ".png";
        break;
      case "47494638":
        type = ".gif";
        break;
      case "ffd8ffe0":
      case "ffd8ffe1":
      case "ffd8ffe2":
      case "ffd8ffe3":
      case "ffd8ffe8":
        type = ".jpeg";
        break;
      default:
        type = false;
        break;
    }
    */


    if (type) {
      self.setState({ photo: { blob: e, type: type } });
      document.getElementById("file-indicator").innerHTML = "✔️";
    }
    else {
      self.props.warning();
      document.getElementById("file-indicator").innerHTML = "❌";
      document.getElementById("file-input").value = ""
    }
  }

  // Renders the text input and the button that adds
  // the locations entered in the input
  render() {
    return (
      <div>
        <h3 className="friends-title">Store your current location:</h3>
        <form onSubmit={this.handleSubmit} id="form">
          <input id="newLocationText" type="text" name="LocationText" value={this.state.name} onChange={this.handleChangeName.bind(this)} placeholder="Name of the location" />
          <input type="submit" value="➕" className="button-add-location" /><br />
          <div class="file-select" id="src-file1" >
            <input type="file" id="file-input" name="src-file1" aria-label="file" onChange={this.handleChangePhoto.bind(this)} />
          </div>
          <div id="file-indicator"></div>
        </form>
      </div>
    );
  }

}

export default InputLocation