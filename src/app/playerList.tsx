'use client'

import { Player } from "@/lib/entity/player";

export function PlayerList({
  setPlayer,
  players,
}: { setPlayer: (player: string,) => void, players: { id: string, name: string }[] }) {

  return (
    <select defaultValue={"player"} name="playerList" id="playerList" onChange={(e) => {
      setPlayer(e.target.value)
    }}>
      <option value="player" disabled>Player</option>
      {
        players.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name}
          </option>
        ))
      }
    </select >
  );
}