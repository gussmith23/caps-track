import { GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from "google-spreadsheet";

export class Point {
  // If double is a boolean, it simply indicates whether the point was a
  // double/triple/quad or not. If double is a number, it indicates the type of
  // double. 0 = single, 1 = double, 2 = triple, 3 = quad, etc.
  public double: boolean | number;

  // Accepts double as a boolean, number, or string, and parses it into the
  // correct value.
  constructor(public gameId: string, double: string | boolean | number, public datetime: Date, public playerId: string) {
    if (typeof double === 'boolean') {
      this.double = double;
    } else if (typeof double === 'number') {
      this.double = double;
    } else if (typeof double === 'string') {
      this.double = double === 'TRUE' ? true : double === 'FALSE' ? false : undefined;
      if (this.double === undefined) {
        throw new Error(`Invalid value for double: ${double}`);
      }
    } else {
      throw new Error(`Invalid value for double: ${double}`);
    }
  };

  static async checkSchema(sheet: GoogleSpreadsheetWorksheet): Promise<any> {
    return sheet.loadHeaderRow().then(_ => {
      let expectedHeaderValues = ['gameId', 'double', 'datetime', 'playerId'];
      for (let expectedHeaderValue of expectedHeaderValues) {
        if (!sheet.headerValues.includes(expectedHeaderValue)) {
          throw new Error(`Point sheet missing field "${expectedHeaderValue}"`);
        }
      }
      for (let actualHeaderValue of sheet.headerValues) {
        if (!expectedHeaderValues.includes(actualHeaderValue)) {
          throw new Error(`Point sheet includes unexpected field "${actualHeaderValue}"`);
        }
      }
    })
  }


  // Process point rows to compute doubles/triples/etc.
  public static fromRows(pointRows: GoogleSpreadsheetRow[]): Point[] {
    // Sort the points by datetime.
    pointRows.sort((a, b) => new Date(a.get('datetime')).getTime() - new Date(b.get('datetime')).getTime());

    // per game id, tracks the current streak of doubles/triples/etc.
    let streakTracker = new Map();

    // If `map` order isn't guaranteed, this might be buggy.
    return pointRows.map(row => {
      let gameId = row.get('gameId');
      let double = row.get('double') === 'TRUE' ? true : row.get('double') === 'FALSE' ? false : undefined;
      if (double === undefined) {
        throw new Error(`double is not TRUE or FALSE: ${row.get('double')}`);
      }

      if (!streakTracker.has(gameId)) {
        streakTracker.set(gameId, 0);
      }

      if (!double) {
        streakTracker.set(gameId, 0);
      } else {
        // Otherwise increment the streak tracker
        streakTracker.set(gameId, streakTracker.get(gameId) + 1);
      }

      return new Point(gameId, streakTracker.get(gameId), new Date(row.get('datetime')), row.get('playerId'));
    });
  }
}