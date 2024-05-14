require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const { Client, GatewayIntentBits } = require("discord.js");
const { executeChatCompletetion } = require("./services/openai/gptThreads.js")
const { createDefaultThread, checkThread, updateThread, deleteThread } = require("./repositories/threads.js")
const { generateUserMessage, generateAssistantMessage, buildMessageArray } = require("./services/GPTMessage/gptMessages.js")

const token = process.env.DISCORD_TOKEN;
const uri = process.env.MONGO_URI;
const botID = process.env.APP_ID;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const dbClient = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

let db = null;
let dbCollection = null;

// Connect to mongo db instance
dbClient.connect().then(() => {
    console.log("connected to db");
    db = dbClient.db("test");
})

// This is the Discord client
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
    else if (message.mentions.has(botID)) {

        // The ID for a Mentioned user is 22 places long
        let msg = message.content.slice(22);
        msg = msg.trim();
        if (msg.toLowerCase() == "delete") {
            message.reply("Attempting to delete conversation history!");
            // delete the mongoDB history for the user in the channel
            let deletionResult = await deleteThread(db, message.author.id, message.channelId);

            if (deletionResult.acknowledged && deletionResult.deletedCount != 0) {
                message.reply("History has been successfully deleted!");
            } else {
                message.reply("There has been an error with your deletion request.")
            }
        } else {
            let mongoThread = await checkThread(db, message.member.id, message.channelId);

            if (mongoThread == null) {
                // Create the default thread, and then return the created object 
                // update the new thread after querying chatGPT
                mongoThread = await createDefaultThread(db, message.member.id, message.channelId);
            }

            // Array of old messages is created to send history of conversation to chat GPT
            let oldMessages = [];
            // Array of new messages is used to update the database record for the conversation.
            let newMessages = [];

            oldMessages = buildMessageArray(mongoThread.messages);

            let msg = message.content.replace("@assistant", "");
            msg = msg.trim();

            oldMessages.push(generateUserMessage(msg));
            newMessages.push(generateUserMessage(msg))

            // Used to use the result of the function call here, but unused right now.
            let result = await executeChatCompletetion(oldMessages).then(
                res => {
                    let text = res.message.content;

                    // Push the assistant's message to the database before splitting it. 
                    newMessages.push(generateAssistantMessage(text))

                    /*
                        Discord.js cannot send a message reply with more than 2000 characters.
                        So loop through the GPT reply and split the message into multiple replies if we need.
                    */

                    do {
                        if (text.length > 2000) {
                            // Get the last space before the 2000th index in the string, a word isn't cut in half for no reason.
                            let n = text.lastIndexOf(" ", 2000);

                            if (n === -1) {
                                // If for some reason there are no spaces at all, just cut the string at the 2000th index space and send that.
                                // If this ever pops up I need to revisit this.
                                n = 2000;
                            }

                            message.reply(text.slice(0, n));
                            text = text.slice(n);
                        } else {
                            // Execute final reply and make the string an empty string. 
                            message.reply(text);
                            text = "";
                        }
                    } while (text.length > 0);
                }
            ).catch(
                err => console.log(err)
            );

            await updateThread(db, mongoThread._id, newMessages);

        }

    }
});

client.login(token);