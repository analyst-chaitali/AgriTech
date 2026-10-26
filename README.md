## Installation and Setup

### Prerequisites
Install Node.js and npm before running the project.

### 1. Start the Backend

Open the first terminal in the main project folder and run:

```bash
cd server
npm install
node server.js
```

Keep this terminal running.

### 2. Start the Frontend

Open a second terminal in the main project folder and run:

```bash
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

**Note:** Configure the MongoDB connection string in `server/.env` before starting the backend. Never upload this file to GitHub.
