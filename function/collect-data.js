const fetch = require('node-fetch');
const publicIp = require('public-ip');

exports.handler = async function(event, context) {
    const { timestamp, userAgent, timezone, screenResolution, language, referrer, connectionType } = JSON.parse(event.body);

    const ip = await publicIp.v4();
    const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
    const geoData = await geoResponse.json();
    const region = geoData.regionName || 'Unknown';

    const discordData = {
        embeds: [{
            title: 'Website Visitor Feedback',
            fields: [
                { name: 'IP Address', value: ip, inline: true },
                { name: 'Browser/Device', value: userAgent, inline: false },
                { name: 'Timezone', value: timezone, inline: true },
                { name: 'Region', value: region, inline: true },
                { name: 'Screen Resolution', value: screenResolution, inline: true },
                { name: 'Language', value: language, inline: true },
                { name: 'Referrer', value: referrer, inline: false },
                { name: 'Connection Type', value: connectionType, inline: true },
                { name: 'Timestamp', value: timestamp, inline: true }
            ],
            color: 0x0099ff
        }]
    };

    const webhookUrl = 'https://discord.com/api/webhooks/1375490734605598861/-W5gBoXMZSVmTUdoFP85jwlfyCKaDxo8kldGOuNKhCjW71kCfbkw5rLykFdghhKXFT4T'; // Replace with your Discord webhook URL
    await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordData)
    });

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Data sent to Discord' })
    };
};
