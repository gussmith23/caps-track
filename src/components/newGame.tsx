"use client";
import { useState } from "react";
import { PlayerList } from "./playerList";
import { PlayerEntity } from "@/lib/entity/player";

export function NewGame({
  players,
}: {
  players: { id: string; name: string }[];
}) {
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [player3, setPlayer3] = useState("");
  const [player4, setPlayer4] = useState("");
  return (
    <>
      <h2>New Game</h2>
      <div className="container text-center">
        <form action="/newGame" method="post">
          <script type="text/javascript">
            {/* function updateGamePreview() {
              $("#gamePreview").text(
                $("#player2 option:selected").text() + " and " +
                $("#player4 option:selected").text() + " vs. " +
                $("#player3 option:selected").text() + " and " +
                $("#player1 option:selected").text()
              ); */}
          </script>
          <div className="row">
            <div className="col d-none d-sm-block"></div>
            <div className="col">
              <PlayerList players={players} setPlayerId={setPlayer2} />
            </div>
            <div className="col"></div>
            <div className="col">
              <PlayerList players={players} setPlayerId={setPlayer3} />
            </div>
            <div className="col d-none d-sm-block"></div>
          </div>
          <div className="row">
            <div className="col d-none d-sm-block"></div>
            <div className="col fs-1">🍺</div>
            <div className="col fs-1">↔</div>
            <div className="col fs-1">🍺</div>
            <div className="col d-none d-sm-block"></div>
          </div>
          <div className="row">
            <div className="col d-none d-sm-block"></div>
            <div className="col">
              <PlayerList players={players} setPlayerId={setPlayer4} />
            </div>
            <div className="col"></div>
            <div className="col">
              <PlayerList players={players} setPlayerId={setPlayer1} />
            </div>
            <div className="col d-none d-sm-block"></div>
          </div>
          <div className="row">
            <p id="gamePreview" className="text-center">
              Player and Player vs. Player and Player
            </p>
          </div>
          <div className="row">
            <div className="col">
              <button type="submit">New Game</button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
