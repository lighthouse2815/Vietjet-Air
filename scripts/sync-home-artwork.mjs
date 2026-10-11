import { readFile, mkdir, writeFile } from "node:fs/promises";

const directory = new URL("../frontend/public/assets/reference/", import.meta.url);
const sources = JSON.parse(await readFile(new URL("sources.json", directory), "utf8"));
await mkdir(directory, { recursive: true });
for (let start = 0; start < sources.length; start += 4) {
  await Promise.all(sources.slice(start, start + 4).map(async ({ file, url }) => {
    const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
    await writeFile(new URL(file, directory), Buffer.from(await response.arrayBuffer()));
    console.log(file);
  }));
}
