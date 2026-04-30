# 🌍 Storiy Board

A modern single-page web application for sharing stories enriched with location data. Users can create, explore, and interact with stories displayed on an interactive map.

---

## ✨ Features

- 📖 View all shared stories in a responsive grid
- 📍 Interactive map integration for story locations
- ➕ Add new stories with:
  - Description
  - Photo upload or camera capture
  - Location selection via map
- 🔐 Authentication (Login & Register)
- ♿ Accessibility support (keyboard navigation & skip-to-content)
- 📱 Fully responsive design

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla JavaScript (SPA architecture)
- **Styling:** Tailwind CSS
- **Map:** Leaflet + OpenStreetMap / MapTiler
- **Routing:** Hash-based routing
- **Build Tool:** Vite

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd <your-project-folder>
```

---

### 2. Install dependencies

```bash
npm install
```

---

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```env
VITE_MAP_SERVICE_API_KEY=your_api_key_here
```

> ⚠️ Make sure the variable starts with `VITE_` so it can be accessed in the frontend.

---

### 4. Run development server

```bash
npm run dev
```

Open in browser:

```
http://localhost:5173
```

---

## 🗺️ Map Service

This project uses a geocoding service for converting coordinates into location names.

- If using MapTiler or similar service, an API key is required.
- If using OpenStreetMap only, API key may not be necessary.

Refer to `STUDENT.txt` for API key (if required).

---

## ♿ Accessibility

This application includes:

- Keyboard-accessible navigation
- Skip-to-content functionality
- Proper semantic HTML usage
- Focus management on route change

---

## 🔐 Security Notes

- API keys are **not hardcoded**
- Stored in `.env` and excluded via `.gitignore`
- Use domain restrictions on your API provider

---

## 📦 Build for Production

```bash
npm run build
```

---

## 👤 Author

**Ayu Novianingrum**

---

## 📜 License

This project is for educational purposes.
