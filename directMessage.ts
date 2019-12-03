import { IgApiClientExt, IgApiClientFbns, withFbns } from 'instagram_mqtt';
import {IgApiClient, IgCheckpointError} from 'instagram-private-api';
import { promisify } from 'util';
import { writeFile, readFile, exists } from 'fs';
import * as Bluebird from 'bluebird';
import inquirer = require('inquirer');

const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);
const existsAsync = promisify(exists);

const { username, password} = require("./config");

(async () => {
    const ig: IgApiClientFbns = withFbns(new IgApiClient());
    ig.state.generateDevice(username);

    // this will set the auth and the cookies for instagram
    await readState(ig);

    // this logs the client in
    await loginToInstagram(ig);

    // Example: listen to direct-messages
    // 'direct_v2_message' is emitted whenever anything gets sent to the user
    ig.fbns.on('direct_v2_message', logEvent('direct-message'));

    // 'push' is emitted on every push notification
    ig.fbns.on('push', logEvent('push'));
    // 'auth' is emitted whenever the auth is sent to the client
    ig.fbns.on('auth', async (auth) => {
        // logs the auth
        logEvent('auth')(auth);

        //saves the auth
        await saveState(ig);
    });
    // 'error' is emitted whenever the client experiences a fatal error
    ig.fbns.on('error', logEvent('error'));
    // 'warning' is emitted whenever the client errors but the connection isn't affected
    ig.fbns.on('warning', logEvent('warning'));

    // this sends the connect packet to the server and starts the connection
    await ig.fbns.connect();
})();

async function saveState(ig: IgApiClientExt) {
    return writeFileAsync('state.json', await ig.exportState(), { encoding: 'utf8' });
}

async function readState(ig: IgApiClientExt) {
    if (!await existsAsync('state.json'))
        return;
    await ig.importState(await readFileAsync('state.json', {encoding: 'utf8'}));
}

async function loginToInstagram(ig: IgApiClientExt) {
    ig.request.end$.subscribe(() => saveState(ig));
    await Bluebird.try(() =>ig.account.login(username, password)).catch(IgCheckpointError, async () => {
        console.log(ig.state.checkpoint); // Checkpoint info here
        await ig.challenge.auto(true); // Requesting sms-code or click "It was me" button
        console.log(ig.state.checkpoint); // Challenge info here
        const { code } = await inquirer.prompt([
            {
                type: 'input',
                name: 'code',
                message: 'Enter code',
            },
        ]);
        console.log(await ig.challenge.sendSecurityCode(code));
    });
}

/**
 * A wrapper function to log to the console
 * @param name
 * @returns {(data) => void}
 */
function logEvent(name) {
    return data => console.log(name, data);
}