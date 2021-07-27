const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");

const app = express();

app.use(express.json());

let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      fileName: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (e) {
    console.log(`DB Server: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertPlayer = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};

const convertMatch = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
        SELECT
          *
        FROM
          player_details`;
  const playerArray = await db.all(getPlayersQuery);
  response.send(playerArray.map((eachPlayer) => convertPlayer(eachPlayer)));
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
        SELECT
           *
        FROM
           player_details
        WHERE
           player_id = ${playerId}`;
  const playerArray = await db.all(getPlayerQuery);
  response.send(convertPlayer(eachPlayer));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const updatePlayerQuery = `
        UPDATE
            player_details
        SET
            player_name= '${playerName}'
        WHERE
            player_id = ${playerId}`;
  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchQuery = `
        SELECT
          *
        FROM
          match_details
        WHERE 
          match_id= ${matchId}`;
  const matchArray = await db.get(getMatchQuery);
  response.send(convertMatch(eachArray));
});

app.get("/players/:playerId/matches/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerMatchQuery = `
        SELECT
          *
        FROM
          player_match_score
          NATURAL JOIN match_details
        WHERE 
          player_id = ${playerId}`;
  const playerMatchArray = await db.all(getPlayerMatchQuery);
  response.send(playerMatchArray.map((eachPlayer) => convertMatch(eachPlayer)));
});

app.get("/matches/:matchId/players/", async (request, response) => {
  const { matchId } = request.params;
  const getMatchPlayerQuery = `
        SELECT
          *
        FROM
          player_match_score
          NATURAL JOIN player_details
        WHERE
          match_id = ${matchId}`;
  const matchPlayerArray = await db.all(getMatchPlayerQuery);
  response.send(matchPlayerArray.map((eachMatch) => convertPlayer(eachMatch)));
});

app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const getmatchPlayerQuery = `
        SELECT
          player_is AS playerId,
          player_name AS playerName,
          SUM(score) AS totalScore,
          SUM(fours) AS totalFours,
          SUM(sixes) AS totalSixes
        FROM
          player_match_score
          NATURAL JOIN player_details
        WHERE
          player_id = ${playerId}`;
  const totalArrays = await db.get(getmatchPlayerQuery);
  response.send(totalArrays);
});

module.exports = app;
