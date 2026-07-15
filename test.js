const {WebClient} = require("@slack/web-api");
require("dotenv").config();

const token = process.env.SLACK_USER_TOKEN;
const client = new WebClient(token);

async function main() {
    const result = await client.auth.test();
    console.log(result);
}

main();

