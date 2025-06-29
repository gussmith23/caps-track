"use client";

import {
  Dispatch,
  PointerEvent,
  ReactElement,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { GameGrid } from "./gameGrid";
import { PlayerObject } from "@/lib/entity/player";
import { addPointToGame, getGame } from "@/app/actions";
import { GameObject } from "@/lib/entity/game";

class SwipeStateMachine {
  private state: "idle" | "maybe-swiping" | "swiping" = "idle";

  private playersSwiped: PlayerObject[] = [];
  private rawMoveEvents: globalThis.PointerEvent[] = [];

  constructor(
    private gameId: string,
    // private button_and_player: [RefObject<null>, PlayerObject][],
    private canvasId: string,
    private document: Document,
  ) {
    this.reset();
  }

  reset() {
    this.document.removeEventListener("pointermove", this.pointerMove);

    this.state = "idle";
    this.playersSwiped = [];
    this.rawMoveEvents = [];

    // Clear the canvas.
    const canvas = this.document.getElementById(
      this.canvasId,
    ) as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Canvas context not found");
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  // Draw the line on the canvas based on the pointer events.
  drawLine() {
    const canvas = this.document.getElementById(
      this.canvasId,
    ) as HTMLCanvasElement;
    if (!canvas) {
      console.error("Canvas not found");
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("Canvas context not found");
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing.
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (this.rawMoveEvents.length > 0) {
      // Get the first event to start the line.
      const firstEvent = this.rawMoveEvents[0];
      const bx = canvas.getBoundingClientRect();
      let x = firstEvent.clientX - bx.left;
      let y = firstEvent.clientY - bx.top;

      // Copilot suggested this fix for scaling -- i don't quite understand it,
      // but it seems to work.
      x = x * (canvas.width / bx.width);

      ctx.moveTo(x, y);

      // Draw lines to each subsequent event.
      for (const event of this.rawMoveEvents) {
        x = event.clientX - bx.left;
        y = event.clientY - bx.top;
        x = x * (canvas.width / bx.width);
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
    ctx.closePath();

    // Draw a circle around the last pointer position.
    if (this.rawMoveEvents.length > 0) {
      const lastEvent = this.rawMoveEvents[this.rawMoveEvents.length - 1];
      const bx = canvas.getBoundingClientRect();
      let x = lastEvent.clientX - bx.left;
      let y = lastEvent.clientY - bx.top;

      // Copilot suggested this fix for scaling -- i don't quite understand it,
      // but it seems to work.
      x = x * (canvas.width / bx.width);

      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();
      ctx.closePath();
    }
  }
  onPointerMove(e: globalThis.PointerEvent) {
    // If swiping or maybe swiping, we want to capture the pointer move events.
    if (this.state === "swiping" || this.state === "maybe-swiping") {
      this.rawMoveEvents.push(e);
    }

    // If swiping or maybe swiping, draw a line on the canvas.
    if (this.state === "swiping" || this.state === "maybe-swiping") {
      this.drawLine();
    }
  }

  async finishSwipe() {
    console.log(
      "Finishing swipe with playersSwiped:",
      this.playersSwiped,
      " and state:",
      this.state,
    );

    if (this.state !== "swiping") {
      console.warn("Cannot finish swipe in state:", this.state);
      this.reset();
      return;
    }

    if (this.playersSwiped == null) {
      console.warn("Expected playersSwiped to be not null, but it is null.");
      this.reset();
      return;
    }

    const completedPlayersSwiped = this.playersSwiped;

    // Add points to game for all players in swipe.
    await Promise.all(
      completedPlayersSwiped.map((p) => {
        return addPointToGame(this.gameId, p.id.toString());
      }),
    );

    this.reset();
  }

  async onPointerUp(e: globalThis.PointerEvent) {
    switch (this.state) {
      case "idle":
        console.warn("Pointer up in idle state, ignoring.");
        return;
      case "maybe-swiping":
        console.log("Pointer up in maybe-swiping state; this is a click.");

        if (this.playersSwiped.length !== 1) {
          console.warn(
            "Expected exactly one player to be swiped, but found",
            this.playersSwiped.length,
            "players swiped. Doing nothing, resetting state.",
          );
          this.reset();
          return;
        }

        addPointToGame(this.gameId, this.playersSwiped[0].id.toString());
        this.reset();
        return;
      case "swiping":
        await this.finishSwipe();
        return;
    }
  }

  makeOnPointerLeave(player: PlayerObject) {
    return (e: PointerEvent<HTMLElement>) => {
      if (this.state == "maybe-swiping") {
        this.state = "swiping";
      }
    };
  }

  makeOnPointerEnter(player: PlayerObject) {
    return (e: PointerEvent<HTMLElement>) => {
      if (this.state == "swiping") {
        // If we are swiping, add player to playersSwiped.
        this.playersSwiped.push(player);

        // If we are swiping, vibrate the device.
        if (navigator.vibrate) {
          navigator.vibrate(100); // Vibrate for 100ms.
        }
      }
    };
  }

  makeOnPointerDown(player: PlayerObject) {
    return (e: PointerEvent<HTMLElement>) => {
      //
      e.target.releasePointerCapture(e.pointerId);
      this.document.addEventListener("pointermove", (event) => {
        this.onPointerMove(event);
      });
      this.document.addEventListener(
        "pointerup",
        (event) => {
          this.onPointerUp(event);
        },
        { once: true },
      );

      if (this.state !== "idle") {
        console.warn(
          "Pointer down in state",
          this.state,
          "but expected idle. Ignoring.",
        );
        return;
      }

      // Start swipe action.
      this.playersSwiped = [player];
      this.state = "maybe-swiping";

      e.target.addEventListener("pointermove", this.pointerMove);
    };
  }
}

export default function Game({ id }: { id: string }) {
  let [stateMachine, setStateMachine] = useState<SwipeStateMachine | null>(
    null,
  );
  useEffect(() => {
    // Initialize the state machine with the document reference.
    setStateMachine(new SwipeStateMachine(id, "gameCanvas", window.document));
  }, [id]);

  // const [dataIgnored, setData] = useState(null);

  const debug = false; // Set to true to show canvas border, among other things.

  const [game, setGame]: [
    GameObject | null,
    Dispatch<SetStateAction<GameObject | null>>,
  ] = useState<GameObject | null>(null);

  useEffect(() => {
    const eventSource = new EventSource(`/game/${id}/gameUpdated`);
    eventSource.onmessage = ({ data }) => {
      updateGame(JSON.parse(data));
    };
    return () => {
      eventSource.close();
    };
  }, [id]);

  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player3Score, setPlayer3Score] = useState(0);
  const [player4Score, setPlayer4Score] = useState(0);

  function updateGame(game: GameObject) {
    setGame(game);
    const [[team1, team2], [p1, p2, p3, p4]] = getScore(game);
    setTeam1Score(team1);
    setTeam2Score(team2);
    setPlayer1Score(p1);
    setPlayer2Score(p2);
    setPlayer3Score(p3);
    setPlayer4Score(p4);
  }

  const fetchGame = async () => {
    updateGame(JSON.parse(await getGame(id)));
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

  // pointer move function draws a line as the pointer moves.
  // function pointerMove(e: PointerEvent<HTMLDivElement>) {
  //   if (playersSwiped == null) {
  //     return;
  //   }

  //   const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
  //   const bx = canvas.getBoundingClientRect();
  //   let x = e.clientX - bx.left;
  //   const y = e.clientY - bx.top;
  //   // Copilot suggested this fix for scaling -- i don't quite understand it,
  //   // but it seems to work.
  //   x = x * (canvas.width / bx.width);

  //   // If playersSwiped is not null, then we are swiping.
  //   const ctx = canvas.getContext("2d");
  //   if (!ctx) {
  //     console.error("Canvas context not found");
  //     return;
  //   }
  //   ctx.strokeStyle = "black";
  //   ctx.lineWidth = 2;
  //   ctx.beginPath();
  //   // Get the canvas relative position.
  //   ctx.moveTo(x, y);
  //   ctx.lineTo(x + 1, y + 1); // Draw a small line to show the pointer movement.
  //   ctx.stroke();

  //   // Draw a circle around the pointer.
  //   ctx.beginPath();
  //   ctx.arc(x, y, 5, 0, Math.PI * 2);
  //   ctx.fillStyle = "black";
  //   ctx.fill();
  //   ctx.closePath();
  // }

  function playerBox({
    player,
    score,
  }: {
    player: PlayerObject;
    score: number;
  }) {
    if (stateMachine == null) {
      return <p>Loading...</p>;
    }
    // const buttonRef = useRef(null);
    let button = (
      <button
        onPointerEnter={stateMachine.makeOnPointerEnter(player)}
        onPointerLeave={stateMachine.makeOnPointerLeave(player)}
        onPointerDown={stateMachine.makeOnPointerDown(player)}
        // onPointerUp={stateMachine.makeOnPointerUp(player)}
        className="btn btn-primary btn-sm"
      >
        {player.name} : {score}
      </button>
    );
    let html = (
      <>{player ? <div className="component">{button}</div> : "loading..."}</>
    );
    return html;
  }

  if (game == null || game.players == null) {
    return <p>Loading...</p>;
  }

  return (
    <>
      {game && (
        <>
          <div
            // have to put this on the div and not the canvas, as we disabled
            // pointer events on the canvas
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
              player1Component={playerBox({
                player: game.players[0],
                score: player1Score,
              })}
              player2Component={playerBox({
                player: game.players[1],
                score: player2Score,
              })}
              player3Component={playerBox({
                player: game.players[2],
                score: player3Score,
              })}
              player4Component={playerBox({
                player: game.players[3],
                score: player4Score,
              })}
            />
          </div>
          <div className="text-center">
            {/* add vertical blank space */}
            <div style={{ height: "20px" }}></div>
            <h2>
              {game.players[0].name} & {game.players[2].name} vs{" "}
              {game.players[1].name} & {game.players[3].name}
            </h2>
            <h2>
              Score: {team1Score} - {team2Score}
            </h2>
          </div>
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
