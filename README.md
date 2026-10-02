# Yogya prototype

## Run locally
1. Install Node.js LTS.
2. In this folder, run `npm.cmd install` (PowerShell on Windows).
3. Copy `.env.example` to `.env.local` and add your Gemini API key as `GEMINI_API_KEY`.
4. Run `npm.cmd run dev` and open http://localhost:3000.

## Ministry map
The Ministry Dashboard uses Leaflet loaded from its public CDN and OpenStreetMap tiles. It does not require a Google Maps API key or Google verification. The map supports pan/zoom, clickable institution and industry markers, highlighted clickable demo regions, and street/satellite/terrain layer switching. Satellite tiles are provided by Esri and map attribution is shown by Leaflet.

The institution statistics and highlighted region boundaries are illustrative prototype data, not official GIS boundaries or a live institutional data feed. Public tile providers have usage policies and availability limits; use a commercial or self-hosted tile service if the app grows substantially.

## Sarthi AI
Keep `.env.local` private. Never commit or share API keys.
