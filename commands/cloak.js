'use strict';

const {cloak_resistance: cloakResistance} = require('../config.json');

module.exports = {
    name: 'cloak',
    cooldown: 2,
    description: 'Get current cloak resistance cap',
    guildOnly: false,
    execute(message, args) {
        message.channel.send(`**Ashjra\'kamas, Shroud of Resolve** corruption resistance cap: ** ${cloakResistance} **`);
    },
};