const Discord = require('discord.js');
const prefix = process.env.PREFIX;

var { getDinoPrices } = require('./pricelist');
var { getSteamID } = require('../api/steamManager');
var { getDinoPrices } = require('../functions/pricelist');
const { get } = require('express/lib/response');

const cancelCheck = (msg) => {
    if(msg.toLowerCase().startsWith("cancel")) {
        return true;
    } else {
        return false;
    }
}

async function initializeEmbed(message, title, footer, hexColor) {
    const filter = m => m.author.id === message.author.id;
    const option = {
        max: 1,
        time: 200000
    }
    return [
        new Discord.MessageEmbed()
        .setTitle(title)
        .setColor(hexColor)
        .setFooter(footer),
        filter,
        option
    ];
}

async function livesPrompts(message) {
    if ( !await getSteamID(message.author.id) ) {
        return message.reply(`you have to link your steam ID using ${prefix}link [your steam ID]`);
    }

    var embedResponse = initializeEmbed(message, `Lives Inject Menu`, `${message.author.username}`, `#f4fc03`);
    
    embed.addFields(
        {
            name: `Are you safelogged?`,
            value: `Please respond with:\nyes\nno`
        }
    )
}

async function injectPrompts(message) {
    var timedOut = false;
    var safelogged;

    if ( !await getSteamID(message.author.id) ) {
        return message.reply(`you have to link your steam ID using ${prefix}link [your steam ID]`);
    }

    const filter = m => m.author.id === message.author.id;
    const options = {
        max: 1,
        time: 200000
    };

    const prompt = new Discord.MessageEmbed()
        .setTitle(`Inject Menu`)
        .setColor(`#f4fc03`)
        .addFields(
            {
                name: `Are you safelogged?`,
                value:`Please respond with:\nyes\nno`
            }
        )
        .setFooter(`User transaction: ${message.author.username}`);
    
    message.reply(prompt);
    await message.channel.awaitMessages(filter, options)
            .then( collected => {
                safelogged = collected.first().content
            })
            .catch(() =>{
                message.reply(`time's up. Please try again.`);
                return timedOut = true;
            });
    if (timedOut) return false;
    if(safelogged.toLowerCase().startsWith("n")) {
        message.reply(`request cancelled.`);
        return false;
    }

    prompt.fields = [];
    var dinoPriceList = await getDinoPrices();
    var prices = "";
    for (var x = 0; x < dinoPriceList.length; x++) {
        prices += `${dinoPriceList[x].ShortName}\t:\t$${dinoPriceList[x].Price.toLocaleString()}\n`;
    }
    prompt.addFields(
        {
            name: `🦎 Type the name of the dino you want to inject 🦎`, 
            value: prices
        }
    );

    var dino;
    var price;
    var dinoFound = false;
    message.reply(prompt);
    await message.channel.awaitMessages(filter, options)
        .then( collected => {
            dino = collected.first().content
        } )
        .catch( () => {
            message.reply(`time's up. Please try again.`);
            return timedOut = true;
        });
    if (timedOut) return false;
    for (var x = 0; x < dinoPriceList.length; x++) {
        if( dino.toLowerCase() == dinoPriceList[x].ShortName.toLowerCase() ) {
            price = dinoPriceList[x].Price;
            dinoFound = true;
            break;
        }
    }
    if (!dinoFound) {
        message.reply(`invalid dino, please try again.`);
        return false;
    }
  
    prompt.fields = [];
    var confirm;
    prompt.addFields( {
        name: `Confirm your order of a ${dino}.`,
        value: `Please type either:\nyes\nno`
    });
    message.reply(prompt);
    await message.channel.awaitMessages(filter, options)
        .then( collected => {
            confirm = collected.first().content
        } )
        .catch( () => {
            message.reply(`time's up. Please try again.`);
            return timedOut = true;
        } );
    if(timedOut) return false;
    
    prompt.fields = [];
    prompt.setTitle(`Please wait for the transaction to be completed.`);
    message.reply(prompt);

    var steamId = await getSteamID(message.author.id);
    if (confirm.toLowerCase().startsWith("y")) return [dino, price, steamId];
    message.reply(`transaction cancelled.`);
    return false;
};

async function getDinoPricesEmbed(message) {
    var data = await getDinoPrices();
    var msg = "";

    for (var x = 0; x < data.length; x++){
        msg += data[x].Dino + ": $" + data[x].Price.toLocaleString() + "\n\n";
    }

    const embed = new Discord.MessageEmbed()
    .setTitle('**Price List**')
    .setColor('#DAF7A6')
    .addFields(
        {name: "\n🦎__**DINOSAUR PRICES (Points)**__🦎\n\n",
        value: msg}
    )
    
    return message.reply(embed);
}

module.exports = { injectPrompts, getDinoPricesEmbed };