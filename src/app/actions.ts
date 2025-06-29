"use server";

import { AppDataSource } from "@/lib/db";
import { GameEntity, GameObject } from "@/lib/entity/game";
import { PlayerEntity } from "@/lib/entity/player";
import { PointEntity } from "@/lib/entity/point";
import { broadcastGameUpdate } from "./game/[id]/gameUpdated/route";
import App from "next/app";

// Returns json string.
// TODO(@gussmith23): I don't know how to type this. I get an error if I do str.
export async function getPlayers() {
  return await AppDataSource.manager
    .find(PlayerEntity)
    .then((players) => JSON.stringify(players));
}

export async function getGame(id: string) {
  const gameRepository = AppDataSource.getRepository(GameEntity);
  return await gameRepository
    .findOneOrFail({
      where: {
        id: id,
      },
      relations: { players: true, points: true },
    })
    .then((game) => JSON.stringify(game));
}

export async function addPointToGame(
  gameId: string,
  playerId: string,
  index?: number,
) {
  const gameRepository = AppDataSource.getRepository(GameEntity);
  const game = await gameRepository.findOneOrFail({
    where: { id: gameId },
    relations: { players: true, points: true },
  });

  const playerRepository = AppDataSource.getRepository(PlayerEntity);
  const playerIdNumber = Number(playerId);
  const player = await playerRepository.findOneByOrFail({ id: playerIdNumber });

  // get max index of points for this game.
  if (index == null) {
    const pointRepository = AppDataSource.getRepository(PointEntity);
    const maxPointIndex = await pointRepository
      .createQueryBuilder("point")
      .select("MAX(point.index)", "maxIndex")
      .where("point.gameId = " + gameId)
      .getRawOne();
    console.log("maxPointIndex: ", maxPointIndex);
    index = maxPointIndex?.maxIndex != null ? maxPointIndex.maxIndex + 1 : 0;
  }

  // Add point
  let point = AppDataSource.manager.create(PointEntity, {
    game: game,
    player: player,
    index: index,
  });
  point = await AppDataSource.manager.save(point);

  // reload game with new point.
  const updatedGame = await gameRepository.findOneOrFail({
    where: { id: gameId },
    relations: { players: true, points: true },
  });

  // Notify clients of game update.
  await broadcastGameUpdate(updatedGame);
}

// export async function getPointsForGame(gameId: string) {
//   // // Get game.
//   // const gameRepository = AppDataSource.getRepository(Game);
//   // const game = await gameRepository.findOneOrFail({
//   //   where: { id: gameId },
//   //   relations: { players: true }
//   // });
//   // // Get player points.
//   // const playerRepository = AppDataSource.getRepository(Player);
//   // const player1points = await playerRepository.createQueryBuilder("player").
//   // const out = await AppDataSource
//   //   .getRepository(Point)
//   //   .createQueryBuilder("point")
//   //   .select("COUNT(point.playerId)", "count")
//   //   .where("point.gameId = :gameId", { gameId })
//   //   .groupBy("point.playerId").getRawMany();
//   // console.log("getPointsForGame out: ", out);
// }

export async function getGames(): Promise<string> {
  return await AppDataSource.manager
    .find(GameEntity, {
      relations: ["players", "points"],
    })
    .then((games) => JSON.stringify(games));
}

export async function removePointFromGame(gameId: string, pointId: number) {
  const pointRepository = AppDataSource.getRepository(PointEntity);
  const point = await pointRepository.findOneOrFail({
    where: { id: pointId },
    relations: ["game"],
  });

  if (point.game.id !== gameId) {
    throw new Error("Point does not belong to the specified game.");
  }

  await pointRepository.remove(point);

  // Notify clients of game update.
  const updatedGame = await getGame(gameId);
  await broadcastGameUpdate(JSON.parse(updatedGame));
}
