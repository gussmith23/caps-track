export const runtime = "nodejs";
// This is required to enable streaming
export const dynamic = "force-dynamic";

import { Game } from "@/lib/entity/game";
import { Channel, createResponse } from "better-sse";
import { NextRequest } from "next/server";

let channel: Channel;

// This fixes the issue of gameIdToWriter being reset on every request. I don't
// know how to do this more reasonably.
// https://github.com/vercel/next.js/discussions/48427#discussioncomment-10550280
if (process.env.NODE_ENV === "production") {
  channel = new Channel();
} else {
  // @ts-ignore
  if (!global.channel) {
    // @ts-ignore
    global.channel = new Channel();
  }
  // @ts-ignore
  channel = global.channel;
}

const loadTimestamp = new Date().toISOString();

export async function broadcastGameUpdate(game: Game) {
  channel.broadcast(game);
}

export async function GET(request: NextRequest, context: any) {
  let res = createResponse(request, (session) => {
    channel.register(session);
  });

  return res;
}
