import { assert } from "console";
import { GoogleSpreadsheetRow, GoogleSpreadsheetWorksheet } from "google-spreadsheet"

export class Player {
  constructor(public id: number, public name: string, public color: string) { };

  static async checkSchema(arg0: GoogleSpreadsheetWorksheet): Promise<any> {
    return arg0.loadHeaderRow().then(_ => {
      let expectedHeaderValues = ['id', 'name', 'color'];
      for (let expectedHeaderValue of expectedHeaderValues) {
        if (!arg0.headerValues.includes(expectedHeaderValue)) {
          throw new Error(`Player sheet missing field "${expectedHeaderValue}"`);
        }
      }
      for (let actualHeaderValue of arg0.headerValues) {
        if (!expectedHeaderValues.includes(actualHeaderValue)) {
          throw new Error(`Player sheet includes unexpected field "${actualHeaderValue}"`);
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
        throw new Error(`Player row is missing ${field}`);
      }
      return row.get(field);
    };
    return new Player(errorIfUndefined('id'), errorIfUndefined('name'), row.get('color'));
  }
};