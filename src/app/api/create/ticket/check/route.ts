import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ message: "Missing ID" }), {
      status: 400,
    });
  }

  const API_URL = process.env.API_URL;
  const API_TOKEN = process.env.API_TOKEN;

  if (!API_URL || !API_TOKEN) {
    return new Response(JSON.stringify({ message: "Missing env variables" }), {
      status: 500,
    });
  }

  try {
    const response = await fetch(`${API_URL}/create/ticket/check?id=${id}`, {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    });

    const json = await response.json();

    return new Response(JSON.stringify(json), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ message: "Failed to fetch API", error }),
      { status: 500 }
    );
  }
}
