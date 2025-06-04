import { Provider } from '@nestjs/common';
import * as postgres from 'postgres';
import { DatabaseService } from './database.service';
import { Font } from '../font';
import { Game } from '../game';
import { Player } from '../player';
import { Point } from '../point';
import { Item } from '../item';


export function createPostgresDatabaseProvider(
  config: {
    username: string,
    password: string,
    database: string,
    host: string,
    port: number,
  }
): Provider {
  return {
    provide: 'DATABASE',
    useFactory: () => {
      const postgresConnection = postgres({
        user: config.username,
        password: config.password,
        database: config.database,
        host: config.host,
        port: config.port,
      });

      const dbService = new PostgresDatabaseService(postgresConnection);
      return dbService;
    },
  }
}

export class PostgresDatabaseService extends DatabaseService {
  getPlayerSchema(): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
  getGameSchema(): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
  getPointSchema(): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
  getItemSchema(): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
  getFontSchema(): Promise<string[]> {
    throw new Error('Method not implemented.');
  }
  init() {
    throw new Error('Method not implemented.');
  }
  addGame(player1id: string, player2id: string, player3id: string, player4id: string, beganAt: Date, endedAt?: Date, name?: string): Promise<string> {
    const ended = endedAt ? true : false;
    return this.sql`
      INSERT INTO game 
      (started_at, ended_at, ended, name)
      VALUES 
      (${beganAt.toISOString()}, ${endedAt ? endedAt.toISOString() : null}, ${ended}, ${name ? name : null})
      RETURNING id;`.then((rows) => {
      if (rows.length === 0) {
        throw new Error('Failed to insert game, no rows returned');
      }
      const id = rows[0].id;
      return this.sql`
      INSERT INTO player_game
      (game_id, player_id, player_idx)
      VALUES
      (${id}, ${player1id}, 0),
      (${id}, ${player2id}, 1),
      (${id}, ${player3id}, 2),
      (${id}, ${player4id}, 3);`.then((_) => {
        return id;
      });
    })
  }
  getGame(id: string): Promise<Game | undefined> {
    return this.sql`
      SELECT * FROM game WHERE id = ${id};`.then((rows) => {
      if (rows.length === 0) {
        return undefined;
      }
      if (rows.length > 1) {
        throw new Error('Expected exactly one row for game');
      }
      const gameRow = rows[0];

      return this.sql`
        SELECT (player_id) FROM player_game WHERE game_id = ${id} ORDER BY player_idx ASC;`.then((playerRows) => {
        if (playerRows.length !== 4) {
          throw new Error(`Expected exactly 4 players for game ${id}, got ${playerRows.length}`);
        }
        const [player1id, player2id, player3id, player4id] = playerRows.map(row => row.player_id);

        let beganAt = new Date(gameRow.started_at);
        if (!beganAt) {
          throw new Error(`Failed to parse started_at ${gameRow.started_at} for game ${id}`);
        }
        beganAt = new Date(beganAt);

        let endedAt: Date | undefined = undefined;
        if (gameRow.ended_at) {
          let parsedResult = new Date(gameRow.ended_at);
          if (!parsedResult) {
            throw new Error(`Failed to parse ended_at ${gameRow.ended_at} for game ${id}`);
          }
          endedAt = new Date(parsedResult);
        }

        return new Game(
          gameRow.id,
          player1id,
          player2id,
          player3id,
          player4id,
          beganAt,
          endedAt,
          gameRow.name ? gameRow.name : undefined,
        );
      })
    })
  }

  getGamesMap(): Promise<Map<string, Game>> {
    // Get all games
    return this.sql`
SELECT g.*, array_agg(p.id ORDER BY pg.player_idx ASC) FILTER (WHERE p.id IS NOT NULL) as player_ids
FROM game g 
LEFT JOIN player_game pg 
ON g.id = pg.game_id 
LEFT JOIN player p
ON p.id = pg.player_id
GROUP BY g.id`.then((rows) => {
      return new Map<string, Game>(rows.map((row) => {
        const playerIds = row.player_ids || [];
        return [row.id, new Game(
          row.id,
          playerIds[0] || '',
          playerIds[1] || '',
          playerIds[2] || '',
          playerIds[3] || '',
          new Date(row.started_at),
          row.ended_at ? new Date(row.ended_at) : undefined,
          row.name ? row.name : undefined,
        )];
      }));
    });
  }

  addPlayer(display_name: string): Promise<string> {
    return this.sql`
      INSERT INTO player (display_name)
      VALUES (${display_name})
      RETURNING id;`.then((rows) => {
      if (rows.length !== 1) {
        throw new Error('Should be exactly one row returned from player insert');
      }
      return rows[0].id;
    }
    );
  }
  getPlayer(id: string): Promise<Player | undefined> {
    return this.sql`
      SELECT player.*, 
        array_agg(player_item.item_id) AS unlocked_item_ids,
        array_agg(player_item.item_id) FILTER (WHERE player_item.equipped = true) AS equipped_item_ids
      FROM player 
      LEFT JOIN player_item
      ON player.id = player_item.player_id
      WHERE player.id = ${id}
      GROUP BY player.id
      `.then((rows) => {
      if (rows.length === 0) {
        return undefined;
      }
      if (rows.length > 1) {
        throw new Error('Expected exactly one row for player');
      }
      const row = rows[0];
      return new Player(
        row.id,
        row.display_name,
        row.name_color ? row.name_color : undefined,
        row.font_id ? row.font_id : undefined,
        row.font_weight ? row.font_weight : undefined,
        row.unlocked_item_ids ? row.unlocked_item_ids : [],
        row.equipped_item_ids ? row.equipped_item_ids : [],
      );
    });
  }
  renameGame(gameId: string, name: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getFontsMap(): Promise<Map<string, Font>> {
    return this.sql`
      SELECT * FROM font;`
      .then((rows) => {
        return new Map<string, Font>(rows.map((row) => {
          return [row.id, new Font(
            row.id,
            row.name,
            row.size ? row.size : undefined,
          )];
        }));
      });
  }
  endGame(gameId: string, datetime: Date): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getPlayers(ids: string[]) {
    return this.sql`
      SELECT player.*,
        array_agg(player_item.item_id) AS unlocked_item_ids,
        array_agg(player_item.item_id) FILTER (WHERE player_item.equipped = true) AS equipped_item_ids
      FROM player
      LEFT JOIN player_item
      ON player.id = player_item.player_id
      WHERE player.id = any(${ids})
      GROUP BY player.id
    `.then((rows) => {
      return rows.map((row) => {
        return new Player(
          row.id,
          row.display_name,
          row.name_color ? row.name_color : undefined,
          row.font_id ? row.font_id : undefined,
          row.font_weight ? row.font_weight : undefined,
          row.unlocked_item_ids ? row.unlocked_item_ids : [],
          row.equipped_item_ids ? row.equipped_item_ids : [],
        );
      });
    });
  }
  getScore(gameId: string): Promise<[number, number, number, number, number, number]> {
    // [team1Score, team2Score, player1Score, player2Score, player3Score, player4Score]
    return this.sql`
      SELECT
        CAST(COALESCE(SUM(CASE WHEN player_game.player_idx = 0 OR player_game.player_idx = 2 THEN 1 ELSE 0 END), 0) AS INT) AS team1_score,
        CAST(COALESCE(SUM(CASE WHEN player_game.player_idx = 1 OR player_game.player_idx = 3 THEN 1 ELSE 0 END), 0) AS INT) AS team2_score,
        CAST(COALESCE(SUM(CASE WHEN player_game.player_idx = 0 THEN 1 ELSE 0 END), 0) AS INT) AS player1_score,
        CAST(COALESCE(SUM(CASE WHEN player_game.player_idx = 1 THEN 1 ELSE 0 END), 0) AS INT) AS player2_score,
        CAST(COALESCE(SUM(CASE WHEN player_game.player_idx = 2 THEN 1 ELSE 0 END), 0) AS INT) AS player3_score,
        CAST(COALESCE(SUM(CASE WHEN player_game.player_idx = 3 THEN 1 ELSE 0 END), 0) AS INT) AS player4_score
      FROM point
      LEFT JOIN player_game
      ON point.game = player_game.game_id AND point.player = player_game.player_id
      WHERE game = ${gameId}
    `.then((rows) => {
      if (rows.length !== 1) {
        throw new Error('Expected exactly one row for score');
      }
      const row = rows[0];

      if (Object.values(row).some(value => value === null || value === undefined)) {
        throw new Error('Score contains null or undefined values');
      }

      return [
        row.team1_score,
        row.team2_score,
        row.player1_score,
        row.player2_score,
        row.player3_score,
        row.player4_score,];
    });
  }
  getInterestingStats(): Promise<Map<number, [string, number][]>> {
    throw new Error('Method not implemented.');
  }
  getAllPlayers(): Promise<Player[]> {
    return this.sql`
      SELECT player.*,
      array_agg(player_item.item_id) AS unlocked_item_ids,
        array_agg(player_item.item_id) FILTER(WHERE player_item.equipped = true) AS equipped_item_ids
      FROM player
      LEFT JOIN player_item
      ON player.id = player_item.player_id
      GROUP BY player.id
      `.then((rows) => {
      return rows.map((row) => {
        return new Player(
          row.id,
          row.display_name,
          row.name_color ? row.name_color : undefined,
          row.font_id ? row.font_id : undefined,
          row.font_weight ? row.font_weight : undefined,
          row.unlocked_item_ids ? row.unlocked_item_ids : [],
          row.equipped_item_ids ? row.equipped_item_ids : [],
        );
      });
    });
  }
  getPlayersMap(): Promise<Map<string, Player>> {
    return this.sql`
      SELECT player.*,
      array_agg(player_item.item_id) AS unlocked_item_ids,
        array_agg(player_item.item_id) FILTER(WHERE player_item.equipped = true) AS equipped_item_ids
      FROM player
      LEFT JOIN player_item
      ON player.id = player_item.player_id
      GROUP BY player.id
    `.then((rows) => {
      return new Map<string, Player>(rows.map((row) => {
        return [row.id, new Player(
          row.id,
          row.display_name,
          row.name_color ? row.name_color : undefined,
          row.font_id ? row.font_id : undefined,
          row.font_weight ? row.font_weight : undefined,
          row.unlocked_item_ids ? row.unlocked_item_ids : [],
          row.equipped_item_ids ? row.equipped_item_ids : [],
        )];
      }));
    });
  }

  getPoints(): Promise<Point[]> {
    return this.sql`SELECT * FROM point`.then((rows) => {
      return rows.map((row) => {
        return new Point(
          row.game,
          row.double,
          new Date(row.timestamp),
          row.player,
        );
      });
    });
  }

  addPoints(points: Point[]): Promise<void> {
    // I think there's a cleaner way to do this with postgresjs, but for now,
    // I'm just manually making the keys match the column names.
    let pointsTransformed = points.map(p => ({
      game: p.gameId,
      player: p.playerId,
      timestamp: p.datetime.toISOString(),
      double: p.double,
    }));
    return this.sql`
      INSERT INTO point 
      ${this.sql(pointsTransformed)}
    `.then(() => { });
  }
  removePoint(gameId: string, playerId: string): Promise<void> {
    // Remove the latest point from the specified game and player.
    return this.sql`
      DELETE FROM point
    WHERE
      (player, game, timestamp, double) = any(array(
        SELECT(player, game, timestamp, double) FROM point
        WHERE
        game = ${gameId} AND player = ${playerId}
        ORDER BY timestamp DESC
        LIMIT 1)); `.then(() => { });
  }

  getPhrases(): Promise<string[]> {
    return this.sql`
      SELECT phrase FROM phrase; `
      .then((rows) => {
        return rows.map(row => row.phrase);
      }
      );
  }

  getItemsMap(): Promise<Map<string, Item>> {
    return this.sql`
    SELECT * FROM item; `
      .then((rows) => {
        return new Map<string, Item>(rows.map((row) => {
          return [row.id, new Item(
            row.id,
            row.name,
            row.icon,
            row.price,
            row.location,
          )];
        }));
      });
  }

  end() {
    // Close the database connection
    return this.sql.end();
  }

  constructor(private readonly sql: postgres.Sql) {
    super();
  }

};