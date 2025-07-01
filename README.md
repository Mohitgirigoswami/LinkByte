# LinkByte: A Full-Stack Social Media Platform

**Live Demo:** [https://link-byte-nine.vercel.app/](https://link-byte-nine.vercel.app/)

This is a personal project demonstrating a full-stack, distributed social media application. The architecture is intentionally decoupled to explore the interaction between different services.

---

## Core Technology Stack

*   **Backend:** Python, Flask, SQLAlchemy
*   **Frontend:** React, Vite, Tailwind CSS
*   **Real-time Service:** Node.js, Socket.IO
*   **Database:** PostgreSQL
*   **Cache / Rate Limiter:** Redis
*   **Media Storage:** Cloudinary

---

## Architectural Diagram

The system is composed of three primary services that communicate via REST APIs and WebSockets.

```mermaid
flowchart TD
    %% --- Styling Definitions (Modern Theme) ---
    classDef userDevice fill:#e0f7fa,stroke:#00796b,stroke-width:2px,color:#004d40;
    classDef backendService fill:#f1f8e9,stroke:#558b2f,stroke-width:2px,color:#33691e;
    classDef externalService fill:#fff8e1,stroke:#ff8f00,stroke-width:2px,stroke-dasharray: 5 5,color:#e65100;
    classDef dbStyle fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px,color:#4a148c;
    classDef cacheStyle fill:#e8eaf6,stroke:#3949ab,stroke-width:2px,color:#1a237e;

    %% --- Component Definitions & Subgraphs ---
    subgraph " "
        direction LR
        subgraph "User's Device"
            direction TB
            User["<div style='font-size: 24px; margin-bottom: 8px;'></div>User/Client (Browser)"]
            Frontend["<div style='font-size: 24px; margin-bottom: 8px;'></div>Frontend (React SPA)"]
        end

        subgraph "Backend Services"
            direction TB
            Backend["<div style='font-size: 24px; margin-bottom: 8px;'></div>Backend (Flask API)"]
            SocketServer["<div style='font-size: 24px; margin-bottom: 8px;'></div>WebSocket Server (Node.js)"]
            Database[("<div style='font-size: 24px; margin-bottom: 8px;'></div>Database (PostgreSQL)")]
            Cache["<div style='font-size: 24px; margin-bottom: 8px;'></div>Cache / Rate Limiter (Redis)"]
        end

        subgraph "External Cloud Services"
            direction TB
            MediaStorage["<div style='font-size: 24px; margin-bottom: 8px;'></div>Cloudinary (Media Storage)"]
            EmailService["<div style='font-size: 24px; margin-bottom: 8px;'></div>SMTP Email Service"]
        end
    end

    %% --- Connections ---

    User -- "Interacts with UI" --> Frontend
    Frontend -- "HTTPS/JSON API Calls" --> Backend
    
    Backend -- "CRUD Operations (SQL)" --> Database
    Backend -- "Caches Data / Checks Limits" --> Cache

    Frontend -- "Establishes WebSocket Connection" --> SocketServer
    SocketServer -- "Pushes Real-time Data" --> Frontend
    SocketServer -.->|Async| Backend

    Backend -- "Requests Signed Upload URL" --> MediaStorage
    Frontend -- "Uploads File Directly" --> MediaStorage

    Backend -- "Sends OTP/Notifications" --> EmailService

    %% --- Apply Styles ---
    class User,Frontend userDevice;
    class Backend,SocketServer backendService;
    class Database dbStyle;
    class Cache cacheStyle;
    class MediaStorage,EmailService externalService;

```

---

## Dummy User

*   **Username:** testuser
*   **Password:** Abcdef12

---

## Local Development Setup

Instructions to get all three services running locally.

### 1. Backend (`LinkByte-BACKEND`)

1.  `cd LinkByte-BACKEND`
2.  `python -m venv .venv`
3.  `.venv\Scripts\activate` (Windows) or `source .venv/bin/activate` (macOS/Linux)
4.  `pip install -r requirements.txt`
5.  Create a `.env` file from `.env.example` and populate the variables.
6.  `python App.py`

### 2. Frontend (`LinkByte-FRONTEND`)

1.  `cd LinkByte-FRONTEND`
2.  `npm install`
3.  Create a `.env` file from `.env.example`.
4.  `npm run dev`

### 3. WebSocket Server (`LinkByte-SOCKET`)

1.  `cd LinkByte-SOCKET`
2.  `npm install`
3.  Create a `.env` file from `.env.example`.
4.  `npm start`

---

## Project Status & Developer Notes

*   **API Definition:** The backend API is defined directly within the Flask route files. For endpoint details, refer to the source code in `LinkByte-BACKEND/routes/` and `LinkByte-BACKEND/Routes.py`. There is no separate, auto-generated documentation at this time.

*   **Testing:** A formal testing suite has not yet been implemented. This is a primary goal for future development to ensure code reliability.

---

## License

MIT License
