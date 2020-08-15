'use strict';

const Discord = require('discord.js');
const schedule = require('node-schedule');
const fs = require('fs');
const cfg = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
    console.log('I am ready!');
});

schedule.scheduleJob({hour: 10, minute: 0, dayOfWeek: 2}, function () {
    client.channels.fetch(cfg.general_id).then(channel => {
        let finalMsg = '@everyone **10:00 THE FISH HAS BEEN PLEASED**';

        cfg.cloak_resistance += 3;
        finalMsg += `**Ashjra\'kamas, Shroud of Resolve** corruption resistance cap: ** ${cfg.cloak_resistance} **`;

        channel.send(finalMsg);
        fs.writeFile('./config.json', JSON.stringify(cfg, null, 2), function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("Cloak resistance updated!");
        });
    });
});

client.on('message', message => {
    if (!message.content.startsWith(cfg.prefix) || message.author.bot) return;

    const args = message.content.slice(cfg.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // aliases block
    const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    // guildOnly block
    if (command.guildOnly && message.channel.type === 'dm') {
        return message.reply('I can\'t execute that command inside DMs!');
    }

    // args and usage block
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${cfg.prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
    }

    // cooldowns block
    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name); // collection with author ids
    const cooldownAmount = (command.cooldown || 3) * 1000; // default 3 seconds if nothing is set
    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
        }
    }
    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount); // remove author id from timestamps after cooldown

    try {
        command.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});

client.login(cfg.token);