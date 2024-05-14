class GPTThread {
    constructor(userID, channelID, messageList) {
        this._id = null;
        this.userID = userID;
        this.channelID = channelID;
        // this.threadID = threadID;
        this.messages = messageList;
    }

    appendMessage(newMessage) {
        this.messages.append(newMessage);
    }
}

module.exports = {
    GPTThread
};