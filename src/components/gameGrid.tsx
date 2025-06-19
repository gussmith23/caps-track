'use client';

import { useState } from "react";

// A general purpose component for rendering a caps game grid. The player
// squares are configurable.
export function GameGrid({
  player1Component,
  player2Component,
  player3Component,
  player4Component,
  startHorizontal = false,
  widthStrs = ["500px",
    "300px",],
}: {
  player1Component: React.ReactNode;
  player2Component: React.ReactNode;
  player3Component: React.ReactNode;
  player4Component: React.ReactNode;
  startHorizontal?: boolean;
  widthStrs?: [string, string];
}) {
  const playerComponents = [
    player1Component,
    player2Component,
    player3Component,
    player4Component,
  ];
  // Initial ordering starting from top left and going clockwise.
  let [playerComponentsOrdering, setPlayerComponentsOrdering] = useState([
    0, 1, 2, 3,
  ]);
  let [horizontal, setHorizontal] = useState(startHorizontal);

  let [widthStrHorizontal, widthStrVertical] = widthStrs;
  let maxWidth = horizontal ? widthStrHorizontal : widthStrVertical;

  return (
    <div className="container text-center">
      <button className="btn btn-primary mb-3" onClick={() => {
        // Rotate the player components
        let tmp = new Array(4);

        for (let i = 0; i < 4; i++) {
          // TODO(@gussmith23): magic number (should be number of components to
          // render)
          //
          // +4 is to ensure we don't go negative when subtracting 1.
          tmp[i] = playerComponentsOrdering[((i + 4) - 1) % 4];
        }


        // Force a re-render
        // This is a workaround for the fact that React doesn't
        // automatically re-render when the array reference doesn't change.
        // This is not the best practice, but it works for this simple case.
        setPlayerComponentsOrdering(tmp);
        setHorizontal(!horizontal);

      }}>rotate</button>
      <div className="container-sm" style={{ maxWidth: maxWidth }}>
        <div className="row">
          <div className="col">
            {playerComponents[playerComponentsOrdering[0]]}
          </div>
          <div className="col">
            {!horizontal ? "🍺" : ""}
          </div>
          <div className="col">
            {playerComponents[playerComponentsOrdering[1]]}
          </div>
        </div>
        <div className="row">
          <div className="col">
            {horizontal ? "🍺" : ""}
          </div>
          <div className="col">
            {horizontal ? "↔" : "↕"}
          </div>
          <div className="col">
            {horizontal ? "🍺" : ""}
          </div>
        </div>
        <div className="row">
          <div className="col">
            {playerComponents[playerComponentsOrdering[3]]}
          </div>
          <div className="col">
            {!horizontal ? "🍺" : ""}
          </div>
          <div className="col">
            {playerComponents[playerComponentsOrdering[2]]}
          </div>
        </div>
      </div>
    </div>
  );
}