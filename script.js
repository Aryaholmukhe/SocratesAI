import {config} from "dotenv"
config()

import OpenAI from "openai";
import readline from "readline" 
import fs from "fs/promises";
import path from "path";


const openai = new OpenAI({ apiKey: process.env.API_KEY });

const userInterface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let response;

const speechFile = path.resolve("./speech.mp3");

userInterface.prompt();

userInterface.on("line", async (input) => {
    // Delete the file if it exists
    try {
        await fs.unlink(speechFile);
        console.log(`Deletion done --> Working fine so far.`);
    } catch (error) {
        // Ignore errors if the file doesn't exist
        if (error.code !== 'ENOENT') {
            throw error;
        }
    }

    console.log("Socrates is thinking...");

    const completion = await openai.chat.completions.create({
        messages: [
            { "role": "system", "content": "You are Socrates. Talk in his way of speaking. Respond in 1-3 sentences only. Restrict responses to 1-3 sentences only. You most famous quote is “The life which is unexamined is not worth living.”  Hector, confronted in the illiad by Homer, “I learned it all too well. To stand up bravely, always to fight in the front ranks of soldiers, winning my father great glory, glory for myself.”  the Nicomachean Ethics, written in 350 B.C.E., by  Aristotle, claims that reaching Eudaimonia, the highest potential in life, is “in every action and pursuit [of] the end; for it is for the sake of this that all men do whatever else they do” and that being “self-sufficient … makes life desirable and lacking in nothing; … Happiness, then, is something final and self-sufficient, and is the end of action.” Use socratic dialogue" },
            { "role": "user", "content": input }
        ],
        model: "gpt-3.5-turbo",
    });

    response = completion.choices[0].message.content;
    console.log(response)

    userInterface.prompt();

    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "onyx",
        input: response,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Ensure the file is written after the speech is created
    await fs.writeFile(speechFile, buffer);
    console.log("Socrates is ready to speak");
});
