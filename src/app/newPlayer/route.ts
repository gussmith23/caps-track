import { AppDataSource } from "@/lib/db";
import { PlayerEntity } from "@/lib/entity/player";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Add a new player to the database.
  const body = await request.formData();
  if (!body.has("name")) {
    return new Response("Missing 'name' field", {
      status: 400,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
  const player = {
    name: body.get("name")?.toString() || "Player",
  };

  const result = await AppDataSource.manager.create(PlayerEntity, player);
  await AppDataSource.manager.save(result);

  // Return the new player as JSON.
  // Redirect back to where the request came from.
  return NextResponse.redirect(request.headers.get("referer") || "/");
}
