import { Player } from "src/player"
import { format } from "date-fns";

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

export function mapLookup(map: Map<any, any>, key: any) {
  return map.get(key);
}

export function formatDate(date: Date, formatString: string) {
  return format(date, formatString);
}