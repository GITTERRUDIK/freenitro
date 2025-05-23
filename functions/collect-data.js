const fetch = require('node-fetch').default; // Use .default for node-fetch v3+
const publicIp = require('public-ip');

exports.handler = async function(event, context) {
    try {
        // Parse incoming data
        const { timestamp, userAgent, timezone, screenResolution, language, referrer, connectionType } = JSON.parse(event.body);

        // Get client's IP address
        let ip = 'Unknown';
        try {
            ip = await publicIp.v4({ timeout: 5000 });
        } catch (ipError) {
            console.error('IP fetch error:', ipError.message);
        }

        // Get geolocation data
        let region = 'Unknown';
        try {
            const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
            if (!geoResponse.ok) throw new Error(`Geo API error: ${geoResponse.status}`);
            const geoData = await geoResponse.json();
            region = geoData.regionName || 'Unknown';
        } catch (geoError) {
            console.error('Geo API error:', geoError.message);
        }

        // Prepare Discord payload
        const discordData = {
            embeds: [{
                title: 'Website Visitor Feedback',
                fields: [
                    { name: 'IP Address', value: ip, inline: true },
                    { name: 'Browser/Device', value: userAgent || 'Unknown', inline: false },
                    { name: 'Timezone', value: timezone || 'Unknown', inline: true },
                    { name: 'Region', value: region, inline: true },
                    { name: 'Screen Resolution', value: screenResolution || 'Unknown', inline: true },
                    { name: 'Language', value: language || 'Unknown', inline: true },
                    { name: 'Referrer', value: referrer || 'Direct', inline: false },
                    { name: 'Connection Type', value: connectionType || 'Unknown', inline: true },
                    { name: 'Timestamp', value: timestamp || 'Unknown', inline: true }
                ],
                color: 0x0099ff
            }]
        };

        // Send to Discord webhook
        const webhookUrl = 'https://discord.com/api/webhooks/1375490734605598861/-W5gBoXMZSVmTUdoFP85jwlfyCKaDxo8kldGOuNKhCjW71kCfbkw5rLykFdghhKXFT4T'; // Replace with your Discord webhook URL
        const discordResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordData)
        });

        if (!discordResponse.ok) {
            throw new Error(`Discord webhook error: ${discordResponse.status}`);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data sent to Discord' })
        };
    } catch (error) {
        console.error('Function error:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
        };
    }
};
