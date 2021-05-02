import React from 'react';

class FriendList extends React.Component {

    render() {
        let friendsList = this.props.friends;
        if (friendsList !== undefined)
            return (
                <div>
                    <h3 className ="friends-title">Friends list:</h3>
                    <table id='friends'>
                        <tbody>
                        {friendsList.map((friend) => {
                            var photo = friend.photo;
                            if (photo === undefined)
                                photo = "/user.png";
                            // Alt is a tag that's used when the image cannot be loaded,
                            // needed, if not warnings are sent
                            // Using target="_blank" without rel="noreferrer" is a security risk
                            return <tr key= {"friend-tr-" + friend.pod}>
                            <th key= {"friend-th1-" + friend.pod} className="profile-pic"><img width="24px" height="24px" src={photo} alt="Load error" /></th>
                            <th key= {"friend-th2-" + friend.pod}><a id={"friend-" + friend.pod} target="_blank" rel="noreferrer" className="friendLink" href={friend.pod}>{friend.name}</a></th>
                            <th key= {"friend-th3-" + friend.pod}><button title="Enable/Disable friend's permissions" className="button-permission" id={"button-" + friend.pod} 
                                        onClick={() => this.props.handlePermission(friend)}>{friend.permission?"✔️":"❌"}</button></th>
                            </tr>
                        })}
                        </tbody>
                    </table>
                </div>)
        else return <div></div>;
    }
}

export default FriendList