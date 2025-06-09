
export default function Home() {
  return (
    <div className="container">
      <h2>New Game</h2>
      <div className="container text-center">
        <form action="/newGame" method="post">
          <script type="text/javascript">
            {/* function updateGamePreview() {
              $("#gamePreview").text(
                $("#player2 option:selected").text() + " and " +
                $("#player4 option:selected").text() + " vs. " +
                $("#player3 option:selected").text() + " and " +
                $("#player1 option:selected").text()
              ); */}
          </script>
          <div className="row">
            <div className="col d-none d-sm-block">
            </div>
            <div className="col">
              <select value={"player"} name="player2" id="player2">
                <option value="player" disabled>Player</option>
                {/* {{ #each playersMap }}
                {{ #with(lookup this 1) }}
                <option value="{{this.id}}">{{ this.name }}</option>
                {{/with}}
                {{/ each}} */}
              </select>
            </div>
            <div className="col">
            </div>
            <div className="col">
              <select defaultValue={"player"} name="player3" id="player3">
                <option value="player" disabled>Player</option>
                {/* {{ #each playersMap }}
                {{ #with(lookup this 1) }}
                <option value="{{this.id}}">{{ this.name }}</option>
                {{/with}}
                {{/ each}} */}
              </select>
            </div>
            <div className="col d-none d-sm-block">
            </div>
          </div>
          <div className="row">
            <div className="col d-none d-sm-block">
            </div>
            <div className="col fs-1">
              🍺
            </div>
            <div className="col fs-1">
              ↔
            </div>
            <div className="col fs-1">
              🍺
            </div>
            <div className="col d-none d-sm-block">
            </div>
          </div>
          <div className="row">
            <div className="col d-none d-sm-block">
            </div>
            <div className="col">
              <select defaultValue={"player"} name="player1" id="player1">
                <option value="player" disabled>Player</option>
                {/* {{ #each playersMap }}
                {{ #with(lookup this 1) }}
                <option value="{{this.id}}">{{ this.name }}</option>
                {{/with}}
                {{/ each}} */}
              </select>
            </div>
            <div className="col">
            </div>
            <div className="col">
              <select defaultValue={"player"} name="player4" id="player4">
                <option value="player" disabled>Player</option>
                {/* {{ #each playersMap }}
                {{ #with(lookup this 1) }}
                <option value="{{this.id}}">{{ this.name }}</option>
                {{/with}}
                {{/ each}} */}
              </select>
            </div>
            <div className="col d-none d-sm-block">
            </div>
          </div>
          <div className="row">
            <p id="gamePreview" className="text-center">
              Player and Player vs. Player and Player
            </p>
          </div>
          <div className="row">
            <div className="col">
              <button type="submit">New Game</button>
            </div>
          </div>
        </form>
      </div>

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
