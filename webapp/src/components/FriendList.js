import React from 'react';

class FriendList extends React.Component {

    render() {
        let friendsList = this.props.friends;
        if (friendsList !== undefined)
            return (
                <div>
                    <h3 className ="friends-title">Friends list:</h3>
                    <table id='friends'>
                        {friendsList.map((friend) => {
                            var photo = friend.photo;
                            if (photo === undefined)
                                photo = "/user.png";
                            // Alt is a tag that's used when the image cannot be loaded,
                            // needed, if not warnings are sent
                            // Using target="_blank" without rel="noreferrer" is a security risk
                            return <tr>
                            <th className="profile-pic"><img width="24px" height="24px" src={photo} alt="Load error" /></th>
                            <th><a id={"friend-" + friend.pod} target="_blank" rel="noreferrer" className="friendLink" href={friend.pod}>{friend.name}</a></th>
                            <th><button title="Enable/Disable friend's permissions" class="button-permission" id={"button-" + friend.pod} 
                                        onClick={() => this.props.handlePermission(friend)}>{friend.permission?"✔️":"❌"}</button></th>
                            </tr>
                        })}
                    </table>
                </div>)
        else return <div></div>;
    }
}

export default FriendList