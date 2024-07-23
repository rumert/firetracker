const { app: authApp } = require("./servers/authServer");
const { app } = require("./servers/server");
const authServer = authApp.listen(5000)
const server = app.listen(4000)