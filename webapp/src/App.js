import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Map from "./components/Map";

import './App.css';
const auth = require('solid-auth-client');
const { default: data } = require('@solid/query-ldflex');

class App extends React.Component {
  constructor(props) {
    super(props)
    this.getLocation();
    this.state = {
      users: [],
      currentLat: null,
      currentLng: null,
      locations: [],
      myLocations: [],
      rangeSelection: "6000"
    };
  }

  // Refresh the user list stored in the state
  refreshUsers(users) {
    this.setState({ users: users })
  }

  // Obtains the localization with the navigator
  getLocation() {
    const self = this;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) { //watchPosition()
        self.setState({
          currentLat: position.coords.latitude,
          currentLng: position.coords.longitude
        });
      });
    }
  }

  // Handles the change of the range slider
  handRangeChange(event) {
    this.setState({ rangeSelection: event.target.value })
  }

  handleNewLocation(location) {
    if (location === "") {
      alert("Empty location not allowed!");
      return;
    }
    const myLocations = this.state.myLocations.concat(location);
    this.setState({ myLocations });
  }

  handleDeleteLocation(location) {
    const myLocations = this.state.myLocations.slice();
    myLocations.splice(myLocations.indexOf(location), 1);
    this.setState({ myLocations });
  }

  async loadFromSolid() {
    let myLocations = await loadSolidLocations("/radarin/stored_locations.ttl");
    this.setState({ myLocations });
  }

  async saveToSolid() {
    let oldLocations = await loadSolidLocations("/radarin/stored_locations.ttl");
    saveSolidLocations(this.state.myLocations, oldLocations);
  }

  async loadFriendsLocations() {
    let session = await getCurrentSession();
    let friends = session.webId.replace("profile/card#me", "/radarin/friends.ttl#pods");

    let radar = data[friends];
    const locations = [];
    for await (const pod of radar.schema_itemListElement) {
      try {
        let location = await fetch('https://' + pod.toString() + '/radarin/last.txt#locations').then(response => {
          if (response.status === 200) return response.text()
        });
        locations.push(location.toString());
        this.setState({ locations });
      } catch { }
    }
  }

  displayMenu() {

    var width = document.getElementById('sidemenu').style.width;
    if (width.toString().length === 0) {
      document.getElementById('sidemenu').style.width = '15%';
      document.getElementById('ShowMenu').innerHTML = "Hide";
    }
    else {
      document.getElementById('sidemenu').style.width = '';
      document.getElementById('ShowMenu').innerText = "Side Menu";
    }
  }
  displayCurrentLocations() {
    this.state.locations = this.state.myLocations;

  }


  // Renders the most part of the webpage:
  // - Title
  // - Menu button and menu
  // - Range and its slider
  // - Usable map
  render() {
    return (
      <div className="App">
        <header>
          <h1>Radarin - Friends Location</h1>
        </header>


        <div className="App-content">
          <button id="ShowMenu" onClick={() => this.displayMenu()}>Side Menu</button>
          <div id="sidemenu">
            <p> Load and edit your saved locations </p>
            <InputLocation addNewLocation={(location) => this.handleNewLocation(location)} />

            <LocationListDisplay locations={this.state.myLocations} deleteLocation={(location) => this.handleDeleteLocation(location)} />

            <SolidStorage loadFromSolid={() => this.loadFromSolid()} saveToSolid={() => this.saveToSolid()} display = {() => this.displayCurrentLocations()} />
          </div>

          <span>{this.state.rangeSelection} meters</span>

          <input type="range" min="4000" max="10000" step="500" value={this.state.rangeSelection} onChange={this.handRangeChange.bind(this)} />
          <button onClick={() => this.loadFriendsLocations()}>Refresh</button>
          <div className="Map-content">
            {
              this.state.currentLat && this.state.currentLng ?
                <Map lat={this.state.currentLat} lng={this.state.currentLng} locations={this.state.locations} range={this.state.rangeSelection} />
                : <h2>Location needed for services</h2>
            }
          </div>
        </div>
      </div>
    )
  }

}

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

// Obtains the list of locations and returns the html list of
// locations with a button to delete each one
function LocationListDisplay(props) {
  LocationList(props.locations);
  return (
    props.locations.map(t => {
      return (
        <li key={t}>
          {t}<button onClick={() => props.deleteLocation(t)}>-</button>
        </li>
      );
    })
  );
}

// Returns the list of locations obtained from the input
function LocationList(input) {
  var data =
    input.map(l => { // l es cada location
      var tp = l.split(',');
      var d = {
        lat: parseInt(tp[0]),
        lng: parseInt(tp[1])
      }
      return d;
    })
  return data;
}

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

// Loads the locations from the solid profile
async function loadSolidLocations(filename) {
  let session = await getCurrentSession();
  let url = session.webId.replace("profile/card#me", filename + "#locations");
  let radar = data[url];
  const locations = [];
  for await (const location of radar.schema_itemListElement) {
    locations.push(location.toString());
  }
  return Array.from(locations.values());
}

// Saves the locations into the solid profile
async function saveSolidLocations(locations, oldLocations) {
  let session = await getCurrentSession();
  let url = session.webId.replace("profile/card#me", "radarin/stored_locations.ttl#locations");
  let radar = data[url];
  for (const t of oldLocations) {
    await radar["schema:itemListElement"].delete(t.toString());
  }
  for (const t of locations) {
    await radar["schema:itemListElement"].add(t.toString());
  }
  alert("Saved to your Solid POD");
}

// Returns the current session
async function getCurrentSession() {
  let session = await auth.currentSession();
  let popupUri = 'https://inrupt.net/common/popup.html';
  if (!session) {
    session = await auth.popupLogin({ popupUri });
  }
  return session;
}

export default App;