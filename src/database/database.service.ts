// Abstract class defining the database provider interface. This allows us to
// separate the definition of the interface from any given implementation (e.g.
// the Google Sheets implementation).

import { Injectable, Logger } from '@nestjs/common';
import { Game } from 'src/game';
import { Player } from 'src/player';
import { Test } from '@nestjs/testing';
import { Point } from '../point';
import { Provider } from '@nestjs/common';
import { Font } from 'src/font';

@Injectable()
export abstract class DatabaseService {
  getItemsMap(): any {
    throw new Error('Method not implemented.');
  }
  getPhrases(): any {
    throw new Error('Method not implemented.');
  }
  // Database schemas.
  abstract getPlayerSchema(): Promise<string[]>;
  abstract getGameSchema(): Promise<string[]>;
  abstract getPointSchema(): Promise<string[]>;
  abstract getItemSchema(): Promise<string[]>;
  abstract getFontSchema(): Promise<string[]>;

  // Initialization routine, if needed. Must be called before use.
  abstract init();

  // Returns the new game's ID.
  abstract addGame(
    player1id: string,
    player2id: string,
    player3id: string,
    player4id: string,
    beganAt: Date,
    endedAt?: Date,
    name?: string,
  ): Promise<string>;
  abstract getGame(id: string): Promise<Game | undefined>;
  abstract getGamesMap(): Promise<Map<string, Game>>;

  // Returns the new player's ID.
  abstract addPlayer(): Promise<string>;
  abstract getPlayer(): Promise<Player | undefined>;

  abstract renameGame(gameId: string, name: string): Promise<void>;
  abstract getFontsMap(): Promise<Map<string, Font>>;
  abstract endGame(gameId: string, datetime: Date): Promise<void>;
  abstract getPlayers(ids: string[]);
  // [team1, team2, player1, player2, player3, player4]
  abstract getScore(gameId: string): Promise<[number, number, number, number, number, number]>;

  // Returns a map of point types to a sorted list of tuples of player id, point
  // count.
  abstract getInterestingStats(): Promise<Map<number, [string, number][]>>;

  abstract getAllPlayers(): Promise<Player[]>;

  abstract getPlayersMap(): Promise<Map<string, Player>>;

  async isGameActive(gameId) {
    return this.getGame(gameId).then((game) => {
      if (typeof game === 'undefined') {
        throw Error(`Game ${gameId} not found`);
      }
      return typeof game.endedAt === 'undefined';
    });
  }

  abstract getPoints(): Promise<Point[]>;
  // Note that unlike e.g. games or players, we can add Point objects directly,
  // as they don't have IDs attached to them.
  abstract addPoints(points: Point[]): Promise<void>;
  // Removes latest point from given game for the given player.
  abstract removePoint(gameId: string, playerId: string): Promise<void>;
  // Resolve a batch of point additions and removals, first minimizing the list
  // of events.
  // - event: "add", "double", or "remove"
  async addAndRemovePoints(
    events: {
      gameId: string;
      event: string;
      datetime: Date;
      playerId: string;
    }[],
  ) {
    events.sort((a, b) => {
      return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
    });

    if (events.length === 0) {
      return;
    }

    let gameId = events[0].gameId;
    for (let event of events) {
      if (event.gameId !== gameId) {
        // This doesn't have to be the case, i'm just lazy right now.
        throw new Error('gameId must be the same for all events');
      }
    }

    // Simplify the adds/removes. If this batch adds and then removes the same
    // player, we can just skip them.
    let trueAddsAndDoubles: {
      gameId: string;
      event: string;
      datetime: Date;
      playerId: string;
    }[] = [];
    let trueRemoves: {
      gameId: string;
      event: string;
      datetime: Date;
      playerId: string;
    }[] = [];
    for (let event of events) {
      if (event.event === 'add' || event.event === 'double') {
        trueAddsAndDoubles.push(event);
      } else if (event.event === 'remove') {
        // look for a matching add or double event in trueAddsAndDoubles and remove it.
        let reversed = trueAddsAndDoubles.slice().reverse();
        let eventToRemove = reversed.find(
          (event2, _) =>
            event2.playerId === event.playerId &&
            event2.gameId === event.gameId,
        );
        // If we find a matching add or double event, remove it from trueAddsAndDoubles. Otherwise, add this event to trueRemoves.
        if (eventToRemove) {
          trueAddsAndDoubles.splice(
            trueAddsAndDoubles.indexOf(eventToRemove),
            1,
          );
        } else {
          trueRemoves.push(event);
        }
      } else {
        throw new Error('event must be add, double, or remove');
      }
    }

    if (trueAddsAndDoubles.length === 0 && trueRemoves.length === 0) return;

    // Remove points the slow but sure way. See the comment below on the
    // commented-out batch-remove function.
    //
    // TODO(@gussmith23): Should we instead do this as a chain of promises and
    // thens? using e.g. reduce()? This is what I originally tried and I swear
    // it didn't work, but I can't remember why. I've fought with this for long
    // enough that, if this is working, I'm just going to let it be.
    for (let event of trueRemoves) {
      await this.removePoint(event.gameId, event.playerId);
    }

    return this.isGameActive(gameId).then((isActive) => {
      if (!isActive) {
        throw new Error('Game is not active');
      } else {
        let rows = trueAddsAndDoubles.map((event) => {
          let double: boolean;
          if (event.event === 'double') {
            double = true;
          } else if (event.event === 'add') {
            double = false;
          } else {
            throw new Error(
              "Invalid value of 'event' at this point in the code",
            );
          }

          return {
            gameId: event.gameId,
            double,
            playerId: event.playerId,
            datetime: event.datetime,
          };
        });
        return this.addPoints(rows);
      }
    });
  }
}

// T should be a class extending DatabaseService. I'm not sure what the type of
// classes in TypeScript is.
// - provider: should be
export function describeDatabaseService(
  description: string,
  provider: Provider,
  readOnly: boolean = false,
) {
  describe(description, () => {
    let service: DatabaseService;
    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({
        controllers: [],
        providers: [provider],
      }).compile();
      // TODO(@gussmith23): This likely won't work for our actual db providers.
      service = await moduleRef.resolve('DATABASE');
    });

    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    // Readonly tests currently just test the database schemas..
    // await Promise.all([Player.checkSchema(this.playerSheet()), Game.checkSchema(this.gameSheet()), Point.checkSchema(this.getPointSheet()), Item.checkSchema(this.getItemSheet()), Font.checkSchema(this.getFontSheet())]);
    describe('schemas', () => {
      it('has correct Player schema', async () => {
        expect(new Set(await service.getPlayerSchema())).toEqual(
          new Set([
            'id',
            'name',
            'nameColor',
            'fontId',
            'fontWeight',
            'unlockedItemIds',
            'equippedItemIds',
          ]),
        );
      });
      it('has correct Game schema', async () => {
        expect(new Set(await service.getGameSchema())).toEqual(
          new Set([
            'id',
            'beganAt',
            'player1',
            'player2',
            'player3',
            'player4',
            'endedAt',
            'name',
          ]),
        );
      });
      it('has correct Point schema', async () => {
        expect(new Set(await service.getPointSchema())).toEqual(
          new Set(['gameId', 'double', 'datetime', 'playerId']),
        );
      });
      it('has correct Item schema', async () => {
        expect(new Set(await service.getItemSchema())).toEqual(
          new Set(['id', 'name', 'icon', 'price', 'location']),
        );
      });
      it('has correct Font schema', async () => {
        expect(new Set(await service.getFontSchema())).toEqual(
          new Set(['id', 'name', 'size']),
        );
      });
    });

    // Return early if only doing the readonly tests.
    if (readOnly) return;

    describe('points', () => {
      describe('addPoints, getPoints, and removePoints', () => {
        it('should add points, get points, and remove points', async () => {
          let initialLength = (await service.getPoints()).length;
          let game1Id = await service.addGame('0', '1', '2', '3', new Date());
          let game2Id = await service.addGame('4', '5', '6', '7', new Date());

          let point1 = {
            gameId: game1Id,
            playerId: '1',
            double: true,
            datetime: new Date(),
          };
          let point2 = {
            gameId: game2Id,
            playerId: '5',
            double: false,
            datetime: new Date(),
          };
          await service.addPoints([point1, point2]);

          let points = await service.getPoints();
          expect(points).toHaveLength(initialLength + 2);
          expect(points).toContainEqual(point1);
          expect(points).toContainEqual(point2);

          await service.removePoint(point1.gameId, point1.playerId);
          await service.removePoint(point2.gameId, point2.playerId);

          points = await service.getPoints();
          expect(points).toHaveLength(initialLength + 0);
        }, 10000);
      });

      describe('removePoints', () => {
        it('should not error when removing from empty points list', async () => {
          let id = await service.addGame('0', '1', '2', '3', new Date());
          expect(id).toBeDefined();
          await service.removePoint(id, '0');
        });

        it('should remove the latest point', async () => {
          let points = await service.getPoints();
          let initialLength = points.length;

          let gameId = await service.addGame('0', '1', '2', '3', new Date());
          let playerId = '1';
          let point1 = { gameId, playerId, double: true, datetime: new Date() };
          let point2 = {
            gameId,
            playerId,
            double: false,
            datetime: new Date(new Date().getTime() + 30000),
          };
          let point3 = {
            gameId,
            playerId,
            double: true,
            datetime: new Date(new Date().getTime() + 60000),
          };

          // Order shouldn't matter.
          await service.addPoints([point2, point3, point1]);

          points = await service.getPoints();
          expect(points).toHaveLength(initialLength + 3);
          expect(points).toContainEqual(point1);
          expect(points).toContainEqual(point2);
          expect(points).toContainEqual(point3);

          await service.removePoint(gameId, playerId);
          points = await service.getPoints();
          expect(points).toHaveLength(initialLength + 2);
          expect(points).toContainEqual(point1);
          expect(points).toContainEqual(point2);

          await service.removePoint(gameId, playerId);
          points = await service.getPoints();
          expect(points).toHaveLength(initialLength + 1);
          expect(points).toContainEqual(point1);

          await service.removePoint(gameId, playerId);
          points = await service.getPoints();
          expect(points).toHaveLength(initialLength + 0);
        }, 15000);
      });

      describe('addAndRemovePoints', () => {
        it('should do nothing when passed an empty list', async () => {
          let points;
          points = await service.getPoints();
          let initialLength = points.length;
          await service.addAndRemovePoints([]);
          points = await service.getPoints();
          expect(points).toHaveLength(initialLength);
        });

        it('should add nothing when points cancel out', async () => {
          let points;
          points = await service.getPoints();
          let initialLength = points.length;

          await service.addAndRemovePoints([
            // Order shouldn't matter; only date order should matter.
            {
              gameId: '0',
              playerId: '0',
              datetime: new Date(2),
              event: 'remove',
            },
            { gameId: '0', playerId: '0', datetime: new Date(0), event: 'add' },
            {
              gameId: '0',
              playerId: '0',
              datetime: new Date(3),
              event: 'remove',
            },
            {
              gameId: '0',
              playerId: '0',
              datetime: new Date(1),
              event: 'double',
            },
          ]);

          points = await service.getPoints();
          expect(points).toHaveLength(initialLength);
        });

        it('should cancel points correctly', async () => {
          // We'll use this as an offset, to try and ensure the synthetic dates
          // aren't already in the database (e.g. in the case of testing on the
          // test database).
          let now = new Date().getTime();
          let gameId = await service.addGame(
            '0',
            '1',
            '2',
            '3',
            new Date(new Date().getTime() + now),
          );

          let points;
          points = await service.getPoints();
          let initialLength = points.length;

          await service.addAndRemovePoints([
            // Order shouldn't matter; only date order should matter.
            {
              gameId: gameId,
              playerId: '0',
              datetime: new Date(now + 2),
              event: 'remove',
            },
            {
              gameId: gameId,
              playerId: '0',
              datetime: new Date(now),
              event: 'add',
            },
            {
              gameId: gameId,
              playerId: '0',
              datetime: new Date(now + 3),
              event: 'double',
            },
          ]);

          points = await service.getPoints();
          expect(points).toHaveLength(initialLength + 1);
          expect(points).toContainEqual(
            new Point(gameId, true, new Date(now + 3), '0'),
          );
        });
      });
    });

    describe('games', () => {
      describe('getGame', () => {
        it('should return undefined for nonexistent games', async () => {
          expect(await service.getGame('nonexistent')).toBeUndefined();
        });
      });

      describe('addGame,  getGame, and getGamesMap', () => {
        it('should add games, get games, and get games as a map', async () => {
          let game1vals = {
            startDate: new Date(),
            endDate: new Date(),
            player1id: '1',
            player2id: '2',
            player3id: '3',
            player4id: '4',
            name: 'test game',
          };
          let game2vals = {
            startDate: new Date(),
            endDate: new Date(),
            player1id: '5',
            player2id: '6',
            player3id: '7',
            player4id: '8',
          };

          let game1id = await service.addGame(
            game1vals.player1id,
            game1vals.player2id,
            game1vals.player3id,
            game1vals.player4id,
            game1vals.startDate,
            game1vals.endDate,
            game1vals.name,
          );
          expect(game1id).toBeDefined();

          let game1 = await service.getGame(game1id);

          expect(game1).toBeDefined();
          expect(game1!.id).toEqual(game1id);
          expect(game1!.player1id).toEqual(game1vals.player1id);
          expect(game1!.player2id).toEqual(game1vals.player2id);
          expect(game1!.player3id).toEqual(game1vals.player3id);
          expect(game1!.player4id).toEqual(game1vals.player4id);
          expect(game1!.beganAt).toEqual(game1vals.startDate);
          expect(game1!.endedAt).toEqual(game1vals.endDate);
          expect(game1!.name).toEqual(game1vals.name);

          let game2id = await service.addGame(
            game2vals.player1id,
            game2vals.player2id,
            game2vals.player3id,
            game2vals.player4id,
            game2vals.startDate,
            game2vals.endDate,
          );
          expect(game2id).toBeDefined();
          expect(game2id).not.toEqual(game1id);

          let game2 = await service.getGame(game2id);
          expect(game2).toBeDefined();
          expect(game2!.name).toBeUndefined();

          let gamesMap = await service.getGamesMap();
          expect(gamesMap.get(game1id)).toEqual(game1);
          expect(gamesMap.get(game2id)).toEqual(game2);
        });
      });
    });
  });
}
