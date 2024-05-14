# TTRPGDiscordBot 
## About

This is a Discord bot that integrates ChatGPT’s API to help a user generate a Tabletop RPG campaign. It uses Discord.js to interact with the Discord API and Node.js to run the program. It also uses MongoDB to hold the message history.

## Getting Started

1. Download this project to your local machine.
2. Create an ENV file to hold your environmental variables.
3. [Set up a Discord bot.](https://discord.com/developers/docs/quick-start/getting-started)
4. Use the token generated from the bot permissions and save that in your .env file like this:
   - `APP_ID=YourApplicationsIdHere`
5. Save the APPLICATION ID on the general information page as:
   - `APP_ID=YourApplicationsIdHere`
6. On the Bot page, set it up with the following permissions:
   -  Send Messages
   -  Read Message History
7. Then take the generated URL and paste it into your browser.
   - Make sure you have administrator privileges for the server where you want to use this bot. Check [here](https://support.discord.com/hc/en-us/articles/206029707-How-do-I-set-up-Permissions-) if you are having problems. If you do not have admin permissions, ask a server administrator to add the bot.
8. Next, set up an OpenAI account with API access and set up an API key, saving it in the .env file as follows:
   - `OPEN_AI_KEY=YourOpenAiAPIKey`
9. Then you need to set up your server. You can either [download and set up your own MongoDB server](https://www.mongodb.com/try/download/community) or [set up a server using MongoDB Atlas](https://www.mongodb.com/atlas). Either way, make sure to save your URI in the .env file as `MONGO_URI=YourMongoDBURI`.
10. Currently, I do not have a start script set up, so I just use `node app.js` in the directory to get it started.
    - I do plan to set up an NPM start script and Dockerfile when the application is more fleshed out.

## Bot Commands

### Chatting with the bot

To talk to the bot, you need to start your sentence with `@assistant`, then the rest of your message. It will automatically create a MongoDB object if none exist and save your messages to your server as you converse. There is no script to start a new conversation at the moment.

### Deleting the Chat History

To delete your conversation with the bot, just type `@basic_gpt_bot delete`, making sure that `@basic_gpt_bot` is a mention of the bot, not just typed text.

## Planned Developments

I plan to work on a few more developments to make the bot more efficient and user-friendly. The following are my priorities at the moment:

- Refactoring the structure to be better organized.
- Improving how users converse with the bot.
- Allowing users to chat with the bot not just on a server, but also direct messages
- Adding an archive option so that you do not lose your prior campaign conversations just because you want to make a new one.
- Implementing functionality to generate a PDF summary for users to review their generated campaign