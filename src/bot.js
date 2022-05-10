//Imports Discord.js library
const Discord = require('discord.js');
const discordClient = new Discord.Client();
const fs = require('fs');
const path = require('path');
const express = require('express');
const adminUsers = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./json/admin-roles.json")));
const channelIds = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./json/channels.json")));

var app = express();
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Running on port ${ PORT }`);
});
app.get('/',(req,res) => {
    return res.send('Hello');
    });
//Loads environment variables from the .env file
require('dotenv').config();

const token = process.env.TOKEN;
const prefix = process.env.PREFIX;

//Logs a success message when log in succeeds

//Importing functions
var { injectPrompts, getDinoPricesEmbed } = require('./functions/embeds');
var { changePrice } = require('./functions/pricelist');
var { processFileTransfer, deleteFile } = require('./functions/fileTransfer');
var { getSteamID, updateSteamID, addSteamID } = require('./api/steamManager');


var processing = false;

async function processingCheck(message) {
    if (processing) {
        message.reply(`please wait on other user(s) to complete their transaction.`);
    }
    while (processing){
        console.log(`${message.author.username}[${message.author.id}] is waiting in queue. . .`);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

function adminRoleCheck(message) {
    for (var x = 0; x < adminUsers.length; x++) {
        if (message.member.roles.cache.has(adminUsers[x].id)){
            return true;
        } 
    }
    return false;
}

function channelIdCheck(channel, cmd) {
    if ( cmd.toLowerCase() == "grow" || cmd.toLowerCase() == "inject") {
        if ( channel == channelIds.growChannel ) return true;
    }
    if ( cmd.toLowerCase() == "slay" ) {
        if ( channel == channelIds.slayChannel ) return true;
    }
    if ( cmd.toLowerCase() == "link" || cmd.toLowerCase() == "updateid" ) {
        if ( channel == channelIds.steamidChannel ) return true;
    }
    return false;
}

discordClient.on("ready", () => {
    console.log(`Successfully logged in.`);
});

//On message listener
discordClient.on("message", async message => {
    if (message.author.bot) return;

    if (!message.content.startsWith(prefix)) return;

    //Assigning message contents to command name and arguments
    const [cmdName, ...args] = message.content
        .trim()
        .substring(prefix.length)
        .split(/ +/g);


    if ( cmdName.toLowerCase() === "change-price" ) {
        if (!adminRoleCheck(message)) return message.reply(`you do not have the rights to use this command.`);

        if( args.length != 2 ) return message.reply(`please use the following format:\n${prefix}change-price [dino name] [new price]`);

        if (changePrice(args[0], args[1])) return message.reply(`successfully changed the price of ${args[0]}`);

        return message.reply(`could not chnage the price of ${args[0]}`);
    }

    if ( cmdName.toLowerCase() == "prices" ) {
        return await getDinoPricesEmbed(message);
    }

    if ( cmdName.toLowerCase() === "inject" ) {
        //if ( !channelIdCheck(message.channel.id, "inject") ) return message.reply(`please use <#${channelIds.growChannel}>`);

        var injectRequest = await injectPrompts(message);
        console.log(`inject request: ${injectRequest}`);

        if (!injectRequest) return;

        await processingCheck(message);

        processing = true;
        if (await processFileTransfer(message, injectRequest, "inject") ) {
            processing = false;
            message.reply(`successfully injected your dino. Please log back in to the server.`);
        } else {
            processing = false;
        }
    }


    if ( cmdName.toLowerCase() ===  "link") {
        
        //if ( !channelIdCheck(message.channel.id, "link") ) return message.reply(`please use <#${channelIds.steamidChannel}>`);

        if( args.length != 1 ) return message.reply(`please use the following format:\n${prefix}link [steam ID here]`);

        if( !await addSteamID(message.author.id, args[0]) ) return message.reply(`steam ID may already be in use, or it is invalid, please try again`);

        return message.reply(`successfully linked your steam ID`);
    }

    if ( cmdName.toLowerCase() === "updateid" ) {
        
        // if ( !channelIdCheck(message.channel.id, "link") ) return message.reply(`please use <#862878037699330058>`);
        
        if (!adminRoleCheck(message)) return message.reply(`you do not have the rights to use this command.`);
        
        if( args.length != 2 ) return message.reply(`please use the followeing format\n${prefix}updateid [@user] [updated steam ID]`);

        if( !await updateSteamID(args[0], args[1]) ) return message.reply(`something went wrong updating this ID.`);

        return message.reply(`${args[0]}'s steam id successfully updated.`);

    }

});


discordClient.login(token);