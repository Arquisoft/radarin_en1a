const auth = require('solid-auth-client');
const { default: data } = require('@solid/query-ldflex');
const fetch = auth.fetch;
const FC = require('solid-file-client');
const fc = new FC(auth);

class SolidFacade {

    /**
         * Saves the location into the solid pod
         */
    async saveLocationToSolid(lat, lng) {
        var locationString = lat + ',' + lng; // Son ambos null ??

        let session = await this.getCurrentSession();
        let url = session.webId.replace("profile/card#me", "radarin/last.txt");
        if (lat != null && lng != null) {
            // If the file does not exist its created, otherwise is just overwritten
            await fc.postFile(url, new Blob([locationString]));
        }
    }

    /**
     * Retrieves the current session
     * @returns the current session
     */
    async getCurrentSession() {
        let session = await auth.currentSession();
        if (!session) {
            let popupUri = './popup.html';
            session = await auth.popupLogin({ popupUri });
        }
        return session;
    }

    /**
     * First, access the file stored_locations.json or creates it if it does not exist.
     * Then, loads the locations stored in the file and returns it
     * @returns locations loaded from the pod
     */
    async loadStoredLocationFromSolid() {
        let session = await this.getCurrentSession();

        // If the file does not exist, is created
        let fileUrl = session.webId.replace("profile/card#me", "radarin/stored_locations.json");
        if (!(await fc.itemExists(fileUrl)))
            await fc.postFile(fileUrl, new Blob());
        // Until here

        let url = session.webId.replace("profile/card#me", "radarin/stored_locations.json");
        let radar = await fetch(url).then((x) => {
            if (x.status === 200)  // if the file exists, return the text
                return x.text()
        });
        if (radar === "")
            return;

        const locations = JSON.parse(radar);
        return locations;
    }

    /**
    * Saves the locations into the solid profile
    * @param {Array} myLocations locations that are stored into the the pod
    */
    async saveStoredLocationToSolid(myLocations) {
        let session = await this.getCurrentSession();
        // If the file does not exist, it is created
        let fileUrl = session.webId.replace("profile/card#me", "radarin/stored_locations.json");
        let myJSON = JSON.stringify(myLocations);
        await fc.postFile(fileUrl, new Blob([myJSON]));
    }

    async handlePermission(friend) {

        let session = await this.getCurrentSession();
        let url = session.webId.replace("profile/card#me", "radarin/last.txt");
        let aclObject = await fc.aclUrlParser(url)
        if (!friend.permission) {
            friend.permission = true;
            aclObject = await fc.acl.addUserMode(aclObject, [{ agent: friend.pod }], ['Read']);
        } else {
            friend.permission = false;
            aclObject = await fc.acl.deleteUserMode(aclObject, [{ agent: friend.pod }], ['Read']);
        }
        const aclBloks = [aclObject] // array of block rules
        const aclContent = await fc.acl.createContent('radarin/last.txt', aclBloks);
        const { acl: aclUrl } = await fc.getItemLinks(url, { links: 'include_possible' });
        fc.putFile(aclUrl, aclContent, 'text/turtle');
    }

    async checkFriendsPermission(friend) {
        let session = await this.getCurrentSession();
        let url = session.webId.replace("profile/card#me", "radarin/last.txt");

        let aclObject = await fc.aclUrlParser(url)
        const aclBloks = [aclObject] // array of block rules
        const aclContent = await fc.acl.createContent('radarin/last.txt', aclBloks);

        // TODO: This is a dirty hack, we should properly check if the user has permissions, not just look if its webID is on the list
        friend.permission = (aclContent.includes(friend.pod));

    }

    async getMyPhoto() {
        let session = await this.getCurrentSession();
        return data[session.webId]["vcard:hasPhoto"].then((x) => {
            var photo = "./user.png";
            if (x !== undefined) {
                photo = x.value;
            }
            return photo;
        });
    }

    async loadFriendsFromSolid() {
        var friends = [];
        var session = await this.getCurrentSession();
        var person = data[session.webId]
        for await (const friend of person.friends) {
            var lFriend = {
                pod: `${await data[friend]}`,
                name: await data[friend].name.value,
                photo: await data[friend]["vcard:hasPhoto"].value,
                lat: null,
                lng: null,
                ring: 3,
                permission: null
            };
            this.checkFriendsPermission(lFriend);
            friends.push(lFriend);
        }
        return friends;
    }

}

export default SolidFacade;