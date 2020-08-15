'use strict';

const https = require('https');

module.exports = {
    name: 'affixes',
    cooldown: 20,
    description: 'Display this week\'s mythic+ affixes (EU)',
    aliases: ['affix', 'm+', 'mythic'],
    guildOnly: false,
    execute(message, args) {
        const options = {
            host: "raider.io",
            port: 443,
            path: '/api/v1/mythic-plus/affixes?region=eu&locale=en',
            method: 'GET'
        };

        https.request(options, function (res) {
            //console.log('STATUS: ' + res.statusCode);
            res.setEncoding('utf8');

            let allData = '';
            res.on('data', function (chunk) {
                allData += chunk;
            });

            res.on('end', function () {
                const parsedData = JSON.parse(allData);
                let finalMsg = `**Affixes:** ${parsedData.title}\n`;
                // affix details
                for (let i = 0; i < 4; i++) {
                    finalMsg += `**${parsedData.affix_details[i].name}**: ${parsedData.affix_details[i].description}\n`;
                }
                finalMsg += `**Leaderboards:** ${parsedData.leaderboard_url}\n`;

                message.channel.send(finalMsg);
            });
        }).end();
    },
};