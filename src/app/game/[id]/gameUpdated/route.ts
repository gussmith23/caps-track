export const runtime = "nodejs";
// This is required to enable streaming
export const dynamic = "force-dynamic";

import { GameObject } from "@/lib/entity/game";
import { Channel, createResponse } from "better-sse";
import { NextRequest } from "next/server";

let channel: Channel;

// This fixes the issue of gameIdToWriter being reset on every request. I don't
// know how to do this more reasonably.
// https://github.com/vercel/next.js/discussions/48427#discussioncomment-10550280
if (process.env.NODE_ENV === "production") {
  channel = new Channel();
} else {
  // @ts-expect-error Using a hack to persist channel.
  if (!global.channel) {
    // @ts-expect-error Using a hack to persist channel.
    global.channel = new Channel();
  }
  // @ts-expect-error Using a hack to persist channel.
  channel = global.channel;
}

export async function broadcastGameUpdate(game: GameObject) {
  channel.broadcast(game);
}

export async function GET(request: NextRequest) {
  const res = createResponse(request, (session) => {
    channel.register(session);
  });

  return res;
}
