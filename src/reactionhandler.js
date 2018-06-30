const Eris = require("eris");

client.on("messageReactionAdd", (context, {id, name}, userID) => {
  // if the message is the server's listening message
  if (context.channel instanceof Eris.PrivateChannel) return;
  let cfg = config[context.channel.guild.id];
  if (!cfg) return;
  if (!context.id === cfg.message) return;

  let role = cfg.roles.find((role) => role.emoji === `${name}:${id}` || role.emoji === name);
  let self = context.channel.guild.members.get(client.user.id);
  let member = context.channel.guild.members.get(userID);

  if (member.bot) return;

  console.log(`{${member.username}#${member.discriminator}}: ${name}:${id} (+)`);

  if (!role) return;
  if (!self.permission.has("manageRoles")) return;

  member.addRole(role.id, "User reacted to the listening message");
});

client.on("messageReactionRemove", (context, {id, name}, userID) => {
  // if the message is the server's listening message
  if (context.channel instanceof Eris.PrivateChannel) return;
  let cfg = config[context.channel.guild.id];
  if (!cfg) return;
  if (!context.id === cfg.message) return;

  let role = cfg.roles.find((role) => role.emoji === `${name}:${id}` || role.emoji === name);
  let self = context.channel.guild.members.get(client.user.id);
  let member = context.channel.guild.members.get(userID);

  if (member.bot) return;

  console.log(`{${member.username}#${member.discriminator}}: ${name}:${id} (-)`);

  if (!role) return;
  if (!self.permission.has("manageRoles")) return;

  member.removeRole(role.id, "User un-reacted to the listening message");
});
