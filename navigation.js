import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const PAGE_CONFIG = Object.freeze({
  dashboard: { href: 'dashboard.html', label: 'Dashboard' },
  guests: { href: 'guests.html', label: 'รายชื่อแขก' },
  seating: { href: 'seating.html', label: 'จัดการโต๊ะที่นั่ง', disabled: true },
  import: { href: 'import.html', label: 'Import Excel', adminOnly: true }
});

/**
 * Render the shared Register POC sidebar.
 * @param {Object} options
 * @param {'dashboard'|'guests'|'seating'|'import'} options.activePage
 * @param {import('firebase/auth').User} options.user
 * @param {'admin'|'editor'|'viewer'} options.role
 * @param {string} [options.targetId='appSidebar']
 * @param {string} [options.logoPath='spark-logo.png']
 */
export function renderNavigation({
  activePage,
  user,
  role,
  targetId = 'appSidebar',
  logoPath = 'spark-logo.png'
}) {
  const target = document.getElementById(targetId);
  if (!target) {
    throw new Error(`Navigation target #${targetId} was not found.`);
  }

  const normalizedRole = String(role || '').toLowerCase();
  const allowedRoles = ['admin', 'editor', 'viewer'];
  if (!allowedRoles.includes(normalizedRole)) {
    throw new Error('Invalid or missing user role.');
  }

  const menuHtml = Object.entries(PAGE_CONFIG)
    .filter(([, item]) => !item.adminOnly || normalizedRole === 'admin')
    .map(([key, item]) => {
      const classes = [
        'nav',
        key === activePage ? 'active' : '',
        item.disabled ? 'disabled' : ''
      ].filter(Boolean).join(' ');

      const disabledAttributes = item.disabled
        ? 'aria-disabled="true" tabindex="-1"'
        : `href="${item.href}"`;

      const suffix = item.disabled ? '<small>เร็ว ๆ นี้</small>' : '';
      return `<a class="${classes}" ${disabledAttributes}><span class="dot"></span>${item.label}${suffix}</a>`;
    })
    .join('');

  target.innerHTML = `
    <div class="brand">
      <a class="brand-logo-link" href="dashboard.html" aria-label="ไปหน้า Dashboard">
        <img class="spark-logo" src="${escapeHtml(logoPath)}" alt="Sustainability Spark by PTT Group">
      </a>
      <div><strong>Register POC</strong><small>Administration</small></div>
    </div>
    <div class="nav-label">เมนูหลัก</div>
    ${menuHtml}
    <div class="userbox">
      <strong>${escapeHtml(user?.email || user?.uid || 'Unknown user')}</strong>
      <span>Role: ${escapeHtml(normalizedRole)}</span>
      <button id="sharedSignOutBtn" class="side-signout" type="button">ออกจากระบบ</button>
    </div>`;

  const signOutButton = document.getElementById('sharedSignOutBtn');
  signOutButton?.addEventListener('click', async () => {
    signOutButton.disabled = true;
    try {
      await signOut(getAuth());
    } finally {
      window.location.replace('index.html');
    }
  });
}

export function getNavigationCss() {
  return `
    .brand{position:relative;display:flex;gap:12px;align-items:center;margin-bottom:34px}
    .brand strong,.brand small{display:block}.brand small{opacity:.72;margin-top:2px}
    .brand-logo-link{display:flex;align-items:center;justify-content:center;width:78px;height:52px;padding:4px;border-radius:12px;background:#fff;text-decoration:none;box-shadow:0 6px 18px #001c351f}
    .spark-logo{display:block;width:100%;height:100%;object-fit:contain}
    .brand:after{content:"";position:absolute;left:17px;right:17px;bottom:-14px;height:3px;border-radius:999px;background:linear-gradient(90deg,#4b5df5,#f7a33d,#f05b78,#42a5dd,#69c20f)}
    .nav-label{font-size:11px;opacity:.55;letter-spacing:.08em;margin:20px 10px 8px}
    .nav{display:flex;gap:10px;align-items:center;padding:11px 12px;border-radius:10px;color:#fff;text-decoration:none;opacity:.78;margin:3px 0}
    .nav:hover,.nav.active{background:#ffffff1d;opacity:1}.nav.disabled{opacity:.35;pointer-events:none}
    .nav small{margin-left:auto;font-size:9px}.dot{width:8px;height:8px;border-radius:50%;background:#67d5e8}
    .userbox{position:absolute;left:17px;right:17px;bottom:20px;padding-top:14px;border-top:1px solid #ffffff22;font-size:12px}
    .userbox strong{display:block;margin-bottom:3px;word-break:break-word}.userbox span{display:block;opacity:.75}
    .side-signout{width:100%;margin-top:11px;padding:8px 10px;border:1px solid #ffffff45;border-radius:8px;background:#ffffff12;color:#fff;font-weight:750;cursor:pointer}
    .side-signout:hover{background:#ffffff22}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}
