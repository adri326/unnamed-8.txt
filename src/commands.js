const Eris = require("eris");
const emojiRegex = require("emoji-regex/es2015/text.js");

client.registerCommand("setMessage", (context, args) => {
  if (checkServer(context)) return;
  if (checkAdmin(context)) return;
  if (!config[context.channel.guild.id]) {
    config[context.channel.guild.id] = {
      message: null,
      channel: null,
      roles: []
    };
  }
  let cfg = config[context.channel.guild.id];
  if (args.length >= 1 && /^\d{18}$/.exec(args[0])) {
    cfg.message = args[0];

    let promises = [];
    context.channel.guild.channels.forEach((channel) => {
      if (!channel.getMessage) return;
      promises.push(new Promise(function(resolve, reject) {
        try {
          channel.getMessage(args[0]).then((message) => {
            reject(channel);
          }).catch(resolve);
        }
        catch (err) {
          resolve(err);
        }
      }));
    });
    Promise.all(promises).then(() => {
      client.createMessage(context.channel.id, `${error()} (could not find message)`);
    }).catch((channel) => {
      cfg.channel = channel.id;
      client.createMessage(context.channel.id, `Successfully set message to ${args[0]}`);
    });
    // what's going on: we want the reverse effect of `Promise.all`, and to \
    // achieve it, we swap the `reject` and `resolve` methods, so that the \
    // Promise calls the `catch` handler whenever a result has been found, and \
    // calls the `then` handler if no result were found. Sketchy :)

    return; // interrupt code execution
  }
  else {
    client.createMessage(context.channel.id, "Command requires one argument (and it's got to be a message ID)");
  }
}, {
  description: "`<message id>`: which message the bot should listen on",
  fullDescription: `Set which message the bot will be listening to.\nUsage:\`${prefix}setMessage <id>\``
});

client.registerCommand("addRole", (context, args) => {
  if (checkServer(context)) return;
  if (checkAdmin(context)) return;
  if (checkSelfPerms(context, "manageRoles")) return;
  if (checkSelfPerms(context, "addReactions")) return;
  if (checkSelfPerms(context, "externalEmojis")) return;

  let cfg = config[context.channel.guild.id];
  if (!cfg || !cfg.message || !cfg.channel) {
    client.createMessage(context.channel.id, `${error()} (you need to use setMessage first)`);
    return;
  }
  if (args.length >= 2) {
    let role = /^\d{18}$|^<@&(\d{18})>$/.exec(args[0]);
    let emoji = /^\w+:\d{18}$|^<:(\w+:\d{18})>/.exec(args[1]);

    if (!role) {
      client.createMessage(context.channel.id, "Invalid role");
      return;
    }

    if (Array.isArray(emoji)) { // custom emoji
      emoji = emoji[1] || emoji[0];
    }
    else if (args[1].length <= 2 && !/[\w\d]/.exec(args[1])) { // stock emoji
      emoji = args[1];
    }
    else {
      client.createMessage(context.channel.id, "Invalid emoji");
      return;
    }

    role = role[1] || role[0];


    if (cfg.roles.find((role) => role.id === role || role.emoji === emoji)) {
      client.createMessage(context.channel.id, `${error()} (Role or emoji already set, delete it beforehand)`);
      return;
    }
    if (cfg.roles.length >= 20) {
      client.createMessage(context.channel.id, `${error()} (more than 20 roles)`);
      return;
    }

    cfg.roles.push({id: role, emoji});

    client.createMessage(context.channel.id, "Added role!");

    updateEmojis(context);
  }
  else {
    client.createMessage(context.channel.id, `${error()} (invalid arguments, check \`help\`)`);
  }
}, {
  description: "`<role> <emoji>`: add a reaction",
  fullDescription: `Listen for a reaction on the listening message.\nUsage: \`${prefix}addRole <role> <emoji>\``
});

client.registerCommand("removeRole", (context, args) => {
  if (checkServer(context)) return;
  if (checkAdmin(context)) return;
  if (checkSelfPerms(context, "addReactions")) return;
  if (checkSelfPerms(context, "externalEmojis")) return;
  if (checkSelfPerms(context, "manageMessages")) return;

  let cfg = config[context.channel.guild.id];
  if (!cfg || !cfg.message || !cfg.channel) {
    client.createMessage(context.channel.id, `${error()} (you need to use setMessage first)`);
    return;
  }
  if (cfg.roles.length === 0) {
    client.createMessage(context.channel.id, `${error()} (no roles added yet!)`);
    return;
  }
  if (args.length === 0) {
    client.createMessage(context.channel.id, `${error()} (invalid arguments, check \`help\`)`);
    return;
  }

  let thing =
    /^<@&(\d{18})>$/.exec(args[0])
    || /^\w+:\d{18}$|^<:(\w+:\d{18})>$/.exec(args[0]);

  if (Array.isArray(thing)) { // custom emoji
    thing = thing[1];
  }
  else if (args[0].length <= 2 && !/[\w\d]/.exec(args[0])) { // stock emoji
    thing = args[0];
  }
  else {
    client.createMessage(context.channel.id, `${error()} (invalid argument, check \`help\`)`);
    return;
  }


  let role = cfg.roles.find((role) => role.id === thing || role.emoji === thing);
  if (!role) {
    client.createMessage(context.channel.id, `${error()} (couldn't find corresponding role/emoji)`);
    return;
  }

  cfg.roles.splice(cfg.roles.indexOf(role), 1);

  client.createMessage(context.channel.id, "Removed role!");

  updateEmojis(context);
},
{
  description: "`<role|emoji>`: removes a listener",
  fullDescription: `Removes a role/reaction from the listening message.\nUsage: \`${prefix}removeRole <role>\` or \`${prefix}removeRole <emoji>\``
});

async function updateEmojis(context) {
  let guild = context.channel.guild;
  let cfg = config[guild.id];

  let channel = guild.channels.get(cfg.channel);
  if (!channel) {
    client.createMessage(context.channel.id, `${error()} (couldn't find channel)`);
    return;
  }
  let message = channel.getMessage(cfg.message).then(async (message) => {
    let reactions = message.reactions;
    for (id in reactions) {
      if (reactions[id].me) {
        if (!cfg.roles.find((role) => role.emoji === id)) {
          try {
            let reacted = [true];
            let last = undefined;

            while(reacted.length) {
              reacted = await message.getReaction(id, 100, undefined, last);
              for (user of reacted) {
                await message.removeReaction(id, user.id === client.user.id ? "@me" : user.id);
              }
              last = reacted[99];
            }
          }
          catch (err) {
            client.createMessage(context.channel.id, `${error()} (error while removing reaction \`${id}\`: \`${err.toString()}\`)`);
          }
        }
      }
    }
    for (role of cfg.roles) {
      if (!reactions[role.id] || !reactions[role.id].me) {
        try {
          await message.addReaction(role.emoji);
        }
        catch (err) {
          client.createMessage(context.channel.id, `${error()} (error while trying to add reaction to the message: \`${err.toString()}\`)`);
          return;
        }
      }
    }
    client.createMessage(context.channel.id, "Successfully updated reactions");
  }).catch(() => {
    client.createMessage(context.channel.id, `${error()} (couldn't find the message)`)
  });
}

function checkServer(context) {
  if (context.channel instanceof Eris.PrivateChannel) {
    client.createMessage(context.channel.id, `${error()} (need to be in server)`);
    return true;
  }
}

function checkAdmin(context) {
  let guild = context.channel.guild;
  let userID = context.author.id;
  let user = guild.members.get(userID);
  if (!user.permission.has("administrator") && guild.ownerID !== userID) {
    client.createMessage(context.channel.id, `${error()} (you be missing administrator permissions)`)
    return true;
  }
}

function checkSelfPerms(context, perm) {
  let guild = context.channel.guild;
  let self = guild.members.get(client.user.id);
  if (!self.permission.has(perm)) {
    client.createMessage(context.channel.id, `${error()} (bot missing permission: ${perm})`);
    return true;
  }
}

function error() {
  return config.errorMessages[Math.floor(Math.random() * config.errorMessages.length)];
}
