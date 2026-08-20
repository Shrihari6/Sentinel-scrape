# 🤝 Contributing to SentinelScrape

Thank you for your interest in contributing to **SentinelScrape**! This guide will walk you through setting up the project locally, running it with Docker, understanding the architecture, and submitting your contributions.

---

## 📋 Table of Contents
1. [Prerequisites](#-prerequisites)
2. [Quickstart with Docker](#-quickstart-with-docker)
3. [Local Development Setup](#-local-development-setup)
4. [Project Architecture Overview](#-project-architecture-overview)
5. [Contributing Guidelines & Workflow](#-contributing-guidelines--workflow)
6. [Troubleshooting & FAQs](#-troubleshooting--faqs)

---

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js**: `v20.x` or higher ([Download Node.js](https://nodejs.org/))
- **npm**: `v10.x` or higher (comes bundled with Node.js)
- **Git**: Latest version ([Download Git](https://git-scm.com/))
- *(Optional)* **Docker**: Docker Desktop or Docker Engine ([Download Docker](https://www.docker.com/))

---

## 🐳 Quickstart with Docker

If you want to quickly test or run SentinelScrape without configuring a local Node environment:

### Option A: Build and Run Locally with Docker

```bash
# 1. Clone the repository
git clone https://github.com/your-username/Sentinel-scrape.git
cd Sentinel-scrape

# 2. Build the Docker image
docker build -t sentinel-scrape .

# 3. Run the Docker container
docker run -d -p 5000:5000 -p 5173:5173 --name sentinel-app sentinel-scrape
```

### Option B: Docker Pull (if image hosted on Docker Hub)

```bash
# Pull the pre-built image
docker pull your-dockerhub-username/sentinel-scrape:latest

# Run the container
docker run -d -p 5000:5000 -p 5173:5173 your-dockerhub-username/sentinel-scrape:latest
```

Once running, access:
- **Frontend Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Socket.io Server / Health API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 💻 Local Development Setup

To make changes to the code, set up a local development environment:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Sentinel-scrape.git
cd Sentinel-scrape
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration (Optional)
Create a `.env` file in the root directory if you want to override default settings:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
COLLECTOR_ID=c_mp7x8a9b2c0d1e2f
```

### 4. Start Development Servers
Run both the Socket.io backend server and the Vite React frontend concurrently:

```bash
npm run start:all
```

Alternatively, you can run them in separate terminal tabs:

**Terminal 1 (Backend Server)**:
```bash
npm run server
```

**Terminal 2 (React Frontend)**:
```bash
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🏗️ Project Architecture Overview

```
Sentinel-scrape/
├── Dockerfile               # Production Docker container manifest
├── .dockerignore            # Docker ignore file
├── package.json             # Root scripts & dependencies
├── vite.config.js           # Vite React & server proxy configuration
├── tailwind.config.js       # Neomorphism color & shadow tokens
├── index.html               # Entry HTML template
├── server/                  # Node.js + Express + Socket.io Backend
│   ├── index.js             # HTTP server entry point & Socket initialization
│   ├── services/
│   │   └── brightdata.js   # Bright Data SDK integration & multi-domain extractors
│   └── sockets/
│       └── scraperSocket.js # Socket.io event lifecycle & batch streaming handlers
└── src/                     # React Frontend (Rich Light Neomorphism Theme)
    ├── App.jsx              # Main Dashboard & Socket.io state manager
    ├── main.jsx             # React entrypoint
    ├── index.css            # Custom Neomorphism utility CSS classes
    └── components/
        ├── Header.jsx       # Top app bar with connection indicators
        ├── ScraperControl.jsx # Multi-domain target selector & search controls
        ├── LiveLogs.jsx     # Real-time socket stream terminal log
        └── DataGrid.jsx     # Adaptive cards gallery (Books, Jobs, Flights, Custom)
```

### Key Technologies
- **Frontend**: React 18, Vite, Tailwind CSS (Rich Light Neomorphism theme), Lucide Icons.
- **Backend**: Node.js, Express, Socket.io (WebSocket streaming), Axios, Cheerio.
- **Scraping Engine**: Bright Data Collector CLI / Web Scraper API with self-healing fallback handlers.

---

## 🌿 Contributing Guidelines & Workflow

We welcome all contributions! Follow these steps to submit a feature or fix:

### 1. Create a Feature Branch
Branch off `main` using a descriptive name:
```bash
git checkout -b feature/your-feature-name
# or for bug fixes:
git checkout -b fix/your-bug-fix
```

### 2. Make Your Changes & Test
- Keep code clean, readable, and well-commented.
- Ensure Neomorphism UI aesthetics (`.neo-card`, `.neo-panel`, `.neo-pill`) are maintained.
- Run `npm run build` to ensure the project builds without errors.

```bash
npm run build
```

### 3. Commit Your Changes
Use conventional commit messages:
```bash
git add .
git commit -m "feat: add support for new dataset domain"
```

### 4. Push & Open a Pull Request (PR)
```bash
git push origin feature/your-feature-name
```
Then navigate to the repository on GitHub and click **"New Pull Request"**. Describe your changes clearly!

---

## ❓ Troubleshooting & FAQs

**Q: Port 5000 or 5173 is already in use.**
- Change `PORT` in `.env` or run with an alternative port:
  ```bash
  PORT=5001 npm run server
  ```

**Q: Bright Data CLI is not installed on my machine.**
- No worries! The project includes a self-healing fallback layer that extracts live target data seamlessly even if Bright Data CLI is not active locally.

---

Happy Coding! 🚀
