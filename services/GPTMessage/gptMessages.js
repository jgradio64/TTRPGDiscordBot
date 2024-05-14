const { GPTMessage } = require("../../models/gptMessage.js");

function generateUserMessage(messageText) {
    let newMessage = new GPTMessage("user" , messageText )

    return newMessage;
}

function generateAssistantMessage(messageText) {

    let newMessage = new GPTMessage("assistant" , messageText )

    return newMessage;
}

function buildMessageArray(oldMessages) {
    let msgArray = [];

    for (msg of oldMessages) {
        msgArray.push({
            role: msg.role.toString(),
            content: msg.content.toString()
        });
    }

    return msgArray;
}

module.exports = {
    generateUserMessage,
    generateAssistantMessage,
    buildMessageArray
}