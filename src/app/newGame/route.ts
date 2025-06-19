import { AppDataSource } from "@/lib/db";
import { GameEntity } from "@/lib/entity/game";
import { PlayerEntity } from "@/lib/entity/player";

export async function POST(req: Request) {
  const body = await req.formData();

  // Function to get id or fail.
  const getIdOrFail = (key: string): number => {
    const value = body.get(key);
    if (!value) {
      throw new Error(`Missing required field: ${key}`);
    }
    const id = Number.parseInt(value.toString());
    if (isNaN(id)) {
      throw new Error(`Invalid id for field: ${key}`);
    }
    return id;
  };

  // Parse player IDs from the form data.
  const player1Id = getIdOrFail("player1id");
  const player2Id = getIdOrFail("player2id");
  const player3Id = getIdOrFail("player3id");
  const player4Id = getIdOrFail("player4id");

  const player1 = await AppDataSource.manager.findOneByOrFail(PlayerEntity, {
    id: player1Id,
  });
  const player2 = await AppDataSource.manager.findOneByOrFail(PlayerEntity, {
    id: player2Id,
  });
  const player3 = await AppDataSource.manager.findOneByOrFail(PlayerEntity, {
    id: player3Id,
  });
  const player4 = await AppDataSource.manager.findOneByOrFail(PlayerEntity, {
    id: player4Id,
  });

  const gameRepository = AppDataSource.getRepository(GameEntity);
  const result = await AppDataSource.manager.insert(GameEntity, {
    beganAt: new Date(),
  });

  const game = await gameRepository.findOneByOrFail({
    id: result.identifiers[0].id,
  });

  game.players = [player1, player2, player3, player4];
  await gameRepository.save(game);

  // Redirect to the new game page.
  const url = new URL(`/game/${result.identifiers[0].id}`, req.url);
  return new Response(null, {
    status: 303,
    headers: {
      Location: url.toString(),
    },
  });
}
