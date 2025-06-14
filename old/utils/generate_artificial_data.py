"""Script for generating artificial games of caps for testing purposes.

Use this script to generate CSV files which can then be imported into the Google
Sheet."""

import datetime
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd


def choose_players(
    players: List[Tuple[str, float]], number_of_players: int = 4
) -> List[Tuple[str, float]]:
    inds = np.random.choice(len(players), number_of_players, replace=False)
    return [players[ind] for ind in inds]


def simulate_games(
    starting_id: int,
    players: List[Tuple[str, float]],
    number_of_games: int,
    time_between_shots_distribution: Tuple[float, float],
    time_between_games_distribution: Tuple[float, float],
):
    """ """

    time = datetime.datetime.now()
    games_df = pd.DataFrame()
    events_df = pd.DataFrame()

    for game_id in range(starting_id, starting_id + number_of_games):
        players = choose_players(players)
        (this_game_df, this_events_df) = simulate_game(
            game_id=game_id,
            players=players,
            time_between_shots_distribution=time_between_shots_distribution,
        )

        games_df = pd.concat([games_df, this_game_df])
        events_df = pd.concat([events_df, this_events_df])

        time += datetime.timedelta(
            seconds=np.random.normal(
                loc=time_between_games_distribution[0],
                scale=time_between_games_distribution[1],
            )
        )

    return games_df, events_df


def simulate_game(
    game_id: int,
    players: List[Tuple[str, float]],
    time_between_shots_distribution: Tuple[float, float],
):
    """
    Simulate a single game with the given players and distributions.

    Args:
        players: List of player IDs. Order is [player1, player2, player3,
          player4]. Teams are player1 and player3, player2 and player4.
        time_between_shots_distribution: Tuple of mean and standard deviation of
          the time between shots distribution.

    Returns:
        A tuple with two elements:
        - A dataframe with a single row, representing the entry to the game sheet.
        - A dataframe with the shots made in the game, to be added to the points sheet.
    """

    # Simulate the game
    game = []
    time = datetime.datetime.now()
    beganAt = time

    current_player_idx = 0

    def _increment_curent_player_idx():
        nonlocal current_player_idx
        current_player_idx = (current_player_idx + 1) % len(players)

    # Tracks whether we're a double/triple/etc.
    previous_player_made_cap = False

    def _calculate_score():
        # Calculate the score of the game
        team1_score = 0
        team2_score = 0
        for d in game:
            player = d["playerId"]
            if player == players[0][0] or player == players[2][0]:
                team1_score += 1
            elif player == players[1][0] or player == players[3][0]:
                team2_score += 1
            else:
                raise ValueError(f"Player {player} not in game.")

        return (team1_score, team2_score)

    while True:
        # Determine the time of the next shot
        time += datetime.timedelta(
            seconds=np.random.normal(
                loc=time_between_shots_distribution[0],
                scale=time_between_shots_distribution[1],
            )
        )

        player_id, binomial_param = players[current_player_idx]

        player_made_cap = bool(np.random.binomial(1, binomial_param))

        if player_made_cap:
            # Add the point to the game
            double = previous_player_made_cap
            game.append(
                {
                    "gameId": game_id,
                    "datetime": time,
                    "playerId": player_id,
                    "double": double,
                }
            )

            # Update scores
            team1_score, team2_score = _calculate_score()

            # Check if the game is over: can't win on a double; win at 11; win
            # by two.
            if not previous_player_made_cap and (
                (team1_score >= 11 and (team1_score - team2_score >= 2))
                or (team2_score >= 11 and (team2_score - team1_score >= 2))
            ):
                break

            previous_player_made_cap = True
        else:
            previous_player_made_cap = False

        # Increment the current player index
        _increment_curent_player_idx()

    return (
        pd.DataFrame.from_records(
            [
                {
                    "id": game_id,
                    "beganAt": beganAt,
                    "player1": players[0][0],
                    "player2": players[1][0],
                    "player3": players[2][0],
                    "player4": players[3][0],
                    "endedAt": time,
                }
            ]
        ),
        pd.DataFrame.from_records(game),
    )


def narrate_game(game, players):
    team1_score = 0
    team2_score = 0
    print(
        f"Teams: {players[0][0]} and {players[2][0]} vs {players[1][0]} and {players[3][0]}"
    )
    for i, row in game.iterrows():

        if row["playerId"] == players[0][0] or row["playerId"] == players[2][0]:
            team1_score += 1
        elif row["playerId"] == players[1][0] or row["playerId"] == players[3][0]:
            team2_score += 1
        print(
            f"{row['datetime']} - {row['playerId']} {'double' if row['double'] else ''}"
        )
        print(f"{team1_score} to {team2_score}")


if __name__ == "__main__":
    # Arg: player. Can be specified multiple times. Expected format is
    # 'player_id=lambda', where lambda is a float representing the parameter to
    # the Poisson distribution.
    #
    # Arg: number_of_games. Number of games to generate.
    #
    # Arg: games_output_file. File to write the generated game data to.
    #
    # Arg: time_between_shots_distribution. Of the format '<mean>,<stddev>'
    # where both numbers are floats.
    #
    # Arg: time_between_games_distribution. Of the format '<mean>,<stddev>'
    # where both numbers are floats.

    import argparse

    # Parse arguments
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--player",
        action="append",
        type=str,
        help="Player to use for random generation. Should be specified at least 4 times. Of the form <player_id: int or string>=<probability: float>, where probability is the chance the player makes a shot.",
    )
    parser.add_argument("--number_of_games", type=int, default=1)
    parser.add_argument("--games_output_file", type=str, required=True)
    parser.add_argument("--points_output_file", type=str, required=True)
    parser.add_argument(
        "--time_between_shots_distribution",
        type=str,
        required=True,
        help="Mean and standard deviation of the normal distribution representing the number of seconds between shots. Of the form <mean>,<stddev> where both numbers are floats.",
    )
    parser.add_argument(
        "--time_between_games_distribution",
        type=str,
        required=True,
        help="Mean and standard deviation of the normal distribution representing the number of seconds between games. Of the form <mean>,<stddev> where both numbers are floats.",
    )
    parser.add_argument(
        "--starting_game_id",
        type=int,
        default=0,
        help="Id to use for first generated game. Each subsequent game will increment the id.",
    )
    args = parser.parse_args()

    # Parse player arguments
    players = []
    for player in args.player:
        player_id, binomial_parameter_str = player.split("=")
        players.append((player_id, float(binomial_parameter_str)))

    assert len(players) >= 4, "At least 4 players must be specified."

    # Parse distributions
    time_between_shots_distribution = tuple(
        map(float, args.time_between_shots_distribution.split(","))
    )
    time_between_games_distribution = tuple(
        map(float, args.time_between_games_distribution.split(","))
    )

    games_df, events_df = simulate_games(
        starting_id=args.starting_game_id,
        players=players,
        number_of_games=args.number_of_games,
        time_between_shots_distribution=time_between_shots_distribution,
        time_between_games_distribution=time_between_games_distribution,
    )

    # Write the game data to the output file
    with open(args.games_output_file, "w") as f:
        # Columns needs to be updated if we rearrange the columns in the Google Sheet.
        games_df.to_csv(
            f,
            index=False,
            columns=[
                "id",
                "beganAt",
                "player1",
                "player2",
                "player3",
                "player4",
                "endedAt",
            ],
        )
    with open(args.points_output_file, "w") as f:
        # Columns needs to be updated if we rearrange the columns in the Google Sheet.
        events_df.to_csv(
            f, index=False, columns=["gameId", "double", "datetime", "playerId"]
        )
