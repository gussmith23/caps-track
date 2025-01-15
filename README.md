# Caps Track

To run Caps Track on development or production data, you need the following:
- The ID of the Google Sheets spreadsheet being used as the database.
  - The ID should be stored in a file called `caps-track-config.json` at the root of the project. See `caps-track-config.json.template`.
- A Google Cloud service account with permission to edit the sheet
- A key to the service account, stored in `key.json` 