import React from 'react';

class FriendList extends React.Component {
    //constructor(props) {
    //    super(props);
    //} Unneeded

    async getFriendName(friend) {
        return await this.props.data[friend].name.value;
    }
    async getFriendPhoto(friend) {
        return await this.props.data[friend]["vcard:hasPhoto"].value;
    }
    
    

    render() {
        let friendsList = this.props.friends;
        //if (this.props.online) {
        const self = this;
        console.log("Friends from lis: " + friendsList);
        return friendsList.map((friend) => {
            var friendName = self.getFriendName(friend);
            var photo = self.getFriendPhoto(friend);

            if (photo === undefined)
                photo = "/user.png";
            // Alt is a tag that's used when the image cannot be loaded,
            // needed, if not warnings are sent
            // Using target="_blank" without rel="noreferrer" is a security risk
            return <li><img width="24px" height="24px" src={photo} alt="Load error" /><a target="_blank" rel="noreferrer" className="friendLink" href={friend}>{friendName}</a></li>
        });
        //}
        //else return <div></div>;
    }
}

export default FriendList