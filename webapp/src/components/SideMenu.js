import React from "react";

import { LoggedIn, LoginButton, LogoutButton, LoggedOut } from '@solid/react';
import LocationListDisplay from "./LocationList";
import InputLocation from "./InputLocation";
import FriendList from './FriendList';

class SideMenu extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            mapType: props.mapType
        }
    }

    // Displays the side menu 
    displayMenu() {

        var width = document.getElementById('sidemenu').style.width;
        if (width.toString().length === 0) {
            document.getElementById('sidemenu').style.width = '25%';
            document.getElementById('sidemenu').style.minWidth = "400px";
            document.getElementById('ShowMenu').style.transform = "scaleX(-1)";
        }
        else {
            document.getElementById('sidemenu').style.width = '';
            document.getElementById('sidemenu').style.minWidth = "0px";
            document.getElementById('ShowMenu').style.transform = "scaleX(1)";
        }
    }

    render() {
        return <div id="sidemenu" data-testid="sidemenu">

            <LoggedOut>
                <LoginButton className="button-Login" popup="./popup.html" />
            </LoggedOut>

            <LoggedIn>

                <InputLocation addNewLocation={(name) => this.props.handleNewLocation(name)} /><hr />
                <LocationListDisplay locations={this.props.myLocations} deleteLocation={(location) => this.props.handleDeleteLocation(location)} /><hr />
                <FriendList data-testid="friendList" friends={this.props.friends} handlePermission={(friend) => this.props.solid.handlePermission(friend)}></FriendList><hr />
                <button onClick={() => this.props.changeMapType()} className="button-ChangeMap">Change Map</button><hr />
                <LogoutButton className="button-Logout" />
            </LoggedIn>

            <button id="ShowMenu" onClick={() => this.displayMenu()}><img src="./oMenu.png" alt="_" /></button>
        </div>
    }
}

export default SideMenu;