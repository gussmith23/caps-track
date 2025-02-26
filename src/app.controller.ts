import { Body, Controller, Get, Inject, Logger, Param, Post, Render, Res, Sse } from '@nestjs/common';
import { AppService } from './app.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { filter, fromEvent, map } from 'rxjs';

@Controller()
export class AppController {
  private logger = new Logger(AppController.name);
  constructor(private readonly appService: AppService, @Inject('SHEET_PROVIDER') private sheet, private eventEmitter: EventEmitter2) { }

  @Get()
  @Render('index')
  async getIndex() {
    return Promise.all([this.sheet.getAllGamesMap(), this.sheet.getAllPlayersMap(), this.sheet.getPhrases(), this.sheet.getItemsMap(), this.sheet.getFontsMap()]).then(([gamesMap, playersMap, phrases, itemsMap, fontsMap]) => {
      let activeGameIds = [];
      let concludedGameIds = [];
      for (let game of gamesMap.values()) {
        if (game.endedAt) {
          concludedGameIds.push(game.id);
        } else {
          activeGameIds.push(game.id);
        }
      }
      return { activeGameIds: activeGameIds, concludedGameIds: concludedGameIds, playersMap: playersMap, gamesMap: gamesMap, phrase: phrases[Math.floor(Math.random() * phrases.length)], itemsMap, fontsMap };
    });
  }

  @Post('newGame')
  async postNewGame(@Res() res, @Body() body) {
    let id = await this.sheet.newGame(body.player1, body.player2, body.player3, body.player4);
    res.redirect(`/game/${id}`);
  }

  @Post('game/:id/addPoint')
  async addPoint(@Param() params, @Body() body) {
    await this.sheet.addPoint(params.id, body.playerId, body.double != undefined, new Date());
    this.eventEmitter.emit('gameUpdated', params.id);
  }

  @Sse('game/:id/gameUpdated')
  async getEvents(@Param() params) {
    return fromEvent(this.eventEmitter, 'gameUpdated').pipe(filter((gameId) => gameId == params.id)).pipe(map(() => ({ data: {} })));
  }

  @Post('game/:id/addEvents')
  async addEvents(@Param() params, @Body() body) {
    this.logger.log(`Adding events to game ${params.id}`);
    // Ensure all events are for this gameid.
    for (let event of body) {
      if (event.gameId != params.id) {
        throw new Error(`Event is for game ${event.gameId}, not game ${params.id}`);
      }
    }
    await this.sheet.addEvents(body);
    this.eventEmitter.emit('gameUpdated', params.id);
    this.logger.log(`Added events to game ${params.id}`);
  }

  @Post('game/:id/removePoint')
  async removePoint(@Param() params, @Body() body) {
    await this.sheet.removePoint(params.id, body.playerId);
    this.eventEmitter.emit('gameUpdated', params.id);
  }

  @Post('game/:id/endGame')
  async endGame(@Param() params) {
    await this.sheet.endGame(params.id, new Date());
    this.eventEmitter.emit('gameUpdated', params.id);
  }

  @Get('game/:id')
  @Render('game')
  async getGame(@Param() params) {
    let game = await this.sheet.getGame(params.id);
    let [[player1, player2, player3, player4], [team1Score, team2Score, player1Score, player2Score, player3Score, player4Score], itemsMap, fontsMap] = await Promise.all([this.sheet.getPlayers([game.player1id, game.player2id, game.player3id, game.player4id]), this.sheet.getScore(params.id), this.sheet.getItemsMap(), this.sheet.getFontsMap()]);
    return { game: game, player1: player1, player2: player2, player3: player3, player4: player4, team1Score, team2Score, player1Score, player2Score, player3Score, player4Score, itemsMap, fontsMap };
  }

  @Post('game/:id/renameGame')
  async renameGame(@Param() params, @Body() body, @Res() res) {
    await this.sheet.renameGame(params.id, body.gameName);
    this.eventEmitter.emit('gameUpdated', params.id);
    res.redirect(`/game/${params.id}`);
  }

  @Get('live')
  @Render('live')
  async getLive() {
    let [pointTypeToSortedPlayersAndPoints, allPlayersMap] = await Promise.all([this.sheet.getInterestingStats(), this.sheet.getAllPlayersMap()]);
    return { pointTypeToSortedPlayersAndPoints, allPlayersMap };
  }
}
