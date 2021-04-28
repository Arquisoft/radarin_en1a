import React from 'react';

const auth = require('solid-auth-client');
const { default: data } = require('@solid/query-ldflex');
const fetch = auth.fetch;
const FC = require('solid-file-client');
const fc = new FC(auth);

class SolidFacade {

    async saveLocationToSolid() {
        var locationString = this.state.currentLat + ',' + this.state.currentLng; // Son ambos null ??
        let session = await this.getCurrentSession();
        let url = session.webId.replace("profile/card#me", "radarin/last.txt");
        if (this.state.currentLat != null && this.state.currentLng != null) {
            // If the file does not exist its created, otherwise is just overwritten
            await fc.postFile(url, new Blob([locationString]));
        }
    }

    // Returns the current session
    async getCurrentSession() {
        let session = await auth.currentSession();
        if (!session) {
            let popupUri = './popup.html';
            session = await auth.popupLogin({ popupUri });
        }
        return session;
    }

}