import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Render,
  Res,
  Sse,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { filter, fromEvent, map } from 'rxjs';
import { DatabaseService } from './database/database.service';
import { Point } from './point';

@Controller()
export class AppController {
  private logger = new Logger(AppController.name);
  constructor(
    @Inject('DATABASE') private database: DatabaseService,
    private eventEmitter: EventEmitter2,
  ) {}

  @Get()
  @Render('index')
  async getIndex() {
    return Promise.all([
      this.database.getGamesMap(),
      this.database.getPlayersMap(),
      this.database.getPhrases(),
      this.database.getItemsMap(),
      this.database.getFontsMap(),
    ]).then(([gamesMap, playersMap, phrases, itemsMap, fontsMap]) => {
      let activeGameIds = [];
      let concludedGameIds = [];
      for (let game of gamesMap.values()) {
        if (game.endedAt) {
          concludedGameIds.push(game.id);
        } else {
          activeGameIds.push(game.id);
        }
      }
      return {
        activeGameIds: activeGameIds,
        concludedGameIds: concludedGameIds,
        playersMap: playersMap,
        gamesMap: gamesMap,
        phrase: phrases[Math.floor(Math.random() * phrases.length)],
        itemsMap,
        fontsMap,
      };
    });
  }

  @Post('newGame')
  async postNewGame(@Res() res, @Body() body) {
    let id = await this.database.addGame(
      body.player1,
      body.player2,
      body.player3,
      body.player4,
      new Date(),
    );
    res.redirect(`/game/${id}`);
  }

  @Post('game/:id/addPoint')
  async addPoint(@Param() params, @Body() body) {
    await this.database.addPoints([
      new Point(
        params.id,
        body.double !== undefined,
        new Date(),
        body.playerId,
      ),
    ]);
    this.eventEmitter.emit('gameUpdated', params.id);
  }

  @Sse('game/:id/gameUpdated')
  async getEvents(@Param() params) {
    return fromEvent(this.eventEmitter, 'gameUpdated')
      .pipe(filter((gameId) => gameId == params.id))
      .pipe(map(() => ({ data: {} })));
  }

  @Post('game/:id/addEvents')
  async addEvents(@Param() params, @Body() body) {
    this.logger.log(`Adding events to game ${params.id}`);
    // Ensure all events are for this gameid.
    for (let event of body) {
      if (event.gameId != params.id) {
        throw new Error(
          `Event is for game ${event.gameId}, not game ${params.id}`,
        );
      }
    }
    await this.database.addAndRemovePoints(body);
    this.eventEmitter.emit('gameUpdated', params.id);
    this.logger.log(`Added events to game ${params.id}`);
  }

  @Post('game/:id/removePoint')
  async removePoint(@Param() params, @Body() body) {
    await this.database.removePoint(params.id, body.playerId);
    this.eventEmitter.emit('gameUpdated', params.id);
  }

  @Post('game/:id/endGame')
  async endGame(@Param() params) {
    await this.database.endGame(params.id, new Date());
    this.eventEmitter.emit('gameUpdated', params.id);
  }

  @Get('game/:id')
  @Render('game')
  async getGame(@Param() params) {
    let game = await this.database.getGame(params.id);
    let [
      [player1, player2, player3, player4],
      [
        team1Score,
        team2Score,
        player1Score,
        player2Score,
        player3Score,
        player4Score,
      ],
      itemsMap,
      fontsMap,
    ] = await Promise.all([
      this.database.getPlayers([
        game.player1id,
        game.player2id,
        game.player3id,
        game.player4id,
      ]),
      this.database.getScore(params.id),
      this.database.getItemsMap(),
      this.database.getFontsMap(),
    ]);
    return {
      game: game,
      player1: player1,
      player2: player2,
      player3: player3,
      player4: player4,
      team1Score,
      team2Score,
      player1Score,
      player2Score,
      player3Score,
      player4Score,
      itemsMap,
      fontsMap,
    };
  }

  @Post('game/:id/renameGame')
  async renameGame(@Param() params, @Body() body, @Res() res) {
    await this.database.renameGame(params.id, body.gameName);
    this.eventEmitter.emit('gameUpdated', params.id);
    res.redirect(`/game/${params.id}`);
  }

  @Get('live')
  @Render('live')
  async getLive() {
    let [pointTypeToSortedPlayersAndPoints, allPlayersMap] = await Promise.all([
      this.database.getInterestingStats(),
      this.database.getAllPlayersMap(),
    ]);
    return { pointTypeToSortedPlayersAndPoints, allPlayersMap };
  }
}
