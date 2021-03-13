import React from 'react';
import './App.css';
import logo from './logo.svg';
import Welcome from './components/Welcome';
import EmailForm from "./components/EmailForm";
import UserList from "./components/UserList";
import 'bootstrap/dist/css/bootstrap.min.css';
import Map from "./components/Map";

class App extends React.Component{
  constructor(props){
    super(props)
    this.getLocation();
    this.state = {
      users:[],
      currentLat : null,
      currentLng : null
    };
  }

  refreshUsers(users){
    this.setState({users:users})
  }
  
  getLocation() {
    const self = this;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) { //watchPosition()
        self.setState({
          currentLat: position.coords.latitude,
          currentLng: position.coords.longitude
        });
      });
    }
  }
  
  render(){
    return(
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <Welcome name="ASW students"/>
        </header>
        <div className="App-content">
          {
            this.state.currentLat && this.state.currentLng ?
            <Map lat={this.state.currentLat} lng={this.state.currentLng}/> : null
          }
          <EmailForm refreshUsers={this.refreshUsers.bind(this)}/>
          <UserList users={this.state.users}/>
          <a className="App-link"
            href="https://github.com/pglez82/radarin_0"
            target="_blank"
            rel="noopener noreferrer">Source code</a>
        </div>
      </div>
    )
  }
}

export default App;