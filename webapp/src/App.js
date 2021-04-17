import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Map from "./components/LeafletMap";
import { LoggedIn, LoginButton, LogoutButton, LoggedOut } from '@solid/react';
import './App.css';
import './leaflet.css';
import LocationListDisplay from "./components/LocationList";
import SolidStorage from "./components/SolidStorage";
import InputLocation from "./components/InputLocation";
//import { overwriteFile } from "@inrupt/solid-client"; //, saveFileInContainer 
import FriendList from './components/FriendList';


const auth = require('solid-auth-client');
const { default: data } = require('@solid/query-ldflex');
const fetch = auth.fetch;
const FC = require('solid-file-client');
const fc = new FC(auth);

var timer;

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentLat: null,
      currentLng: null,
      friends: [],
      myLocations: []// Locations from solid pod and manually added
    };
    this.myPhoto = "./user.png";
    this.online = true;
    this.getLocation();
    this.loadFriendsLocations();
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
  }

  async saveLocationToSolid() {
    var locationString = this.state.currentLat + ',' + this.state.currentLng; // Son ambos null ??
    let session = await this.getCurrentSession();
    let url = session.webId.replace("profile/card#me", "radarin/last.txt");
    if (this.state.currentLat != null && this.state.currentLng != null) {
      // If the file does not exist its created, otherwise is just overwritten
      await fc.postFile(url, new Blob([locationString]), { type: "plain/text" });
    }
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
    let coords = location.split(",")
    if (!repeated) {
      const myLocations = this.state.myLocations.concat(coords);
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
    var friends = [];
    for await (const friend of person.friends) {
      var lFriend = {
        pod: `${await data[friend]}`,
        name: await data[friend].name.value,
        photo: await data[friend]["vcard:hasPhoto"].value,
        lat: null,
        lng: null
      };
      friends.push(lFriend);
    }
    this.setState({ friends: friends });
    await this.getMyPhoto();
    this.reloadFriendLocations(friends);
  }

  // Method that requests the last location to the friend's pods
  async reloadFriendLocations(friends) {

    // We do this to get a copy of the list.
    let friendList = friends;

    if (this.online && friends !== undefined) {
      for await (var friend of friends) {
        var url = friend.pod.split('profile')[0] // We have to do this because friends are saved with the full WebID (example.inrupt.net/profile/card#me)
        var location = await fetch(url + '/radarin/last.txt').then((x) => { //Fetch the file from the pod's storage
          if (x.status === 200)  // if the file exists, return the text
            return x.text()
        });
        if (location != null) { //TODO: validate what we have before pushing it (it has to be two doubles separated by a comma)
          let coords = location.split(",")
          friend.lat = coords[0]
          friend.lng = coords[1]
        }
      }
    }

    this.setState({friends : friendList});

  }

  // Sets the online flag to true, and starts the timer to reload the friends locations every second
  async startTimer() {
    // This code is a bit hacky, I'll try to explain it as best as possible. First, we set the "online" variable to true, so the "reloadFriendLocations"
    // function will work.
    this.online = true;
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
  }


  // Loads the locations from the solid profile
  async loadSolidLocations(filename) {
    let session = await this.getCurrentSession();

    // If the file does not exist, is created
    let fileUrl = session.webId.replace("profile/card#me", filename);
    if (!(await fc.itemExists(fileUrl)))
      await fc.postFile(fileUrl, new Blob(), { type: "text/turtle" });
    // Until here

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

    // If the file does not exist, is created
    let fileUrl = session.webId.replace("profile/card#me", "radarin/stored_locations.ttl");
    if (!(await fc.itemExists(fileUrl)))
      await fc.postFile(fileUrl, new Blob(), { type: "text/turtle" });
    // Until here

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
    data[session.webId]["vcard:hasPhoto"].then((x) => {
      const photo = x.value;
      this.setState({ myPhoto: photo });
    });
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
                <FriendList friends={this.state.friends}></FriendList>
              </ul>

            </LoggedIn>
          </div>
          <button onClick={() => { this.loadFriendsLocations() }}>
            Start</button>
          {
            this.state.currentLat && this.state.currentLng ?
              <Map lat={this.state.currentLat} lng={this.state.currentLng} friends={this.state.friends} myIcon={this.state.myPhoto} locations={this.state.myLocations} />
              : <h2>Location needed for services</h2>
          }
        </div>
      </div >
    )
  }

}


export default App;