import { GoogleGenAI } from '@google/genai';
const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
async function test() {
    try {
        const response = await client.models.list();
        const models = [];
        for await (const m of response) { if(m.name.includes('embed')) models.push(m.name); }
        console.log("Embed models: ", models);
    } catch (e) { console.log(e.message); }
}
test();
