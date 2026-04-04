# AgroSeva Deployment Guide

This guide provides step-by-step instructions for deploying the AgroSeva platform to production using **Vercel** and **Render**.

---

## 1. Prerequisites

Before starting, ensure you have accounts and projects created for:
- [Vercel](https://vercel.com/) (Frontend)
- [Render](https://render.com/) (Backends)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Database)
- [Upstash Redis](https://upstash.com/) (Queue & Cache)
- [Cloudinary](https://cloudinary.com/) (Media Storage)

---

## 2. Database & Cache Setup

### MongoDB Atlas
1. Create a Shared Cluster (Free Tier).
2. Under "Network Access", allow access from `0.0.0.0/0` (Render's dynamic IPs).
3. Create a Database User with read/write permissions.
4. Copy your **Connection String** (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/agro_seva`).

### Upstash Redis
1. Create a Global Redis instance.
2. Copy the **Redis URL** (e.g., `redis://default:token@region.upstash.io:6379`).

---

## 3. Deploying Backends (Render)

### Phase A: AI Service (Flask)
1. In Render, create a **New Web Service**.
2. Connect your repository.
3. **Build Command**: `pip install -r ai-service/requirements.txt`
4. **Start Command**: `python ai-service/app.py`
5. **Environment Variables**:
   - `PORT`: `5002` (or your preferred port)
   - `ALLOWED_ORIGIN`: `https://your-backend-api.onrender.com` (The URL of the Node.js backend)
6. **Advanced Settings**: Select **Private Service** if you want it only reachable by the Node Backend.

### Phase B: Core Backend (Node.js)
1. In Render, create a **New Web Service**.
2. Connect your repository.
3. **Root Directory**: `backend`
4. **Build Command**: `npm install`
5. **Start Command**: `npm start`
6. **Environment Variables**:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: *(Your Atlas string)*
   - `BULL_REDIS_URL`: *(Your Upstash URL)*
   - `JWT_SECRET`: *(A long random string)*
   - `REFRESH_TOKEN_SECRET`: *(Another long random string)*
   - `AI_SERVICE_URL`: *(The internal/public URL of your AI service)*
   - `FRONTEND_URL`: `https://your-app.vercel.app`
   - `CLOUDINARY_CLOUD_NAME`: *(Your Cloudinary name)*
   - `CLOUDINARY_API_KEY`: *(Your key)*
   - `CLOUDINARY_API_SECRET`: *(Your secret)*

---

## 4. Deploying Frontend (Vercel)

1. Connect your repository to Vercel.
2. **Framework Preset**: Next.js.
3. **Internal Redirects**: (Optional but recommended) Ensure your API calls point to the Render backend.
4. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-api.onrender.com/api`

---

## 5. Security & Verification

## 6. Environment Variable Quick-Reference

Use this table to correctly link your services after deployment:

| Service | Platform | Variable Name | Value to Set (Example) |
| :--- | :--- | :--- | :--- |
| **Frontend** | Vercel | `NEXT_PUBLIC_API_URL` | `https://backend-api.onrender.com/api` |
| **Node Backend** | Render | `FRONTEND_URL` | `https://your-app.vercel.app` |
| **Node Backend** | Render | `AI_SERVICE_URL` | `http://ai-service-internal:5002` (Internal URL) |
| **Node Backend** | Render | `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| **Node Backend** | Render | `BULL_REDIS_URL` | `redis://default:token@region.upstash.io:6379` |
| **AI Service** | Render | `ALLOWED_ORIGIN` | `https://backend-api.onrender.com` |

---
**Your project is now ready for launch!** Follow the steps above to begin the process.
