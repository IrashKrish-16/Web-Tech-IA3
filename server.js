/**
 * ============================================================================
 * EXPRESS REST API SERVER WITH MONGODB (server.js)
 * ============================================================================
 * Serves the frontend static files (HTML, CSS, JS) and provides REST API
 * endpoints backed by MongoDB via Mongoose.
 * 
 * Endpoints:
 * - GET  /api/health       -> Health check and MongoDB connection status
 * - GET  /api/pets         -> List pets with optional query filters
 * - GET  /api/pets/:id     -> Get a specific pet by ID
 * - POST /api/adoptions    -> Submit an adoption inquiry
 * - GET  /api/adoptions    -> View submitted adoption inquiries (admin/debug)
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, getConnectionStatus } = require('./db');
const Pet = require('./models/Pet');
const Adoption = require('./models/Adoption');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static frontend files (index.html, style.css, app.js) directly
app.use(express.static(path.join(__dirname)));

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * 1. Health & Connection Status
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  const dbStatus = getConnectionStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

/**
 * 2. Get Pets with Optional Filtering
 * GET /api/pets?species=dog&ageGroup=young&gender=Male&search=milo
 */
app.get('/api/pets', async (req, res) => {
  try {
    const { species, ageGroup, gender, search } = req.query;

    // Build MongoDB query filter
    const query = {};

    // Filter by species if provided and not "all"
    if (species && species !== 'all') {
      query.species = species.toLowerCase();
    }

    // Filter by ageGroup if provided and not "all"
    if (ageGroup && ageGroup !== 'all') {
      query.ageGroup = ageGroup.toLowerCase();
    }

    // Filter by gender if provided and not "all"
    if (gender && gender !== 'all') {
      query.gender = gender;
    }

    // Filter by search text (case-insensitive regex match against name, breed, or tags)
    if (search && search.trim() !== '') {
      const termRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: termRegex },
        { breed: termRegex },
        { tags: termRegex }
      ];
    }

    // Execute query in MongoDB sorted by pet ID
    const pets = await Pet.find(query).sort({ id: 1 });
    res.json(pets);
  } catch (err) {
    console.error('Error fetching pets from MongoDB:', err.message);
    res.status(500).json({
      error: 'Failed to retrieve pets from MongoDB',
      details: err.message
    });
  }
});

/**
 * 3. Get Single Pet by ID
 * GET /api/pets/:id
 */
app.get('/api/pets/:id', async (req, res) => {
  try {
    const petId = parseInt(req.params.id, 10);
    const pet = await Pet.findOne({ id: petId });

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    res.json(pet);
  } catch (err) {
    console.error('Error fetching pet details:', err.message);
    res.status(500).json({ error: 'Failed to retrieve pet', details: err.message });
  }
});

/**
 * 4. Submit Adoption Application
 * POST /api/adoptions
 */
app.post('/api/adoptions', async (req, res) => {
  try {
    const { petId, name, email, phone, housing, hasPets, message } = req.body;

    // Validate required fields
    if (!petId || !name || !email || !phone || !housing) {
      return res.status(400).json({
        error: 'Missing required fields (petId, name, email, phone, housing)'
      });
    }

    // Look up pet name for reference
    const pet = await Pet.findOne({ id: parseInt(petId, 10) });

    // Create adoption document in MongoDB 'adoptions' collection
    const adoption = await Adoption.create({
      petId: parseInt(petId, 10),
      petName: pet ? pet.name : 'Unknown',
      applicantName: name,
      applicantEmail: email,
      applicantPhone: phone,
      housingType: housing,
      hasPets: hasPets || 'none',
      message: message || '',
      status: 'pending'
    });

    console.log(`📥 New adoption application stored in MongoDB for Pet #${petId} (${adoption.petName}) from ${name}`);

    res.status(201).json({
      success: true,
      message: 'Adoption application successfully recorded in MongoDB database!',
      applicationId: adoption._id
    });
  } catch (err) {
    console.error('Error recording adoption application:', err.message);
    res.status(500).json({
      error: 'Failed to submit application',
      details: err.message
    });
  }
});

/**
 * 5. View Submitted Applications (Admin / Verification)
 * GET /api/adoptions
 */
app.get('/api/adoptions', async (req, res) => {
  try {
    const adoptions = await Adoption.find().sort({ submittedAt: -1 });
    res.json(adoptions);
  } catch (err) {
    console.error('Error fetching adoptions from MongoDB:', err.message);
    res.status(500).json({ error: 'Failed to fetch adoptions', details: err.message });
  }
});

// Start Express Server and Connect to MongoDB
app.listen(PORT, async () => {
  console.log(`\n🐾 Pawsome Match server running at http://localhost:${PORT}`);
  console.log(`   Frontend: http://localhost:${PORT}`);
  console.log(`   API Health: http://localhost:${PORT}/api/health`);
  console.log(`   API Pets: http://localhost:${PORT}/api/pets`);
  console.log(`   API Adoptions: http://localhost:${PORT}/api/adoptions\n`);

  // Connect to MongoDB
  await connectDB();
});
