import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Map from "./components/Map";
import { LoggedIn, LoginButton, LogoutButton, LoggedOut } from '@solid/react';
import './App.css';
import LocationListDisplay from "./components/LocationList";
import SolidStorage from "./components/SolidStorage";
import InputLocation from "./components/InputLocation";
import { overwriteFile } from "@inrupt/solid-client";
import FriendList from './components/FriendList';
const auth = require('solid-auth-client');
const { default: data } = require('@solid/query-ldflex');
const fetch = auth.fetch;

var timer;

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      users: [],
      currentLat: null,
      currentLng: null,
      locations: [],
      myLocations: [], // Locations from solid pod and manually added
      friends: [],
      friendsNames: [],
      friendsPhotos: [],
      rangeSelection: "6000"
    };

    this.online = true;
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
        self.setAndSaveLocation(position)
      })
    }
  }

  // Intermediate step to make the getLocation and saveLocationToSolid work syncronous
  setAndSaveLocation(position) {
    // Sets the latitude and longitude into the state
    // Latitude and longitude are taken from the geolocation
    this.setState({
      currentLat: position.coords.latitude,
      currentLng: position.coords.longitude
    })

    // Checks if the user is logged in before saving its location to solid
    let session = this.getCurrentSession();
    if (session.state !== "pending")
      this.saveLocationToSolid();
  }

  // Saves the actual location into the pod TODO
  async saveLocationToSolid() {
    var locationString = this.state.currentLat + ',' + this.state.currentLng; // Son ambos null ??
    let session = await this.getCurrentSession();
    let url = session.webId.replace("profile/card#me", "radarin/last.txt");
    let last = data[url];
    if (this.state.currentLat != null && this.state.currentLng != null) {
      await overwriteFile(last.value, new Blob([locationString], { type: "plain/text" }));
    }
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

    let repeated = false;
    for (let i = 0; i < this.state.myLocations.length; i++) {
      if (location.toString() === this.state.myLocations[i].toString())
        repeated = true;
    }

    if (!repeated) {
      const myLocations = this.state.myLocations.concat(location);
      this.setState({ myLocations });
    }
    else
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
  async loadStoredLocationFromSolid() {
    let myLocations = await this.loadSolidLocations("radarin/stored_locations.ttl");
    this.setState({ myLocations });
  }

  // Save all the locations to solid
  async saveStoredLocationToSolid() {
    let oldLocations = await this.loadSolidLocations("radarin/stored_locations.ttl");
    this.saveSolidLocations(this.state.myLocations, oldLocations);
  }

  // Method that loads the friends location to 
  // show them in the map later
  // Made by Fran, one friday at 1 AM, who drank maybe a bit too much cocacola
  async loadFriendsLocations() {
    var session = await this.getCurrentSession();
    var person = data[session.webId]
    const friends = [];
    const friendsNames = [];
    const friendsPhotos = [];
    for await (const friend of person.friends) {
      friends.push(`${await data[friend]}`);
      friendsNames.push(await data[friend].name.value);
      friendsPhotos.push(await data[friend]["vcard:hasPhoto"].value);
    }
    this.setState({ friends });
    this.setState({ friendsNames });
    this.setState({ friendsPhotos });
    await this.getMyPhoto();
    this.reloadFriendLocations(friends);
  }

  // Method that requests the last location to the friend's pods
  async reloadFriendLocations(friends) {
    if (this.online) {
      var locations = []
      for await (var friend of friends) {
        var location = friend.split('profile')[0] // We have to do this because friends are saved with the full WebID (example.inrupt.net/profile/card#me)
        location = await fetch(location + '/radarin/last.txt').then((x) => { //Fetch the file from the pod's storage
          if (x.status === 200)  // if the file exists, return the text
            return x.text()
        });

        if (location != null) { //TODO: validate what we have before pushing it (it has to be two doubles separated by a comma)
          locations.push(location)
        }
      }

    }
    if (this.online)
      this.setState({ locations }) //Update the state variable
  }

  // Sets the online flag to true, and starts the timer to reload the friends locations every second
  async startTimer() {
    // This code is a bit hacky, I'll try to explain it as best as possible. First, we set the "online" variable to true, so the "reloadFriendLocations"
    // function will work.
    this.online = true;
    // Then we delete all previous locations. This is to flush any marker from previous operations (mainly, load and display from solid)
    const locations = [];
    this.setState({ locations })
    // When all that is done, we can set the interval to reload the friends every second.
    // TODO: This should be a state variable
    timer = setInterval(() => {
      this.reloadFriendLocations(this.state.friends);
      this.getLocation();
    }, 1000);
    //this.reloadFriendLocations()
  }

  // Displays the side menu 
  displayMenu() {

    var width = document.getElementById('sidemenu').style.width;
    if (width.toString().length === 0) {
      document.getElementById('sidemenu').style.width = '25%';
      document.getElementById('ShowMenu').innerHTML = "Hide";
    }
    else {
      document.getElementById('sidemenu').style.width = '';
      document.getElementById('ShowMenu').innerText = "Side Menu";
    }
  }

  // Displays the locations from myLocations
  displayCurrentLocations() {

    // First, we set the online flag to false, so if the reload friends function is beeing executed asyncronously, it will know that it's time to stop
    this.online = false;

    // We remove the timer interval.
    clearInterval(timer);

    // Flush the locations state variable, so no markers are left over
    var locations = [];
    this.setState({ locations });

    // Set the variable to "myLocations"
    locations = this.state.myLocations;
    this.setState({ locations });

    // Remove the friends names and photos, so they won't show up on the new markers
    //this.state.friendsNames = [];
    //this.state.friendsPhotos = [];
    this.setState({friendsNames : []});
    this.setState({friendsPhotos : []});

  }


  // Loads the locations from the solid profile
  async loadSolidLocations(filename) {
    let session = await this.getCurrentSession();
    let url = session.webId.replace("profile/card#me", filename + "#locations");
    let radar = data[url];
    const locations = [];
    for await (const location of radar.schema_itemListElement) {
      locations.push(location.toString());
    }
    return Array.from(locations.values());
  }

  // Saves the locations into the solid profile
  async saveSolidLocations(locations, oldLocations) {
    let session = await this.getCurrentSession();
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
  async getCurrentSession() {
    let session = await auth.currentSession();
    if (!session) {
      let popupUri = 'https://solidcommunity.net/common/popup.html';
      session = await auth.popupLogin({ popupUri });
    }
    return session;
  }

  async getMyPhoto() {
    let session = await this.getCurrentSession();
    var myPhoto = (await data[session.webId]["vcard:hasPhoto"].value);
    this.setState({ myPhoto });
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

              <SolidStorage loadFromSolid={() => this.loadStoredLocationFromSolid()} saveToSolid={() => this.saveStoredLocationToSolid()} display={() => this.displayCurrentLocations()} />

              <p>Friends list:</p>
              <ul id='friends_list'>
                <FriendList friends={this.state.friends} friendsPhotos={this.state.friendsPhotos} friendsNames={this.state.friendsNames} online={this.online}></FriendList>
              </ul>

            </LoggedIn>
          </div>
          <span>{this.state.rangeSelection} meters</span>

          <input type="range" min="4000" max="100000" step="500" value={this.state.rangeSelection} onChange={this.handRangeChange.bind(this)} />
          <button onClick={() => { this.loadFriendsLocations(); this.startTimer() }}>
            Start</button>
          <div className="Map-content">
            {
              this.state.currentLat && this.state.currentLng ?
                <Map lat={this.state.currentLat} lng={this.state.currentLng} locations={this.state.locations} range={this.state.rangeSelection}
                  friendsNames={this.state.friendsNames} friendsPhotos={this.state.friendsPhotos}
                  myIcon={this.state.myPhoto} />
                : <h2>Location needed for services</h2>
            }
          </div>
        </div>
      </div >
    )
  }

}


export default App;