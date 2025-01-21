# Caps Track

To run Caps Track on development or production data, you need the following:
- A configuration file, stored in `config/`.
  - By default, Caps Track will look for a config called `config.json`. If you would like to set a custom config, set the environment variable `CAPS_TRACK_CONFIG`. The value of this environment variable is taken as a filepath relative to the base of `config/`. Note: your config must be stored somewhere in `config/` or it will not be copied during build.
- The ID of the Google Sheets spreadsheet being used as the database. This is set within the config file.
- A Google Cloud service account with permission to edit the sheet.
- A key to the service account, stored in a JSON file in `config/`. By default, Caps Track will look for a key called `key.json`. If you would like to use a different key, you can either 1. set the environment variable `CAPS_TRACK_KEYFILE` or 2. set the `"keyfile"` setting in the config. These settings are taken as relative to the `config/` directory.

## Structure

Here, I explain a bit about the structure of the project, geared towards potential contributors.

The components one might want to contribute to are:
- **Backend logic:** how pages link together, how the various buttons interact with the database, the design of the database schema, what data is tracked, etc.
- **Frontend:** what the pages actually look like.
- **Data analysis and visualization:** anything fun you want to do with the data once it's actually collected.


**Data analysis and visualization** is the easiest thing to contribute to. Caps Track uses a Google Sheets spreadsheet as its database, so if you would like to e.g. generate a visualization over the data, you simply need to build the visualization in the spreadsheet using standard Google Sheets tools. I can give you access to the spreadsheet if you would like to do this.

**Frontend** is also relatively easy to contribute to. The user interface of Caps Track is simply HTML files. These files are stored in the `views/` directory. These files are in an HTML templating language called Handlebars, which is quite easy to learn. These template files are instantiated on the server side and sent to the client. They have access to server-side data e.g. player and game info. These can be accessed in the template with syntax like `{{ game.player1 }}`. More data can be made available to templates by modifying the backend logic, so if there's something you're trying to do in the frontend, just ask.

**Backend logic** is by far the most complex thing to contribute to. In general, the project uses NestJS, which is a nice wrapper over NodeJS. The Caps Track server is a NestJS application that runs on a server somewhere and receives requests from clients (ie you using your phone to access the app while playing caps). If you want to contribute to this portion of the code, I recommend just talking to me directly. I will try to keep the code commented and clear.
