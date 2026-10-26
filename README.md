# AgriTech – Empowering Farmers Through Digital Technology

## About the Project
AgriTech is a web-based application designed to support farmers through digital technology. It provides farm management, crop recommendations, weather information, crop details, and basic agricultural guidance in one place.

## Features
- **Dashboard:** Overview of the application.
- **Farm Management:** Add, view, edit, and delete farm records.
- **Crop Advisor:** Provides rule-based crop suggestions based on entered soil and environmental details.
- **Weather:** Displays weather conditions and forecasts.
- **Crop Library:** Provides basic crop information.
- **AI Assistant:** Offers predefined responses to general farming questions.

## Technologies Used
- **Frontend:** React.js, Vite, CSS, Bootstrap
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Weather Data:** Open-Meteo API

## Project Structure
- `src/` – Frontend application
- `server/` – Backend application and API
- `server/models/Farm.js` – Farm database schema
- `src/App.jsx` – Main React component
- `src/App.css` – Application styling

## Installation and Setup

### Prerequisites
Install Node.js and npm.

### 1. Start the Backend
Open a terminal in the project folder and run:

```bash
cd server
npm install
node server.js
```

### 2. Start the Frontend
Open a second terminal in the main project folder and run:

```bash
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## API Endpoints
- `GET /api/health` – Check backend health.
- `GET /api/farms` – Get all farm records.
- `GET /api/farms/:id` – Get a farm by ID.
- `POST /api/farms` – Add a farm.
- `PUT /api/farms/:id` – Update a farm.
- `DELETE /api/farms/:id` – Delete a farm.

## Security Notes
- Store database credentials in `server/.env`.
- Never upload `.env` files or database credentials to GitHub.
- Crop suggestions are illustrative and should be verified with local agricultural experts.
- The AI Assistant uses predefined responses and does not replace professional agricultural advice.

## Project Objective
The objective of AgriTech is to make farm management and basic agricultural information more accessible through a simple digital platform.
