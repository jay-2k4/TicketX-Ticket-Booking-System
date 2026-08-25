const USER_SERVICE_URL =
  'https://ticketx-ticket-booking-system.onrender.com';

const API_GATEWAY_URL =
  'https://ticketx-api-gateway.onrender.com';

const EVENT_SERVICE_URL =
  'https://ticketx-ticket-booking-system-1.onrender.com';

const BOOKING_SERVICE_URL =
  'https://ticketx-ticket-booking-system-2.onrender.com';

const PAYMENT_SERVICE_URL =
  'https://ticketx-payment-service.onrender.com';

const NOTIFICATION_SERVICE_URL =
  'https://ticketx-notification-service.onrender.com';

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function wakeService(url, name, healthPath = '/') {
  const maxAttempts = 6;
  const delay = 15000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${url}${healthPath}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (response.ok) {
        console.log(`${name} is awake`);
        return true;
      }

      console.log(
        `${name} returned ${response.status}. Attempt ${attempt}/${maxAttempts}`
      );
    } catch (error) {
      console.log(
        `${name} is waking up. Attempt ${attempt}/${maxAttempts}`
      );
    }

    if (attempt < maxAttempts) {
      await sleep(delay);
    }
  }

  throw new Error(
    `${name} is taking too long to wake up. Please try again later.`
  );
}

export async function wakeUserService() {
  return wakeService(
    USER_SERVICE_URL,
    'User service'
  );
}

export async function wakeEventServices() {
  await wakeService(
    API_GATEWAY_URL,
    'API Gateway'
  );

  await wakeService(
    EVENT_SERVICE_URL,
    'Event service'
  );
}

export async function wakeBookingServices() {
  await wakeService(
    API_GATEWAY_URL,
    'API Gateway'
  );

  await wakeService(
    BOOKING_SERVICE_URL,
    'Booking service'
  );
}

export async function wakePaymentServices() {
  await wakeService(
    API_GATEWAY_URL,
    'API Gateway'
  );

  await wakeService(
    PAYMENT_SERVICE_URL,
    'Payment service',
    '/health'
  );
}

export async function wakeNotificationService() {
  return wakeService(
    NOTIFICATION_SERVICE_URL,
    'Notification service'
  );
}