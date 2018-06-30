const Eris = require("eris");
let secret = require("../secret.json");
const client = global.client = new Eris.CommandClient(secret["token"], {}, secret.info);
const prefix = global.prefix = secret.info.prefix;
delete secret;
const commands = require("./commands");
const exitHandler = require("./exithandler");
const reactionHandler = require("./reactionhandler");

client.on("ready", () => {console.log("Ready!")});
client.on("messageCreate", (context) => {
  if (context.content.startsWith(prefix)) console.log(
    "[" + context.author.username + "#" + context.author.discriminator + "]: " + context.content
  );
});
client.connect();

global.config = require("../config.json");
