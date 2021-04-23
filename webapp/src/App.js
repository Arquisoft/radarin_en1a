import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import GMap from "./components/Map";
import LMap from "./components/LeafletMap";
import { LoggedIn, LoginButton, LogoutButton, LoggedOut } from '@solid/react';
import './App.css';
import './leaflet.css';
import LocationListDisplay from "./components/LocationList";
import SolidStorage from "./components/SolidStorage";
import InputLocation from "./components/InputLocation";
import FriendList from './components/FriendList';
import { LoadScript } from "@react-google-maps/api"
import ReactNotification from 'react-notifications-component'
import { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css'


const auth = require('solid-auth-client');
const { default: data } = require('@solid/query-ldflex');
const fetch = auth.fetch;
const FC = require('solid-file-client');
const fc = new FC(auth);
const libraries = ["places", "geometry"];
const google = window.google;

//var timer;

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentLat: null,
      currentLng: null,
      friends: [],
      myPhoto: "./user.png",
      myLocations: [],// Locations from solid pod and manually added
      mapType: 'gmap',
      range: 6000
    };
    this.getLocation();
    this.loadFriendsLocations();
    this.loadStoredLocationFromSolid();
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
    this.saveLocationToSolid()
  }

  async saveLocationToSolid() {
    var locationString = this.state.currentLat + ',' + this.state.currentLng; // Son ambos null ??
    let session = await this.getCurrentSession();
    let url = session.webId.replace("profile/card#me", "radarin/last.txt");
    if (this.state.currentLat != null && this.state.currentLng != null) {
      // If the file does not exist its created, otherwise is just overwritten
      await fc.postFile(url, new Blob([locationString]));
    }
  }

  // Handles the insertion of a new location checking that it is not empty
  // It also checks if the location is already in the list before inserting it
  handleNewLocation(lat, lng, name) {

    if (lat === "" || lng === "") {
      alert("Empty coordinates not allowed!");
      return;
    }
    let locationJson = {
      lat: lat,
      lng: lng,
      name: name,
      photo: "./logo192.png"
    };

    let repeated = false;
    for (let i = 0; i < this.state.myLocations.length; i++) {
      if (locationJson.lat === this.state.myLocations[i].lat && locationJson.lng === this.state.myLocations[i].lng)
        repeated = true;
    }
    if (!repeated) {
      const myLocations = this.state.myLocations.concat(locationJson);
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
        lng: null,
        ring: 1
      };
      friends.push(lFriend);
    }
    this.setState({ friends: friends });
    await this.getMyPhoto();
    //Reloads the first one to ask for every friend's location
    this.reloadRing(1);
    this.startTimer();
  }

  /**
   * Method that requests the locations of the friends in a given ring
   * @param {*} ring 
   */
  async reloadRing(ring) {
    // We do this to get a copy of the list of friends.
    let friendList = this.state.friends;
    if (friendList !== undefined) {
      for await (var friend of friendList) {
        if (friend.ring === ring) {
          var url = friend.pod.split('profile')[0] // We have to do this because friends are saved with the full WebID (example.inrupt.net/profile/card#me)
          var location = await fetch(url + '/radarin/last.txt').then((x) => { //Fetch the file from the pod's storage
            if (x.status === 200)  // if the file exists, return the text
              return x.text()
          });
          if (location != null) { //TODO: validate what we have before pushing it (it has to be two doubles separated by a comma)
            let coords = location.split(",")
            friend.lat = coords[0]
            friend.lng = coords[1]
            friend.ring = this.computeRing(location);
          }
        }
      }
    }

    this.setState({ friends: friendList });

  }
  /**
   * Calculates and returns the ring a friend belongs to
   * @param {String} location of the friend 
   * @returns {int} corresponding ring
   */
  computeRing(location) {
    var loc = latAndLngFromLocation(location);
    var distance = this.distanceBetweenCoordinates(loc.lat, loc.lng);
    //Returns the corresponding ring
    if (distance <= this.state.range) {
      return 1;
    }
    if (distance <= (this.state.range * 1.5)) {
      return 2;
    }
    if (distance > (this.state.range * 1.5)) {
      return 3;
    }
  }
  /**
   * Calculates and returns the distance between the current location of the user and a given location
   * @param {*} lat latitude to compute the distance to
   * @param {*} lng longitude to compute the distance to
   * @returns  distance between the user and the given location
   */
  distanceBetweenCoordinates(lat, lng) {
    return window.google.maps.geometry.spherical.computeDistanceBetween(new window.google.maps.LatLng({ lat: this.state.currentLat, lng: this.state.currentLng }),
      new window.google.maps.LatLng({ lat: lat, lng: lng }));
  }

  /**
   * Starts the timer to reload the friends locations
   */
  async startTimer() {
    let self = this;
    setInterval(() => {
      self.reloadRing(1);
      //self.getLocation();
    }, 1000); // 1 second
    setInterval(() => {
      self.reloadRing(2);
    }, 10000); // 10 seconds
    setInterval(() => {
      self.reloadRing(3);
    }, 60000); // 1 minute
    //this.reloadRing()
  }

  // Displays the side menu 
  displayMenu() {

    var width = document.getElementById('sidemenu').style.width;
    if (width.toString().length === 0) {
      document.getElementById('sidemenu').style.width = '25%';
      document.getElementById('ShowMenu').style.transform = "scaleX(-1)";
    }
    else {
      document.getElementById('sidemenu').style.width = '';
      document.getElementById('ShowMenu').style.transform = "scaleX(1)";
    }

    this.addNewNotification();
  }

  // Load the locations from solid and put them into the state
  async loadStoredLocationFromSolid() {
    let session = await this.getCurrentSession();

    // If the file does not exist, is created
    let fileUrl = session.webId.replace("profile/card#me", "radarin/stored_locations.json");
    if (!(await fc.itemExists(fileUrl)))
      await fc.postFile(fileUrl, new Blob());
    // Until here

    let url = session.webId.replace("profile/card#me", "radarin/stored_locations.json");
    let radar = await fetch(url).then((x) => {
      if (x.status === 200)  // if the file exists, return the text
        return x.text()
    });
    if (radar === "")
      return;

    const locations = JSON.parse(radar);
    this.setState({ myLocations: locations })
  }

  // Saves the locations into the solid profile
  async saveStoredLocationToSolid() {
    let session = await this.getCurrentSession();
    // If the file does not exist, it is created
    let fileUrl = session.webId.replace("profile/card#me", "radarin/stored_locations.json");
    let myJSON = JSON.stringify(this.state.myLocations);
    await fc.postFile(fileUrl, new Blob([myJSON]));
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
      var photo = "./user.png";
      if (x !== undefined) {
        photo = x.value;
      }
      this.setState({ myPhoto: photo });
    });
  }

  changeMapType() {
    if (this.state.mapType === 'gmap')
      this.setState({ mapType: 'lmap' })
    else
      this.setState({ mapType: 'gmap' })
  }
  // Handles the change of the range slider
  handRangeChange(event) {
    this.setState({ range: event.target.value })
  }


  /**
   * Function to add new notification in our GUI
   */
  addNewNotification() {
    store.addNotification({
      title: "Titulo goes here",
      message: "Mensaje de la notificaion",
      type: "success",
      insert: "bottom",
      container: "bottom-left",
      animationIn: ["animate__animated", "animate__fadeIn"],
      animationOut: ["animate__animated", "animate__fadeOut"],
      dismiss: {
        duration: 5000,
        onScreen: true
      }
    }
    )
  }

  // Renders the most part of the webpage:
  // - Title
  // - Menu button and menu
  // - Range and its slider
  // - Usable map
  render() {
    return (
      <div className="App">
        <button id="ShowMenu" onClick={() => this.displayMenu()}><img src="./oMenu.png" /></button>
        {google ? null : <LoadScript
          id="script-loader"
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_KEY}
          libraries={libraries}> </LoadScript>}

        <div id="sidemenu">

          <LoggedOut>
            <LoginButton popup="https://inrupt.net/common/popup.html" />
          </LoggedOut>

          <LoggedIn>

            <LogoutButton />
            <SolidStorage loadFromSolid={() => this.loadStoredLocationFromSolid()} saveToSolid={() => this.saveStoredLocationToSolid()} />
            <InputLocation addNewLocation={(lat, lng, name) => this.handleNewLocation(lat, lng, name)} />
            <LocationListDisplay locations={this.state.myLocations} deleteLocation={(location) => this.handleDeleteLocation(location)} />
            <FriendList friends={this.state.friends}></FriendList>
            <button onClick={() => this.changeMapType()}>Change Map</button>
          </LoggedIn>
        </div>
        {/* System notification componenet */}
        <ReactNotification />
        {
          this.state.currentLat && this.state.currentLng ?
            this.state.mapType === 'gmap' && window.google !== undefined ?
              <div>
                <div className="slider-container">
                  <input className="slider" type="range" min="1000" max="100000" step="500" value={this.state.range} onChange={this.handRangeChange.bind(this)} />
                </div>
                <GMap lat={this.state.currentLat} lng={this.state.currentLng} friends={this.state.friends}
                  myIcon={this.state.myPhoto} locations={this.state.myLocations} range={this.state.range} />
              </div>

              : this.state.mapType === 'lmap' ?
                <LMap lat={this.state.currentLat} lng={this.state.currentLng} friends={this.state.friends}
                  myIcon={this.state.myPhoto} locations={this.state.myLocations} />
                : <h2>Error loading the map</h2>
            : <h2> Loading map ... </h2>
        }
      </div >
    )
  }

}

function latAndLngFromLocation(l) {
  var tp = l.split(',');
  var d = {
    lat: parseFloat(tp[0]),
    lng: parseFloat(tp[1])
  }
  return d;
}

export default App;