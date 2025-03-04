import { Point } from './point';

describe('Point', () => {
  describe('computeDoubles', () => {
    it('computes doubles', () => {
      let points = Point.computeDoubles([
        // Unscrambled list:
        //
        // new Point("0", false, new Date(0), "0"),
        // new Point("0", true, new Date(1), "1"),
        // new Point("0", true, new Date(2), "2"),
        // new Point("0", false, new Date(3), "3"),
        // new Point("0", false, new Date(4), "0"),
        // new Point("0", true, new Date(5), "1"),
        // new Point("0", true, new Date(6), "2"),
        //
        // new Point("1", false, new Date(3), "3"),
        // new Point("1", false, new Date(4), "0"),
        // new Point("1", true, new Date(5), "1"),
        // new Point("1", true, new Date(6), "2"),
        // new Point("1", false, new Date(7), "2"),
        // new Point("1", true, new Date(8), "2"),
        //
        // We scramble it to test that order doesn't matter.
        new Point('1', true, new Date(8), '2'),
        new Point('0', true, new Date(1), '1'),
        new Point('1', false, new Date(7), '2'),
        new Point('1', false, new Date(3), '3'),
        new Point('0', false, new Date(3), '3'),
        new Point('1', false, new Date(4), '0'),
        new Point('0', true, new Date(5), '1'),
        new Point('0', false, new Date(0), '0'),
        new Point('0', true, new Date(6), '2'),
        new Point('1', true, new Date(6), '2'),
        new Point('0', false, new Date(4), '0'),
        new Point('0', true, new Date(2), '2'),
        new Point('1', true, new Date(5), '1'),
      ]);

      expect(points).toHaveLength(13);
      expect(points).toContainEqual(new Point('0', 0, new Date(0), '0'));
      expect(points).toContainEqual(new Point('0', 1, new Date(1), '1'));
      expect(points).toContainEqual(new Point('0', 2, new Date(2), '2'));
      expect(points).toContainEqual(new Point('0', 0, new Date(3), '3'));
      expect(points).toContainEqual(new Point('0', 0, new Date(4), '0'));
      expect(points).toContainEqual(new Point('0', 1, new Date(5), '1'));
      expect(points).toContainEqual(new Point('0', 2, new Date(6), '2'));
      expect(points).toContainEqual(new Point('1', 0, new Date(3), '3'));
      expect(points).toContainEqual(new Point('1', 0, new Date(4), '0'));
      expect(points).toContainEqual(new Point('1', 1, new Date(5), '1'));
      expect(points).toContainEqual(new Point('1', 2, new Date(6), '2'));
      expect(points).toContainEqual(new Point('1', 0, new Date(7), '2'));
      expect(points).toContainEqual(new Point('1', 1, new Date(8), '2'));
    });
  });
});
