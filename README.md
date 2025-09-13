# POS-System

A modern Point-of-Sale (POS) system for restaurants and retail, built with React (frontend) and Node.js/Express/Sequelize (backend).

## Features
- Multi-branch management
- Product and category management
- Company contact information (address, phone, email)
- Staff and table management
- Order and payment processing
- Dashboard with sales and activity stats
- Branch-based filtering for products and categories

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express, Sequelize ORM
- **Database:** PostgreSQL

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/TheUnknown550/POS-System.git
   cd POS-System
   ```
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Database Setup
1. Configure your database in `backend/config/config.json`.
2. Run migrations:
   ```bash
   cd backend
   npm run migrate
   ```
3. (Optional) Seed demo data:
   ```bash
   npm run seed
   ```

### Running the App
- Start the backend server:
  ```bash
  cd backend
  npm run dev
  ```
- Start the frontend:
  ```bash
  cd frontend
  npm run dev
  ```

## API Documentation
See `backend/API_DOCUMENTATION.md` for full API details.

## Folder Structure
```
POS-System/
  backend/    # Node.js/Express API & models
  frontend/   # React app
```

## Contributing
Pull requests are welcome! For major changes, please open an issue first.

## License
MIT

