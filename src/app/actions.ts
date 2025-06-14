"use server";

import { AppDataSource } from "@/lib/db";
import { Player } from "@/lib/entity/player";

// Returns json string.
// TODO(@gussmith23): I don't know how to type this. I get an error if I do str.
export async function getPlayers() {
  return await AppDataSource.manager.find(Player).then(players => JSON.stringify(players));
}