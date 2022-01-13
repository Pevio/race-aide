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
  2: "Database Error",
  3: "Unable to find information in database",
  4: "Invalid JSON in body",

  // Create Race
  101: "Missing fields for create race",
  102: "raceId already exists",

  // Race Details
  201: "Invalid Password"
};
const returnError = (res, returnCode = 1, data = {}, status = 400) => {
  res.status(status);
  res.json({
    ...data,
    returnCode,
    responseMessage: responseMessages[returnCode],
  });
};

// Cached Data
let raceListCache = [];
let raceListUpdated = 0;

let raceResultsCache = {};
let raceResultsUpdated = 0;

let raceUpdateBuffer = [];

// API
app.post("/api/createrace", (req, res) => {
  try {
    const body = req.body;
    const race = body?.race;
    console.log(race);
    if (!body || !race) {
      returnError(res, 4);
      return;
    }
    if (
      !(race.raceId?.length > 0) ||
      !(race.raceName?.length > 0) ||
      !(race.city?.length > 0) ||
      !(race.timezone?.length > 0) ||
      !(race.adminPassword?.length > 0) ||
      !(race.checkpointPassword?.length > 0) ||
      !(race.startTime > 0) ||
      !race.raceDetails
    ) {
      returnError(res, 101);
      return;
    }

    const adminPassword = encrypt(genericKey, race.adminPassword);
    const checkpointPassword = encrypt(genericKey, race.checkpointPassword);
    client.query("SELECT race_id from public.races WHERE race_id = $1", [req.raceId], (err, res3) => {
      if (res3.rows.length > 0) {
        returnError(res, 102);
        return;
      }
      client.query(
        "INSERT INTO public.races" + "(race_id, race_name, city, start_time, timezone, race_details, admin_password, checkpoint_password)" + "values ($1, $2, $3, $4, $5, $6, $7, $8)",
        [race.raceId, race.raceName, race.city, race.startTime, race.timezone, race.raceDetails, adminPassword, checkpointPassword],
        (err, res2) => {
          if (err) {
            console.log(err);
            returnError(res, 2);
            return;
          }

          res.json({
            responseMessage: "GOOD",
            returnCode: 0,
            race: race,
          });
        }
      );
    });
  } catch (err) {
    console.log(err);
    returnError(res, 1);
  }
});

app.get("/api/getracelist", (req, res) => {
  const now = Date.now();
  if (raceListUpdated + 1000 > Date.now()) {
    res.json({
      races: raceListCache,
      returnCode: 0,
    });
    return;
  }

  try {
    client.query("SELECT race_id, race_name, city, start_time, timezone from public.races", (err, res2) => {
      if (err) {
        returnError(res, 2);
        return;
      }
      const newRaces = [];
      res2.rows.forEach((row) => {
        newRaces.push({
          raceId: row.race_id,
          raceName: row.race_name,
          city: row.city,
          startTime: Number.parseInt(row.start_time),
          timezone: row.timezone,
        });
      });
      raceListCache = newRaces;
      raceListUpdated = now;
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

app.get("/api/getracedetails/:raceId", (req, res) => {
  const raceId = req.params.raceId;

  let raceData = {};
  let runners = {};
  let checkpoints = [];

  // Pull race data
  try {
    client.query("SELECT race_id, race_name, race_details, city, start_time, timezone from public.races WHERE race_id=$1", [raceId], (err, res2) => {
      if (err) {
        returnError(res, 2);
        return;
      }
      if (res2.rows.length === 0) {
        returnError(res, 3);
        return;
      }
      const dbData = res2.rows[0];
      raceData = {
        raceId: dbData.race_id,
        raceName: dbData.race_name,
        race_details: dbData.race_details,
        city: dbData.city,
        startTime: dbData.start_time,
        timezone: dbData.timezone,
      };

      try {
        client.query("SELECT race_id, bib_number, runner_name, distance from public.runners WHERE race_id=$1", [raceId], (err, res2) => {
          if (err) {
            returnError(res, 2);
            return;
          }
          res2.rows.forEach((row) => {
            runners[row.bib_number] = {
              bibNumber: row.bib_number,
              runnerName: row.runner_name,
              runnerDetails: row.distance,
            };
          });

          res.json({
            responseMessage: "GOOD",
            returnCode: 0,
            race: {
              ...raceData,
              runners,
              checkpoints,
            },
          });
        });
      } catch (err) {
        console.log(err);
        returnError(res, 1);
      }
    });
  } catch (err) {
    console.log(err);
    returnError(res, 1);
  }
});

app.get("/api/validatepassword/:raceId/:password", (req, res) => {
  const raceId = req.params.raceId;
  const password = req.params.password;
  const noAccess = "NO_ACCESS"
  let result = noAccess;

  // Pull race data
  try {
    client.query("SELECT race_id, admin_password, checkpoint_password WHERE race_id=$1", [raceId], (err, res2) => {
      if (err) {
        returnError(res, 2);
        return;
      }
      if (res2.rows.length === 0) {
        returnError(res, 3);
        return;
      }
      const race = res2.rows[0];
      if (decrypt(race.admin_password) === genericKey) {
        result = "RACE_ADMIN"
      } else if (decrypt(race.checkpoint_password) === genericKey) {
        result = "RACE_ASSISTANT"
      }
    });
  } catch (err) {
    console.log(err);
    returnError(res, 1);
  }
  if (result === noAccess) {
    returnError(res, 201, {access: result})
  }
  res.json({
    responseMessage: "GOOD",
    returnCode: 0,
    access: result
  });
});

app.post("/api/updateracedetails", (req, res) => {
  // Pull race data
  try {
    client.query("SELECT race_id, admin_password, checkpoint_password WHERE race_id=$1", [raceId], (err, res2) => {
      if (err) {
        returnError(res, 2);
        return;
      }
      if (res2.rows.length === 0) {
        returnError(res, 3);
        return;
      }
      const race = res2.rows[0];
      
    });
  } catch (err) {
    console.log(err);
    returnError(res, 1);
  }
  if (result === noAccess) {
    returnError(res, 201, {access: result})
  }
  res.json({
    responseMessage: "GOOD",
    returnCode: 0,
  });
});

app.post("/api/updateraceparticipants", (req, res) => {
   // Pull race data
   try {
    client.query("SELECT race_id, admin_password, checkpoint_password WHERE race_id=$1", [raceId], (err, res2) => {
      if (err) {
        returnError(res, 2);
        return;
      }
      if (res2.rows.length === 0) {
        returnError(res, 3);
        return;
      }
      const race = res2.rows[0];
      
    });
  } catch (err) {
    console.log(err);
    returnError(res, 1);
  }
  if (result === noAccess) {
    returnError(res, 201, {access: result})
  }
  res.json({
    responseMessage: "GOOD",
    returnCode: 0,
  });
});

app.post("/api/updateraceparticipants", (req, res) => {
  // Pull race data
  try {
   client.query("SELECT race_id, admin_password, checkpoint_password WHERE race_id=$1", [raceId], (err, res2) => {
     if (err) {
       returnError(res, 2);
       return;
     }
     if (res2.rows.length === 0) {
       returnError(res, 3);
       return;
     }
     const race = res2.rows[0];
   });
 } catch (err) {
   console.log(err);
   returnError(res, 1);
 }
 if (result === noAccess) {
   returnError(res, 201, {access: result})
 }
 res.json({
   responseMessage: "GOOD",
   returnCode: 0,
 });
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
