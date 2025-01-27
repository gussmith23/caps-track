import { GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from "google-spreadsheet"

export class Game {
  async addToSheet(sheet: GoogleSpreadsheetWorksheet) {
    let data = {
      id: this.id,
      player1: this.player1id,
      player2: this.player2id,
      player3: this.player3id,
      player4: this.player4id,
    };
    if (this.endedAt) {
      data['endedAt'] = this.endedAt;
    }
    if (this.beganAt) {
      data['beganAt'] = this.beganAt;
    }
    return sheet.addRow(data);
  }
  constructor(public id: number, public player1id: number, public player2id: number, public player3id: number, public player4id: number, public beganAt: Date, public endedAt?: Date) { };

  static async checkSchema(arg0: GoogleSpreadsheetWorksheet): Promise<any> {
    return arg0.loadHeaderRow().then(_ => {
      let expectedHeaderValues = ['id', 'beganAt', 'player1', 'player2', 'player3', 'player4', 'endedAt'];
      for (let expectedHeaderValue of expectedHeaderValues) {
        if (!arg0.headerValues.includes(expectedHeaderValue)) {
          throw new Error(`Game sheet missing field "${expectedHeaderValue}"`);
        }
      }
      for (let actualHeaderValue of arg0.headerValues) {
        if (!expectedHeaderValues.includes(actualHeaderValue)) {
          throw new Error(`Game sheet includes unexpected field "${actualHeaderValue}"`);
        }
      }
    })
  }

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