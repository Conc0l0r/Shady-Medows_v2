// ── Helper functions tests ────────────────────────────────────

function iso(d){ return d.toISOString().split('T')[0]; }
function fmtDate(d){ return d.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}); }
function fmtDateShort(d){ return d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}); }

// ── ISO date ──────────────────────────────────────────────────
test('iso() returns correct format', () => {
  const d = new Date('2026-04-20');
  expect(iso(d)).toBe('2026-04-20');
});

// ── Night calculation ─────────────────────────────────────────
test('calculates nights correctly', () => {
  const ci = new Date('2026-05-01');
  const co = new Date('2026-05-05');
  const nights = Math.round((co - ci) / 86400000);
  expect(nights).toBe(4);
});

test('returns 0 nights when same date', () => {
  const ci = new Date('2026-05-01');
  const co = new Date('2026-05-01');
  const nights = Math.round((co - ci) / 86400000);
  expect(nights).toBe(0);
});

// ── Price calculation ─────────────────────────────────────────
test('calculates subtotal correctly', () => {
  const price = 150, nights = 3;
  expect(price * nights).toBe(450);
});

test('calculates 10% tax correctly', () => {
  const sub = 450;
  const tax = Math.round(sub * 0.1);
  expect(tax).toBe(45);
});

test('calculates total correctly', () => {
  const sub = 450, tax = 45;
  expect(sub + tax).toBe(495);
});

// ── Email validation ──────────────────────────────────────────
test('valid email passes', () => {
  const email = 'test@test.com';
  expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)).toBe(true);
});

test('invalid email fails', () => {
  const email = 'notanemail';
  expect(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)).toBe(false);
});

// ── Phone validation ──────────────────────────────────────────
test('valid phone passes', () => {
  expect(/^[0-9\s\-\+]{7,15}$/.test('07911123456')).toBe(true);
});

test('too short phone fails', () => {
  expect(/^[0-9\s\-\+]{7,15}$/.test('123')).toBe(false);
});

// ── Card validation ───────────────────────────────────────────
test('valid 16 digit card passes', () => {
  const card = '1234 5678 9012 3456';
  expect(card.replace(/\s/g,'').length).toBe(16);
});

test('valid CVV passes', () => {
  expect(/^\d{3,4}$/.test('123')).toBe(true);
});

test('valid expiry passes', () => {
  expect(/^\d{2}\/\d{2}$/.test('12/26')).toBe(true);
});

test('invalid expiry fails', () => {
  expect(/^\d{2}\/\d{2}$/.test('1226')).toBe(false);
});