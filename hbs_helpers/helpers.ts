import { Player } from "src/player"

export function formatPlayer(player: Player) {
  let style = "";
  if (player.fontName) {
    style += `font-family: '${player.fontName}', serif;`;
  }
  if (player.nameColor) {
    style += `color: ${player.nameColor};`;
  }
  if (player.fontWeight) {
    style += `font-weight: ${player.fontWeight};`;
  }

  return `<span style="${style}">${player.name}</span>`;
}