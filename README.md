# Ditto

A personal Slack selfbot built for DOPPEL. It reacts to messages and takes commands sent to myself.

## What it does

DM yourself with commands wiht the "!" before each:

- `!ping` - test it's alive
- `!note <text>` - save a note
- `!notes` - list your notes
- `!clearnotes` - delete all notes
- `!remind <minutes> <text>` - schedules a reminder, persists across restarts
- `!reminders` - list pending reminders
- `!cancel <id>` - cancel a pending reminder
- `!status <emoji> <text>` - set your Slack status
- `!clearstatus` - clear your Slack status
- `!away <text>` - auto-replies to DMs from others with this message
- `!back` - turn off away mode
- `!mirror <text>` - reverses your text
- `!joke` - random joke
- `!uptime` - how long Ditto's been running
- `!8ball <question>` - magic 8-ball answer
- `!weather <city>` - current weather
- `!translate <lang code> <text>` - translates text from English
- `!lockin` - morale
- `!help` - lists all commands

It also reacts with the party emoji to any message that has the word "hackclub" in it :)

## Setup

For the `.env` file, make sure to generate your own Slack user token and Slack app token, so you can test it out. Make a `.env` file with `SLACK_USER_TOKEN` and `SLACK_APP_TOKEN` variables and paste your info there.

1. Go to https://api.slack.com/apps, then click **Create New App** and **From scratch**.
2. Under **OAuth & Permissions**, add these User Token Scopes:
   `channels:history`, `groups:history`, `im:history`, `mpim:history`, `chat:write`, `im:write`, `reactions:write`, `users.profile:write`
3. Under **Socket Mode**, enable it and generate an **App-Level Token** with the `connections:write` scope.
4. Under **Event Subscriptions**, enable events, then under "Subscribe to events on behalf of users" add:
   `message.im`, `message.channels`, `message.groups`
5. Install the app to your workspace AND copy the **User OAuth Token** (`xoxp-...`) and **App-Level Token** (`xapp-...`).
6. Clone this repo and install dependencies:

   ```
   git clone https://github.com/SwiftProGrammer178611/Ditto.git
   cd Ditto
   npm install
   ```

7. Create a `.env` file in the project root:

   ```
   SLACK_USER_TOKEN=xoxp-your-token-here
   SLACK_APP_TOKEN=xapp-your-token-here
   ```

8. Run it:

   ```
   npm start
   ```

DONT FORGET TO HAVE FUN!(and also touch grass)
