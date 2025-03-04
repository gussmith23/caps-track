import { assert } from 'console';
import {
  GoogleSpreadsheetRow,
  GoogleSpreadsheetWorksheet,
} from 'google-spreadsheet';

export class Player {
  constructor(
    public id: string,
    public name: string,
    public nameColor: string,
    public fontId: string,
    public fontWeight: string,
    public unlockedItemIds: [string],
    public equippedItemIds: [string],
  ) {}
}
