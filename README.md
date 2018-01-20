# SHOUTcast Stream Adder App
This is a `node.js` application which runs on the same server as your SHOUTcast server and allows you to easily add streams to the server without having to manually edit and restart the server.

## Features
- Simple web UI
- Easy installation
- Authenticated webpage
- Simple Configuration

## Installation Instructions
1. `cd path/to/directory && git clone https://github.com/radioplanet/sc-stream-adder-app`
2. `cd sc-stream-adder-app && npm init`
3. `cp exampleSettings.json settings.json` and then edit `settings.json` as shown below.
4. `npm start` to check the system comes online then `^C (CTRL+C)` to stop the script.
5. `npm start > /dev/null 2>&1 & disown` to start the process as a daemon.
6. Add the app to launch on startup.
7. Open firewall port the app uses.

## Setup Configuration
- `port`: The port that this app should run on.
- `minSID`: The smallest randomly generated SID to use.
- `maxSID`: The largest randomly generated SID to use.
- `maxUsersDefault`: The default amount of maximum users to be able to connect.
- `defaultPwd`: The default password you can insert instead of the 16 digit random password.
- `absoluteShoutcastConfigPath`: The absolute path of your SHOUTcast server configuration. This needs to be readable/writeable.
- `shoutcastURL`: The URL to access the web interface of your SHOUTcast server. Could be `localhost:8000`.
- `appUsername`: Username to use when logging into the app. **Shouldn't be `admin`.**
- `appPwd`: Password to use when logging into the app. **This should be secure to stop people hijacking your server.**
