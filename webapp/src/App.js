import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Map from "./components/Map";
import { LoggedIn, LoginButton, LogoutButton, LoggedOut } from '@solid/react';
import './App.css';
import { overwriteFile } from "@inrupt/solid-client";
const auth = require('solid-auth-client');
const { default: data } = require('@solid/query-ldflex');

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      users: [],
      currentLat: null,
      currentLng: null,
      locations: [],
      myLocations: [], // Locations from solid pod and manually added
      rangeSelection: "6000",
      ring1:[], //Rings for location retrieval optimization
      ring2:[],
      ring3:[] 
    };
    this.getLocation();
  }

  // Refresh the user list stored in the state
  refreshUsers(users) {
    this.setState({ users: users })
  }

  // Obtains the localization with the navigator
  // Then saves the localization into the last.txt file of the pod
  getLocation() {
    const self = this;
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) { //watchPosition()
        self.setAndSaveLocation(self, position,  function (){
          self.saveLocationToSolid();
        })
      })
    }
  }

  // Intermediate step to make the getLocation and saveLocationToSolid work syncronous
  setAndSaveLocation(self, position, callback)
  {
    // Sets the latitude and longitude into the state
    // Latitude and longitude are taken from the geolocation
    self.setState({
      currentLat: position.coords.latitude,
      currentLng: position.coords.longitude
    })
    callback();
  }

  // Saves the actual location into the pod TODO
  async saveLocationToSolid()
  {
    var locationString = this.state.currentLat + ',' + this.state.currentLng; // Son ambos null ??
    console.log(locationString);
    let session = await getCurrentSession();
    let url = session.webId.replace("profile/card#me", "radarin/last.txt");
    let last = data[url];
    if(this.state.currentLat != null && this.state.currentLng != null)
      await overwriteFile(last.value, new Blob([locationString], { type: "plain/text" }));

    console.log("Saved to the pod");
  }
 
  // Handles the change of the range slider
  handRangeChange(event) {
    this.setState({ rangeSelection: event.target.value })
  }

  // Handles the insertion of a new location checking that it is not empty
  // It also checks if the location is already in the list before inserting it
  handleNewLocation(location) {
    if (location === "") {
      alert("Empty location not allowed!");
      return;
    }

    let repetida = false;
    for (let i = 0; i < this.state.myLocations.length; i++) {
      if (location.toString() == this.state.myLocations[i].toString())
        repetida = true;
    }

    if (!repetida) {
      const myLocations = this.state.myLocations.concat(location);
      this.setState({ myLocations });
    }else
        alert("Repeated location not allowed!");
  }

  // Handles the deletion of a location and 
  // deletes the location from myLocations of the state
  handleDeleteLocation(location) {
    const myLocations = this.state.myLocations.slice();
    myLocations.splice(myLocations.indexOf(location), 1);
    this.setState({ myLocations });
  }

  // Load the locations from solid and put them into the state
  async loadFromSolid() {
    let myLocations = await loadSolidLocations("radarin/stored_locations.ttl");
    this.setState({ myLocations });
  }

  // Save all the locations to solid
  async saveToSolid() {
    let oldLocations = await loadSolidLocations("radarin/stored_locations.ttl");
    saveSolidLocations(this.state.myLocations, oldLocations);
  }

  // Method that loads the friends location to 
  // show them in the map later
  // Made by Fran, one friday at 1 AM, who drank maybe a bit too much cocacola
  async loadFriendsLocations() {
    var session = await getCurrentSession();
    var person = data[session.webId]
    const friends = [];
    for await (const friend of person.friends)
      friends.push(`${await data[friend]}`);
    //this.setState({ friends })
    console.log(friends)
    this.reloadRing(friends);
  }

  // Method that requests the last location to the friend's pods
  async reloadRing(ring) {
    for await (var f of ring) {
      var friend = f.split('profile')[0] // We have to do this because friends are saved with the full WebID (example.inrupt.net/profile/card#me)
      var location = await fetch(friend + '/radarin/last.txt').then((x) => { //Fetch the file from the pod's storage
        if (x.status === 200)  // if the file exists, return the text
          return x.text()
      });
      

      if (location != null) { //TODO: validate what we have before pushing it (it has to be two doubles separated by a comma)
        this.state.locations[friend] = location;
      }

    }
  }

  distanceBetweenCoordinates(lat2, lng2){
    return window.google.maps.geometry.spherical.computeDistanceBetween(new window.google.maps.LatLng({lat: this.state.currentLat,lng: this.state.currentLng}),
        new window.google.maps.LatLng({lat:lat2,lng:lng2}));
}
  // Displays the side menu 
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
    var locations = this.state.myLocations;
    this.setState({ locations })
  }


  // Renders the most part of the webpage:
  // - Title
  // - Menu button and menu
  // - Range and its slider
  // - Usable map
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <button id="ShowMenu" onClick={() => this.displayMenu()}>Side Menu</button>

          <h1>Radarin - Friends Location</h1>

        </header>

        <div className="App-content">

          <div id="sidemenu">

            <LoggedOut>
              <LoginButton popup="https://inrupt.net/common/popup.html" />
            </LoggedOut>
            <LoggedIn>
              <LogoutButton />
              <p> Load and edit your saved locations </p>
              <InputLocation addNewLocation={(location) => this.handleNewLocation(location)} />

              <LocationListDisplay locations={this.state.myLocations} deleteLocation={(location) => this.handleDeleteLocation(location)} />

              <SolidStorage loadFromSolid={() => this.loadFromSolid()} saveToSolid={() => this.saveToSolid()} display={() => this.displayCurrentLocations()} />

            </LoggedIn>
          </div>
          <span>{this.state.rangeSelection} meters</span>

          <input type="range" min="4000" max="100000" step="500" value={this.state.rangeSelection} onChange={this.handRangeChange.bind(this)} />
          <button onClick={() => this.loadFriendsLocations()}>Refresh</button>
          <div className="Map-content">
            {
              this.state.currentLat && this.state.currentLng ?
                <Map lat={this.state.currentLat} lng={this.state.currentLng} locations={this.state.locations} range={this.state.rangeSelection} />
                : <h2>Location needed for services</h2>
            }
          </div>
        </div>
      </div >
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
      return latAndLngFromLocation(l);
    });
  return data;
}

function latAndLngFromLocation(l){
  var tp = l.split(',');
    var d = {
      lat: parseInt(tp[0]),
      lng: parseInt(tp[1])
    }
    return d;
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
  if (!session) {
    let popupUri = 'https://solidcommunity.net/common/popup.html';
    session = await auth.popupLogin({ popupUri });
  }
  return session;
}

export default App;