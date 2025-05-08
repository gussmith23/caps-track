// A fake database implementation that can be used for local functional testing.

import { Player } from 'src/player';
import { Game } from '../game';
import { DatabaseService } from './database.service';
import { Point } from 'src/point';
import { Font } from 'src/font';

export class FakeDatabaseService extends DatabaseService {
  renameGame(gameId: string, name: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getFontsMap(): Promise<Map<string, Font>> {
    throw new Error('Method not implemented.');
  }
  endGame(gameId: string, datetime: Date): Promise<void> {
    throw new Error('Method not implemented.');
  }
  getPlayers(ids: string[]) {
    throw new Error('Method not implemented.');
  }
  getScore(gameId: string): Promise<[number, number, number, number, number, number]> {
    throw new Error('Method not implemented.');
  }
  getInterestingStats(): Promise<Map<number, [string, number][]>> {
    throw new Error('Method not implemented.');
  }
  getAllPlayers(): Promise<Player[]> {
    throw new Error('Method not implemented.');
  }
  private points: Point[] = [];
  private games: Map<string, Game> = new Map();

  getGameSchema(): Promise<string[]> {
    return Promise.resolve([
      'id',
      'beganAt',
      'player1',
      'player2',
      'player3',
      'player4',
      'endedAt',
      'name',
    ]);
  }
  getPointSchema(): Promise<string[]> {
    return Promise.resolve(['gameId', 'double', 'datetime', 'playerId']);
  }
  getItemSchema(): Promise<string[]> {
    return Promise.resolve(['id', 'name', 'icon', 'price', 'location']);
  }
  getFontSchema(): Promise<string[]> {
    return Promise.resolve(['id', 'name', 'size']);
  }
  getPlayerSchema(): Promise<string[]> {
    return Promise.resolve([
      'id',
      'name',
      'nameColor',
      'fontId',
      'fontWeight',
      'unlockedItemIds',
      'equippedItemIds',
    ]);
  }

  getPoints(): Promise<Point[]> {
    return Promise.resolve(this.points);
  }
  addPoints(points: Point[]): Promise<void> {
    points.forEach((v) => this.points.push(v));
    return Promise.resolve();
  }
  removePoint(gameId: string, playerId: string): Promise<void> {
    this.points.sort((a, b) => {
      return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
    });
    this.points.reverse();
    let index = this.points.findIndex(
      (p) => p.gameId === gameId && p.playerId === playerId,
    );
    if (index !== -1) this.points.splice(index, 1);
    return Promise.resolve();
  }
  getGamesMap(): Promise<Map<string, Game>> {
    return Promise.resolve(this.games);
  }
  addPlayer(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  getPlayer(): Promise<Player | undefined> {
    throw new Error('Method not implemented.');
  }
  getPlayersMap(): Promise<Map<string, Player>> {
    throw new Error('Method not implemented.');
  }

  addGame(
    player1id: string,
    player2id: string,
    player3id: string,
    player4id: string,
    beganAt: Date,
    endedAt?: Date,
    name?: string,
  ): Promise<string> {
    let id = this.games.size.toString();
    this.games.set(
      id,
      new Game(
        id,
        player1id,
        player2id,
        player3id,
        player4id,
        beganAt,
        endedAt,
        name,
      ),
    );
    return Promise.resolve(id);
  }
  getGame(id: string): Promise<Game | undefined> {
    return Promise.resolve(this.games.get(id));
  }

  init() {}
}
