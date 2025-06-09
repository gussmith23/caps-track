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

## Development Notes

### Player Numbering

I went through a few ways of numbering players, and settled on this:
```
(player 1) (cup) (player 2)
             ^
             |
             V
(player 4) (cup) (player 3)
```
This means that teams are player 1 and player 3 vs player 2 and player 4. I've already had bugs where I don't respect this numbering scheme, so please be careful.

### Custom Bootstrap 

We use Bootstrap for styling. We also customize Bootstrap a bit (e.g. to make the logo change colors when you flip between dark and light themes). Customizing Bootstrap is easy and well-supported. We have our own main style file, `scss/style.scss`, which imports Bootstrap and adds our custom styles. Then, in the build scripts in `package.json`, this file is compiled into the main `style.css` file and moved into `assets/`, which is eventually copied into the `dist/` by Nest.js and imported in all of our HTML (see `default.hbs`).

## Architecture

Entry is in `main.ts`.

Database schema checking is really basic. Basically: log into the database and check that it matches expectations. If it doesn't, fail. If the table doesn't exist at all, create it. No migrations or anything; either manually migrate or delete the database each time.

Entire config is stored in `.env` file. See `.env.template` and 12-factor app.

Testing:
Unit tests are stored in `src/` alongside implementation files. These should be runnable with a basic invocation of `jest`; use `npm run test`.
Integration/end-to-end tests are stored in `test/`. These require the rest of the environment to be set up (e.g. the Postgres database.)