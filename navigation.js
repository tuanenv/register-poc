import {
  getAuth,
  signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const PAGE_CONFIG = Object.freeze({
  dashboard: {
    href: "dashboard.html",
    label: "Dashboard"
  },

  guests: {
    href: "guests.html",
    label: "รายชื่อแขก"
  },

  seating: {
    href: "seating.html",
    label: "จัดการที่นั่ง"
  },

  import: {
    href: "import.html",
    label: "Import Excel",
    adminOnly: true
  }
});

/**
 * สร้าง Sidebar กลางของ Register POC
 *
 * @param {Object} options
 * @param {"dashboard"|"guests"|"seating"|"import"} options.activePage
 * @param {Object} options.user
 * @param {"admin"|"editor"|"viewer"} options.role
 * @param {string} [options.targetId]
 * @param {string} [options.logoPath]
 */
export function renderNavigation({
  activePage,
  user,
  role,
  targetId = "appSidebar",
  logoPath = "spark-logo.png"
}) {
  const target =
    document.getElementById(targetId);

  if (!target) {
    throw new Error(
      `Navigation target #${targetId} was not found.`
    );
  }

  ensureNavigationStyles();

  const normalizedRole =
    String(role || "").toLowerCase();

  const allowedRoles = [
    "admin",
    "editor",
    "viewer"
  ];

  if (!allowedRoles.includes(normalizedRole)) {
    throw new Error(
      "Invalid or missing user role."
    );
  }

  const menuHtml = Object
    .entries(PAGE_CONFIG)
    .filter(([, item]) => {
      return (
        !item.adminOnly ||
        normalizedRole === "admin"
      );
    })
    .map(([key, item]) => {
      const classes = [
        "nav",
        key === activePage
          ? "active"
          : "",
        item.disabled
          ? "disabled"
          : ""
      ]
        .filter(Boolean)
        .join(" ");

      const attributes = item.disabled
        ? 'aria-disabled="true" tabindex="-1"'
        : `href="${item.href}"`;

      const suffix = item.disabled
        ? "<small>เร็ว ๆ นี้</small>"
        : "";

      return `
        <a
          class="${classes}"
          ${attributes}
        >
          <span class="dot"></span>

          <span class="nav-text">
            ${escapeHtml(item.label)}
          </span>

          ${suffix}
        </a>
      `;
    })
    .join("");

  target.innerHTML = `
    <div class="brand">
      <a
        class="brand-logo-link"
        href="dashboard.html"
        aria-label="ไปหน้า Dashboard"
      >
        "
          alt="Sustainability Spark by PTT Group"
        >
      </a>

      <div class="brand-text">
        <strong>Register POC</strong>
        <small>Administration</small>
      </div>
    </div>

    <div class="nav-label">
      เมนูหลัก
    </div>

    <nav class="nav-menu">
      ${menuHtml}
    </nav>

    <div class="userbox">
      <strong>
        ${escapeHtml(
          user?.email ||
          user?.uid ||
          "Unknown user"
        )}
      </strong>

      <span>
        Role: ${escapeHtml(normalizedRole)}
      </span>

      <button
        id="sharedSignOutBtn"
        class="side-signout"
        type="button"
      >
        ออกจากระบบ
      </button>
    </div>
  `;

  const signOutButton =
    document.getElementById(
      "sharedSignOutBtn"
    );

  signOutButton?.addEventListener(
    "click",
    async () => {
      signOutButton.disabled = true;
      signOutButton.textContent =
        "กำลังออกจากระบบ...";

      try {
        await signOut(getAuth());
      } catch (error) {
        console.error(
          "Firebase sign out failed:",
          error
        );
      } finally {
        window.location.replace(
          "index.html"
        );
      }
    }
  );
}

/**
 * ใส่ CSS กลางของ Navigation ลงในหน้าเว็บ
 * ทำเพียงครั้งเดียวต่อหน้า
 */
function ensureNavigationStyles() {
  const styleId =
    "register-poc-navigation-styles";

  if (document.getElementById(styleId)) {
    return;
  }

  const style =
    document.createElement("style");

  style.id = styleId;
  style.textContent =
    getNavigationCss();

  document.head.appendChild(style);
}

/**
 * CSS กลางสำหรับ Sidebar
 */
export function getNavigationCss() {
  return `
    #appSidebar {
      position: sticky;
      top: 0;
      height: 100vh;
      padding: 22px 17px;
      overflow: hidden;
      background:
        linear-gradient(
          180deg,
          #194f7d,
          #103b61
        );
      color: #ffffff;
    }

    #appSidebar .brand {
      position: relative;
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 34px;
    }

    #appSidebar .brand strong,
    #appSidebar .brand small {
      display: block;
    }

    #appSidebar .brand strong {
      color: #ffffff;
      font-size: 14px;
      line-height: 1.3;
    }

    #appSidebar .brand small {
      margin-top: 2px;
      color: #ffffff;
      font-size: 11px;
      opacity: 0.72;
    }

    #appSidebar .brand-logo-link {
      display: flex;
      flex: 0 0 78px;
      align-items: center;
      justify-content: center;
      width: 78px;
      height: 52px;
      padding: 4px;
      overflow: hidden;
      border-radius: 12px;
      background: #ffffff;
      text-decoration: none;
      box-shadow:
        0 6px 18px
        rgba(0, 28, 53, 0.12);
    }

    #appSidebar .spark-logo {
      display: block;
      width: 100%;
      height: 100%;
      max-width: 70px;
      max-height: 44px;
      object-fit: contain;
    }

    #appSidebar .brand::after {
      content: "";
      position: absolute;
      right: 0;
      bottom: -14px;
      left: 0;
      height: 3px;
      border-radius: 999px;
      background:
        linear-gradient
