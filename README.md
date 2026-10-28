# 🐾 Pawsome Match — Full-Stack Pet Adoption Portal with MongoDB

A full-stack, beginner-friendly **Pet Adoption Portal** built with **HTML5, CSS3, JavaScript (ES6+), and jQuery (v3.7.1)** on the frontend, and **Node.js, Express, and MongoDB (via Mongoose)** on the backend.

Includes full compatibility with **MongoDB Compass** for visual database exploration and management.

---

## 🌟 Key Features

1. **MongoDB NoSQL Database**:
   - `pets` collection: Stores pet species, breed, age, size, photo URL, personality tags, care requirements, and adoption status.
   - `adoptions` collection: Stores adoption inquiries submitted by visitors with reference to the target pet.
2. **Mongoose Models**:
   - Clean, structured schemas with data validation and timestamps (`models/Pet.js` and `models/Adoption.js`).
3. **Automatic & Manual Seeding**:
   - Automatically populates starter pets into MongoDB upon initial server startup if the database is empty.
   - Manual reset command: `npm run seed`.
4. **RESTful Express API**:
   - `GET /api/pets`: Fetches pets from MongoDB with search and filtering (`?species=dog`, `?search=milo`, etc.).
   - `GET /api/pets/:id`: Fetches a specific pet by ID.
   - `POST /api/adoptions`: Inserts new adoption inquiries into MongoDB.
   - `GET /api/adoptions`: Displays all submitted applications.
   - `GET /api/health`: Real-time health check reporting MongoDB connection status.
5. **Dynamic Frontend with Live DB Status**:
   - Navbar status pill shows live state: `● MongoDB Connected` vs `● Offline / Demo`.
   - Automatic graceful fallback: If MongoDB is offline, the portal automatically displays built-in demo pets so the UI never crashes.

---

## 📂 Project Structure

```text
pet-adoption-portal/
├── models/
│   ├── Pet.js         # Mongoose schema for pets
│   └── Adoption.js    # Mongoose schema for adoption applications
├── seed.js            # Standalone MongoDB database seed script
├── server.js          # Express server & REST API routes
├── db.js              # Mongoose connection & auto-seed diagnostics
├── .env               # Database URI & port configuration
├── .env.example       # Example template for .env
├── package.json       # Node.js dependencies (express, mongoose, cors, dotenv)
├── index.html         # Frontend HTML5 structure & modals
├── style.css          # Modern CSS styling with CSS variables & responsive layout
├── app.js             # Frontend jQuery logic & API communication
└── README.md          # Full setup & MongoDB Compass guide
```

---

## 🍃 MongoDB Compass & Setup Guide

### Step 1: Confirm MongoDB is Running
MongoDB is already installed and running on your system at `127.0.0.1:27017`.
The connection string in [`.env`](file:///C:/Users/IRASH/.gemini/antigravity/scratch/pet-adoption-portal/.env) is:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/pet_adoption_db
PORT=3000
```

---

### Step 2: Seed the Database (Optional)
Starter pets will automatically seed when the server launches, but you can also manually seed/reset anytime:
```powershell
cd C:\Users\IRASH\.gemini\antigravity\scratch\pet-adoption-portal
npm run seed
```

---

### Step 3: Start the Backend Server
```powershell
cd C:\Users\IRASH\.gemini\antigravity\scratch\pet-adoption-portal
npm start
```

You will see:
```text
🐾 Pawsome Match server running at http://localhost:3000
✅ Connected to MongoDB successfully!
   Host: 127.0.0.1 | Database: pet_adoption_db
```

---

### Step 4: Open the Website
Visit [**http://localhost:3000**](http://localhost:3000).

- The navbar will show **`● MongoDB Connected`** in green.
- All pet cards are rendered directly from your MongoDB `pets` collection.

---

### Step 5: View Your Data in MongoDB Compass
1. Open **MongoDB Compass**.
2. In the "New Connection" field, paste:
   ```text
   mongodb://127.0.0.1:27017
   ```
3. Click **Connect**.
4. In the left navigation, click on **`pet_adoption_db`**.
5. You will see two collections:
   - 📄 **`pets`**: Click to see all rescue pet documents (Milo, Luna, Barnaby, etc.).
   - 📄 **`adoptions`**: Submit an adoption form on the website, then click **Refresh** in Compass to see the new document appear in real time!

---

## 🛠️ REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Returns server health and MongoDB connection status |
| `GET` | `/api/pets` | Returns pets (supports `?species=dog`, `?ageGroup=young`, `?search=milo`) |
| `GET` | `/api/pets/:id` | Returns single pet by ID |
| `POST` | `/api/adoptions` | Saves an adoption application to the `adoptions` collection |
| `GET` | `/api/adoptions` | Returns all submitted adoption applications |
