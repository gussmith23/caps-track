CREATE TABLE game (
    id SERIAL PRIMARY KEY,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended BOOLEAN NOT NULL DEFAULT FALSE,
    ended_at TIMESTAMP WITH TIME ZONE,
    name VARCHAR(255)
);

CREATE TABLE item (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    icon VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    location VARCHAR(255) NOT NULL
);

CREATE TABLE font (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    size VARCHAR(255) 
);

CREATE TABLE player (
    id SERIAL PRIMARY KEY,
    display_name VARCHAR(255) NOT NULL,
    name_color VARCHAR(255),
    font_id INTEGER REFERENCES font(id) ON DELETE SET NULL,
    font_weight VARCHAR(255)
);

CREATE TABLE player_item (
    player_id SERIAL NOT NULL REFERENCES player(id) ON DELETE CASCADE,
    item_id SERIAL NOT NULL REFERENCES item(id) ON DELETE CASCADE,
    equipped BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (player_id, item_id)
);

CREATE TABLE player_game (
    player_id SERIAL NOT NULL REFERENCES player(id) ON DELETE CASCADE,
    game_id SERIAL NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    player_idx INTEGER NOT NULL,
    PRIMARY KEY (player_id, game_id)
);

CREATE TABLE point (
    game INTEGER NOT NULL REFERENCES game(id) ON DELETE CASCADE,
    player INTEGER NOT NULL REFERENCES player(id) ON DELETE CASCADE,
    double BOOLEAN NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (game, player, timestamp, double)
);

CREATE TABLE phrase (
    phrase TEXT NOT NULL
);
