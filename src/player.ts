import { GoogleSpreadsheetRow } from "google-spreadsheet"

export class Player {
  constructor(public id: number, public name: string) { };

  static fromRow(row: GoogleSpreadsheetRow) {
    // TODO(@gussmith23): It feels like there should be a more TypeScript-y way
    // of doing this. Apparently get() can return undefined and there's no way
    // to make it fail if it does.
    let errorIfUndefined = (field: string) => {
      if (typeof row.get(field) === 'undefined') {
        throw new Error(`Player row is missing ${field}`);
      }
      return row.get(field);
    };
    return new Player(errorIfUndefined('id'), errorIfUndefined('name'));
  }
};