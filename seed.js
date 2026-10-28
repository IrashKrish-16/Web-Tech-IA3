/**
 * ============================================================================
 * MONGODB SEED SCRIPT (seed.js)
 * ============================================================================
 * Populates the MongoDB 'pets' collection with sample rescue pets.
 * Can be run manually with:
 *    npm run seed
 * ============================================================================
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Pet = require('./models/Pet');

const initialPets = [
  {
    id: 1,
    name: "Milo",
    species: "dog",
    breed: "Golden Retriever Mix",
    ageGroup: "young",
    age: "1.5 years",
    gender: "Male",
    size: "Medium (45 lbs)",
    image: "images/milo.jpg",
    tags: ["Friendly", "Playful", "Good with Kids"],
    story: "Milo is a bundle of joy who loves games of fetch, swimming in shallow creeks, and snuggling on the rug after long walks. Fully vaccinated and eager to please!",
    compatibility: { kids: true, dogs: true, cats: true },
    vaccinated: true,
    neutered: true
  },
  {
    id: 2,
    name: "Luna",
    species: "cat",
    breed: "Domestic Short Hair",
    ageGroup: "young",
    age: "2 years",
    gender: "Female",
    size: "Small (9 lbs)",
    image: "images/luna.jpg",
    tags: ["Affectionate", "Calm", "Purr Machine"],
    story: "Luna is a gentle soul who loves sunny window sills, head scratches, and cardboard boxes. She is quiet, well-mannered, and litter-box trained.",
    compatibility: { kids: true, dogs: false, cats: true },
    vaccinated: true,
    neutered: true
  },
  {
    id: 3,
    name: "Barnaby",
    species: "dog",
    breed: "Beagle & Hound",
    ageGroup: "adult",
    age: "4 years",
    gender: "Male",
    size: "Medium (35 lbs)",
    image: "images/barnaby.jpg",
    tags: ["Curious", "Loyal", "Walk Enthusiast"],
    story: "Barnaby loves sniffing new trails and curling up by your feet. He is house-trained, knows basic commands like sit and stay, and loves peanut butter treats.",
    compatibility: { kids: true, dogs: true, cats: false },
    vaccinated: true,
    neutered: true
  },
  {
    id: 4,
    name: "Cleo",
    species: "cat",
    breed: "Calico",
    ageGroup: "baby",
    age: "5 months",
    gender: "Female",
    size: "Kitten (4 lbs)",
    image: "images/cleo.jpg",
    tags: ["Curious", "Playful", "Loves Toys"],
    story: "Cleo was rescued with her siblings and has blossomed into an energetic and cuddly kitten who will chase feather wands all afternoon.",
    compatibility: { kids: true, dogs: true, cats: true },
    vaccinated: true,
    neutered: false
  },
  {
    id: 5,
    name: "Ollie",
    species: "small",
    breed: "Holland Lop Rabbit",
    ageGroup: "young",
    age: "1 year",
    gender: "Male",
    size: "Small (3 lbs)",
    image: "images/ollie.jpg",
    tags: ["Gentle", "Quiet", "Herb Lover"],
    story: "Ollie is an indoor rabbit who loves fresh parsley, tunnels, and being gently stroked between his floppy ears. Litter-box trained!",
    compatibility: { kids: true, dogs: false, cats: false },
    vaccinated: true,
    neutered: true
  },
  {
    id: 6,
    name: "Bella",
    species: "dog",
    breed: "Labrador Retriever",
    ageGroup: "baby",
    age: "7 months",
    gender: "Female",
    size: "Medium (38 lbs)",
    image: "images/bella.jpg",
    tags: ["High Energy", "Smart", "Social"],
    story: "Bella is an intelligent young lab looking for an active owner who enjoys hiking and outdoor adventures. She learns new tricks in minutes!",
    compatibility: { kids: true, dogs: true, cats: true },
    vaccinated: true,
    neutered: true
  },
  {
    id: 7,
    name: "Jasper",
    species: "dog",
    breed: "Senior German Shepherd",
    ageGroup: "senior",
    age: "8.5 years",
    gender: "Male",
    size: "Large (68 lbs)",
    image: "images/jasper.jpg",
    tags: ["Gentle Giant", "House Trained", "Loyal"],
    story: "Jasper is a sweet senior who enjoys relaxed morning strolls and relaxing on a soft orthopedic bed. Perfect companion for a calm household.",
    compatibility: { kids: true, dogs: true, cats: false },
    vaccinated: true,
    neutered: true
  },
  {
    id: 8,
    name: "Pip & Squeak",
    species: "small",
    breed: "Guinea Pig Pair",
    ageGroup: "young",
    age: "1.5 years",
    gender: "Female",
    size: "Small (2 lbs)",
    image: "images/pip-squeak.jpg",
    tags: ["Bonded Pair", "Vocal", "Cute Chirps"],
    story: "Pip and Squeak are best friends and must be adopted together. They love fresh bell peppers, timothy hay, and chirping when you open the fridge!",
    compatibility: { kids: true, dogs: false, cats: false },
    vaccinated: true,
    neutered: false
  }
];

/**
 * Seeds pets into MongoDB if the 'pets' collection is empty.
 */
async function seedPetsIfEmpty() {
  const count = await Pet.countDocuments();
  if (count === 0) {
    console.log('🌱 Pets collection is empty. Auto-seeding starter pets into MongoDB...');
    await Pet.insertMany(initialPets);
    console.log(`✅ Successfully seeded ${initialPets.length} pets into MongoDB!`);
  }
}

/**
 * Direct seed execution via CLI
 */
async function runDirectSeed() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pet_adoption_db';
  console.log(`Connecting to MongoDB at: ${uri}`);

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB.');

    // Clear existing pets and re-insert
    console.log('Clearing existing pets...');
    await Pet.deleteMany({});

    console.log('Inserting starter pets...');
    const result = await Pet.insertMany(initialPets);
    console.log(`🎉 Seed complete! Inserted ${result.length} pets into 'pets' collection.`);

    await mongoose.disconnect();
    console.log('Disconnected cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

// If run directly from terminal: node seed.js
if (require.main === module) {
  runDirectSeed();
}

module.exports = {
  initialPets,
  seedPetsIfEmpty
};
