const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dataBasePath = path.join(__dirname, "cricketMatchDetails.db");
const app = express();
app.use(express.json());

let database = null;
const initializeDatabaseToServer = async () => {
  try {
    database = await open({
      filename: dataBasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error:${error.message}`);
    process.exit(1);
  }
};
initializeDatabaseToServer();

const convertDBobjecttoserverObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};
app.get("/players/", async (request, response) => {
  const getplayerdetails = `
    SELECT * FROM player_details`;
  const getplayer = await database.all(getplayerdetails);
  response.send(
    getplayer.map((eachplayer) => convertDBobjecttoserverObject(eachplayer))
  );
});
app.get("/players/:playerId/", async (request, response) => {
  const { playerName } = request.params;
  const getplayerdetails = `
    SELECT player_name FROM player_details`;
  const getplayer = await database.all(getplayerdetails);
  response.send(
    getplayer.map((eachplayer) => convertDBobjecttoserverObject(eachplayer))
  );
});
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;
  const getplayerdetails = `
    UPDATE player_details SET  player_name='${playerName}'; WHERE player_id=${playerId}`;
  const getplayer = await database.all(getplayerdetails);
  response.send("Player Details Updated");
});
app.get("/matches/:matchId/", async (request, response) => {
  const { match, matchId } = request.params;
  const getplayerdetails = `
    SELECT * FROM match_details`;
  const getplayer = await database.all(getplayerdetails);
  response.send("Player Details Updated");
});
app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;
  const getplayerdetails = `
    SELECT * FROM player_match_score NATURAL JOIN match_details WHERE player_id=${playerId};`;
  const getplayer = await database.all(getplayerdetails);
  response.send(
    getplayer.map((eachplayer) => convertDBobjecttoserverObject(eachplayer))
  );
});
app.get("/matches/:matchId/players", async (request, response) => {
  const getplayerdetails = `
    SELECT player_details.player_id AS playerId,player_details.player_name AS playerName FROM player_match_score NATURAL JOIN player_details WHERE match_id=${matchId};`;
  const getplayer = await database.all(getplayerdetails);
  response.send(convertDBobjecttoserverObject(getplayer));
});
app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;
  const getplayerdetails = `
    SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};
    `;
  const getplayer = await database.all(getplayerdetails);
  response.send(convertDBobjecttoserverObject(getplayer));
});
module.exports = app;
