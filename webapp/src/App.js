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
      currentLng: null
    };
  }
  refreshUsers(users){
    this.setState({ users: users })
  }
  
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
  
  render(){
    return (
      <div className="App">
        <div className="App">
          <header>
            <h1>Admin Radain</h1>
          </header>
          <LocationsList />
        </div>
        <div className="App-content">
          {
            this.state.currentLat && this.state.currentLng ?
              <Map lat={this.state.currentLat} lng={this.state.currentLng} />
              : <h2>Location needed for services</h2>
          }
        </div>
      </div>
    )
  }

}

class LocationsList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      locations: [],
    }
  }

  handleNewLocation(location) {
    if (location === "") {
      alert("Empty location is not allowed!");
      return;
    }
    const locations = this.state.locations.concat(location);
    this.setState({ locations });
  }

  handleDeleteLocation(location) {
    const locations = this.state.locations.slice();
    locations.splice(locations.indexOf(location), 1);
    this.setState({ locations });
  }

  async loadFromSolid() {
    let locations = await loadSolidLocations();
    this.setState({ locations });
  }

  async saveToSolid() {
    let oldLocations = await loadSolidLocations();
    saveSolidLocations(this.state.locations, oldLocations);
  }

  render() {
    return (
      <div className="App-content">
        <InputLocation addNewLocation={(location) => this.handleNewLocation(location)} />
        <LocationList locations={this.state.locations} deleteLocation={(location) => this.handleDeleteLocation(location)} />
        <SolidStorage loadFromSolid={() => this.loadFromSolid()} saveToSolid={() => this.saveToSolid()} />
      </div>
    );
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

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event) {
    this.props.addNewLocation(this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" name="location" value={this.state.value} onChange={this.handleChange} />
        <input type="submit" value="+" />
      </form>
    );
  }

}

//TODO: MODIFICAR ESTO PARA RENDERIZAR EL MAPA (API GOOGLE MAPS)
function LocationList(props) {
  var data =
    props.locations.map(l => { // l es cada location
      var tp = l.split(',');
      var d = {
        lat: tp[0],
        lon: tp[1]

      }
      return d;
    })
  console.log(JSON.stringify(data));
  return null;
}

class SolidStorage extends React.Component {
  render() {
    return (
      <div>
        <button onClick={() => this.props.loadFromSolid()}>Load from Solid</button>
        <button onClick={() => this.props.saveToSolid()}>Save to Solid</button>
      </div>
    );
  }
}

async function loadSolidLocations() {
  let session = await getCurrentSession();
  let url = session.webId.replace("profile/card#me", "radarin/last.ttl#locations");
  let locationList = data[url];
  const locations = [];
  for await (const location of locationList.schema_itemListElement) {
    locations.push(location.toString());
  }
  return Array.from(locations.values());
}

async function saveSolidLocations(newlocations, oldLocations) {
  let session = await getCurrentSession();
  let url = session.webId.replace("profile/card#me", "radarin/last.ttl#locations");
  let locations = data[url];
  for (const t of oldLocations) {
    await locations["schema:itemListElement"].delete(t.toString());
  }
  for (const t of newlocations) {
    await locations["schema:itemListElement"].add(t.toString());
  }
  alert("Saved to your Solid POD");
}

async function getCurrentSession() {
  let session = await auth.currentSession();
  let popupUri = 'https://inrupt.net/common/popup.html';
  if (!session) {
    session = await auth.popupLogin({ popupUri });
  }
  return session;
}

//MAPA


export default App;