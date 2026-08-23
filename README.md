TicketX – AI-Powered Ticket Booking System

TicketX is a full-stack ticket booking application that allows users to discover events, select seats, book tickets, manage bookings, and receive notifications. The backend follows a microservices architecture for better modularity and scalability.

🌐 Live Application

Frontend: https://ticketx-ticket-booking-system.vercel.app/

API Gateway: https://ticketx-api-gateway.onrender.com

🚀 Features
User registration and JWT-based login
Browse and view events
Interactive seat selection
Ticket booking and payment workflow
Booking history
Email notifications
Protected routes
REST API-based communication
Cloud deployment
🛠️ Tech Stack

Frontend: React.js, Vite, JavaScript, Axios, CSS
Backend: Node.js, Express.js, REST APIs, JWT
Database: MongoDB Atlas
Deployment: Vercel, Render
Version Control: Git & GitHub

🏗️ Architecture
                 React Frontend
                       │
                       ▼
                  API Gateway
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   User Service   Event Service   Booking Service
                                      │
                         ┌────────────┴────────────┐
                         ▼                         ▼
                  Payment Service         Notification Service
                         │                         │
                         └────────────┬────────────┘
                                      ▼
                                MongoDB Atlas
📂 Project Structure
TicketX/
├── backend/
│   ├── api-gateway/
│   ├── user-service/
│   ├── event-service/
│   ├── booking-service/
│   ├── payment-service/
│   └── notification-service/
├── frontend/
├── infra/
├── docs/
└── README.md
🔧 Microservices
User Service – Registration, login, authentication and user management.
Event Service – Event listing and event details.
Booking Service – Seat selection, ticket booking and booking history.
Payment Service – Payment workflow and payment records.
Notification Service – Booking-related email notifications.
API Gateway – Single entry point for communication between the frontend and backend services.
🔐 Authentication

TicketX uses JWT authentication.

User → Login/Register → User Service → JWT Token
                                      ↓
                              Authenticated Requests

JWT tokens are automatically attached to API requests using Axios interceptors.

🗄️ Database

MongoDB Atlas is used as the cloud database.

user_db
event_db
booking_db
ticketx_payments
ticketx_notifications
💻 Local Setup

Clone the repository:

git clone https://github.com/YOUR_USERNAME/TicketX-AI-Ticket-Booking-System.git
cd TicketX-AI-Ticket-Booking-System

Run the frontend:

cd frontend
npm install
npm run dev

Run each backend service separately:

cd backend/user-service
npm install
npm start

The same process can be followed for the other services.

⚙️ Environment Variables

Create appropriate .env files for local development.

Example:

PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret

For the frontend:

VITE_API_BASE_URL=http://localhost:5000/api

Never commit passwords, database credentials, JWT secrets, SMTP credentials, or API keys to GitHub.

☁️ Deployment
Vercel – React frontend
Render – Backend microservices and API Gateway
MongoDB Atlas – Cloud database
GitHub – Source code

Production frontend API:

https://ticketx-api-gateway.onrender.com/api
🎟️ Booking Flow
Browse Events
     ↓
Select Event
     ↓
Select Seats
     ↓
Checkout
     ↓
Payment
     ↓
Booking Confirmation
     ↓
Notification
🔮 Future Enhancements
AI-based event recommendations
Real payment gateway integration
QR-code ticket verification
Admin dashboard
Real-time seat availability
Redis caching
Advanced analytics
🎯 Objective

The objective of TicketX is to demonstrate a real-world full-stack application using React, Node.js, Express, MongoDB, JWT authentication, microservices, API Gateway, and cloud deployment.
