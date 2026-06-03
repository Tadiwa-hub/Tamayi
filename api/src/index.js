import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable CORS for testing
app.use('/api/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: err.message || 'Internal Server Error' }, 500);
});

// Middleware to verify Admin Session Token
async function authMiddleware(c, next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.split(' ')[1];
  
  try {
    const session = await c.env.DB.prepare(
      'SELECT * FROM admin_sessions WHERE token = ? AND expires_at > ?'
    ).bind(token, new Date().toISOString()).first();

    if (!session) {
      return c.json({ error: 'Unauthorized: Invalid or expired token' }, 401);
    }

    // Attach token to request context
    c.set('sessionToken', token);
    await next();
  } catch (error) {
    return c.json({ error: 'Database error during auth validation' }, 500);
  }
}

// -------------------------------------------------------------
// ADMIN AUTH ENDPOINTS
// -------------------------------------------------------------

// Global login attempt tracker (in-memory per isolate instance)
// Note: Workers are ephemeral, but for local dev and standard single-instance worker requests
// this provides the 3-attempt / 10-minute lockout mechanism.
const loginAttempts = new Map();

app.post('/api/admin/login', async (c) => {
  const { password } = await c.req.json();
  const clientIp = c.req.header('CF-Connecting-IP') || 'local';
  
  const now = Date.now();
  const attemptInfo = loginAttempts.get(clientIp) || { count: 0, lockoutUntil: 0 };

  if (attemptInfo.lockoutUntil > now) {
    const remainingSecs = Math.ceil((attemptInfo.lockoutUntil - now) / 1000);
    return c.json({ 
      error: `Too many failed attempts. Try again in ${Math.ceil(remainingSecs / 60)} minutes.` 
    }, 429);
  }

  const adminPassword = c.env.ADMIN_PASSWORD || 'TamayiLuxury2026';
  
  if (password !== adminPassword) {
    attemptInfo.count += 1;
    if (attemptInfo.count >= 3) {
      attemptInfo.lockoutUntil = now + 10 * 60 * 1000; // 10 minute lockout
      loginAttempts.set(clientIp, attemptInfo);
      return c.json({ 
        error: 'Too many failed attempts. Account locked for 10 minutes.' 
      }, 429);
    }
    loginAttempts.set(clientIp, attemptInfo);
    return c.json({ 
      error: `Invalid password. ${3 - attemptInfo.count} attempts remaining.` 
    }, 401);
  }

  // Clear tracking on successful login
  loginAttempts.delete(clientIp);

  // Generate session token
  const token = crypto.randomUUID();
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 8 * 3600 * 1000).toISOString(); // 8 hours expiry

  await c.env.DB.prepare(
    'INSERT INTO admin_sessions (id, token, expires_at) VALUES (?, ?, ?)'
  ).bind(sessionId, token, expiresAt).run();

  return c.json({ token });
});

app.post('/api/admin/logout', authMiddleware, async (c) => {
  const token = c.get('sessionToken');
  await c.env.DB.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run();
  return c.json({ success: true });
});

app.get('/api/admin/verify', authMiddleware, async (c) => {
  return c.json({ valid: true });
});

// -------------------------------------------------------------
// AVAILABILITY ENDPOINTS
// -------------------------------------------------------------

// Public & Admin: Get availability for a specific month
// GET /api/availability?month=2026-06
app.get('/api/availability', async (c) => {
  const month = c.req.query('month'); // Expects YYYY-MM
  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return c.json({ error: 'Invalid or missing month parameter (use YYYY-MM)' }, 400);
  }

  const query = 'SELECT property_id, date, status, note FROM availability WHERE date LIKE ?';
  const { results } = await c.env.DB.prepare(query).bind(`${month}-%`).all();
  return c.json(results || []);
});

// Admin Only: Upsert single availability record
// POST /api/availability
app.post('/api/availability', authMiddleware, async (c) => {
  const { property_id, date, status, note } = await c.req.json();
  
  if (!property_id || !date || !status) {
    return c.json({ error: 'Missing required parameters: property_id, date, status' }, 400);
  }

  const id = crypto.randomUUID();
  const query = `
    INSERT INTO availability (id, property_id, date, status, note, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(property_id, date) DO UPDATE SET
      status = excluded.status,
      note = excluded.note,
      updated_at = datetime('now')
  `;

  await c.env.DB.prepare(query).bind(id, property_id, date, status, note || '').run();
  return c.json({ success: true });
});

// Admin Only: Bulk block range of dates
// POST /api/availability/bulk
app.post('/api/availability/bulk', authMiddleware, async (c) => {
  const { property_id, from, to, status } = await c.req.json();

  if (!property_id || !from || !to || !status) {
    return c.json({ error: 'Missing required parameters: property_id, from, to, status' }, 400);
  }

  const startDate = new Date(from);
  const endDate = new Date(to);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
    return c.json({ error: 'Invalid date range' }, 400);
  }

  const statements = [];
  const curr = new Date(startDate);
  
  // Cap bulk operation to 365 days to prevent huge queries
  let count = 0;
  while (curr <= endDate && count < 366) {
    const dateStr = curr.toISOString().split('T')[0];
    const uuid = crypto.randomUUID();
    
    statements.push(
      c.env.DB.prepare(`
        INSERT INTO availability (id, property_id, date, status, note, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        ON CONFLICT(property_id, date) DO UPDATE SET
          status = excluded.status,
          updated_at = datetime('now')
      `).bind(uuid, property_id, dateStr, status, 'Bulk block')
    );

    curr.setDate(curr.getDate() + 1);
    count++;
  }

  if (statements.length > 0) {
    await c.env.DB.batch(statements);
  }

  return c.json({ success: true, count: statements.length });
});

// -------------------------------------------------------------
// BOOKING ENDPOINTS
// -------------------------------------------------------------

// Admin Only: Get all bookings
// GET /api/bookings
app.get('/api/bookings', authMiddleware, async (c) => {
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM bookings ORDER BY created_at DESC'
  ).all();
  return c.json(results || []);
});

// Public: Create new booking request & Auto-Slash the date
// POST /api/bookings
app.post('/api/bookings', async (c) => {
  const { 
    property_id, 
    property_name, 
    client_name, 
    client_phone, 
    check_in, 
    check_out, 
    num_guests, 
    special_requests 
  } = await c.req.json();

  if (!property_id || !property_name || !check_in) {
    return c.json({ error: 'Missing required booking fields' }, 400);
  }

  const bookingId = 'B-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  
  // Statement 1: Insert Booking Record
  const insertBooking = c.env.DB.prepare(`
    INSERT INTO bookings (id, property_id, property_name, client_name, client_phone, check_in, check_out, num_guests, special_requests, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
  `).bind(
    bookingId,
    property_id,
    property_name,
    client_name || 'Guest',
    client_phone || 'WhatsApp',
    check_in,
    check_out || null,
    parseInt(num_guests) || 1,
    special_requests || ''
  );

  // Statement 2: Auto-Slash the date in Availability table
  const availabilityId = crypto.randomUUID();
  const upsertAvailability = c.env.DB.prepare(`
    INSERT INTO availability (id, property_id, date, status, note, created_at, updated_at)
    VALUES (?, ?, ?, 'fully_booked', 'Auto-booked via website', datetime('now'), datetime('now'))
    ON CONFLICT(property_id, date) DO UPDATE SET
      status = 'fully_booked',
      updated_at = datetime('now')
  `).bind(availabilityId, property_id, check_in);

  // Execute both in a batch
  await c.env.DB.batch([insertBooking, upsertAvailability]);

  return c.json({ booking_id: bookingId, success: true });
});

// Admin Only: Update booking status
// PUT /api/bookings/:id
app.put('/api/bookings/:id', authMiddleware, async (c) => {
  const id = c.req.param('id');
  const { status } = await c.req.json();

  if (!status || !['pending', 'confirmed', 'cancelled', 'no_show'].includes(status)) {
    return c.json({ error: 'Invalid booking status' }, 400);
  }

  const result = await c.env.DB.prepare(
    'UPDATE bookings SET status = ? WHERE id = ?'
  ).bind(status, id).run();

  if (result.meta.changes === 0) {
    return c.json({ error: 'Booking not found' }, 404);
  }

  return c.json({ success: true });
});

export default app;
