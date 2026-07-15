const {WebClient} = require("@slack/web-api");

const tok = process.env.SLACK_USER_TOKEN;
const cli = new WebClient(tok);

async function main() {
    const auth = await cli.auth.test();
    const myUID = auth.user_id;

    //dm with myself
    const dm = await cli.conversations.open({ users: myUID});
    const channelId = dm.channel.id;

    await cli.chat.postMessage({
        channel: channelId,
        text: "hello from yo bro Ditto!"
    });

    console.log("msg sent! check yo Slack Dm's")
}


main();