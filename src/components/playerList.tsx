// Assumption: there's no player with id "player" in the players array.
export function PlayerList({
  setPlayerId,
  players,
  selectedValue,
}: {
  setPlayerId: (playerId: string) => void;
  players: { id: string; name: string }[];
  selectedValue?: string;
}) {
  return (
    <select
      value={selectedValue}
      name="playerList"
      id="playerList"
      onChange={(e) => {
        setPlayerId(e.target.value);
      }}
    >
      <option value="player" key="player" disabled>
        Player
      </option>
      {players.map((player) => (
        <option key={player.id} value={player.id} label={player.name}>
          {player.name}
        </option>
      ))}
    </select>
  );
}
