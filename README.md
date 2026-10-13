# MindForge

MindForge is a full-stack e-learning platform where learners can browse courses, study lectures, track course progress, take quizzes, and earn certificates. Administrators can manage course content and users.

## Features

- Browse and filter free and paid courses
- Register, verify an account by email, sign in, and reset a password
- Enroll in courses and track completed lectures
- Purchase paid courses through Stripe Checkout
- Create and take quizzes, view quiz results, and check the leaderboard
- Earn and download PDF certificates for perfect scores on quizzes for premium courses
- Ask the Gemini-powered learning chatbot questions
- Admin pages for managing courses, lectures, quizzes, and users

## Tech stack

- Frontend: React, React Router, Vite
- Backend: Node.js, Express
- Database: MongoDB with Mongoose
- Integrations: Stripe, Gemini API, Nodemailer with Gmail SMTP

## Requirements

- Node.js and npm
- A MongoDB database, local or hosted
- Credentials for the integrations you want to use (Stripe, Gemini, and Gmail SMTP)

## Run locally

Install dependencies in each app directory:

```bash
cd server
npm install

cd ../frontend
npm install
```

Create `server/.env` and configure the backend before starting it. The application reads these settings:

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend port; use `5000` for the current frontend API URL |
| `DB` | MongoDB connection string |
| `Jwt_Sec` | JWT signing secret for authenticated sessions |
| `Activation_Secret` | Secret used for email verification tokens |
| `Forgot_Secret` | Secret used for password reset tokens |
| `Gmail` | Gmail address used to send verification and reset emails |
| `Password` | Gmail app password for SMTP |
| `STRIPE_SECRET_KEY` | Stripe secret key for paid course checkout |
| `FRONTEND_URL` | Frontend URL used for payment redirects, typically `http://localhost:5173` |
| `frontendurl` | Frontend URL used in password reset emails, typically `http://localhost:5173` |
| `GEMINI_API_KEY` | Gemini API key for the chatbot |

Keep credentials private. The repository ignores `.env` files; do not commit real secrets.

Start the backend in one terminal:

```bash
cd server
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

Open the Vite URL printed in the frontend terminal (by default, `http://localhost:5173`). The frontend currently sends API requests to `http://localhost:5000`.

To create a production frontend build:

```bash
cd frontend
npm run build
```

## Project structure

```text
frontend/   React application
server/     Express API, MongoDB models, and integrations
```
