import { getFromBin, pasteToBin } from "../src/utils";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  const binId = params.get("id");
  if(!binId) return new Response("No bin id provided", { status: 400 });

  const [data, error] = await getFromBin(binId);
  if(error) return new Response("Failed to fetch data " + error.message, { status: 500 });
  return new Response(data);
}


export async function POST(request: Request) {
    const data = await request.text();
    if(!data) return new Response("No data found", { status: 400 });

    const [binUrl, error] = await pasteToBin(data)
    if(error) return new Response("Failed to store data " + error.message, { status: 500 });
    const slug = new URL(binUrl).pathname.slice(1);
    return new Response(slug);
}

export const config = {
  runtime: "edge",
};
