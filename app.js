require('dotenv').config()

const fs = require('node:fs');
const path = require('node:path');
// const { Client, Intents, Collection, Events, GatewayIntentBits } = require('discord.js');
const { Client, GatewayIntentBits } = require("discord.js");
const { createThread, sendMessage } = require("./createThread.js")

var token = process.env.DISCORD_TOKEN;

const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],
});

client.on("ready", () => {
    console.log("Bot is ready.");
});

client.on("messageCreate", async (message) => { 
    if (message.author.bot) return; 
    else if (message.content.includes("@asst")) {

        let msg = message.content.replace("@asst", "");
        msg = msg.trim();
        // console.log(message.content);
        // Build a way to recieve and send to gpt api for thread
        await sendMessage(msg).then(
            res => message.channel.send(res.message.content)
        ).catch(
            err => console.log(err)
        );

    }
});



// const eventsPath = path.join(__dirname, 'events');
// const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

// for (const file of eventFiles) {
// 	const filePath = path.join(eventsPath, file);
// 	const event = require(filePath);
// 	if (event.once) {
// 		client.once(event.name, (...args) => event.execute(...args));
// 	} else {
// 		client.on(event.name, (...args) => event.execute(...args));
// 	}
// }


client.login(token);