// ── CONFIG ────────────────────────────────────────────────────
var API = 'api';

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {
  checkSession();
  document.getElementById('btnLogoutProfile').addEventListener('click', doLogout);
});

// ── SESSION CHECK ─────────────────────────────────────────────
function checkSession() {
  fetch(API + '/auth.php?action=me', { credentials: 'include' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      if (d.ok) {
        renderProfile(d.user);
        loadBookings(d.user);
      } else {
        showAuthGuard();
      }
    })
    .catch(function () { showAuthGuard(); });
}

function showAuthGuard() {
  var guard = document.getElementById('authGuard');
  guard.style.display = 'flex';
}

// ── RENDER PROFILE INFO ───────────────────────────────────────
function renderProfile(user) {
  document.getElementById('profileContent').style.display = 'block';

  // Avatar initial
  var initial = (user.username || '?').charAt(0).toUpperCase();
  document.getElementById('avatarCircle').textContent = initial;

  // Nav
  document.getElementById('navUsername').textContent = user.username;
  document.getElementById('navAuthArea').innerHTML =
    '<a href="profile.html" class="btn-nav-user"><i class="bi bi-person-circle me-1"></i>' + escHtml(user.username) + '</a>';

  // Hero
  document.getElementById('profileUsername').textContent = user.username;
  document.getElementById('profileEmail').innerHTML =
    '<i class="bi bi-envelope me-1"></i>' + escHtml(user.email);

  // Account details panel
  document.getElementById('detailUsername').textContent = user.username;
  document.getElementById('detailEmail').textContent = user.email;

  // Member since — auth.php /me doesn't return created_at so we show account info
  var since = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Active Member';
  document.getElementById('profileMemberSince').innerHTML =
    '<i class="bi bi-calendar3 me-1"></i>Member since ' + since;
  document.getElementById('detailSince').textContent = since;
}

// ── LOAD BOOKINGS ─────────────────────────────────────────────
function loadBookings(user) {
  fetch(API + '/bookings.php', { credentials: 'include' })
    .then(function (r) { return r.json(); })
    .then(function (d) {
      document.getElementById('bookingsLoading').style.display = 'none';
      if (!d.ok) { showBookingsEmpty(); return; }
      var bookings = d.bookings || [];
      if (bookings.length === 0) { showBookingsEmpty(); return; }
      renderStats(bookings);
      renderNextBooking(bookings);
      renderBookings(bookings);
    })
    .catch(function () {
      document.getElementById('bookingsLoading').style.display = 'none';
      showBookingsEmpty();
    });
}

function showBookingsEmpty() {
  document.getElementById('bookingsEmpty').style.display = 'block';
}

// ── STATS ─────────────────────────────────────────────────────
function renderStats(bookings) {
  var confirmed = bookings.filter(function (b) { return b.status === 'confirmed'; });
  var pending   = bookings.filter(function (b) { return b.status === 'pending'; });
  var spent     = confirmed.reduce(function (sum, b) { return sum + parseFloat(b.total); }, 0);

  document.getElementById('statTotal').textContent     = bookings.length;
  document.getElementById('statConfirmed').textContent = confirmed.length;
  document.getElementById('statPending').textContent   = pending.length;
  document.getElementById('statSpent').textContent     = '£' + Math.round(spent);
}

// ── NEXT UPCOMING BOOKING ─────────────────────────────────────
function renderNextBooking(bookings) {
  var today = new Date(); today.setHours(0, 0, 0, 0);
  var upcoming = bookings
    .filter(function (b) { return b.status !== 'cancelled' && new Date(b.checkin) >= today; })
    .sort(function (a, b) { return new Date(a.checkin) - new Date(b.checkin); });

  if (upcoming.length === 0) return;

  var next = upcoming[0];
  var nights = Math.round((new Date(next.checkout) - new Date(next.checkin)) / 86400000);

  document.getElementById('nextBookingCard').style.display = 'block';
  document.getElementById('nextBookingContent').innerHTML =
    '<div class="next-booking-room">' + escHtml(next.room_name) + ' Room</div>' +
    '<div class="next-booking-dates">' +
      '<i class="bi bi-calendar-range me-1"></i>' +
      fmtDate(new Date(next.checkin)) + ' → ' + fmtDate(new Date(next.checkout)) +
      ' &nbsp;·&nbsp; ' + nights + ' night' + (nights !== 1 ? 's' : '') +
    '</div>' +
    '<div class="next-booking-ref">' + escHtml(next.reference) + '</div>';
}

// ── RENDER BOOKINGS LIST ──────────────────────────────────────
function renderBookings(bookings) {
  var list = document.getElementById('bookingsList');
  list.style.display = 'block';

  list.innerHTML = bookings.map(function (b) {
    var nights = Math.round((new Date(b.checkout) - new Date(b.checkin)) / 86400000);
    var sub    = parseFloat(b.total) / 1.1;
    var tax    = parseFloat(b.total) - sub;
    var bookedOn = new Date(b.created_at).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
    var requests = b.requests ? escHtml(b.requests) : 'None';

    return '<div class="booking-entry" onclick="toggleDetails(\'details-' + b.id + '\', this)">' +

      '<div class="booking-entry-header">' +
        '<div>' +
          '<div class="booking-entry-room">' + escHtml(b.room_name) + ' Room</div>' +
          '<div class="booking-entry-ref">' + escHtml(b.reference) + '</div>' +
        '</div>' +
        '<span class="booking-status ' + b.status + '">' + b.status + '</span>' +
      '</div>' +

      '<div class="booking-entry-meta">' +
        '<span><i class="bi bi-calendar-event"></i>' + fmtDate(new Date(b.checkin)) + '</span>' +
        '<span><i class="bi bi-arrow-right"></i>' + fmtDate(new Date(b.checkout)) + '</span>' +
        '<span><i class="bi bi-moon"></i>' + nights + ' night' + (nights !== 1 ? 's' : '') + '</span>' +
        '<span><i class="bi bi-people"></i>' + b.guests + ' guest' + (b.guests > 1 ? 's' : '') + '</span>' +
      '</div>' +

      '<div class="booking-entry-total">' +
        '<button class="toggle-details" onclick="event.stopPropagation(); toggleDetails(\'details-' + b.id + '\', document.querySelector(\'[data-id=\\"' + b.id + '\\"]\'))">' +
          '<i class="bi bi-chevron-down" id="chevron-' + b.id + '"></i> View Details' +
        '</button>' +
        '<span class="amount">£' + parseFloat(b.total).toFixed(2) + '</span>' +
      '</div>' +

      '<div class="booking-entry-details" id="details-' + b.id + '">' +
        '<div class="detail-grid">' +
          '<div class="detail-grid-row"><span class="detail-grid-label">Guest Name</span><span class="detail-grid-val">' + escHtml(b.firstname) + ' ' + escHtml(b.lastname) + '</span></div>' +
          '<div class="detail-grid-row"><span class="detail-grid-label">Email</span><span class="detail-grid-val">' + escHtml(b.email) + '</span></div>' +
          '<div class="detail-grid-row"><span class="detail-grid-label">Phone</span><span class="detail-grid-val">' + escHtml(b.phone) + '</span></div>' +
          '<div class="detail-grid-row"><span class="detail-grid-label">Booked On</span><span class="detail-grid-val">' + bookedOn + '</span></div>' +
          '<div class="detail-grid-row"><span class="detail-grid-label">Subtotal</span><span class="detail-grid-val">£' + sub.toFixed(2) + '</span></div>' +
          '<div class="detail-grid-row"><span class="detail-grid-label">Tax (10%)</span><span class="detail-grid-val">£' + tax.toFixed(2) + '</span></div>' +
        '</div>' +
        (b.requests ? '<div style="margin-top:.75rem;padding:.6rem .85rem;background:var(--gold-l);border-radius:8px;font-size:.8rem;"><strong>Special Requests:</strong> ' + requests + '</div>' : '') +
        (b.admin_note ? '<div style="margin-top:.5rem;padding:.6rem .85rem;background:#e8f4fd;border-radius:8px;font-size:.8rem;"><strong>Hotel Note:</strong> ' + escHtml(b.admin_note) + '</div>' : '') +
      '</div>' +

    '</div>';
  }).join('');
}

// ── TOGGLE BOOKING DETAILS ────────────────────────────────────
function toggleDetails(id, entry) {
  var el = document.getElementById(id);
  if (!el) return;
  var open = el.classList.contains('open');
  el.classList.toggle('open', !open);

  // Rotate chevron
  var bookingId = id.replace('details-', '');
  var chevron = document.getElementById('chevron-' + bookingId);
  if (chevron) {
    chevron.className = open ? 'bi bi-chevron-down' : 'bi bi-chevron-up';
  }
}

// ── LOGOUT ────────────────────────────────────────────────────
function doLogout() {
  fetch(API + '/auth.php?action=logout', { method: 'POST', credentials: 'include' })
    .then(function () { window.location.href = 'index.html'; });
}

// ── HELPERS ───────────────────────────────────────────────────
function fmtDate(d) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}