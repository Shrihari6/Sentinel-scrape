v1
# Architecture.md

**SentinelScrape Engine — System Architecture**

*Version: 1.0.0 | Last updated: August 2026*

---

## 1. System Overview

SentinelScrape is a decoupled two-app system—a React/Vite frontend dashboard and a Node.js/Express backend service—designed for automated e-commerce web scraping, layout drift detection, CLI-driven self-healing, and low-latency metrics caching.

```text
┌─────────────────────────────────────────────────────────────┐
│  Browser Dashboard (React / Vite — Port 5173)              │
│                                                             │
│  ┌───────────────┐   ┌─────────────────┐   ┌─────────────┐  │
│  │ System Header │   │ LivePriceTable  │   │ PriceChart  │  │
│  │ (Trigger/Stat)│   │ (Redis Hot Data)│   │ (Postgres)  │  │
│  └───────────────┘   └─────────────────┘   └─────────────┘  │
│          │                    │                   │         │
│          └────────────────────┼───────────────────┘         │
│                               ▼                             │
│                  src/services/api.js (HTTP Client)          │
└───────────────────────────────┼─────────────────────────────┘
                                │ HTTP REST (JSON)
                                ▼
┌─────────────────────────────────────────────────────────────┐
│  Node.js / Express Backend (Port 3000)                      │
│                                                             │
│  cors → express.json() → Router / Controllers               │
│                                                             │
│  ┌──────────────────────────┐    ┌────────────────────────┐ │
│  │ scraperController.js     │    │ scheduler.js           │ │
│  │ GET /api/products/live   │    │ (Cron Scrape Loop)     │ │
│  │ GET /api/audit/healing   │    └───────────┬────────────┘ │
│  └────────────┬─────────────┘                │              │
│               │                              ▼              │
│               │                  detector.js (Tier 2 Check) │
│               │                              │              │
│               │                    ┌─────────┴──────────┐   │
│               │                    ▼                    ▼   │
│               │             brightdata.js          healer.js│
│               │             (Child Process)       (CLI Heal)│
│               │                    │                    │   │
│               ▼                    ▼                    │   │
│  ┌──────────────────────────┐   ┌───────────────────────┴─┐ │
│  │ Redis (Hot Cache — 3h)   │   │ Postgres (Audit Log &   │ │
│  │ live:product:{id}        │   │ Price History DB)       │ │
│  └──────────────────────────┘   └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

```

---

## 2. App Flow

### 2.1 Automated Scrape & Tier 2 Validation Cycle

* **Scheduled Trigger:** `scheduler.js` executes the recurring loop based on `SCRAPE_INTERVAL_MINUTES`.
* **CLI Scrape Call:** `brightdata.js` spawns a child process executing `bdata scraper run <COLLECTOR_ID> <TARGET_URL> --pretty`.
* **Validation Inspection:** Output payload passes to `detector.js` to evaluate structural integrity:
* **Shape Validation:** Verifies required keys (`item_id`, `primary_value`, `status`) exist and match target data types.
* **Volume Drop Check:** Compares total extracted rows against historical run averages in Redis (`> 40%` drop flags an anomaly).
* **Staleness Check:** Assesses if consecutive identical values indicate anti-bot caching or blocked responses.


* **Storage Dispatch:** If validation passes:
* Raw records are written to Redis (`live:product:{id}`) with a 3-hour TTL (`10800`s).
* Historical trends are written to the Postgres `price_history` table.



### 2.2 Self-Healing Pipeline Execution

* **Anomaly Detection:** If `detector.js` returns `isValid: false`, `healer.js` intercepts the payload.
* **Audit Pending Log:** An entry is inserted into Postgres `healing_events` with status `PENDING`.
* **Automated Repair Command:** `healer.js` executes `bdata scraper heal <COLLECTOR_ID> "<prompt>" --auto-approve` via Node child process.
* **Verification Re-run:** A test scrape runs against the target URL post-healing.
* **Audit Resolution:** If successful, Postgres `healing_events` updates to `HEALED`; otherwise, status updates to `FAILED`.

### 2.3 Manual Trigger & Dashboard Synchronization

* **Client Action:** User clicks "Trigger Scrape" in `Header.jsx`, firing `POST /api/trigger`.
* **Execution:** Backend interrupts normal wait state and immediately runs `runScrapeCycle()`.
* **UI Polling Sync:** Dashboard `App.jsx` polling engine (`10s` loop) pulls fresh datasets from `/api/products/live` and `/api/audit/healing`, re-rendering the tables and timeline charts without page reloads.

---

## 3. Tech Stack — Detailed

### Frontend

| Technology | Version | Purpose |
| --- | --- | --- |
| **React** | 18.x | Component-driven UI framework for dashboard rendering |
| **Vite** | 5.x | High-performance client bundler and HMR dev server |
| **Tailwind CSS** | 3.x | Utility-first styling for tables, badges, and layout grids |
| **Lucide React** | 0.x | Icon library for system state badges and control buttons |
| **Recharts / Chart.js** | 2.x | Historical price trend visualization over time |

### Backend

| Technology | Version | Purpose |
| --- | --- | --- |
| **Node.js** | 20.x+ | Runtime executing ES Modules (`import/export`) architecture |
| **Express** | 4.x | HTTP REST API router handling client requests |
| **Redis Client (`redis`)** | 4.x | Low-latency in-memory hot cache for active scraped listings |
| **Postgres Client (`pg`)** | 8.x | Relational cold storage driver for logs and historical metrics |
| **Bright Data CLI** | Latest | External scraper generator and repair engine (`@brightdata/cli`) |
| **dotenv** | 16.x | Runtime environment variable manager |

### Storage & Infrastructure

| Service | Hosting | Storage Domain |
| --- | --- | --- |
| **Redis** | Local Docker / Upstash | Key-value store for live products (3-hr TTL) and last 5 run logs |
| **PostgreSQL** | Local Docker / Neon | Relational tables (`runs`, `price_history`, `healing_events`) |
| **Bright Data Studio** | Managed Cloud | External CLI scraper host and AI self-healing service |

---

## 4. Folder & File Structure

```text
sentinel-scrape/
├── backend/
│   ├── src/
│   │   ├── app.js                   # Express initialization, CORS, routing, boot logic
│   │   ├── config/
│   │   │   └── env.js               # Environment variable verification on startup
│   │   ├── controllers/
│   │   │   └── scraperController.js # Endpoint handlers (/live, /history, /healing, /trigger)
│   │   ├── db/
│   │   │   ├── postgres.js          # Postgres client connection pool & query methods
│   │   │   └── redis.js             # Redis client wrapper & TTL caching helpers
│   │   ├── jobs/
│   │   │   └── scheduler.js         # Interval execution engine for scrape cycles
│   │   └── services/
│   │       ├── brightdata.js        # Child process wrapper for bdata run/heal CLI
│   │       ├── detector.js          # Tier 2 payload shape & volume validation engine
│   │       └── healer.js            # Self-healing orchestrator & audit state manager
│   ├── .env                         # DB credentials & Bright Data API keys (local only)
│   ├── .env.example                 # Environment template
│   └── package.json                 # Backend dependencies & script definitions
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx           # Platform health badge & manual trigger button
│   │   │   ├── LivePriceTable.jsx   # Live cached product grid renderer
│   │   │   ├── PriceChart.jsx       # Historical price trend visualization
│   │   │   └── HealingAuditLog.jsx  # Audit log feed for self-healing events
│   │   ├── services/
│   │   │   └── api.js               # Axios/Fetch HTTP client module & mock toggles
│   │   ├── App.jsx                  # Main dashboard view assembly & polling engine
│   │   └── main.jsx                 # Vite application entry point
│   ├── index.html                   # HTML template
│   ├── vite.config.js               # Vite build and proxy configuration
│   └── package.json                 # Frontend dependencies & dev scripts
│
├── .gitignore                       # Git ignore declarations
└── README.md                        # Documentation & hackathon submission overview

```

---

## 5. Data Flow Contracts

### API Endpoints

#### `GET /api/products/live`

* **Response:**
```json
{
  "success": true,
  "timestamp": "2026-08-19T14:00:00.000Z",
  "data": [
    {
      "item_id": "p-101",
      "title": "UltraBook Pro 15",
      "primary_value": 1299.99,
      "currency": "USD",
      "status": "active",
      "metadata": { "brand": "TechCorp", "rating": 4.7 },
      "scraped_at": "2026-08-19T13:58:12.000Z"
    }
  ]
}

```



#### `GET /api/products/:id/history`

* **Response:**
```json
{
  "success": true,
  "item_id": "p-101",
  "data": [
    { "recorded_at": "2026-08-18T12:00:00.000Z", "primary_value": 1349.99, "status": "active" },
    { "recorded_at": "2026-08-19T12:00:00.000Z", "primary_value": 1299.99, "status": "active" }
  ]
}

```



#### `GET /api/audit/healing`

* **Response:**
```json
{
  "success": true,
  "data": [
    {
      "event_id": "h-501",
      "collector_id": "c_9x821a",
      "reason": "Missing primary_value key across 80% of rows",
      "prompt": "Extract price from span.new-price selector",
      "rows_before": 2,
      "rows_after": 25,
      "status": "HEALED",
      "created_at": "2026-08-19T10:15:00.000Z"
    }
  ]
}

```



#### `POST /api/trigger`

* **Request:** `{}`
* **Response:**
```json
{
  "success": true,
  "message": "Manual scrape cycle triggered successfully",
  "timestamp": "2026-08-19T14:02:10.000Z"
}

```