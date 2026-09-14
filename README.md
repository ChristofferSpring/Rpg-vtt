# RPG Virtual Tabletop

Virtual tabletop for RPG sessions. Move tokens, roll dice, draw on the map, chat — synced live between everyone at the table.

Live: https://rpg-vtt-production.up.railway.app

## Stack

- Client: React + Vite, Konva for the canvas (grid, tokens, drawing).
- Server: Node + Express, Socket.io for the real-time sync.
- Database: Postgres. Falls back to a local SQLite file if `DATABASE_URL` isn't set, so local dev needs no database setup.

## Running it locally

Needs two terminals.

Backend (port 3001):
```
cd server
npm install
npx nodemon index.js
```

Frontend:
```
cd client
npm install
npm run dev
```

Copy `server/.env.example` to `server/.env` and set `JWT_SECRET` to any random string. Leave `DATABASE_URL` empty to use SQLite.

## Features

- Real-time map: move tokens, see everyone else's moves live, presence panel showing who's online.
- Tokens can carry a custom image instead of a plain color circle.
- Dice roller, results post to chat.
- Ruler for measuring distance on the grid.
- Pencil and eraser for drawing on the map — the eraser removes a whole stroke at once, not pixel by pixel.
- Chat, saved per game.
- Tokens snap to the grid when moved.

## Deploying

Runs on Railway, database on Supabase (Postgres). The root `package.json` and `railway.json` tell Railway how to build and start it: `npm run build` builds the client, `npm start` runs the server, which also serves the built client — same origin, no separate frontend host needed.

To deploy your own copy: new Railway project pointed at this repo, then set `JWT_SECRET` and `DATABASE_URL` as service variables (a Postgres connection string — Supabase's free tier works fine). `PORT` is set by Railway automatically, don't add it yourself.

Known limitation: uploaded images (map backgrounds, token pictures) are saved to local disk on the server, so they don't survive a redeploy yet.
