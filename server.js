//jsonbox
const bodyParser = require("body-parser");
const express = require("express");
const path = require("path");
const cors = require("cors");
const config = require("./src/config");
const routes = require("./src/routes");
const fs = require("fs");
const io = require("socket.io");

const co3ServerCertsPath = "/etc/letsencrypt/live/jsontomongodb.co3project.eu/";

const app = express();
const port = process.env.PORT || config.PORT;
const http_https = require("./http_https");
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
require("request").defaults({ rejectUnauthorized: false });

app.enable("trust proxy");
// set express server middlewares
app.use(cors());
//app.use(express.static(path.join(__dirname, 'www')));
app.use(bodyParser.json());

//app.get('/v2', (req, res) => res.sendFile(path.join(__dirname, 'www/index.html')));
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  //res.setHeader('Access-Control-Allow-Origin', 'https://84.88.182.238.nip.io');
  res.setHeader("Access-Control-Allow-Credentials", true);
  // Request methods you wish to allow
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
  // Request headers you wish to allow
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  var urlExp = new RegExp(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?projectco3\.eu(:[0-9]{1,5})?(\/.*)?$/gi);
  // if (req.headers["x-forwarded-for"] != "45.14.211.103" && req.headers["host"] != "localhost" && !req.headers["host"].match(urlExp)) {
  //   return res.status(403).json({ error: "No external clients allowed" });
  // }
  if (!req.headers["x-api-key"]) {
    return res.status(401).json({ error: "No credentials (x-api-key) header sent!" });
  } else if (![config.API_KEY_LIMITED, config.API_KEY_ALL].includes(req.headers["x-api-key"])) {
    return res.status(403).json({ error: "Invalid credentials (x-api-key) header sent!" });
  }
  next();
});

app.use(routes);

//84.88.182.238.nip.io <- for generating certificate
var env = process.env.NODE_ENV || process.argv[2] || "dev";
let opts = {
  //key: fs.readFileSync('./server.key'),
  key: fs.readFileSync(env == "dev" ? "./cert/server.key" : co3ServerCertsPath + "/privkey.pem"),
  //cert: fs.readFileSync('./server.cert')
  cert: fs.readFileSync(env == "dev" ? "./cert/server.cert" : co3ServerCertsPath + "fullchain.pem"),
};

let server = http_https.createServer(opts, app);
let ws = io(server.http);
let wss = io(server.https);

server.listen(port, "0.0.0.0", (err) => {
  if (err) console.error(err);
  console.log("Server started on " + port);
});
