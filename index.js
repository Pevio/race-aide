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
  201: "Invalid Password",
  202: "Missing fields for update race",

  // Race Participants
  301: "Missing fields for race participants",

  // Race Checkpoints
  401: "Missing fields for race checkpoints",
  402: "Invalid action for race checkpoint CRUD",
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
      !(race.raceDetails.distances.length > 0) ||
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

  // Pull race data
  try {
    client.query(
      "SELECT races.race_id, race_name, race_details, city, start_time, timezone, runners, checkpoint_number, checkpoint_distances, runners_passed from public.races LEFT JOIN public.runners ON races.race_id = runners.race_id LEFT JOIN public.checkpoints ON races.race_id = checkpoints.race_id WHERE public.races.race_id=$1",
      [raceId],
      (err, res2) => {
        if (err) {
          console.log(err);
          returnError(res, 2);
          return;
        }
        if (res2.rows.length === 0) {
          returnError(res, 3);
          return;
        }
        const firstRow = res2.rows[0];
        const checkpoints = [];
        res2.rows.forEach((row) => {
          if (row.checkpoint_number) {
            checkpoints.push({
              checkpointNumber: row.checkpoint_number,
              distances: row.checkpoint_distances,
              runnersPassed: row.runners_passed,
            });
          }
        });
        raceData = {
          raceId: firstRow.race_id,
          raceName: firstRow.race_name,
          raceDetails: firstRow.race_details,
          city: firstRow.city,
          startTime: Number.parseInt(firstRow.start_time),
          timezone: firstRow.timezone,
          runners: firstRow.runners || {},
          checkpoints,
        };
        res.json({
          responseMessage: "GOOD",
          returnCode: 0,
          race: raceData,
        });
      }
    );
  } catch (err) {
    console.log(err);
    returnError(res, 1);
  }
});

app.post("/api/validatepassword/:raceId", (req, res) => {
  const raceId = req.params.raceId;
  const password = req.body?.password;
  const noAccess = "NO_ACCESS";
  let result = noAccess;

  // Pull race data
  try {
    client.query("SELECT race_id, admin_password, checkpoint_password FROM public.races WHERE race_id=$1", [raceId], (err, res2) => {
      if (err) {
        returnError(res, 2);
        return;
      }
      if (res2.rows.length === 0) {
        returnError(res, 3);
        return;
      }
      const race = res2.rows[0];
      if (decrypt(race.admin_password, password) === genericKey) {
        result = "RACE_ADMIN";
      } else if (decrypt(race.checkpoint_password, password) === genericKey) {
        result = "RACE_ASSISTANT";
      }

      if (result === noAccess) {
        returnError(res, 201, { access: result });
        return;
      }
      res.json({
        responseMessage: "GOOD",
        returnCode: 0,
        access: result,
      });
    });
  } catch (err) {
    console.log(err);
    returnError(res, 1);
    return;
  }
});

app.post("/api/updateracedetails", (req, res) => {
  const race = req.body?.race || {};

  if (
    !(race.raceId?.length > 0) ||
    !(race.raceName?.length > 0) ||
    !(race.city?.length > 0) ||
    !(race.timezone?.length > 0) ||
    !(race.startTime > 0) ||
    !(race.raceDetails?.distances?.length > 0) ||
    !race.raceDetails
  ) {
    returnError(res, 202);
    return;
  }

  try {
    client.query("SELECT race_id, admin_password from public.races WHERE race_id=$1", [race.raceId], (err, res2) => {
      if (err) {
        console.log(err, 1);
        returnError(res, 2);
        return;
      }
      if (res2.rows.length === 0) {
        returnError(res, 3);
        return;
      }
      const originalRace = res2.rows[0];
      if (decrypt(originalRace.admin_password, req.body.password) !== genericKey) {
        returnError(res, 201);
        return;
      }
      client.query(
        "UPDATE public.races SET race_name = $2, city = $3, start_time = $4, timezone = $5, race_details = $6 WHERE race_id=$1",
        [race.raceId, race.raceName, race.city, race.startTime, race.timezone, race.raceDetails],
        (err, res2) => {
          if (err) {
            console.log(err);
            returnError(res, 2);
            return;
          }
          res.json({
            responseMessage: "GOOD",
            returnCode: 0,
            race,
          });
        }
      );
    });
  } catch (err) {
    console.log(err);
    returnError(res, 1);
  }
});

app.post("/api/updateraceparticipants", (req, res) => {
  const body = req?.body || {};
  const raceId = body.raceId;
  if (!body.password || !body.raceId || !(typeof body.runners === "object")) {
    returnError(res, 301);
    return;
  }
  try {
    client.query("SELECT races.race_id, admin_password, runners from public.races LEFT JOIN public.runners ON races.race_id = runners.race_id WHERE races.race_id=$1", [raceId], (err, res2) => {
      if (err) {
        returnError(res, 2);
        return;
      }
      if (res2.rows.length === 0) {
        returnError(res, 3);
        return;
      }
      if (decrypt(res2.rows[0].admin_password, body.password) !== genericKey) {
        returnError(res, 201);
        return;
      }
      let statement = "";
      if (res2.rows[0].runners) {
        // UPDATE
        statement = "UPDATE public.runners SET runners = $2 WHERE race_id = $1";
      } else {
        // CREATE
        statement = "INSERT INTO public.runners (race_id, runners) VALUES ($1, $2)";
      }
      client.query(statement, [raceId, body.runners], (err2, res3) => {
        if (err2) {
          returnError(res, 2);
          return;
        }
      });
      res.json({
        responseMessage: "GOOD",
        returnCode: 0,
        runners: body.runners,
      });
    });
  } catch (err) {
    console.log(err);
    returnError(res, 1);
  }
});

app.post("/api/updateracecheckpoints", (req, res) => {
  const body = req?.body || {};
  const raceId = body.raceId;
  if (!["CREATE", "UPDATE", "DELETE"].includes(body.action)) {
    returnError(res, 402);
    return;
  }
  if (!body.password || !body.raceId || !body.checkpoint || !body.action) {
    returnError(res, 401);
    return;
  }
  try {
    client.query("SELECT race_id, admin_password FROM public.races WHERE races.race_id=$1", [raceId], (err, res2) => {
      if (err) {
        console.log(1);
        console.log(err);
        returnError(res, 2);
        return;
      }
      if (decrypt(res2.rows[0].admin_password, body.password) !== genericKey) {
        returnError(res, 201);
        return;
      }

      let statement = "";
      let params = [];
      switch (body.action) {
        case "CREATE":
          statement = "INSERT INTO public.checkpoints (race_id, checkpoint_number, checkpoint_distances, runners_passed) VALUES ($1, $2, $3, $4)";
          params = [body.raceId, body.checkpoint.checkpointNumber, body.checkpoint.distances, JSON.stringify({})];
          break;
        case "UPDATE":
          statement = "UPDATE public.checkpoints SET checkpoint_distances = $3 WHERE race_id = $1 AND checkpoint_number = $2";
          params = [body.raceId, body.checkpoint.checkpointNumber, body.checkpoint.distances];
          break;
        case "DELETE":
          statement = "DELETE FROM public.checkpoints WHERE race_id = $1 AND checkpoint_number = $2";
          params = [body.raceId, body.checkpoint.checkpointNumber];
          break;
      }

      console.log(statement, params);
      client.query(statement, params, (err, res2) => {
        if (err) {
          console.log(2);
          console.log(err);
          returnError(res, 2);
          return;
        }

        client.query("SELECT checkpoint_number, checkpoint_distances, runners_passed from public.checkpoints WHERE race_id=$1", [raceId, body.checkpoint.checkpointNumber], (err, res2) => {
          if (err || res2.rows?.length === 0) {
            console.log(2);
            console.log(err);
            returnError(res, 2);
            return;
          }
          const checkpoints = rew2.rows.map((row) => ({
            checkpointNumber: row.checkpoint_number,
            distances: row.distances,
            runnersPassed: row.runners_passed,
          }));
          res.json({
            responseMessage: "GOOD",
            returnCode: 0,
            checkpoints,
          });
        });
      });
    });
  } catch (err) {
    console.log(err);
    returnError(res, 1);
  }
});

app.post("/api/addcheckpointentry", (req, res) => {
  // Pull race data
  try {
    client.query("SELECT race_id, admin_password, checkpoint_password from public.races WHERE race_id=$1", [raceId], (err, res2) => {
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
    returnError(res, 201, { access: result });
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
