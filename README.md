# ⚡ SentinelScrape

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-v18.2.0-blue.svg)](https://reactjs.org/)
[![Socket.io](https://img.shields.io/badge/socket.io-v4.7.5-indigo.svg)](https://socket.io/)
[![Tailwind CSS](https://img.shields.io/badge/tailwind-neomorphism-cyan.svg)](https://tailwindcss.com/)
[![Docker Ready](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)

**SentinelScrape** is a real-time, multi-domain web scraping and monitoring platform built with Node.js, Express, Socket.io, and a **Rich Light Neomorphism (Soft UI)** React dashboard. Integrated with Bright Data collector architectures, it features self-healing extraction fallbacks, dynamic multi-page crawling, and chunked real-time WebSocket streaming.

---

## ✨ Features

- **⚡ Real-Time Socket.io Event Streaming**: Replaced traditional polling loops with real-time WebSocket event streams (`scrape:progress`, `scrape:batch_data`, `scrape:complete`).
- **🎨 Rich Light Neomorphism UI**: Clean, soft-UI tactile aesthetic with extruded cards, pressed buttons, inset input fields, and charcoal typography (`#1D2434`).
- **🛡️ Self-Healing Extraction Layer**: Isolated item parsing, retry policies, and guaranteed terminal lifecycle safety so the UI never hangs.
- **🌐 Multi-Domain Dataset Support**:
  - **Books**: `books.toscrape.com` multi-page crawler with category & keyword filters.
  - **LinkedIn Jobs**: Job listings with company, location, salary range, and apply links.
  - **Google Flights**: Flight schedules with airlines, routes, departure/arrival times, and stops.
  - **Custom**: Generic extractor for custom targets.
- **🐳 Docker Ready**: Single command Docker build and execution.

---

## 🚀 Quickstart with Docker

```bash
# Clone repository
git clone https://github.com/your-username/Sentinel-scrape.git
cd Sentinel-scrape

# Build Docker image
docker build -t sentinel-scrape .

# Run container
docker run -d -p 5000:5000 -p 5173:5173 --name sentinel-app sentinel-scrape
```

Access the app at:
- **Dashboard**: [http://localhost:5173](http://localhost:5173)
- **Health Endpoint**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 💻 Local Setup & Development

```bash
# 1. Clone repository
git clone https://github.com/your-username/Sentinel-scrape.git
cd Sentinel-scrape

# 2. Install dependencies
npm install

# 3. Run full-stack servers
npm run start:all
```

---

## 📖 Contributing

For detailed setup instructions, project architecture details, and pull request guidelines, please refer to **[CONTRIBUTING.md](CONTRIBUTING.md)**.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
