const fs = require("fs");

const exitHandler = module.exports.exitHandler = function exitHandler(_, err) {
  if (_.exception) console.error("Uncaught exception:\n", err);
  if (!_.exit) {
    try {
      console.log();
      fs.writeFileSync("./config.json", JSON.stringify(config))
      console.log("Saved!");
      process.exit();
    }
    catch (err) {
      console.error(err);
      process.exit(1);
    };
  }
}

process.on("exit", exitHandler.bind(null, {exit: true}));
process.on("SIGINT", exitHandler.bind(null, {}));
process.on("uncaughtException", (err) => {exitHandler({exception: true}, err)});
