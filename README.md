# Team Dark Devil - Enterprise Microjob & Worker Management Platform

An advanced, full-stack microjob, email/SMS sending team management, and operations control platform built with **React 19**, **Vite**, **Express**, **Tailwind CSS**, and **Neon PostgreSQL**, integrated with Cloudflare R2 storage and automated disaster recovery.

---

## 🚀 Key Features

- **🛡️ Enterprise Admin & Leader Control Center**:
  - Secure multi-tier authentication (`dd_admin_users` and `dd_users`).
  - Real-time management of workers, jobs, microjob submissions, tutorials, tools, and automation scripts.
- **📊 Advanced Data Pipeline & Excel Ingestion**:
  - Direct XLSX / CSV data file processing and bulk data assignment.
- **💾 System Backup & Disaster Recovery Engine**:
  - One-click Neon PostgreSQL full database snapshots & table dumps.
  - Cloudflare R2 file catalog and asset manifest backups.
  - Interactive JSON upload & safe schema synchronization restore engine with real-time progress indicators.
- **⚡ Modern Dark Theme UI**:
  - High-contrast, dense, and space-efficient compact dark theme designed for operations teams.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS (v4), Lucide React, Framer Motion.
- **Backend**: Node.js, Express, TypeScript, `pg` (PostgreSQL client).
- **Storage & Database**: Neon Serverless PostgreSQL, Cloudflare R2 S3 API.
- **Build System**: Vite + ESBuild server bundling.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (refer to `.env.example`):

```env
DATABASE_URL=postgres://user:password@host:port/dbname?sslmode=require
GEMINI_API_KEY=your_gemini_api_key_here
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
```

---

## 📦 Installation & Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/team-dark-devil-platform.git
   cd team-dark-devil-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
