# TicketX — Frontend

React + Vite frontend for the TicketX event-booking platform, built to talk to
the existing microservices through the API Gateway.

## Backend it connects to

```
Browser
  │
  ▼
API Gateway (:5000)
  ├── /api/auth/*           → user-service (:5001)
  ├── /api/events/*         → event-service (:5002)
  ├── /api/bookings/*       → booking-service (:5003)
  ├── /api/payments/*       → payment-service (:5004)
  └── /api/notifications/*  → notification-service (:5005)
```

All requests from this app go to the **gateway only** (`VITE_API_BASE_URL`,
default `http://localhost:5000/api`) — it never talks to a microservice directly.

## Getting started

```bash
npm install
cp .env.example .env      # adjust VITE_API_BASE_URL if your gateway runs elsewhere
npm run dev                # http://localhost:5173
```

Make sure the backend is running first: the API Gateway plus the five
microservices, each connected to Mongo, as in your existing `.env` files.

## Project structure

```
src/
├── api/                  # One file per backend service — thin axios wrappers
│   ├── axiosClient.js     # base axios instance, attaches JWT, handles 401s
│   ├── authApi.js         # /api/auth/*
│   ├── eventApi.js        # /api/events/*
│   ├── bookingApi.js      # /api/bookings/*
│   └── paymentApi.js      # /api/payments/*
├── context/
│   └── AuthContext.jsx    # session state (user + token in localStorage)
├── components/
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx # redirects to /login when unauthenticated
│   ├── EventCard.jsx
│   ├── SeatMap.jsx        # renders the seat grid from GET /events/:id/seats
│   ├── CountdownTimer.jsx # counts down a booking's lockExpiry
│   ├── TicketStub.jsx     # shared "ticket" card used on confirmation + my-bookings
│   └── Loader.jsx
├── pages/
│   ├── Login.jsx / Register.jsx
│   ├── Events.jsx          # browse + filter by category
│   ├── EventDetail.jsx     # pick seats, hold them (creates a pending booking)
│   ├── Checkout.jsx        # pay before the 10-minute hold expires
│   ├── BookingConfirmation.jsx
│   ├── MyBookings.jsx      # list + cancel pending bookings
│   └── NotFound.jsx
├── App.jsx                 # routes
└── main.jsx                # entry point
```

## User flow → API calls

1. **Sign up / log in** → `POST /api/auth/register` or `/login` → JWT stored,
   attached to every future request as `Authorization: Bearer <token>`.
2. **Browse events** → `GET /api/events?category=`
3. **Open an event** → `GET /api/events/:id` + `GET /api/events/:id/seats`
4. **Select seats, hold them** → `POST /api/bookings` (this locks the seats in
   event-service for 10 minutes and returns `lockExpiry`)
5. **Checkout** → countdown shows time left; on submit → `POST /api/payments/pay`,
   which (server-side) confirms the booking and triggers the confirmation email
6. **If the hold expires** → the booking is cancelled client-side
   (`PATCH /api/bookings/:id/cancel`); the backend's expiry sweeper also cleans
   these up independently every 60 seconds
7. **My bookings** → `GET /api/bookings/user/:userId`, with a **Cancel** action
   on pending bookings

## Design notes

The visual direction is a "box-office ledger": an ink-black interface with a
marquee-gold accent, seat maps that read like a real venue, and confirmed
bookings rendered as a torn ticket stub (`TicketStub.jsx`) rather than a plain
summary card.

## Notes / things to double check against your backend

- `pricePerSeat` is sent from the frontend on booking creation, matching
  `bookingController.createBooking`, which trusts the client-supplied price.
  You may want to move that calculation server-side (look up the event's
  price by `eventId`) before this goes to production.
- The seat lock is currently 10 minutes (`eventController.lockSeats`); the
  countdown timer reads this from `booking.lockExpiry`, so if you change the
  duration server-side, the frontend adjusts automatically.
