import { AppDataSource } from "@/lib/db";
import { NewGame } from "./newGame";
import { Player } from "@/lib/entity/player";




export default async function Home() {
  const players = await AppDataSource.manager.find(Player);
  return (
    <div className="container">
      <NewGame players={players.map(v => { return { id: v.id.toString(), name: v.name } })} />

      {/* {{ #if activeGameIds.length }}
      <h2>Active Games</h2>
      <ul>
        {{ #each activeGameIds }}
        {{ #with(mapLookup ../ gamesMap this)}}
        <li>
          <a href="/game/{{this.id}}">{{> gameName game=this
            player1=(mapLookup ../../playersMap this.player1id)
            player2=(mapLookup ../../playersMap this.player2id)
            player3=(mapLookup ../../playersMap this.player3id)
            player4=(mapLookup ../../playersMap this.player4id)
            displayDate=false
            itemsMap=../../itemsMap
            fontsMap=../../fontsMap
        }}</a>
        </li>
        {{/with}}
        {{/ each}}
      </ul>
      {{/if}}

      {{ #if concludedGameIds.length }}
      <h2>Concluded Games</h2>
      <ul>
        {{ #each concludedGameIds }}
        {{ #with(mapLookup ../ gamesMap this)}}
        <li>
          <a href="/game/{{this.id}}">{{> gameName game=this
            player1=(mapLookup ../../playersMap this.player1id)
            player2=(mapLookup ../../playersMap this.player2id)
            player3=(mapLookup ../../playersMap this.player3id)
            player4=(mapLookup ../../playersMap this.player4id)
            displayDate=true
            itemsMap=../../itemsMap
            fontsMap=../../fontsMap
        }}</a>
        </li>
        {{/with}}
        {{/ each}}
      </ul>
      {{/if}} */}
    </div>
  );
}
