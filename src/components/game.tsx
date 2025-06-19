"use client";

import {
  Dispatch,
  PointerEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { GameGrid } from "./gameGrid";
import { PlayerObject } from "@/lib/entity/player";
import { addPointToGame, getGame } from "@/app/actions";
import { GameObject } from "@/lib/entity/game";

export default function Game({ id }: { id: string }) {
  // const [dataIgnored, setData] = useState(null);

  const debug = true; // Set to true to show canvas border, among other things.

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

  // Players swiped, when swipe action is occurring. Null when no swipe is
  // occurring.
  let playersSwiped: PlayerObject[] | null = null;

  // pointer move function draws a line as the pointer moves.
  function pointerMove(e: PointerEvent<HTMLDivElement>) {
    if (playersSwiped == null) {
      return;
    }

    const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    const bx = canvas.getBoundingClientRect();
    let x = e.clientX - bx.left;
    const y = e.clientY - bx.top;
    // Copilot suggested this fix for scaling -- i don't quite understand it,
    // but it seems to work.
    x = x * (canvas.width / bx.width);

    // If playersSwiped is not null, then we are swiping.
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Canvas context not found");
      return;
    }
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Get the canvas relative position.
    ctx.moveTo(x, y);
    ctx.lineTo(x + 1, y + 1); // Draw a small line to show the pointer movement.
    ctx.stroke();

    // Draw a circle around the pointer.
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.closePath();
  }

  function playerBox({ player }: { player: PlayerObject }) {
    return (
      <>
        {player ? (
          <div className="component">
            {player.name}
            <button
              className="btn btn-primary btn-sm"
              onPointerOver={() => {
                console.log(
                  "Pointer over on button for player",
                  player.name,
                  "with id",
                  player.id,
                );
                // If playersSwiped is not null, we're swiping; add player to
                // playersSwiped.
                if (playersSwiped != null) {
                  // Add player to playersSwiped.
                  playersSwiped.push(player);
                  console.log("Added player to playersSwiped", playersSwiped);
                }
              }}
              onPointerDown={(e: PointerEvent<HTMLElement>) => {
                //
                e.target.releasePointerCapture(e.pointerId);

                console.log(
                  "Pointer down on button for player",
                  player.name,
                  "with id",
                  player.id,
                );

                // playersSwiped should be null as no swipe should be occurring.
                if (playersSwiped != null) {
                  console.warn(
                    "Pointer down on button for player",
                    player.name,
                    "but playersSwiped is not null.",
                  );

                  return;
                }

                // Start swipe action.
                playersSwiped = [player];

                // // Add listener for pointer move to add players to swipe.
                // const onPointerMove = (e: PointerEvent) => {
                //   console.log(
                //     "Pointer move on button for player",
                //     player.name,
                //     "with id",
                //     player.id,
                //   );

                //   // If playersSwiped is null, then we are not swiping.
                //   if (playersSwiped == null) {
                //     console.warn(
                //       "Pointer move on button for player",
                //       player.name,
                //       "but playersSwiped is null.",
                //     );
                //   }

                // }
                // const onPointerUp = async (e: PointerEvent) => {
                //   console.log(
                //     "Pointer up on button for player",
                //     player.name,
                //     "with id",
                //     player.id,
                //   );

                //   // If playersSwiped is null, then we are not swiping.
                //   if (playersSwiped == null) {
                //     console.warn(
                //       "Pointer up on button for player",
                //       player.name,
                //       "but playersSwiped is null.",
                //     );
                //     return;
                //   }

                //   // Remove listeners.
                //   document.removeEventListener("pointermove", onPointerMove);
                //   document.removeEventListener("pointerup", onPointerUp);

                //   // Add points to game for all players in swipe.
                //   for (const p of playersSwiped) {
                //     await addPointToGame(id, p.id.toString());
                //   }
                //   // Reset playersSwiped.

                //   playersSwiped = null;
                // }
                // // Add listeners for pointer move and pointer up.
                // document.addEventListener("pointermove", onPointerMove);
                // document.addEventListener("pointerup", onPointerUp);

                document.addEventListener(
                  "pointerup",
                  async () => {
                    // If playersSwiped is null, then we are not swiping.
                    if (playersSwiped == null) {
                      return;
                    }

                    const completedPlayersSwiped = playersSwiped;
                    playersSwiped = null; // Reset playersSwiped.

                    // Clear the canvas.
                    const canvas = document.getElementById(
                      "gameCanvas",
                    ) as HTMLCanvasElement;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) {
                      console.error("Canvas context not found");
                      return;
                    }
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    // Add points to game for all players in swipe.
                    await Promise.all(
                      completedPlayersSwiped.map((p) => {
                        return addPointToGame(id, p.id.toString());
                      }),
                    );
                  },
                  { once: true },
                );
              }}
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
      {game && (
        <div
          // have to put this on the div and not the canvas, as we disabled
          // pointer events on the canvas
          onPointerMove={pointerMove}
          className="container"
          style={{
            position: "relative",
            touchAction: "none",
          }}
        >
          <canvas
            id="gameCanvas"
            style={{
              touchAction: "none",
              pointerEvents: "none",
              border: debug ? "1px solid black" : "none",
              width: "100%",
              height: "100%",
              position: "absolute",
            }}
          ></canvas>
          <GameGrid
            player1Component={playerBox({ player: game.players[0] })}
            player2Component={playerBox({ player: game.players[1] })}
            player3Component={playerBox({ player: game.players[2] })}
            player4Component={playerBox({ player: game.players[3] })}
          />
        </div>
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
