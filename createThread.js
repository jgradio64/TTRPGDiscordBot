require('dotenv').config()
const { OpenAI } = require('openai')

const openai = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY
});

// async function createThread() {
//     const thread = await openai.beta.threads.create();

//     console.log(thread);

//     return thread.id;
// }

async function sendMessage(message) {
    console.log(message);
    const completion = await openai.chat.completions.create({
      messages: [
          { role: "system", content: "You are going to help the user generate a D&D campaign. Don't let the user get off topic. Keep them on track and remind them if needed." },
          { role: "user", "content": message}
      ],
      
      model: "gpt-3.5-turbo",
    });
  
    return completion.choices[0];
}

// async function createAssistant() {
//     const assistant = await openai.beta.assistants.create({
//         name: "Friendly Assistant",
//         instructions: "You are a helpful assistant.",
//         model: "gpt-3.5-turbo"
//     });

//     return assistant;
// }

module.exports = {
    createThread,
    sendMessage
}

