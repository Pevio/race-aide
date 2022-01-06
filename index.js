require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();

// Filter
const CryptoJS = require("crypto-js");
const genericKey = process.env.GENERIC_KEY;

// parse request bodies as json structures
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

const getClient = () => {
  const { Client } = require("pg");
  const client = new Client({
    connectionLimit: 5,
    connectionString: String(process.env.DATABASE_URL),
    ssl: {
      rejectUnauthorized: false,
    },
  });
  client.connect();

  return client;
};
const client = getClient();

const encrypt = (content, key) => {
  if (!content || !key) return "";
  try {
    return CryptoJS.AES.encrypt(content, key).toString();
  } catch {
    return "";
  }
};
const decrypt = (encrypted, key) => {
  if (!encrypted || !key) return "";
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, key);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return "";
  }
};

// API Util Functions
const responseMessages = {
  0: "GOOD",
  1: "Unknown Error",
  2: "Database Error"
}
const returnError = (res, returnCode = 1, data = {}, status = 400) => {
  res.status(status)
  res.json({
    ...data,
    returnCode,
    responseMessage: responseMessages[returnCode]
  })
}

// Cached Data
let raceListCache = []
let raceListUpdated = 0

let raceResultsCache = {}
let raceResultsUpdated = 0


let raceUpdateBuffer = []

// API
app.get("/api/getracelist", (req, res) => {
  const now = Date.now()
  if (raceListUpdated + 1000 > Date.now()) {
    res.json({
      races: raceListCache,
      returnCode: 0,
    });
    return
  }

  try {
    client.query("SELECT * from public.races", (err, res2) => {
      if (err) {
        returnError(res, 2)
        return;
      }
      const newRaces = []
      res2.rows().forEach((row) => {
        newRaces.push({
          raceId: row.race_id,
          raceName: row.race_name,
          raceStart: row.race_start
        })
      })
      raceListCache = newRaces
      raceListUpdated = now
      res.json({
        responseMessage: "GOOD",
        returnCode: 0,
        races: newRaces,
      });
    });
  } catch (err) {
    console.log(err);
    returnError(res, 1);
  }
});

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const http = require("http");
const server = http.createServer(app);

// Finish up
const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Race Aide listening on ${port}`);
});
