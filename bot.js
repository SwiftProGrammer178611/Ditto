const { App } = require("@slack/bolt");

//from node
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
    const remindersfile = "reminders.json";
    function loadReminders(){
        if(!fs.existsSync(remindersfile)) return[];
        return JSON.parse(fs.readFileSync(remindersfile, "utf8" ));
    }

    function saveReminders(reminders){
        fs.writeFileSync(remindersfile, JSON.stringify(reminders, null, 2));

        
    }
    const activeTimers = {};
        function scheduleRreminder(reminder,client){
            const delay = Math.max(0,reminder.fireAt - Date.now());
            activeTimers[reminder.id] = setTimeout(async () =>{
                await client.chat.postMessage({ channel: reminder.channel, text: `⏰ reminder: ${reminder.text}`});  
                delete active[reminder.id];
            }, delay);
        }
const app = new App({
    token: process.env.SLACK_USER_TOKEN,
    appToken: process.env.SLACK_APP_TOKEN,
    socketMode: true,
    ignoreSelf: false,
});
let myUID = null;
let awayMsg = null;

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

if(message.channel_type === "im" && message.user !== myUID && awayMsg){
    await client.chat.postMessage({
        channel: message.channel,
        text: `Bro, Leave me alone, I am out rn: ${awayMsg}`,
    });
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
    }
    else if(message.text.startsWith("!remind ")){
        const rest = message.text.slice("!remind ".length);
        const match = rest.match(/^(\d+)\s+(.+)$/);
        if(!match){
            await client.chat.postMessage({ channel: message.channel, text: "usage: !status <emoji> <text>"});
        
        }else{
            const mins = parseInt(match[1], 10);
            const reminder = {
                id:Date.now(),
                fireAt: Date.now() + mins * 60&1000,
                channel: message.channel,
                text: match[2],                                                                                                                                                                                                                                                                                                                                                                                                             
            };
            const reminders = loadReminders();
            reminders.push(reminder);
            saveReminders(reminders);
            scheduleReminder(reminder, client);
            await client.chat.postMessage({channel:message.channel, text: `ok, reminding u in ${mins} min (id: ${reminder.id}`});
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
    } else if(message.text.startsWith("!away")){
        awayMsg = message.text.slice("!away ".length);
        await client.chat.postMessage({channel:message.channel, text:`ok , marked away: "${awayMsg}`});
    }
    else if(message.text === "!back"){
        awayMsg = null;
        await client.chat.postMessage({ channel: message.channel, text: "welcome back! away mode off"});
    }else if(message.text === "!reminders"){
        const reminders = loadReminders();
        if(!reminders.length){
            await client.chat.postMessage({channel:message.channel, text: "no pending reminders."});
        }else{
            const listtxt = reminders.map(r=>{
                const minsLeft = Math.max(0, Math.round((r.fireAt - Date.now()) / 60000));
                return `id ${r.id}: "${r.text}" (in ~${minsLeft} min)`;
            }).join("\n");
            await client.chat.postMessage({channel:message.channel, text: listtxt});
        }
    }else if(message.text.startsWith("!cancel ")){
        const id = parseInt(message.text.slice("!cancel ".length).trim(), 10);
        const reminders = loadReminders();
        if(!reminders.some(r => r.id === id)) {
            await client.chat.postMessage({ channel: message.channel, text: `no-reminder found with id ${id}`});

        }else{
            //if inactive, delete those
            if(activeTimers[id]) {clearTimeout(activeTimers[id]); delete activeTimers[id];}
            saveReminders(reminders.filter(r=> r.id !== id));
            await client.chat.postMessage({ channel: message.channel, text: `cancelled reminder ${id}`});
        }

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
    for (const reminder of loadReminders()){
        scheduleReminder(reminder,app.client);
    }
    console.log(`Ditto is Listening.... as ${auth.user}`);
})();