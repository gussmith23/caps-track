import { GoogleSpreadsheetRow } from "google-spreadsheet"

export class Player {
  constructor(public id: number, public name: string) { };

  static fromRow(row: GoogleSpreadsheetRow) {
    return new Player(row.get('id'), row.get('name'));
  }
};