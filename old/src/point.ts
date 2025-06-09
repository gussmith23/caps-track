export class Point {
  // If double is a boolean, it simply indicates whether the point was a
  // double/triple/quad or not. If double is a number, it indicates the type of
  // double. 0 = single, 1 = double, 2 = triple, 3 = quad, etc.
  public double: boolean | number;

  // Accepts double as a boolean, number, or string, and parses it into the
  // correct value.
  constructor(
    public gameId: string,
    double: string | boolean | number,
    public datetime: Date,
    public playerId: string,
  ) {
    if (typeof double === 'boolean') {
      this.double = double;
    } else if (typeof double === 'number') {
      this.double = double;
    } else if (typeof double === 'string') {
      if (double === 'TRUE') {
        this.double = true;
      } else if (double === 'FALSE') {
        this.double = false;
      } else {
        throw new Error(`Invalid value for double: ${double}`);
      }
    } else {
      throw new Error(`Invalid value for double: ${double}`);
    }

    this.datetime = new Date(datetime);
  }

  // Process point rows to compute doubles/triples/etc. Converts the `double`
  // field of each Point from a boolean into a number.
  public static computeDoubles(points: Point[]): Point[] {
    // First check that all of the points currently have booleans in their
    // double field, otherwise this doesn't make sense.
    points.forEach((p) => {
      if (typeof p.double !== 'boolean') {
        throw Error('Expected boolean in the double field');
      }
    });

    // Sort the points by datetime.
    points.sort((a, b) => a.datetime.getTime() - b.datetime.getTime());

    // per game id, tracks the current streak of doubles/triples/etc.
    let streakTracker = new Map();

    // If `map` order isn't guaranteed, this might be buggy.
    return points.map((p) => {
      let gameId = p.gameId;
      let double = p.double;

      if (!streakTracker.has(gameId)) {
        streakTracker.set(gameId, 0);
      }

      if (!double) {
        streakTracker.set(gameId, 0);
      } else {
        // Otherwise increment the streak tracker
        streakTracker.set(gameId, streakTracker.get(gameId) + 1);
      }

      return new Point(
        gameId,
        streakTracker.get(gameId),
        p.datetime,
        p.playerId,
      );
    });
  }
}
