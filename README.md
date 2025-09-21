What's New Blog Platform

A full-stack blog publishing platform built with a modern stack for creating, reading, updating, and deleting blog posts.
You can check webiste live on render:): https://blogapp1-1-5g13.onrender.com
**Tech Stack**

Frontend: React, Redux Toolkit, React Router, SCSS (Vite)

Backend: Node.js, Express, MongoDB (Mongoose), JWT Authentication

OAuth: Firebase Authentication (in progress)

**Project Structure**
MittArv/
├── backend/        # Express + MongoDB + JWT/Firebase auth
└── frontend/       # React + Redux Toolkit + Vite

**Features**

->User Authentication with JWT (email/password). (Firebase auth in progress)

->Blog CRUD: Create, read, update, and delete posts with author-only edit/delete rights.

->Author Profiles: Name, photo, bio, date of birth, occupation, and list of authored posts.

->Extras: Search by title/tags, Likes/Bookmarks, Reactions, Comments, Pagination-ready API.

**Quickstart**
1️⃣ Database Setup

Create a MongoDB database (Atlas or local).

Copy your connection string.

2️⃣ Backend Setup
cd backend
npm install
cp .env.example .env
**Edit .env with your MongoDB URI + JWT_SECRET**
npm run dev

3️⃣ Frontend Setup
cd frontend
npm install
npm run dev

4️⃣ Frontend Env Config (optional)

Create frontend/.env file to point to backend (default: http://localhost:5000
):

VITE_API_BASE_URL=http://localhost:5000/api

5️⃣ User Accounts

Register a new account on the Sign Up page.

Login to create, edit, or delete posts.

**Scripts**

**Backend:**
npm run dev → Development with nodemon
npm start → Production

**Frontend:**
npm run dev → Development
npm run build → Build for production

npm run preview → Preview production build

Use Postman for validating backend routes like auth/register and auth/login.
