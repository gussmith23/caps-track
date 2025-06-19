"use client";
import { PlayerEntity } from "@/lib/entity/player";
import { GameGrid } from "@/components/gameGrid";
import { useEffect, useState, useTransition } from "react";
import { getPlayers } from "./actions";
import { PlayerList } from "@/components/playerList";

export default function Home() {
  // Must ensure there's no player with id "player" in the players array/db.
  const [player1, setPlayer1] = useState({ name: "Player", id: "player" });
  const [player2, setPlayer2] = useState({ name: "Player", id: "player" });
  const [player3, setPlayer3] = useState({ name: "Player", id: "player" });
  const [player4, setPlayer4] = useState({ name: "Player", id: "player" });
  const [playerList, setPlayerList] = useState<{ id: string; name: string }[]>(
    [],
  );

  // Function to find a player by ID.
  const findPlayerById = (id: string) => {
    return playerList.find((p) => p.id === id);
  };
  // Function to create a setter for a player by ID.
  const makeSetPlayerById = (
    setPlayer: (player: { name: string; id: string }) => void,
  ) => {
    return (id: string) => {
      const player = findPlayerById(id);
      if (player) {
        setPlayer(player);
      }
    };
  };

  const [isPending, startTransition] = useTransition();

  // TODO(@gussmith23): useEffect is bad; should also have a cleanup function.
  useEffect(
    () => {
      startTransition(async () => {
        const players = JSON.parse(await getPlayers());
        const playerList = players.map((p: PlayerEntity) => {
          return { id: p.id.toString(), name: p.name };
        });
        setPlayerList(playerList);
      });
    },
    // This arg is important to prevent infinite loop.
    [],
  );

  return (
    <>
      <div className="container">
        <h2>New Game</h2>
        <GameGrid
          player1Component={
            <PlayerList
              selectedValue={player1.id}
              players={playerList}
              setPlayerId={makeSetPlayerById(setPlayer1)}
            />
          }
          player2Component={
            <PlayerList
              selectedValue={player2.id}
              players={playerList}
              setPlayerId={makeSetPlayerById(setPlayer2)}
            />
          }
          player3Component={
            <PlayerList
              selectedValue={player3.id}
              players={playerList}
              setPlayerId={makeSetPlayerById(setPlayer3)}
            />
          }
          player4Component={
            <PlayerList
              selectedValue={player4.id}
              players={playerList}
              setPlayerId={makeSetPlayerById(setPlayer4)}
            />
          }
        />
        <form action="/newGame" method="post">
          <p className="text-center">
            {player1.name} & {player3.name} vs {player2.name} &{" "}
            {player4.name}{" "}
          </p>
          <input type="hidden" name="player1id" value={player1.id} />
          <input type="hidden" name="player2id" value={player2.id} />
          <input type="hidden" name="player3id" value={player3.id} />
          <input type="hidden" name="player4id" value={player4.id} />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isPending}
          >
            New Game{" "}
          </button>
        </form>
      </div>

      {/* <div className="container"> */}
      {/* <NewGame players={playerList} /> */}

      {/* {{ #if activeGameIds.length }}
      <h2>Active Games</h2>
      <ul>
        {{ #each activeGameIds }}
        {{ #with(mapLookup ../ gamesMap this)}}
        <li>
          <a href="/game/{{this.id}}">{{> gameName game=this
            player1=(mapLookup ../../playersMap this.player1id)
            player2=(mapLookup ../../playersMap this.player2id)
            player3=(mapLookup ../../playersMap this.player3id)
            player4=(mapLookup ../../playersMap this.player4id)
            displayDate=false
            itemsMap=../../itemsMap
            fontsMap=../../fontsMap
        }}</a>
        </li>
        {{/with}}
        {{/ each}}
      </ul>
      {{/if}}

      {{ #if concludedGameIds.length }}
      <h2>Concluded Games</h2>
      <ul>
        {{ #each concludedGameIds }}
        {{ #with(mapLookup ../ gamesMap this)}}
        <li>
          <a href="/game/{{this.id}}">{{> gameName game=this
            player1=(mapLookup ../../playersMap this.player1id)
            player2=(mapLookup ../../playersMap this.player2id)
            player3=(mapLookup ../../playersMap this.player3id)
            player4=(mapLookup ../../playersMap this.player4id)
            displayDate=true
            itemsMap=../../itemsMap
            fontsMap=../../fontsMap
        }}</a>
        </li>
        {{/with}}
        {{/ each}}
      </ul>
      {{/if}} */}
      {/* </div> */}
    </>
  );
}
