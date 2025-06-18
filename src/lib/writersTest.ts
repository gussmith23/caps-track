
export let gameIdToWriter: Record<string, WritableStreamDefaultWriter>;

// This fixes the issue of gameIdToWriter being reset on every request. I don't
// know how to do this more reasonably.
// https://github.com/vercel/next.js/discussions/48427#discussioncomment-10550280
if (process.env.NODE_ENV === "production") {
  gameIdToWriter = {};
} else {
  if (!(global).gameIdToWriter) {
    global.gameIdToWriter = [];
  }
  gameIdToWriter = global.gameIdToWriter;
}