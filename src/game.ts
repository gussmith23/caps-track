import { GoogleSpreadsheetRow } from "google-spreadsheet"

export class Game {
  constructor(public id: number, public player1id: number, public player2id: number, public player3id: number, public player4id: number, public beganAt: Date, public endedAt?: Date) { };

  static fromRow(row: GoogleSpreadsheetRow) {
    return new Game(row.get('id'), row.get('player1'), row.get('player2'), row.get('player3'), row.get('player4'), new Date(row.get('beganAt')), row.get('endedAt') ? new Date(row.get('endedAt')) : undefined);
  }
};