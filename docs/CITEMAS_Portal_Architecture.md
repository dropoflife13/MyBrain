# CITEMAS Portal — System Architecture & Dynamic UI/UX Design

> **CITEMAS (College of Information Technology Education Multimedia Arts System)** is a full-stack creative studio portal built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **Framer Motion 14**, **Three.js (WebGL)**, **MongoDB/Mongoose**, and **Cloudinary**.

---

## 1. High-Level System Architecture
- **Client Layer:** Next.js 16 App Router, React 19, Glass Navbar, ScrollSpine Telemetry HUD, Three.js WebGL procedural centerpiece, 10s Cut Hover Video Engine.
- **State & Theme:** AuthContext (JWT hydration), Zero-FOUC inline script, Tailwind v4 custom variants & semantic tokens.
- **Serverless API Layer:** Next.js route handlers (`/api/auth`, `/api/applications`, `/api/portfolio`, `/api/events`, `/api/officers`, `/api/activity`).
- **Data & Media:** MongoDB Atlas (Mongoose 9), Cloudinary CDN (portfolio & avatars), local static media.

---

## 2. 3D WebGL Engine & Spatial Centerpiece
- **Procedural 3D Logo (`public/citemas-logo-3d.html`):**
  - Embedded via `?embed` inside `app/page.tsx` with transparent alpha clearing.
  - Procedural geometry (6 curved blades stacked on Z-axis + Catmull-Rom spline extruded via `THREE.ExtrudeGeometry`).
  - Custom vertex shader coloring (`paint(g)`) across 5 crimson stops.
  - `MeshPhysicalMaterial` with PBR clearcoat and 4-point studio lighting.
  - Pointer drag rotation with angular velocity damping (`vel *= 0.95`), pitch clamping, and 360° idle yaw rotation after 1.2s inactivity.
- **Zero-Jank Scene Reveal:** `CitemasLoader` cross-fades out on iframe `onLoad` with a 3500ms safety fallback timer.
- **Cursor Parallax:** Independent parallax depths on 3D centerpiece and floating orbital cards.

---

## 3. Dynamic Video Showcase System (10-Second Cut & Hover Accordion)
- **DOM-Persistent Preloaded `<video>` Elements:** Kept mounted in CSS Grid (`grid-rows-[0fr]` → `grid-rows-[1fr]`) to prevent black flashes and re-buffering.
- **Strict 10s Cut Enforcement:** HTML5 Media Fragment `#t=0,10` combined with `onTimeUpdate` loop (`if (currentTime >= 10) { currentTime = 0; play(); }`).
- **Adaptive Row Compaction:** Non-hovered rows compress vertically (`opacity-60`) to prevent viewport overflow inside the 86vh sticky card.
- **Live Studio Telemetry HUD:** Pulsing red REC indicator, discipline tag, 00:0X / 00:10S counter, and progress bar.

---

## 4. Motion Architecture & Kinematics
- **400vh Sticky Card Stack:** 4 full-viewport cards with depth scaling (`scale(1 - cardProgress * 0.08)`) and dimming filter (`brightness(1 - cardProgress * 0.45)`).
- **Scroll-Driven Crossfade:** Drifting radial starfield crossfades into technical blueprint grid.
- **ScrollSpine HUD:** Vertical telemetry gauge driven by Framer Motion `useScroll` and `useSpring`.
- **Zero-FOUC Dual Theme:** Inline `<head>` script prevents theme flash; Tailwind v4 CSS variables adapt Obsidian Dark (`#070305`) and Daylight (`#ffffff`).
- **Tab Visibility Pause:** Carousels pause automatically when `document.hidden` is true.

---

## 5. RBAC & Data Models
- **Roles:** `super_admin`, `teacher`/`adviser` (requires admin approval before activation), `officer` (single-holder vs multi-holder positions), `member`/`alumni`, `applicant`/`user`.
- **Validation:** Enforces `@phinmaed.com` institutional email and regex Student ID format (`^\d{2}-\d{4}-\d{4,7}$`).
- **Security:** Stateless JWT, audit logging via `ActivityLog`, Cloudinary image management.

