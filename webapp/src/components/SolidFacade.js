import React from 'react';

const auth = require('solid-auth-client');
const { default: data } = require('@solid/query-ldflex');
const fetch = auth.fetch;
const FC = require('solid-file-client');
const fc = new FC(auth);

class SolidFacade {


    /**
     * Saves the location into the solid pod
     */
    async saveLocationToSolid() {
        var locationString = this.state.currentLat + ',' + this.state.currentLng; // Son ambos null ??
        let session = await this.getCurrentSession();
        let url = session.webId.replace("profile/card#me", "radarin/last.txt");
        if (this.state.currentLat != null && this.state.currentLng != null) {
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

}