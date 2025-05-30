import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
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

  let body: {
    label: string;
    message: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ message: "Invalid JSON body" }), {
      status: 400,
    });
  }

  if (!body.label)
    return new Response(
      JSON.stringify({ message: "Please give your trigger a label" }),
      {
        status: 400,
      }
    );

  if (!body.message)
    return new Response(
      JSON.stringify({ message: "A trigger message is required" }),
      {
        status: 400,
      }
    );

  if (body.label.length > 80 || body.label.length < 1)
    return new Response(
      JSON.stringify({ message: "Label must be 1-80 characters" }),
      {
        status: 400,
      }
    );

  try {
    const response = await fetch(`${API_URL}/create/ticket/save?id=${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
