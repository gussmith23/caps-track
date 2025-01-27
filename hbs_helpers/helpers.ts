import { Player } from "src/player"

export function formatPlayer(player: Player) {
  return `<span style="color: ${player.color}">${player.name}</span>`;
}