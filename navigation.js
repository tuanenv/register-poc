import {
  getAuth,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const PAGE_CONFIG = Object.freeze({
  dashboard: { href: "dashboard.html", label: "Dashboard" },
  guests: { href: "guests.html", label: "รายชื่อแขก" },
  seating: { href: "seating.html", label: "จัดการที่นั่ง" },
  import: { href: "import.html", label: "Import Excel", adminOnly: true }
});

export function renderNavigation({
  activePage,
  user,
  role,
  targetId = "appSidebar",
  logoPath = "spark-logo.png"
}) {
  const target = document.getElementById(targetId);
  if (!target) {
    throw new Error(`Navigation target #${targetId} was not found.`);
  }

  const normalizedRole = String(role || "").toLowerCase();
  if (!["admin", "editor", "viewer"].includes(normalizedRole)) {
    throw new Error("Invalid or missing user role.");
  }

  ensureNavigationStyles();
  removeExistingMobileControls();

  const menuHtml = Object.entries(PAGE_CONFIG)
    .filter(([, item]) => !item.adminOnly || normalizedRole === "admin")
    .map(([key, item]) => `
      <a
        class="nav ${key === activePage ? "active" : ""}"
        href="${item.href}"
        data-mobile-nav-link
      >
        <span class="dot"></span>
        <span>${escapeHtml(item.label)}</span>
      </a>
    `)
    .join("");

  target.innerHTML = `
    <div class="brand">
      <a class="brand-logo-link" href="dashboard.html" aria-label="ไปหน้า Dashboard">
        <img class="spark-logo" src="${escapeHtml(logoPath)}" alt="Sustainability Spark by PTT Group">
      </a>
      <div class="brand-text">
        <strong>Register POC</strong>
        <small>Administration</small>
      </div>
      <button class="drawer-close" id="drawerCloseBtn" type="button" aria-label="ปิดเมนู">×</button>
    </div>

    <div class="nav-label">เมนูหลัก</div>
    <nav class="nav-menu">${menuHtml}</nav>

    <div class="userbox">
      <strong>${escapeHtml(user?.email || user?.uid || "Unknown user")}</strong>
      <span>Role: ${escapeHtml(normalizedRole)}</span>
      <button id="sharedSignOutBtn" class="side-signout" type="button">ออกจากระบบ</button>
    </div>
  `;

  createMobileControls();
  bindDrawerEvents(target);
  bindSignOut();
}

function createMobileControls() {
  const menuButton = document.createElement("button");
  menuButton.id = "mobileMenuBtn";
  menuButton.className = "mobile-menu-button";
  menuButton.type = "button";
  menuButton.setAttribute("aria-label", "เปิดเมนูหลัก");
  menuButton.setAttribute("aria-controls", "appSidebar");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.innerHTML = '<span aria-hidden="true">☰</span>';

  const overlay = document.createElement("div");
  overlay.id = "mobileNavOverlay";
  overlay.className = "mobile-nav-overlay";
  overlay.hidden = true;

  document.body.append(menuButton, overlay);
}

function bindDrawerEvents(target) {
  const menuButton = document.getElementById("mobileMenuBtn");
  const closeButton = document.getElementById("drawerCloseBtn");
  const overlay = document.getElementById("mobileNavOverlay");

  const openDrawer = () => {
    target.classList.add("drawer-open");
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("show"));
    menuButton.setAttribute("aria-expanded", "true");
    document.body.classList.add("mobile-drawer-open");
    closeButton.focus();
  };

  const closeDrawer = () => {
    target.classList.remove("drawer-open");
    overlay.classList.remove("show");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.classList.remove("mobile-drawer-open");
    window.setTimeout(() => {
      overlay.hidden = true;
    }, 180);
  };

  menuButton.addEventListener("click", () => {
    if (target.classList.contains("drawer-open")) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  closeButton.addEventListener("click", closeDrawer);
  overlay.addEventListener("click", closeDrawer);

  target.querySelectorAll("[data-mobile-nav-link]").forEach(link => {
    link.addEventListener("click", closeDrawer);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && target.classList.contains("drawer-open")) {
      closeDrawer();
      menuButton.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1200 && target.classList.contains("drawer-open")) {
      closeDrawer();
    }
  });
}

function bindSignOut() {
  const signOutButton = document.getElementById("sharedSignOutBtn");
  signOutButton?.addEventListener("click", async () => {
    signOutButton.disabled = true;
    signOutButton.textContent = "กำลังออกจากระบบ...";
    try {
      await signOut(getAuth());
    } finally {
      window.location.replace("index.html");
    }
  });
}

function removeExistingMobileControls() {
  document.getElementById("mobileMenuBtn")?.remove();
  document.getElementById("mobileNavOverlay")?.remove();
}

function ensureNavigationStyles() {
  const styleId = "register-poc-navigation-styles";
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = getNavigationCss();
  document.head.appendChild(style);
}

export function getNavigationCss() {
  return `
    #appSidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      padding: 22px 17px;
      overflow: hidden;
      background: linear-gradient(180deg, #194f7d, #103b61);
      color: #ffffff;
    }
    #appSidebar .brand {position:relative;display:flex;gap:12px;align-items:center;margin-bottom:34px}
    #appSidebar .brand strong,#appSidebar .brand small{display:block;color:#fff}
    #appSidebar .brand strong{font-size:14px;line-height:1.3}
    #appSidebar .brand small{margin-top:2px;font-size:11px;opacity:.72}
    #appSidebar .brand-logo-link{display:flex;flex:0 0 78px;align-items:center;justify-content:center;width:78px;height:52px;padding:4px;overflow:hidden;border-radius:12px;background:#fff;text-decoration:none;box-shadow:0 6px 18px rgba(0,28,53,.12)}
    #appSidebar .spark-logo{display:block;width:100%;height:100%;max-width:70px;max-height:44px;object-fit:contain}
    #appSidebar .brand:after{content:"";position:absolute;right:0;bottom:-14px;left:0;height:3px;border-radius:999px;background:linear-gradient(90deg,#4b5df5,#f7a33d,#f05b78,#42a5dd,#69c20f)}
    #appSidebar .nav-label{margin:20px 10px 8px;color:#fff;font-size:11px;letter-spacing:.08em;opacity:.55}
    #appSidebar .nav{display:flex;gap:10px;align-items:center;margin:3px 0;padding:11px 12px;border-radius:10px;color:#fff;font-size:13px;text-decoration:none;opacity:.78}
    #appSidebar .nav:hover,#appSidebar .nav.active{background:rgba(255,255,255,.12);opacity:1}
    #appSidebar .dot{flex:0 0 8px;width:8px;height:8px;border-radius:50%;background:#67d5e8}
    #appSidebar .userbox{position:absolute;right:17px;bottom:20px;left:17px;padding-top:14px;border-top:1px solid rgba(255,255,255,.14);font-size:12px;line-height:1.45}
    #appSidebar .userbox strong,#appSidebar .userbox span{display:block;color:#fff;word-break:break-word}
    #appSidebar .userbox span{opacity:.78}
    #appSidebar .side-signout{appearance:none;width:100%;min-height:38px;margin-top:11px;padding:8px 10px;border:1px solid rgba(255,255,255,.27);border-radius:8px;background:rgba(255,255,255,.07);color:#fff;font:inherit;font-weight:750;cursor:pointer}
    #appSidebar .side-signout:hover{background:rgba(255,255,255,.14)}
    .drawer-close,.mobile-menu-button{display:none}

    @media (max-width:1200px) {
      body.mobile-drawer-open{overflow:hidden}
      #appSidebar.side,#appSidebar.sidebar,#appSidebar{
        display:block !important;
        position:fixed !important;
        z-index:1002;
        top:0;
        bottom:0;
        left:0;
        width:min(310px,86vw);
        height:100dvh;
        transform:translateX(-105%);
        visibility:hidden;
        transition:transform .2s ease,visibility .2s ease;
        box-shadow:18px 0 45px rgba(16,24,40,.28);
      }
      #appSidebar.drawer-open{transform:translateX(0);visibility:visible}
      #appSidebar .drawer-close{display:grid;place-items:center;position:absolute;right:-5px;top:-5px;width:34px;height:34px;border:1px solid rgba(255,255,255,.2);border-radius:50%;background:rgba(255,255,255,.1);color:#fff;font-size:22px;cursor:pointer}
      .mobile-menu-button{display:grid;place-items:center;position:fixed;z-index:998;left:14px;bottom:max(18px,env(safe-area-inset-bottom));width:50px;height:50px;border:0;border-radius:50%;background:#194f7d;color:#fff;font-size:23px;box-shadow:0 8px 24px rgba(16,59,97,.35);cursor:pointer}
      .mobile-menu-button:focus-visible{outline:3px solid #67d5e8;outline-offset:3px}
      .mobile-nav-overlay{position:fixed;z-index:1001;inset:0;background:rgba(16,24,40,.58);opacity:0;transition:opacity .18s ease}
      .mobile-nav-overlay.show{opacity:1}
      #appSidebar .userbox{bottom:max(18px,env(safe-area-inset-bottom))}
    }
  `;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character]);
}
