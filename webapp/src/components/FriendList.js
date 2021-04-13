import React from 'react';

class FriendList extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let friendsList = this.props.friends;
        if (this.props.online) {
            const self = this;
            return friendsList.map((prop) => {
                var index = friendsList.indexOf(prop);
                var photo = self.props.friendsPhotos[index];

                if (photo == undefined)
                    photo = "/user.png"
                console.log(photo)

                return <li><img width="24px" height="24px" src={photo} /><a target="_blank" className="friendLink" href={prop}>{self.props.friendsNames[index]}</a></li>
            });
        }
        else return <div></div>;
    }
}

export default FriendList