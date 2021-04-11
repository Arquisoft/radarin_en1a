import React from 'react';
import ListGroup from "react-bootstrap/ListGroup";


class FriendList extends React.Component {
    constructor(users) {
        super();
        this.users = users
    }
    render() {
        return (
            <div className="FriendList">
                <h2>Friend List</h2>
                <ListGroup>
                    {
                        this.users.map(function (user) {
                            return <p id={'user-' + user.name}>{user.name}</p>
                        })}
                </ListGroup>
            </div>
        )
    }
}

export default FriendList