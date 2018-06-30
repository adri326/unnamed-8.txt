# Unnamed (8).txt

A (very) simple bot for reaction to role assignment.

It allows you to set a message per server on which the bot will look for reactions and use them to give or remove roles to the members of the server.
It works by linking an emote/emoji with a role. The bot will then add the emote as a reaction to the selected message.
Anyone who then reacts to the emote will be given the role. Additionally, if they un-react, their role will be removed.

## Installation

In a terminal, do

```sh
git clone https://github.com/adri326/unnamed-8.txt.git
cd unnamed-8.txt
npm i
```

Then, create a new file called `secret.json`, and put inside of it:

```json
{
  "token": "YOUR_TOKEN",
  "info": {
    "description": "A great description",
    "owner": "YOUR NAME",
    "prefix": "PREFIX"
  }
}
```

Remember to fill the different fields with the correct information. If you don't know what a bot token is, visit [this page](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token).

You should also check out the mighty [best practices](https://github.com/meew0/discord-bot-best-practices).

In case you're not sure whether or not the prefix you're thinking about is available, check if it is already used with [discordbots-prefix](https://github.com/adri326/discordbots-prefix).

## Running

```sh
node ./
```

(done)

The user config will be put in the `config.json` file.

## Commands

This bot comes - thankfully - shipped with a few commands. These being:

* `setMessage`: define which message the reactions will be on
* `addRole`: add a role/emoji pair to the listened ones
* `removeRole`: remove a role/emoji pair from the listened ones
* `help` - provided by Eris

## Using this bot for yourself

Go ahead, you don't even have to credit me. Though you can show me the cool stuff you do with it, I would highly appreciate it :3
