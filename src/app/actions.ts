"use server";

import { AppDataSource } from "@/lib/db";
import { GameEntity } from "@/lib/entity/game";
import { PlayerEntity } from "@/lib/entity/player";
import { PointEntity } from "@/lib/entity/point";
import { broadcastGameUpdate } from "./game/[id]/gameUpdated/route";

// Returns json string.
// TODO(@gussmith23): I don't know how to type this. I get an error if I do str.
export async function getPlayers() {
  return await AppDataSource.manager
    .find(PlayerEntity)
    .then((players) => JSON.stringify(players));
}

export async function getGame(id: string) {
  let gameRepository = AppDataSource.getRepository(GameEntity);
  return await gameRepository
    .findOneOrFail({
      where: {
        id: id,
      },
      relations: { players: true, points: true },
    })
    .then((game) => JSON.stringify(game));
}

export async function addPointToGame(gameId: string, playerId: string) {
  const gameRepository = AppDataSource.getRepository(GameEntity);
  const game = await gameRepository.findOneOrFail({
    where: { id: gameId },
    relations: { players: true, points: true },
  });

  const playerRepository = AppDataSource.getRepository(PlayerEntity);
  const playerIdNumber = Number(playerId);
  const player = await playerRepository.findOneByOrFail({ id: playerIdNumber });

  // Add point
  await AppDataSource.manager.insert(PointEntity, {
    game: game,
    player: player,
    datetime: new Date(),
  });

  // Notify clients of game update.
  await broadcastGameUpdate(game);
}

export async function getPointsForGame(gameId: string) {
  // // Get game.
  // const gameRepository = AppDataSource.getRepository(Game);
  // const game = await gameRepository.findOneOrFail({
  //   where: { id: gameId },
  //   relations: { players: true }
  // });
  // // Get player points.
  // const playerRepository = AppDataSource.getRepository(Player);
  // const player1points = await playerRepository.createQueryBuilder("player").
  // const out = await AppDataSource
  //   .getRepository(Point)
  //   .createQueryBuilder("point")
  //   .select("COUNT(point.playerId)", "count")
  //   .where("point.gameId = :gameId", { gameId })
  //   .groupBy("point.playerId").getRawMany();
  // console.log("getPointsForGame out: ", out);
}
