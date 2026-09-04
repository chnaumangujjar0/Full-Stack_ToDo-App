# TaskFlow — Collaborative Todo & Workspace Platform

<!-- TODO: swap in your actual project name, logo, and badges (build status, license, coverage) -->

A full-stack, real-time todo application built around shared **workspaces**. Teams create workspaces, invite teammates with specific roles, assign and track tasks together, and see changes propagate live via WebSockets — all backed by a role-based access control (RBAC) system and a full authentication/session layer supporting both local accounts and Auth0.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [API Overview](#api-overview)
- [Real-Time Events (Socket.IO)](#real-time-events-socketio)
- [Authorization Model](#authorization-model)
- [Data Models](#data-models)
- [Security Notes](#security-notes)
- [Scripts](#scripts)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## Features

**Authentication & Accounts**
- Email/username + password login, with bcrypt-hashed passwords
- Auth0 (OAuth) login for social/SSO sign-in, auto-provisioning local accounts on first login
- Access + refresh token pairs (JWT), refresh tokens backed by a `Session` collection (not stored on the user)
- Multiple concurrent sessions per user (log in from phone + laptop simultaneously)
- Per-device/session logout (revokes one session without logging out other devices)
- OTP-based password reset (authenticated "change password" flow and unauthenticated "forgot password" flow), with a short-lived, single-purpose signed token gating the final password change
- Full login audit trail (`LoginActivity`) recording success **and** failure attempts, IP, device, and auth provider

**Workspaces & Collaboration**
- Create workspaces with a dedicated owner
- Three-tier role system: **owner → admin → member**, enforced by rank-based RBAC middleware
- Invite teammates by username, with a selectable role (`admin` / `member`)
- Time-limited invites (7-day expiry) with accept/decline flow
- Promote/demote members, remove members (soft-delete, preserves history), leave a workspace
- Cascading cleanup on workspace deletion (members, tasks all removed)

**Tasks**
- Per-workspace task creation, editing, status updates, and deletion
- Deadlines and assignment within a workspace

**Real-Time**
- Live task status updates across all connected clients in a workspace
- Live member list updates when someone is invited, joins, is promoted, or is removed
- Live notification delivery (invites, removals, role changes) to the affected user specifically
- A removed user is bounced out of a workspace page they're actively viewing

**Notifications**
- Persistent, queryable notification records for invites, removals, and additions, in addition to the real-time push

---

## Tech Stack

**Backend**
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO (real-time layer)
- JSON Web Tokens (`jsonwebtoken`) for access/refresh/reset tokens
- bcrypt for password and refresh-token hashing
- Auth0 + `jwks-rsa` for OAuth login verification
- Nodemailer for transactional OTP emails
- Cloudinary for avatar/cover image uploads

**Frontend**
- React (Vite)
- React Router
- Tailwind CSS
- Socket.IO client
- react-toastify for notifications/toasts
- lucide-react for icons

<!-- TODO: confirm build tool (Vite vs CRA vs Next.js) and add/remove entries above to match your actual stack -->

---

## Architecture Overview


- Auth uses **httpOnly, secure cookies** for access/refresh tokens — not `localStorage` — to reduce XSS token-theft risk.
- Each authenticated socket connection joins a room named after the user's own ID, enabling targeted server → client pushes (notifications, kicks) in addition to per-workspace broadcast rooms.
- Authorization for every workspace-scoped route is resolved once, centrally, via middleware (`req.workspace`, `req.workspaceRole`) rather than being re-implemented per controller.

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local instance or Atlas)
- An Auth0 tenant (for social login) — optional if you disable that flow
- An SMTP account (e.g. Gmail app password) for OTP emails
- A Cloudinary account for avatar/cover image uploads

### Installation

```bash
git clone <your-repo-url>
cd <repo-name>

# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

### Environment Variables

**Backend `.env`**

| Variable | Description |
|---|---|
| `PORT` | Port the API server listens on |
| `MONGODB_URI` | MongoDB connection string |
| `CORS_ORIGIN` | Allowed frontend origin (needed since auth uses cookies) |
| `ACCESS_TOKEN_SECRET` | Signing secret for short-lived access tokens |
| `ACCESS_TOKEN_EXPIRY` | e.g. `15m` |
| `REFRESH_TOKEN_SECRET` | Signing secret for refresh tokens (backs `Session` documents) |
| `REFRESH_TOKEN_EXPIRY` | e.g. `7d` |
| `RESET_PASSWORD_TOKEN_SECRET` | **Separate** secret for the short-lived password-reset token — deliberately isolated from the access/refresh secrets so a leak of one can't be used to forge the other, and so it can be rotated independently |
| `SMTP_USER` / `SMTP_PASS` | Credentials for sending OTP emails |
| `AUTH0_DOMAIN` | Your Auth0 tenant domain, used to fetch the JWKS for token verification |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary credentials for avatar/cover uploads |

**Frontend `.env`**

<!-- TODO: confirm the actual prefix (VITE_ / REACT_APP_ / NEXT_PUBLIC_) your build tool requires --

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API |
| `VITE_SOCKET_URL` | Base URL for the Socket.IO connection |
| `VITE_AUTH0_DOMAIN` / `VITE_AUTH0_CLIENT_ID` | Auth0 SPA application credentials |

### Running Locally

```bash
# backend
cd backend
npm run dev

# frontend (separate terminal)
cd frontend
npm run dev
```

---

## API Overview

All routes are versioned and JWT-protected via `verifyJwt` unless noted. Workspace-scoped routes additionally run through the RBAC middleware described below.

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Public | Create a local account |
| POST | `/api/v1/auth/login` | Public | Local login |
| POST | `/api/v1/auth/auth0-login` | Public | Auth0 token exchange |
| POST | `/api/v1/auth/refresh-token` | Public (cookie) | Rotate access token from a valid refresh token/session |
| POST | `/api/v1/auth/logout` | Auth required | Revoke the current session |
| GET | `/api/v1/auth/me` | Auth required | Current user profile |
| POST | `/api/v1/auth/request-password-reset` | Auth required | OTP for authenticated password change |
| POST | `/api/v1/auth/verify-reset-password` | Auth required | Complete authenticated password change |
| POST | `/api/v1/auth/forgot-password` | Public | OTP for unauthenticated password reset |
| POST | `/api/v1/auth/verify-forgot-password-otp` | Public | Verify OTP, issue short-lived reset token |
| POST | `/api/v1/auth/change-forgot-password` | Public (reset token) | Complete unauthenticated password reset |
| GET | `/api/v1/workspaces` | Any active member | List workspaces you belong to |
| POST | `/api/v1/workspaces/create` | Auth required | Create a workspace |
| GET | `/api/v1/workspaces/getWorkspaceById/:workspaceId` | Member+ | Workspace details + member list |
| PATCH | `/api/v1/workspaces/:workspaceId/update` | Admin+ | Rename a workspace |
| DELETE | `/api/v1/workspaces/:workspaceId/delete` | Owner | Delete a workspace |
| POST | `/api/v1/workspace-members/:workspaceId/add` | Admin+ | Add a member directly |
| GET | `/api/v1/workspace-members/:workspaceId` | Member+ | List members |
| PATCH | `/api/v1/workspace-members/:workspaceId/role` | Owner | Promote/demote a member |
| PATCH | `/api/v1/workspace-members/:workspaceId/delete` | Admin+ | Remove (soft-delete) a member |
| DELETE | `/api/v1/workspace-members/:workspaceId/leave` | Member+ | Leave a workspace (blocked for the owner) |
| POST | `/api/v1/invites/:workspaceId` | Admin+ | Send an invite by username |
| PATCH | `/api/v1/invites/:inviteId/respond` | Invitee only | Accept/decline an invite |
| GET | `/api/v1/invites` | Auth required | List your pending invites |
| GET/POST/PATCH/DELETE | `/api/v1/todos/...` | Member+ | Task CRUD within a workspace |

<!-- TODO: fill in exact todo.routes.js paths once finalized -->

---

## Real-Time Events (Socket.IO)

Each connected client joins a room named after its own user ID on connect, and joins/leaves a room named after a workspace ID while viewing that workspace.

| Event | Direction | Payload | Purpose |
|---|---|---|---|
| `join_workspace` / `leave_workspace` | Client → Server | `workspaceId` | Join/leave a workspace's broadcast room |
| `task_status_updated` | Server → Workspace room | Updated task | Live task board sync |
| `new_task` | Server → Workspace room | New task | Live task board sync |
| `invite_response` | Server → Workspace room | Flattened member object | A new member joined (via direct add or invite acceptance) |
| `member_removed` | Server → Workspace room | `{ memberId }` | A member was removed |
| `kicked_from_workspace` | Server → User room | `{ workspaceId, message }` | Notifies the specific user they were removed |
| `workspace_invite` | Server → User room | Invite document | Notifies the specific user of a new invite |
| `workspace_joined` | Server → User room | Workspace list-item shape | Lets the accepting user's own workspace list update without a refetch |
| `new_notification` | Server → User room | Notification document | Generic persistent-notification push |

---

## Authorization Model

Workspace access is enforced by rank, not by three separate hardcoded checks:

```js
const ROLE_RANK = { member: 1, admin: 2, owner: 3 };
```

Middleware pipeline (`workspaceRBAC.middleware.js`):

1. **`loadWorkspace`** — validates `:workspaceId`, loads the workspace, 404s if missing.
2. **`resolveWorkspaceRole`** — determines the caller's role (`owner` | `admin` | `member` | `null`).
3. **`requireMinimumRole(role)`** — 403s unless the caller's rank meets the threshold.

Three ready-made bundles cover every route: `requireWorkspaceMember`, `requireWorkspaceManager` (admin+), `requireWorkspaceOwner`. Business rules that aren't purely about access level (e.g. "the owner can't leave their own workspace") are intentionally kept in the controller rather than the middleware, since the owner passes every rank check by design.

---

## Data Models

| Model | Purpose |
|---|---|
| `User` | Account record; supports local (bcrypt password) and Auth0 auth providers |
| `Session` | One document per logged-in device; holds a bcrypt-hashed refresh token, IP, user agent, and TTL-based auto-expiry |
| `LoginActivity` | Immutable audit log of every login attempt (success and failure), including auth provider |
| `Workspace` | A shared team space; tracks only `name` and `owner` |
| `WorkspaceMember` | Join table between `User` and `Workspace`; carries `role` (`admin`/`member`) and `status` (`active`/`removed`) — the owner also holds a row here so a single collection is the source of truth for membership |
| `Invite` | Pending/accepted/declined/expired/cancelled invitation, tied to an email and a proposed role, with a 7-day expiry |
| `Todo` | A task scoped to a workspace |
| `Notification` | Persistent, per-user notification record |

---

## Security Notes

- **Password hashing**: bcrypt, salted, via Mongoose pre-save hooks.
- **Refresh tokens are never stored in plaintext**: `Session.refreshToken` is bcrypt-hashed; the JWT embeds the session's `_id` so it can be looked up and verified without a plaintext comparison.
- **No refresh-token rotation** (by design, current tradeoff): a refresh token stays valid until its own expiry rather than being replaced on each use. Revisit this if you need tighter compromise-recovery guarantees.
- **Dedicated reset-token secret**: `RESET_PASSWORD_TOKEN_SECRET` is isolated from `ACCESS_TOKEN_SECRET`/`REFRESH_TOKEN_SECRET` so a leak of one can't be used to forge the others, and so it can be rotated independently without invalidating active sessions.
- **OTP flows never trust client-supplied identity alone**: the forgot-password flow requires a short-lived, signed, single-purpose token issued only after OTP verification — a bare email address is never sufficient to change a password.
- **Email enumeration protection**: `forgot-password` returns the same response whether or not the email is registered.
- **Full audit trail**: every login attempt (not just successes) is recorded with IP, device, and provider.

---

## Scripts

<!-- TODO: confirm these match your actual package.json -->

```bash
npm run dev      # start with hot reload (nodemon / vite)
npm run build    # production build (frontend)
npm start        # start production server (backend)
npm run lint     # lint the codebase
```

---

## Deployment

<!-- TODO: fill in your actual deployment target(s) -->

- Backend: containerize with Docker and deploy to your platform of choice (Render, Railway, Fly.io, EC2, etc.). Ensure `MONGODB_URI` points at a replica-set-enabled cluster if you later add multi-document transactions.
- Frontend: static build deployed to Vercel/Netlify/Cloudflare Pages, or served behind the same reverse proxy as the API.
- Set `secure: true` cookies only behind HTTPS; ensure `CORS_ORIGIN` matches your deployed frontend origin exactly.

---

## Roadmap

- [ ] Workspace ownership transfer (currently an owner can never leave or be demoted)
- [ ] Refresh-token rotation option for higher-security deployments
- [ ] Rate limiting on auth endpoints
- [ ] Automated test suite (unit + integration)

---

