require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

const { Client, GatewayIntentBits } = require("discord.js");
const { createThread, sendMessage, executeChatCompletetion } = require("./createThread.js")
const { GPTThread } = require("./models/gptThread.js");

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
let threadCollection = null;

dbClient.connect().then(() => {
    console.log("connected to db");
    db = dbClient.db("thread-messages");
})

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

        let result = await checkThread(db, message.member.id, message.channelId);

        if(result == null) {
            // Create the default threaed, and then return the created object 
            // update the new thread after querying chatGPT
            result = await createDefaultThread(message.member.id, message.channelId);
        }
        
        // extract message history from the document, turn into array
        let oldMessages = [];
        oldMessages = buildMessageArray(result.messages);
        
        let msg = message.content.replace("@asst", "");
        msg = msg.trim();

        oldMessages.push(generateUserMessage(msg));

        let idk = await executeChatCompletetion(oldMessages).then(
            res => message.reply(res.message.content)
        ).catch(
            err => console.log(err)
        );

        let newMessages = [];
        newMessages.push(generateUserMessage(msg))
        newMessages.push(generateAssistantMessage(idk.content))

        await updateThread(db, result._id, newMessages);
    }
    else if (message.mentions.has(botID)) {
        message.reply("Yup, I'm here to help!");
    }
});

// Checks to see if the thread exists in the MongoDB database
async function checkThread(database, userID, channelID) {
    let threadCollection = database.collection("gpt-threads");
    let results = await threadCollection.findOne({"userID": userID, "channelID": channelID});
    return results;
}

// Requires passing in the messsages as an array
async function updateThread(database, objID, messageAry) {
    let threadCollection = database.collection("gpt-threads");
    let result = await threadCollection.updateOne(
        { "_id": objID },
        {
            $push: {
                messages: { $each: messageAry }
            }
        }
    );

    return result;
}

async function createDefaultThread(userID, channelID){

    let defaultMessage = [
        { role: "system", content: "You are going to help the user generate a D&D campaign. Don't let the user get off topic. Keep them on track and remind them if needed." }
    ]

    let defaultThread = new GPTThread(userID, channelID, defaultMessage);
    let threadCollection = db.collection("gpt-threads");

    let result = await threadCollection.insertOne(defaultThread);
    console.log(
        `A document was inserted with the _id: ${result.insertedId}`,
    );

    defaultThread._id = result.insertedId;

    return defaultThread;
}

async function runMongoClient() {
    await dbClient.connect();
    const db = dbClient.db("thread-messages");

    let threadCollection = db.collection("gpt-threads");
    let results = await threadCollection.findOne();
    console.log(results);
}

function generateUserMessage(message) {
    let newMessage = {
        role: "user",
        content: message
    }
    return newMessage;
}

function generateAssistantMessage(message) {
    let newMessage = {
        role: "assistant",
        content: message
    }
    return newMessage;
}

function buildMessageArray(oldMessages){
    let msgArray = [];

    for (msg of oldMessages) {
        console.log(msg);
        msgArray.push({
            role: msg.role.toString(),
            content: msg.content.toString()
        });
    }

    return msgArray;
}

client.login(token);