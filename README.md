# Harmonia – The Royal Social Music Experience
Harmonia is a premium, real-time social music listening application. It allows users to create exclusive, private listening rooms accessible via a unique 4-digit code. Inside these rooms, participants can collaboratively build a music queue, vote on upcoming tracks, and engage in a real-time chat. The application features user profiles with customizable avatars and display names. The entire experience is wrapped in an elegant, 90s-inspired "Retro Royal" user interface, emphasizing a sense of luxury and community.
## ✨ Key Features
-   **Private Listening Rooms**: Create or join exclusive rooms with a 4-digit code.
-   **Collaborative Queue**: Add, up-vote, and down-vote songs together.
-   **Real-Time Chat**: Engage with other listeners in a live chat panel.
-   **Music Search**: Find tracks from a vast library (simulated).
-   **User Profiles**: Customize your identity with a display name and avatar.
-   **Now Playing**: View the current song's details and control playback.
-   **Retro Royal UI**: An elegant, 90s-inspired design for a unique experience.
## 🛠️ Technology Stack
-   **Frontend**: React, Vite, React Router
-   **Backend**: Cloudflare Workers, Hono
-   **State Management**: Zustand (Client), Cloudflare Durable Objects (Server)
-   **Styling**: Tailwind CSS, shadcn/ui
-   **Animation**: Framer Motion
-   **Language**: TypeScript
## 🚀 Getting Started
Follow these instructions to get the project up and running on your local machine for development and testing purposes.
### Prerequisites
-   [Node.js](https://nodejs.org/) (v18 or later)
-   [Bun](https://bun.sh/)
-   [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
### Installation
1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/harmonia.git
    cd harmonia
    ```
2.  **Install dependencies:**
    ```bash
    bun install
    ```
## 💻 Development
To start the local development server, which includes both the Vite frontend and the Wrangler backend, run the following command:
```bash
bun run dev
```
This will start the application, typically available at `http://localhost:3000`. The frontend will hot-reload on changes, and the worker will restart automatically.
## ☁️ Deployment
This project is configured for easy deployment to Cloudflare Pages and Workers.
1.  **Login to Wrangler:**
    Authenticate with your Cloudflare account.
    ```bash
    wrangler login
    ```
2.  **Deploy the application:**
    This command will build the frontend application and deploy it along with the Cloudflare Worker.
    ```bash
    bun run deploy
    ```
## 📂 Project Structure
-   `src/`: Contains the frontend React application source code.
    -   `components/`: Reusable React components.
    -   `pages/`: Top-level page components for each route.
    -   `lib/`: Utility functions and libraries.
-   `worker/`: Contains the Cloudflare Worker backend code using Hono.
    -   `durableObject.ts`: The core logic for the global Durable Object.
-   `shared/`: TypeScript types and interfaces shared between the frontend and backend.
## 📜 Available Scripts
-   `bun run dev`: Starts the development server.
-   `bun run build`: Builds the application for production.
-   `bun run deploy`: Deploys the application to Cloudflare.
-   `bun run lint`: Lints the codebase using ESLint.