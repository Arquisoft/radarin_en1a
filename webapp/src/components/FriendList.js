import React from 'react';

class FriendList extends React.Component {

    render() {
        let friendsList = this.props.friends;
        if (friendsList !== undefined)
            return friendsList.map((friend) => {
                var photo = friend.photo;
                if (photo === undefined)
                    photo = "/user.png";
                // Alt is a tag that's used when the image cannot be loaded,
                // needed, if not warnings are sent
                // Using target="_blank" without rel="noreferrer" is a security risk
                return <li>
                    <img width="24px" height="24px" src={photo} alt="Load error" />
                    <a target="_blank" rel="noreferrer" className="friendLink" href={friend.pod}>{friend.name}</a>
                    </li>
            });
        else return <div></div>;
    }
}

export default FriendList