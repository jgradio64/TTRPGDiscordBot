const { GPTThread } = require("../models/gptThread.js");


async function createDefaultThread(database, userID, channelID) {

    let defaultMessage = [
        { role: "system", content: "You are going to help the user generate a Table Top RPG campaign. Don't let the user get off topic. Keep them on track and remind them if needed." }
    ]

    let defaultThread = new GPTThread(userID, channelID, defaultMessage);
    let threadCollection = database.collection("gpt-threads");

    let result = await threadCollection.insertOne(defaultThread);
    console.log(
        `A document was inserted with the _id: ${result.insertedId}`,
    );

    defaultThread._id = result.insertedId;

    return defaultThread;
}

// Checks to see if the thread exists in the MongoDB database
async function checkThread(database, userID, channelID) {
    let threadCollection = database.collection("gpt-threads");
    let results = await threadCollection.findOne({ "userID": userID, "channelID": channelID });
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

async function deleteThread(database, userid, channelid) {
    let threadCollection = database.collection("gpt-threads");
    let result = await threadCollection.deleteOne({
        userID: userid,
        channelID: channelid
    });
    return result;
}

module.exports = {
    createDefaultThread,
    checkThread,
    updateThread,
    deleteThread
}