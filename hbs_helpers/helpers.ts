import { Player } from "src/player"
import { format } from "date-fns";
import { Item } from "src/item";

export function formatPlayer(player: Player, itemsMap: Map<string, Item>) {
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

  let classes = "";

  let hat = "";
  if (player.equippedItemIds.length > 0) {
    // Relative positioning, so that we can stack the item on top of the player name.
    classes += "position-relative";
    if (player.equippedItemIds.length > 1) {
      throw new Error(`Not supported yet`);
    }
    let item = itemsMap.get(player.equippedItemIds[0]);
    let itemHtml = itemToHtml(item);
    // Stack the item above the existing html in an inline element.
    hat = `<span class="position-absolute top-0 start-50 translate-middle" style="z-index:1;height:1em;width:1em;">${itemHtml}</span>`;
  }

  let html = `<span class="${classes}" style="${style}">${hat}${player.name}</span>`;

  return html;
}

export function mapLookup(map: Map<any, any>, key: any) {
  return map.get(key);
}

export function formatDate(date: Date, formatString: string) {
  return format(date, formatString);
}

export function itemToHtml(item: Item) {
  if (item.icon.startsWith('base64:')) {
    // height and width of 1em means image scales with text
    return `<img style="height:1em;width:1em;" src="${item.icon.slice(7)}" alt="${item.name}" />`;
  } else if (item.icon.startsWith('text:')) {
    return item.icon.slice(5);
  } else {
    throw new Error(`Item ${item.id} has invalid icon ${item.icon}`);
  }
}