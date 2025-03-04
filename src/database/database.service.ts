// Abstract class defining the database provider interface. This allows us to
// separate the definition of the interface from any given implementation (e.g.
// the Google Sheets implementation).

import { Injectable } from '@nestjs/common';
import { Game } from 'src/game';
import { Player } from 'src/player';
import { Point } from 'src/point';

@Injectable()
export abstract class DatabaseService {
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
    let trueAddsAndDoubles = [];
    let trueRemoves = [];
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
          let double = undefined;
          if (event.event === 'double') {
            double = true;
          } else if (event.event === 'add') {
            double = false;
          }
          if (double === undefined) {
            throw new Error('double is undefined');
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
