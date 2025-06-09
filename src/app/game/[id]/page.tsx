'use server'
// A nextjs page for a game at the given id, which accesses the database to
// retrieve the game and player information, and renders the game view.
import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { DataSource } from 'typeorm';
import { Player } from '../../../lib/entity/player';
import config from '../../../lib/config';
import { addPoint } from '@/lib/addPoint';
import { Game as GameEntity } from '@/lib/entity/game';
import GameComponent from '@/app/game';
import { AppDataSource } from '@/lib/db';


export default async function Page({ params }:
  {
    params: Promise<{ id: string }>
  },
) {

  const id = (await params).id;

  // Get the game from the database
  const game = await AppDataSource.manager.findOneOrFail(GameEntity, { where: { id } });

  return <GameComponent id={id} />

  //   {
  //     {
  //       !--
  //         Inputs
  //         - game
  //         - itemsMap
  //         - fontsMap
  //       --}
  //   }
  //   { { !--Crazy hack for inserting handlebars vars into javascript in the page-- } }
  //   <scri{{!}} pt >
  //   const gameId = "{{game.id}}";
  // </scri{ { !} } pt >
  // <script>
  //   const eventSource = new EventSource(`/game/${gameId}/gameUpdated`);
  //   eventSource.onmessage = ({ data }) => {
  //     window.location.reload();
  //   };

  //   const TIMEOUT = 3000; // ms
  //   // scoreEvent receives an event {playerId, type, datetime} and eventually posts
  //     // it to the server. After receiving an event, waits TIMEOUT ms before posting
  //     // it to the server. If another event is received before TIMEOUT ms, it is added
  //     // to the queue and the timer is reset.
  //     function scoreEvent(event, elementId) {

  //     // Validate the event object
  //     if (typeof event !== "object" || event === null) {
  //       console.error("event must be an object");
  //     return;
  //     }
  //     if (!("gameId" in event, "gameId is required")) {
  //       console.error("gameId is required");
  //     return;
  //     }
  //     if (typeof event.gameId !== "string") {
  //       console.error("gameId must be a string");
  //     return;
  //     }
  //     if (!("playerId" in event, "playerId is required")) {
  //       console.error("playerId is required");
  //     return;
  //     }
  //     if (typeof event.playerId !== "string") {
  //       console.error("playerId must be a string");
  //     return;
  //     }
  //     if (!("datetime" in event, "datetime is required")) {
  //       console.error("datetime is required");
  //     return;
  //     }
  //     if (typeof event.datetime !== "object" || !(event.datetime instanceof Date)) {
  //       console.error("datetime must be a Date object");
  //     return;
  //     }

  //     if (!("playerId" in event, "playerId is required")) {
  //       console.error("playerId is required");
  //     return;
  //     }
  //     if (!("gameId" in event, "playerId is required")) {
  //       console.error("playerId is required");
  //     return;
  //     }
  //     if (!("event" in event, "event is required")) {
  //       console.error("playerId is required");
  //     return;
  //     }
  //     if (!(event.event === "add" || event.event === "remove" || event.event === "double")) {
  //       console.error("event must be 'add', 'remove', or 'double'");
  //     return;
  //     }
  //     if (!("datetime" in event, "datetime is required")) {
  //       console.error("playerId is required");
  //     return;
  //     }

  //     // Immediately log the event locally
  //     const element = document.getElementById(elementId);
  //     if (event.event === "remove") {
  //       element.innerText = Math.max(0, parseInt(element.innerText) - 1);
  //     } else if (event.event === "add" || event.event === "double") {
  //       element.innerText = Math.max(0, parseInt(element.innerText) + 1);
  //     } else {
  //       console.error("event must be 'add', 'remove', or 'double'");
  //     }

  //     // Add event to the queue, reset the timeout. On timeout, post events to the server.
  //     if (window["scoreEventQueue"] === undefined) {
  //       window["scoreEventQueue"] = [];
  //     }
  //     window["scoreEventQueue"].push(event);
  //     if (window["scoreEventTimeout"] !== undefined) {
  //       clearTimeout(window["scoreEventTimeout"]);
  //     }
  //     window["scoreEventTimeout"] = setTimeout(() => {
  //       const events = window["scoreEventQueue"];
  //     window["scoreEventQueue"] = [];
  //     fetch(`/game/${gameId}/addEvents`, {
  //       method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //         },
  //     body: JSON.stringify(events),
  //       });
  //     }, TIMEOUT);
  //   }
  //   </script>
  //   <div class="modal" id="editNameModal">
  //     <div class="modal-dialog">
  //       <div class="modal-content">
  //         <div class="modal-header">
  //           <h1 class="modal-title fs-5" id="exampleModalLabel">Rename game</h1>
  //           <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
  //         </div>
  //         <div class="modal-body">
  //           <form action="/game/{{game.id}}/renameGame" method="post">
  //             <div class="mb-3">
  //               <input type="text" class="form-control" id="gameName" name="gameName">
  //                 <button type="submit" class="btn btn-primary mt-2">Save</button>
  //             </div>
  //           </form>
  //         </div>
  //       </div>
  //     </div>
  //   </div>

  //   <div class="container">
  //     <h1>
  //       {{> gameName game=game itemsMap=itemsMap fontsMap=fontsMap}}
  //       <button type="button" class="btn btn-light btn-sm ms-3" data-bs-toggle="modal"
  //         data-bs-target="#editNameModal">✎</button>
  //     </h1>
  //     <p>began: {{ game.beganAt }}</p>
  //     {{ #if game.endedAt }}
  //     <p>ended: {{ game.endedAt }}</p>
  //     {{/if}}
  //     <p>score: {{ team1Score }} - {{ team2Score }}</p>

  //     <div class="d-flex justify-content-center">
  //       {{> playerBox player=player2 points=player2Score game=game fontsMap=fontsMap itemsMap=itemsMap}}
  //       <div class="col d-none d-sm-block" style="max-width: 8em;">
  //         <!--padding for breakpoints larger than sm-->
  //       </div>
  //       <div class="col" style="max-width: 2em;">
  //         <!--padding that always exists-->
  //       </div>
  //       {{> playerBox player=player3 points=player3Score game=game fontsMap=fontsMap itemsMap=itemsMap}}
  //     </div>
  //     <div class="d-flex justify-content-center">
  //       <div class="fs-1">
  //         🍺
  //       </div>
  //       <div class="col d-none d-sm-block" style="max-width: 8em;">
  //         <!--padding for breakpoints larger than sm-->
  //       </div>
  //       <div class="fs-1">
  //         ↔
  //       </div>
  //       <div class="col d-none d-sm-block" style="max-width: 8em;">
  //         <!--padding for breakpoints larger than sm-->
  //       </div>
  //       <div class="fs-1">
  //         🍺
  //       </div>
  //     </div>
  //     <div class="d-flex justify-content-center">
  //       {{> playerBox player=player1 points=player1Score game=game fontsMap=fontsMap itemsMap=itemsMap}}
  //       <div class="col d-none d-sm-block" style="max-width: 8em;">
  //         <!--padding for breakpoints larger than sm-->
  //       </div>
  //       <div class="col" style="max-width: 2em;">
  //         <!--padding that always exists-->
  //       </div>
  //       {{> playerBox player=player4 points=player4Score game=game fontsMap=fontsMap itemsMap=itemsMap}}
  //     </div>

  //     {{ #unless game.endedAt }}
  //     <form class="mt-3 float-end" action="/game/{{game.id}}/endGame" method="post">
  //       <button type="submit">end game</button>
  //     </form>
  //     {{/ unless}}

  //   </div>
}