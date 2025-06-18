"use client"

import { useEffect, useState, } from 'react';
import { GameGrid } from './gameGrid';
import { Player } from '@/lib/entity/player';
import { addPointToGame, getGame, getPointsForGame } from '@/app/actions';
import { Game as GameEntity, } from '@/lib/entity/game';



export default function Game({ id }: { id: string }) {
  // const [dataIgnored, setData] = useState(null);

  let [game, setGame] = useState(null);

  useEffect(() => {
    const eventSource = new EventSource(`/game/${id}/gameUpdated`);
    // const eventSource = new EventSource(`/gameUpdated`);
    eventSource.onmessage = ({ data }) => {
      console.log("Received game update via SSE");
      console.log(data);
      // setGame(JSON.parse(data));
    };
    return () => {
      eventSource.close();
    };
  }, [id]);

  const fetchGame = async () => {
    setGame(JSON.parse(await getGame(id)));
  };

  // Get game.
  // TODO(@gussmith23): useEffect is bad; should also have a cleanup function.
  useEffect(() => {
    fetchGame().catch(console.error);
  },
    // This arg is important to prevent infinite loop.
    [id]);

  function playerBox({ player }: { player: Player }) {

    return (<>
      {player ?
        <div className="component">
          {player.name
          }
          <button className="btn btn-primary btn-sm" onClick={async () => {
            await addPointToGame(id, player.id.toString());
            // This forces reload of game; trying to handle with SSE instead.
            // fetchGame().catch(console.error);
          }}>
            +
          </button>
        </div>
        : "loading..."}
    </>)

  }

  let [[team1Score, team2Score], [player1Score, player2Score, player3Score, player4Score]] = game ? getScore(game) : [[0, 0], [0, 0, 0, 0]];

  return <>
    {/* Render grid only when not isPending */}
    {game &&
      <GameGrid
        player1Component={playerBox({ player: game!.players[0] })}
        player2Component={playerBox({ player: game!.players[1] })}
        player3Component={playerBox({ player: game!.players[2] })}
        player4Component={playerBox({ player: game!.players[3] })}
      />
    }
    {game &&
      <>

        <p>Score: {team1Score} - {team2Score}</p>
        <p>Player 1 Score: {player1Score}</p>
        <p>Player 2 Score: {player2Score}</p>
        <p>Player 3 Score: {player3Score}</p>
        <p>Player 4 Score: {player4Score}</p>
      </>
    }

  </>
}

// Returns the score of the game as two arrays. The first array contains the
// scores of the teams. The second array contains the scores of the players in
// the same order as the players array. Currently intended for 2v2 games, but
// could be extended if we also track teams explicitly.
//
// Note that this is kind of weird because it's defined over objects similar to
// GameEntities, but not actually a method of GameEntity. This is because it's
// used in the client code and not in the server code. It would be nice to
// define clean deserialization and then define this as a method of GameEntity.
function getScore(game: {
  players: { id: string }[];
  points: { player: { id: string } }[];
}): [[number, number], [number, number, number, number]] {
  const team1Score = game.points.filter(point => point.player.id === game.players[0].id || point.player.id === game.players[2].id).length;
  const team2Score = game.points.filter(point => point.player.id === game.players[1].id || point.player.id === game.players[3].id).length;

  const playerScores = game.players.map(player => {
    return game.points.filter(point => point.player.id === player.id).length;
  });

  if (game.players.length !== 4) {
    console.warn("Game.getScore: Expected 4 players, but found", game.players.length);
  }
  return [[team1Score, team2Score], [playerScores[0], playerScores[1], playerScores[2], playerScores[3]]];

}