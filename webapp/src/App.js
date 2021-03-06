import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import GMap from "./components/Map";
import LMap from "./components/LeafletMap";
import './App.css';
import './leaflet.css';
import { LoadScript } from "@react-google-maps/api"
import ReactNotification from 'react-notifications-component'
import { store } from 'react-notifications-component';
import 'react-notifications-component/dist/theme.css'
import SolidFacade from './components/SolidFacade';
import SideMenu from './components/SideMenu';

const solid = new SolidFacade();
const libraries = ["places", "geometry"];
const google = window.google;

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentLat: null,
      currentLng: null,
      friends: [],
      myPhoto: "./user.png",
      myLocations: [], // Locations from solid pod and manually added
      mapType: 'lmap',
      range: 6000,
      zoom: 13
    };
    this.getLocation();
    this.loadLocations();
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
    solid.saveLocationToSolid(this.state.currentLat, this.state.currentLng)
  }

  // Handles the insertion of a new location checking that it is not empty
  // It also checks if the location is already in the list before inserting it
  async handleNewLocation(name, photo) {

    if (name === "") {
      this.addNewNotification("Empty location name not allowed!", "Please, add an unique tag to save your location", "danger");
      return;
    }

    var pic = "";
    if (photo !== "") {
      pic = await solid.saveLocationPicToSolid(name + photo.type, photo.blob);
      }

    let locationJson = {
      lat: this.state.currentLat,
      lng: this.state.currentLng,
      name: name,
      photo: pic
    };

    let repeated = false;
    for (let i = 0; i < this.state.myLocations.length; i++) {
      if (locationJson.name === this.state.myLocations[i].name)
        repeated = true;
    }
    if (!repeated) {
      const myLocations = this.state.myLocations.concat(locationJson);
      this.setState({ myLocations });
      document.getElementById('newLocationText').value = "";
      solid.saveStoredLocationToSolid(myLocations);
    }
    else
      this.addNewNotification("Repeated location name not allowed!", "Please, add an unique tag to save your location", "danger");
  }

  // Handles the deletion of a location and 
  // deletes the location from myLocations of the state
  handleDeleteLocation(location) {
    let myLocations = [];
    this.state.myLocations.forEach((l) => {
      if (l !== location)
        myLocations.push(l);
    });
    this.setState({ myLocations });
    solid.saveStoredLocationToSolid(myLocations);
    solid.deleteStoredPicture(location.photo);
  }

  // Method that loads the friends location to 
  // show them in the map later
  // TODO: Cambiar el nombre de esto
  async loadLocations() {

    // First, we load and store the stored locations:
    let myLocations = await solid.loadStoredLocationFromSolid()
    if (myLocations === undefined) {
      myLocations = [];
    }
    this.setState({ myLocations });

    // Then we do the same with the friends locations and data:
    var friends = await solid.loadFriendsFromSolid();
    this.setState({ friends: friends });

    // Finally, we get our own profile pic, and store it:
    var photo = await solid.getMyPhoto();
    this.setState({ myPhoto: photo });
    //Reloads the first one to ask for every friend's location
    this.reloadRing(3);
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

          var coords = await solid.getFriendLocation(friend);
          if (coords !== null) {
            //TODO: validate what we have before pushing it (it has to be two doubles separated by a comma)
            document.getElementById("friend-" + friend.pod).style.color = "lime";
            friend.lat = coords[0];
            friend.lng = coords[1];
            friend.ring = this.computeRing(friend);
            if (friend.ring === 1 && ring !== 1 && !friend.hasExited) {
              this.notifyNewFriendEntered(friend.name);
              friend.hasExited = true;
            }
            if (friend.ring !== 1 && ring === 1 && friend.hasExited) {
              this.notifyNewFriendExited(friend.name);
              friend.hasExited = false;
            }
          }
          else {
            document.getElementById("friend-" + friend.pod).style.color = "grey";
          }
        }
      }
    }

    this.setState({ friends: friendList });

  }
  /**
   * Calculates and returns the ring a friend belongs to
   * @param {Object} friend 
   * @returns {int} corresponding ring
   */
  computeRing(friend) {
    var loc = { lat: parseFloat(friend.lat), lng: parseFloat(friend.lng) };
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
  // SOURCE OF THIS ALGORITHM : https://www.movable-type.co.uk/scripts/latlong.html
  distanceBetweenCoordinates(lat1, lng1) {
    const lat2 = parseFloat(this.state.currentLat);
    const lng2 = parseFloat(this.state.currentLng);

    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres  
  }

  /**
   * Starts the timer to reload the friends locations
   */
  async startTimer() {
    let self = this;
    setInterval(() => {
      self.reloadRing(1);
      self.getLocation();
    }, 1000); // 1 second
    setInterval(() => {
      self.reloadRing(2);
    }, 10000); // 10 seconds
    setInterval(() => {
      self.reloadRing(3);
    }, 60000); // 1 minute
    //this.reloadRing()
  }
  reloadAllRings() {
    this.reloadRing(1);
    this.reloadRing(2);
    this.reloadRing(3);
  }
  // Handles the change of the range slider
  handRangeChange(event) {
    this.setState({ range: event.target.value })
    this.reloadAllRings();
  }

  notifyNewFriendEntered(name) {
    var message = "Your friend " + name + " is near you!";
    this.addNewNotification("New friend nearby!", message, "success");
  }
  notifyNewFriendExited(name) {
    var message = "Your friend " + name + " went away!";
    this.addNewNotification("Friend out of the radar!", message, "warning");
  }
  /**
   * Function to add new notification in our GUI
   */
  addNewNotification(title, message, type) {
    store.addNotification({
      title: title,
      message: message,
      type: type,
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
    var audio = new Audio('n_sound.mp3');
    audio.play();
  }

  changeMapType() {
    if (this.state.mapType === 'gmap') {
      this.setState({ mapType: 'lmap' });
      document.getElementById('ShowMenu').style.marginTop = "10vh";
      console.log(this.state.myLocations)
    }
    else {
      this.setState({ mapType: 'gmap' });
      document.getElementById('ShowMenu').style.marginTop = "1vh";
    }
  }

  // Renders the most part of the webpage:
  // - Title
  // - Menu button and menu
  // - Range and its slider
  // - Usable map
  render() {
    return (
      <div className="App">
        {
          google ? null : <LoadScript
            id="script-loader"
            googleMapsApiKey={process.env.REACT_APP_GOOGLE_KEY}
            libraries={libraries}> </LoadScript>
        }
        <SideMenu handleNewLocation={(name, photo) => this.handleNewLocation(name, photo)} myLocations={this.state.myLocations}
          warning={() => this.addNewNotification("The file is not an image", "Please, check that the file you provided was a PNG, a JPG or a GIF", "danger")}
          solid={solid} friends={this.state.friends} changeMapType={(mapType) => this.changeMapType(mapType)} handleDeleteLocation={(location) => this.handleDeleteLocation(location)} />
        {/* System notification componenet */}
        <ReactNotification />

        <div className="slider-container">
          <input className="slider" type="range" min="1000" max="100000" step="500" value={this.state.range} onChange={this.handRangeChange.bind(this)} />
        </div>
        {

          this.state.currentLat && this.state.currentLng ?
            this.state.mapType === 'gmap' && window.google !== undefined ?
              <GMap lat={this.state.currentLat} lng={this.state.currentLng} friends={this.state.friends}
                myIcon={this.state.myPhoto} locations={this.state.myLocations} range={this.state.range} zoom={this.state.zoom} />
              : this.state.mapType === 'lmap' ?

                <LMap lat={this.state.currentLat} lng={this.state.currentLng} friends={this.state.friends}
                  myIcon={this.state.myPhoto} locations={this.state.myLocations} range={this.state.range} zoom={this.state.zoom} />
                : <div />
            : (<div className="loader"></div>)
        }
      </div >
    )
  }

}

export default App;