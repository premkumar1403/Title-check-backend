const app = require("../server"); // or './server' depending on your name

module.exports = (req, res) => {
  app(req, res);
};
