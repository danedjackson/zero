// //Imports Discord.js library
// const Discord = require('discord.js');
// const discordClient = new Discord.Client();

var token = process.env.TOKEN;

//Loads environment variables from the .env file
require('dotenv').config();

//Logs a success message when log in succeeds
discordClient.on("ready", () => {
    console.log(`Successfully logged in.`);
});

//On message listener
discordClient.on("message", (message) => {

});


discordClient.login(token);