import { GoogleSpreadsheetRow } from "google-spreadsheet"

export class Game {
  constructor(public id: number, public player1id: number, public player2id: number, public player3id: number, public player4id: number, public beganAt: Date, public endedAt?: Date) { };

  static fromRow(row: GoogleSpreadsheetRow) {
    // TODO(@gussmith23): It feels like there should be a more TypeScript-y way
    // of doing this. Apparently get() can return undefined and there's no way
    // to make it fail if it does.
    let errorIfUndefined = (field: string) => {
      if (typeof row.get(field) === 'undefined') {
        throw new Error(`Game row is missing ${field}`);
      }
      return row.get(field);
    };
    return new Game(errorIfUndefined('id'), errorIfUndefined('player1'), errorIfUndefined('player2'), errorIfUndefined('player3'), errorIfUndefined('player4'), new Date(errorIfUndefined('beganAt')), row.get('endedAt') ? new Date(row.get('endedAt')) : undefined);
  }
};