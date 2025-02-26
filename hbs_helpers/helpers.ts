import { Player } from "src/player"
import { format } from "date-fns";
import { Item } from "src/item";
import { Font } from "src/font";

// - level: 0 is text only, 1 is text with font/color/weight, 2 is 1 with items
export function formatPlayer(player: Player, itemsMap: Map<string, Item>, fontsMap: Map<string, Font>, level: number = 0) {
  if (!player) {
    throw new Error("Player is undefined");
  }
  let style = "";
  // Styles that only apply directly to the name text itself.
  let playerNameSpanStyle = "";
  if (player.fontId && level >= 1) {
    let font = fontsMap.get(player.fontId);
    style += `font-family: '${font.name}', serif;`;
    if (font.size) {
      playerNameSpanStyle += `font-size: ${font.size};`;
    }
  }
  if (player.nameColor && level >= 1) {
    style += `color: ${player.nameColor};`;
  }
  if (player.fontWeight && level >= 1) {
    style += `font-weight: ${player.fontWeight};`;
  }

  let classes = "";

  let hat = "";
  let left = "";
  let right = "";
  if (player.equippedItemIds.length > 0 && level >= 2) {
    // Relative positioning, so that we can stack the item on top of the player name.
    classes += "position-relative";
    for (let itemId of player.equippedItemIds) {
      let item = itemsMap.get(itemId);
      let itemHtml = itemToHtml(item);
      if (item.location === 'hat') {
        hat = `<span class="position-absolute start-50 translate-middle" style="top:-.1em;z-index:1">${itemHtml}</span>`;
      } else if (item.location === 'left') {
        left = `<span style="z-index:1;">${itemHtml}</span>`;
      } else if (item.location === 'right') {
        right = `<span style="z-index:1;">${itemHtml}</span>`;
      } else {
        throw new Error(`Invalid item location ${item.location}`);
      }
    }
  }

  let html = `${left}<span class="${classes}" style="${style}">${hat}<span style="${playerNameSpanStyle}">${player.name}</span></span>${right}`;

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