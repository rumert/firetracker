const { app: authApp } = require("./servers/authServer");
const { app } = require("./servers/server");

authApp.listen(5000, () => console.log('Auth server running on port 5000'));
app.listen(4000, () => console.log('Main server running on port 4000'));
