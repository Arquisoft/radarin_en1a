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
      rangeSelection: "6000",
      locations : ["43.5169,-6.01471","43.55473,-5.92483","43.4667,-5.9167"]
    };
  }
  
  refreshUsers(users) {
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

  handRangeChange(event) {
    this.setState({rangeSelection: event.target.value})
  }
  
  handleNewLocation(location) {
    if (location === "") {
      alert("Empty location not allowed!");
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
      <div className="App">
        <header>
          <h1>Radarin - Friends Location</h1>
        </header>
        <InputLocation addNewLocation={(location) => this.handleNewLocation(location)} />
        <LocationListDisplay locations={this.state.locations} deleteLocation={(location) => this.handleDeleteLocation(location)} />
        <SolidStorage loadFromSolid={() => this.loadFromSolid()} saveToSolid={() => this.saveToSolid()} />
        <div className="App-content">
          <span>{this.state.rangeSelection} meters</span>
          <input type="range" min="4000" max="10000" step="500" value={this.state.rangeSelection} onChange={this.handRangeChange.bind(this)}/>
          <div className="Map-content">
          {
            this.state.currentLat && this.state.currentLng ? 
              <Map lat={this.state.currentLat} lng={this.state.currentLng} locations={this.state.locations} range={this.state.rangeSelection}/>
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
  let radar = data[url];
  const locations = [];
  for await (const location of radar.schema_itemListElement) {
    locations.push(location.toString());
  }
  return Array.from(locations.values());
}

async function saveSolidLocations(locations, oldLocations) {
  let session = await getCurrentSession();
  let url = session.webId.replace("profile/card#me", "radarin/last.ttl#locations");
  let radar = data[url];
  for (const t of oldLocations) {
    await radar["schema:itemListElement"].delete(t.toString());
  }
  for (const t of locations) {
    await radar["schema:itemListElement"].add(t.toString());
  }
  alert("Saved to your Solid POD");
}

async function getCurrentSession() {
  let session = await auth.currentSession();
  let popupUri = 'https://solid.community/common/popup.html';
  if (!session) {
    session = await auth.popupLogin({ popupUri });
  }
  return session;
}

export default App;