# RPG Virtual Tabletop (VTT)

A real-time Virtual Tabletop (VTT) application designed for tabletop RPG sessions. This project allows Game Masters to manage maps and grids while players interact with tokens in real-time, leveraging WebSockets for instant synchronization.

## Tech Stack

The project follows a **Monorepo** architecture, separating concerns between the client-side interface and the server-side logic.

### Frontend (Client)
* **React + Vite:** Utilized for a modern, fast, and modular UI development experience.
* **Konva.js + React-Konva:** A high-performance 2D Canvas library. Selected to handle complex rendering of the grid, map layers, and tokens efficiently (superior to standard DOM manipulation).
* **CSS Flexbox:** Ensures a responsive, application-like layout (Sidebar, Full-screen Map, Floating Menus).

### Backend (Server)
* **Node.js + Express:** Handles API routing and serves static assets (production build).
* **Socket.io:** Powers the bidirectional event-based communication. This ensures that game state changes (e.g., token movement) are propagated to all connected clients with low latency.

---
# Development Mode

Use this mode for active development. It enables Hot Module Replacement (HMR) for React. You will need two terminal instances.

Terminal 1 (Backend) (Runs on port 3001):
cd server
npx nodemon index.js

Terminal 2 (Frontend):
cd client
npm run dev

# Production & Remote Access (ngrok)
Use this workflow to simulate a production environment and allow external access (e.g., for playtesting with friends).

Step A: Build the Frontend Compile the React application into static files:
cd client
npm run build

**Step B: Start the Server**
cd server
npx nodemon index.js

**Expose to the Internet With the server running, open a new terminal and initialize ngrok:**
ngrok http 3001

# Deploy (Railway)

The repo root has a `package.json` (build/start scripts) and `railway.json`
so Railway's Nixpacks builder can run this monorepo as a single service —
Express already serves the built client and the API from the same process.

1. New Railway project from this GitHub repo.
2. Set env vars on the service (see `server/.env.example`): `JWT_SECRET`
   and `DATABASE_URL` (a Postgres connection string, e.g. Supabase's
   Session pooler URI). `PORT` is injected by Railway automatically.
3. Deploy. Railway runs `npm run build` then `npm start` from the root.

Known gap: uploaded images (`server/uploads/`) still live on local disk,
so they don't survive a redeploy yet.

# installing
**server file**
npm init -y
npm install express socket.io cors
npm install --save-dev nodemon
npm install uuid

**client file**
npm create vite@latest client -- --template react
npm install 
npm install konva react-konva use-image socket.io-client