"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { GameGrid } from "./gameGrid";
import { PlayerObject } from "@/lib/entity/player";
import { addPointToGame, getGame } from "@/app/actions";
import { GameObject } from "@/lib/entity/game";

export default function Game({ id }: { id: string }) {
  // const [dataIgnored, setData] = useState(null);

  const [game, setGame]: [
    GameObject | null,
    Dispatch<SetStateAction<GameObject | null>>,
  ] = useState<GameObject | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`/game/${id}/gameUpdated`);
    eventSource.onmessage = ({ data }) => {
      setGame(JSON.parse(data));
    };
    return () => {
      eventSource.close();
    };
  }, [id]);

  const fetchGame = async () => {
    setGame(JSON.parse(await getGame(id)));
  };

  // Get game.
  // TODO(@gussmith23): useEffect is bad; should also have a cleanup function.
  useEffect(
    () => {
      fetchGame().catch(console.error);
    },
    // This arg is important to prevent infinite loop.
    [id],
  );

  function playerBox({ player }: { player: PlayerObject }) {
    console.log("Rendering playerBox for", player);
    return (
      <>
        {player ? (
          <div className="component">
            {player.name}
            <button
              className="btn btn-primary btn-sm"
              onClick={async () => {
                await addPointToGame(id, player.id.toString());
                // This forces reload of game; trying to handle with SSE instead.
                // fetchGame().catch(console.error);
              }}
            >
              +
            </button>
          </div>
        ) : (
          "loading..."
        )}
      </>
    );
  }

  const [
    [team1Score, team2Score],
    [player1Score, player2Score, player3Score, player4Score],
  ] = game
    ? getScore(game)
    : [
        [0, 0],
        [0, 0, 0, 0],
      ];

  if (game == null || game.players == null) {
    return <p>Loading...</p>;
  }

  return (
    <>
      {/* Render grid only when not isPending */}
      {game && (
        <GameGrid
          player1Component={playerBox({ player: game.players[0] })}
          player2Component={playerBox({ player: game.players[1] })}
          player3Component={playerBox({ player: game.players[2] })}
          player4Component={playerBox({ player: game.players[3] })}
        />
      )}
      {game && (
        <>
          <p>
            Score: {team1Score} - {team2Score}
          </p>
          <p>Player 1 Score: {player1Score}</p>
          <p>Player 2 Score: {player2Score}</p>
          <p>Player 3 Score: {player3Score}</p>
          <p>Player 4 Score: {player4Score}</p>
        </>
      )}
    </>
  );
}

// Returns the score of the game as two arrays. The first array contains the
// scores of the teams. The second array contains the scores of the players in
// the same order as the players array. Currently intended for 2v2 games, but
// could be extended if we also track teams explicitly.
//
// Note that this is kind of weird because it's defined over objects similar to
// GameEntities, but not actually a method of GameEntity. This is because it's
// used in the client code and not in the server code. It would be nice to
// define clean deserialization and then define this as a method of GameEntity.
function getScore(
  game: GameObject,
): [[number, number], [number, number, number, number]] {
  if (game.players == null) {
    throw new Error(
      "Game.getScore: Game is missing players: " + JSON.stringify(game),
    );
  }
  if (game.points == null) {
    throw new Error(
      "Game.getScore: Game is missing points: " + JSON.stringify(game),
    );
  }
  const players = game.players;
  const points = game.points;
  const team1Score = points.filter(
    (point) =>
      point.player.id === players[0].id || point.player.id === players[2].id,
  ).length;
  const team2Score = points.filter(
    (point) =>
      point.player.id === players[1].id || point.player.id === players[3].id,
  ).length;

  const playerScores = players.map((player) => {
    return points.filter((point) => point.player.id === player.id).length;
  });

  if (game.players.length !== 4) {
    console.warn(
      "Game.getScore: Expected 4 players, but found",
      game.players.length,
    );
  }
  return [
    [team1Score, team2Score],
    [playerScores[0], playerScores[1], playerScores[2], playerScores[3]],
  ];
}
