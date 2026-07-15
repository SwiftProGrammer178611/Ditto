const { App } = require("@slack/bolt");

const fs = require("fs");
    const NOTES_FILE = "notes.json";
    const reactWhen =[
        {keyword:"hackclub", type: "react", emoji: "tada" },
    ]
    function loadNotes() {
        if(!fs.existsSync(NOTES_FILE)) return [];
        return JSON.parse(fs.readFileSync(NOTES_FILE, "utf8"));
    }
    function saveNotes(notes) {
        fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
    }
const app = new App({
    token: process.env.SLACK_USER_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
    ignoreSelf: false,
});
let myUID = null;

// Tested this func, it works! i can send myself a msg and it logs properly
// app.message(async ({message}) => {
//     console.log("got a msg: ", message.text);
// });

//this v can react!
// app.message(async ({ message, client }) => {
//     console.log("got msg Bruh: ", message.text);

//     //looks for hackclub msg and reacts with party emoji
//     if (message.text && message.text.toLowerCase().includes("hackclub")) {
//         await client.reactions.add({
//             channel: message.channel,
//             timestamp: message.ts,
//             name: "tada",
//         });
//     }
// });

app.message(async ({ message, client})=> {
    if(!myUID) return;
    const isSelfDm = message.channel_type === "im" && message.user === myUID;
    for(const rule of reactWhen) {
    if(message.text.toLowerCase().includes(rule.keyword)){
        if(rule.type === "react"){
            await client.reactions.add({
                channel: message.channel,
                timestamp: message.ts,
                name: rule.emoji,
            });
        }
    }
}
    if(isSelfDm && message.text && message.text.startsWith("!")) {
        if(message.text === "!ping") {
            await client.chat.postMessage({
                    channel: message.channel,
                    text: "pong!",
            });
        }else if(message.text.startsWith("!note ")){
            const noteTxt = message.text.slice("!note ".length);
        const notes = loadNotes();
        notes.push(noteTxt);
        saveNotes(notes);
        await client.chat.postMessage({channel: message.channel, text: `saved your note: "${noteTxt}"`});
        }
        
        
    else if (message.text === "!notes"){
        const notes = loadNotes();
        const listTxt = notes.length
            ? notes.map((n,i) => `${i+1}. ${n}`).join("\n")
            : "no Notes yet :(";
        await client.chat.postMessage({ channel: message.channel, text: listTxt});
    } else if (message.text === "!help"){
        const helpText = [
            "*Ditto commands:*",
            "`!ping` - test it's alive",
            "`!notes` - save a note",
            "`!notes` - list your notes",
            "`!clearnotes` - delete all notes",
            "`!remind <minutes> <text>` - DM yourself a reminder later",
        ].join("\n");
        await client.chat.postMessage({channel:message.channel, text: helpText});
    } else if (message.text === "!clearnotes") {
        saveNotes([]);
        await client.chat.postMessage({channel: message.channel, text: "notes cleared."});
    }else if(message.text.startsWith("!remind ")) {
        const rest = message.text.slice("!remind ".length);
        const match = rest.match(/^(\d+)\s+(.+)$/);
        if(!match){
            await client.chat.postMessage({channel:message.channel, text:"usage: !remind <minutes> <text>"});
        }else{
            const minutes = parseInt(match[1],10);
            const reminderText = match[2];
            setTimeout(async() => {
                await client.chat.postMessage({channel:message.channel, text: `⏰ reminder: ${reminderText}`});
            }, minutes * 60*1000);
            await client.chat.postMessage({channel: message.channel, text: `ok, reminding u in ${minutes} min`});
        }
    }
    else if(message.text .startsWith("!status ")){
        const rest = message.text.slice("!status ".length);
        const match = rest.match(/^(\S+)\s+(.+)$/);
        if(!match){
            await client.chat.postMessage({ channel: message.channel, text: "usage: !status <emoji> <text>"});
        }else{
            const emoji = match[1].replace(/:/g, "");
            const status_text = match[2];
            await client.users.profile.set({
                profile:JSON.stringify({ status_text: status_text, status_emoji: `:${emoji}:`, status_expiration: 0}),
            });
            await client.chat.postMessage({ channel: message.channel, text: `:${emoji}: ${status_text}`});
        }
    } else if(message.text === "!clearstatus"){
         await client.users.profile.set({
            profile: JSON.stringify({ status_text: "", status_emoji: "", status_expiration: 0}),
         });
         await client.chat.postMessage({ channel: message.channel, text: "status cleared."});
    }
    return;
}

console.log("got msg: ", message.text);

    // if(message.text && message.text.toLowerCase().includes("hackclub")) { 
    //     await client.reactions.add({
    //         channel: message.channel,
    //         timestamp: message.ts,
    //         name: 'tada',
    //     });
    // }
    
});

(async () => {
    await app.start();
    const auth = await app.client.auth.test();
    myUID = auth.user_id;
    console.log(`Ditto is Listening.... as ${auth.user}`);
})();