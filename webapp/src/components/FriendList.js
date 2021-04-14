import React from 'react';

class FriendList extends React.Component {
    //constructor(props) {
    //    super(props);
    //} Unneeded

    render() {
        let friendsList = this.props.friends;
        if (this.props.online) {
            const self = this;
            return friendsList.map((prop) => {
                var index = friendsList.indexOf(prop);
                var photo = self.props.friendsPhotos[index];

                if (photo === undefined)
                    photo = "/user.png"
                console.log(photo)

                // Alt is a tag that's used when the image cannot be loaded,
                // needed, if not warnings are sent
                // Using target="_blank" without rel="noreferrer" is a security risk
                return <li><img width="24px" height="24px" src={photo} alt="Load error" /><a target="_blank" rel="noreferrer" className="friendLink" href={prop}>{self.props.friendsNames[index]}</a></li>
            });
        }
        else return <div></div>;
    }
}

export default FriendList