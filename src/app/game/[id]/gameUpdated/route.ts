export const runtime = 'nodejs';
// This is required to enable streaming
export const dynamic = 'force-dynamic';

//TODO I think what's happening here is that this file is getting reloaded or
// something. All the debugging I'm doing is pointing to the fact that e.g.
// `writers` is getting reset. For a more explicit experiment see the timestamp
// logging. The timestamp shouldn't change.
import { gameIdToWriter } from "@/lib/writersTest";
import { Game } from "@/lib/entity/game";
// import { createChannel, createResponse, createSession, Session } from "better-sse";
import { NextRequest } from "next/server";



const loadTimestamp = new Date().toISOString();

export function sendData(cmpID: string, data: any) {
  const encoder = new TextEncoder();
  const writer = gameIdToWriter[cmpID];
  console.log("writers:", gameIdToWriter);
  console.log("writers@9:", gameIdToWriter['9']);
  console.log("writers@arg:", gameIdToWriter[cmpID]);
  console.log("loadTimestamp:", loadTimestamp);

  if (!writer) {
    console.error('Writer is not initialized for client:', cmpID);
    return;
  }

  const formattedData = `data: ${JSON.stringify(data)}\n\n`;
  writer.write(encoder.encode(formattedData));
}


// export async function _GET(request: NextRequest) {
//   await request.json();
//   let res = createResponse(request, (session: Session) => {
//     session.push("connected", "connected");
//     session.once("disconnected", () => {
//       let err = new Error("Session closed");
//       console.log(err.stack);
//       throw err;
//     });
//     channel.register(session);
//   });


//   // TODO(@gussmith23): The response should be being kept alive, but it's not.
//   // See the stack trace generated above.
//   console.log(res);

//   return res;
// }

export async function broadcastGameUpdate(game: Game) {
  console.log("Broadcasting game update");
  sendData(game.id.toString(), game);
}

export async function GET(request: NextRequest, context: any) {
  console.log(gameIdToWriter);
  const params = await context.params;
  const cmpID = params.id;

  let responseStream = new TransformStream();
  console.log("creating writer for cmpID", cmpID);
  gameIdToWriter[cmpID] = responseStream.writable.getWriter();

  sendData(cmpID, { progress: '0%' }); // <-- this works



  // try {
  //   // @ts-ignore
  //   openaiRes.data.on('data', async (data: Buffer) => {
  //     const lines = data
  //       .toString()
  //       .split('\n')
  //       .filter((line: string) => line.trim() !== '');
  //     for (const line of lines) {
  //       const message = line.replace(/^data: /, '');
  //       if (message === '[DONE]') {
  //         console.log('Stream completed');
  //         writer.close();
  //         return;
  //       }
  //       try {
  //         const parsed = JSON.parse(message);
  //         await writer.write(encoder.encode(`${parsed.choices[0].text}`));
  //       } catch (error) {
  //         console.error('Could not JSON parse stream message', message, error);
  //       }
  //     }
  //   });
  // } catch (error) {
  //   console.error('An error occurred during OpenAI request', error);
  //   writer.write(encoder.encode('An error occurred during OpenAI request'));
  //   writer.close();
  // }

  return new Response(responseStream.readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}