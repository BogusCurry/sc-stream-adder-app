// jshint esversion: 6
const settings = require("./settings.json");
const data = require("./data.json");
const express = require("express");
const app = express();
const fs = require("fs");
const requestify = require("requestify");
const auth = require('basic-auth');

app.set("views", "./views");
app.set("view engine", "pug");

function randomNum(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function getNewSID() {
	var min = settings.minSID;
	var max = settings.maxSID;
	while (true) {
		var tryRand = randomNum(min, max);
		if (data.SIDs.indexOf(tryRand) == -1) {
			return tryRand;
		}
	}
}

function generatePassword() {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var strLength = 16;
	var randomString = '';
	for (var i = 0; i < strLength; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		randomString += chars.substring(rnum, rnum + 1);
	}
	return randomString;
}

let formObj = {
	SID: getNewSID(),
	maxUsers: settings.maxUsersDefault,
	password: generatePassword(),
	defaultPwd: settings.defaultPwd,
	maxGlobalUsers: settings.maxGlobalUsersDefault
};

function sendformObj() {
	let toSend = formObj;
	console.log("\n=== " + new Date() + " ===" + "\nSending the Following to User:");
	console.log(toSend);
	console.log("===============================================");
	return (toSend);
}

app.get("/", (req, res) => {

	var credentials = auth(req);
	if(!credentials || credentials.name !== settings.appUsername || credentials.pass !== settings.appPwd) {

		// Ask user to authenticate
		res.set('WWW-Authenticate', 'Basic realm="page"').status(401).send();

	} else {

		// Send user configuration form.
		res.status(200);
		res.render("index", sendformObj());

	}

});

app.get("/submit", (req, res) => {

	var credentials = auth(req);

	if(!credentials || credentials.name !== settings.appUsername || credentials.pass !== settings.appPwd) {

		// Ask user to authenticate
		res.set('WWW-Authenticate', 'Basic realm="page"').status(401).send();

	} else {

		// Start logging request
		console.log("\n=== " + new Date() + " ===" + "\nUser Returned:");
		console.log(req.query);

		if (req.query.SID === null || req.query.maxUsers === null || req.query.password === null || req.query.maxGlobalUsers === null) {

			// Ensure all parameters are present
			res.status(200).send("<center><h1>Not all parameters are present.</h1><br><a href='javascript:history.back()'>Go Back</a></center>");
			console.log("\nUser Forgot Parameter... Sending Back");

		} else if (data.SIDs.indexOf(parseInt(req.query.SID)) != -1) {

			// Stop duplicate SIDs
			res.status(200).send("<center><h1>SID already in use.</h1><br><a href='javascript:history.back()'>Go Back</a></center>");
			console.log("\nUser Attempted to Add an SID Already in Use");
			console.log("SID Number:" + req.query.SID);

		} else {

			// Add new SID to data.json
			fs.readFile('data.json', (err, data) => {

				var json = JSON.parse(data);
				json.SIDs.push(parseInt(req.query.SID));
				fs.writeFile('data.json', JSON.stringify(json));

			});

			// Append to config file
			// var stringToAppend = "\n# Generated at " + new Date() + "\nstreamid_" + req.query.SID + "=" + req.query.SID + "\nstreammaxuser_" + req.query.SID + "=" + req.query.maxUsers + "\nstreampassword_" + req.query.SID + "=" + req.query.password;
			// fs.appendFileSync(settings.absoluteShoutcastConfigPath, stringToAppend);

			// Update Global Max Users
			fs.readFile(settings.absoluteShoutcastConfigPath, "utf8", (err, shoutcastConfig) => {

				let pattern = /maxuser: \d+/;
				let stringToAppend = "\n\n# Generated at " + new Date() + "\nstreamid_" + req.query.SID + "=" + req.query.SID + "\nstreammaxuser_" + req.query.SID + "=" + req.query.maxUsers + "\nstreampassword_" + req.query.SID + "=" + req.query.password;
				console.log(shoutcastConfig);
				shoutcastConfig = shoutcastConfig.replace(pattern, "maxuser: " + req.query.maxGlobalUsers);
				shoutcastConfig += stringToAppend
				fs.writeFile(settings.absoluteShoutcastConfigPath, shoutcastConfig);

				// Log what is being added
				console.log("\nAdding following to configuration file...");
				console.log(stringToAppend);

			});

			// Reload the SHOUTcast Server
			console.log("\nReloading SHOUTcast Server...")
			// requestify.get(settings.shoutcastURL + "/admin.cgi?mode=reload", {
			// 	auth: {
			// 		username: "admin",
			// 		password: settings.shoutcastAdminPassword
			// 	}
			// }).then((response) => {
			// 	console.log(response);
			// });

			res.status(200).send("<center><h1>Update Successful.</h1><br><a href='javascript:history.back()'>Go Back</a></center>");

		}
	}
	console.log("===============================================");
});

app.listen(settings.port, console.log("\n=== " + new Date() + " ===" + "\nSystem Start...\nsettings.json:\n" + JSON.stringify(settings) + "\n==============================================="));
