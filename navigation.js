import { getAuth, signOut } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';

const PAGE_CONFIG = Object.freeze({
  dashboard: { href: 'dashboard.html', label: 'Dashboard' },
  guests: { href: 'guests.html', label: 'รายชื่อแขก' },
  seating: { href: 'seating.html', label: 'จัดการที่นั่ง' },
  import: { href: 'import.html', label: 'Import Excel', adminOnly: true }
});

export function renderNavigation({
  activePage,
  user,
  role,
  targetId = 'appSidebar',
  logoPath = 'spark-logo.png'
}) {
  const target = document.getElementById(targetId);
  if (!target) throw new Error(`Navigation target #${targetId} was not found.`);

  ensureNavigationStyles();

  const normalizedRole = String(role || '').toLowerCase();
  if (!['admin', 'editor', 'viewer'].includes(normalizedRole)) {
    throw new Error('Invalid or missing user role.');
  }

  const menuHtml = Object.entries(PAGE_CONFIG)
    .filter(([, item]) => !item.adminOnly || normalizedRole === 'admin')
    .map(([key, item]) => {
      const classes = ['nav', key === activePage ? 'active' : ''].filter(Boolean).join(' ');
      return `<a class="${classes}" href="${item.href}"><span class="dot"></span><span>${escapeHtml(item.label)}</span></a>`;
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
    <nav class="nav-menu">${menuHtml}</nav>
    <div class="userbox">
      <strong>${escapeHtml(user?.email || user?.uid || 'Unknown user')}</strong>
      <span>Role: ${escapeHtml(normalizedRole)}</span>
      <button id="sharedSignOutBtn" class="side-signout" type="button">ออกจากระบบ</button>
    </div>`;

  document.getElementById('sharedSignOutBtn')?.addEventListener('click', async event => {
    const button = event.currentTarget;
    button.disabled = true;
    button.textContent = 'กำลังออกจากระบบ...';
    try {
      await signOut(getAuth());
    } finally {
      window.location.replace('index.html');
    }
  });
}

function ensureNavigationStyles() {
  const styleId = 'register-poc-navigation-styles';
  if (document.getElementById(styleId)) return;
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = getNavigationCss();
  document.head.appendChild(style);
}

export function getNavigationCss() {
  return `
    #appSidebar{position:sticky;top:0;height:100vh;padding:22px 17px;overflow:hidden;background:linear-gradient(180deg,#194f7d,#103b61);color:#fff}
    #appSidebar .brand{position:relative;display:flex;gap:12px;align-items:center;margin-bottom:34px}
    #appSidebar .brand strong,#appSidebar .brand small{display:block;color:#fff}
    #appSidebar .brand strong{font-size:14px;line-height:1.3}
    #appSidebar .brand small{margin-top:2px;font-size:11px;opacity:.72}
    #appSidebar .brand-logo-link{display:flex;flex:0 0 78px;align-items:center;justify-content:center;width:78px;height:52px;padding:4px;overflow:hidden;border-radius:12px;background:#fff;text-decoration:none;box-shadow:0 6px 18px rgba(0,28,53,.12)}
    #appSidebar .spark-logo{display:block;width:100%;height:100%;max-width:70px;max-height:44px;object-fit:contain}
    #appSidebar .brand:after{content:"";position:absolute;right:0;bottom:-14px;left:0;height:3px;border-radius:999px;background:linear-gradient(90deg,#4b5df5,#f7a33d,#f05b78,#42a5dd,#69c20f)}
    #appSidebar .nav-label{margin:20px 10px 8px;color:#fff;font-size:11px;letter-spacing:.08em;opacity:.55}
    #appSidebar .nav-menu{display:block}
    #appSidebar .nav{display:flex;gap:10px;align-items:center;margin:3px 0;padding:11px 12px;border-radius:10px;color:#fff;font-size:13px;line-height:1.3;text-decoration:none;opacity:.78;transition:.15s}
    #appSidebar .nav:hover,#appSidebar .nav.active{background:rgba(255,255,255,.12);color:#fff;opacity:1}
    #appSidebar .dot{flex:0 0 8px;width:8px;height:8px;border-radius:50%;background:#67d5e8}
    #appSidebar .userbox{position:absolute;right:17px;bottom:20px;left:17px;padding-top:14px;border-top:1px solid rgba(255,255,255,.14);color:#fff;font-size:12px;line-height:1.45}
    #appSidebar .userbox strong{display:block;margin-bottom:3px;color:#fff;word-break:break-word}
    #appSidebar .userbox span{display:block;color:#fff;opacity:.78}
    #appSidebar .side-signout{appearance:none;display:block;width:100%;min-height:38px;margin:11px 0 0;padding:8px 10px;border:1px solid rgba(255,255,255,.27);border-radius:8px;background:rgba(255,255,255,.07);color:#fff;font:inherit;font-size:12px;font-weight:750;text-align:center;cursor:pointer;box-shadow:none}
    #appSidebar .side-signout:hover{background:rgba(255,255,255,.14)}
    #appSidebar .side-signout:disabled{cursor:not-allowed;opacity:.55}`;
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[character]);
}
