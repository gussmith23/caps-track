import { Player } from "src/player"

export function formatPlayer(player: Player) {
  return `<span style="color: ${player.nameColor}">${player.name}</span>`;
}