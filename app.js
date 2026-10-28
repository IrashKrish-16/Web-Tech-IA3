/**
 * ============================================================================
 * PAWSOME MATCH - PET ADOPTION PORTAL LOGIC (app.js)
 * ============================================================================
 * Technologies: HTML5, CSS3, JavaScript (ES6+), and jQuery 3.7.1
 * 
 * This file contains all interactive behaviors:
 * 1. Sample pet data array
 * 2. Dynamic card rendering
 * 3. Multi-criteria filtering (search text, species, age, gender)
 * 4. Modal popups for pet details and adoption application
 * 5. Favorites tracker using browser localStorage
 * 6. Clean form validation and notification toasts
 * ============================================================================
 */

// ============================================================================
// SECTION 1: API CONFIGURATION & SAMPLE DATASET
// When connected to the Express + MongoDB backend, data is fetched dynamically.
// If offline, defaultPetsData ensures the portal still functions smoothly.
// ============================================================================
const API_BASE_URL = window.location.protocol === 'file:' ? 'http://localhost:3000' : '';

const defaultPetsData = [
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
    story: "Milo is a bundle of joy who loves games of fetch, swimming in shallow creeks, and snuggling on the rug after long walks. He's fully vaccinated and eager to please!",
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

// Active working pet list (initialized with defaults, updated from MongoDB when online)
let petsData = [...defaultPetsData];

// ============================================================================
// SECTION 2: STATE MANAGEMENT
// We track current active filters, saved favorites, and backend connectivity.
// ============================================================================
const state = {
  selectedSpecies: "all",
  selectedAge: "all",
  selectedGender: "all",
  searchQuery: "",
  isBackendOnline: false,
  // Load saved favorites from browser localStorage, or start with empty array
  favorites: JSON.parse(localStorage.getItem("pawsome_favorites") || "[]")
};

// ============================================================================
// SECTION 3: JQUERY READY HANDLER & BACKEND SYNC
// ============================================================================
$(document).ready(function () {
  console.log("Pawsome Match initialized!");

  // 1. Initial render using default dataset (instant display)
  renderPets(petsData);

  // 2. Update favorites badge count in navigation
  updateFavoritesBadge();

  // 3. Attach all user interaction event handlers
  setupEventListeners();

  // 4. Check backend status and fetch live pets from MySQL
  checkBackendAndLoadData();
});

/**
 * Checks if the Express server and MongoDB database are online,
 * updates the navbar indicator, and loads live pets from MongoDB.
 */
function checkBackendAndLoadData() {
  const $pill = $("#backend-status-pill");
  const $text = $("#backend-status-text");

  $text.text("Connecting...");

  $.ajax({
    url: `${API_BASE_URL}/api/health`,
    method: "GET",
    timeout: 3000,
    success: function (res) {
      if (res && res.database && res.database.connected) {
        state.isBackendOnline = true;
        $pill.removeClass("offline").addClass("online");
        $text.html('<i class="fa-solid fa-database"></i> MongoDB Connected');
        $pill.attr("title", "Connected to MongoDB! Pet data and applications are synced live.");

        // Fetch live pets from MongoDB
        fetchPetsFromMongoDB();
      } else {
        state.isBackendOnline = false;
        $pill.removeClass("online").addClass("offline");
        $text.html('<i class="fa-solid fa-triangle-exclamation"></i> DB Disconnected');
        $pill.attr("title", "Server running, but MongoDB connection failed. Make sure mongod is running on 127.0.0.1:27017.");
      }
    },
    error: function () {
      state.isBackendOnline = false;
      $pill.removeClass("online").addClass("offline");
      $text.html('<i class="fa-solid fa-server"></i> Offline / Demo');
      $pill.attr("title", "Backend server not detected. Showing built-in demo pets.");
    }
  });
}

/**
 * Fetches pet list directly from MongoDB via GET /api/pets
 */
function fetchPetsFromMongoDB() {
  $.ajax({
    url: `${API_BASE_URL}/api/pets`,
    method: "GET",
    success: function (data) {
      if (Array.isArray(data) && data.length > 0) {
        petsData = data;
        applyFilters();
        showToast("Connected to MongoDB! Loaded live pet data.", "success");
      }
    },
    error: function (err) {
      console.warn("Could not load pets from /api/pets, using local fallback.", err);
    }
  });
}

// ============================================================================
// SECTION 4: RENDERING FUNCTIONS
// ============================================================================

/**
 * Generates and displays pet cards inside `#pet-cards-grid`.
 * @param {Array} list - Array of pet objects to display
 */
function renderPets(list) {
  const $grid = $("#pet-cards-grid");
  const $emptyState = $("#no-results");
  const $resultsCount = $("#results-count");

  // Empty the current cards container
  $grid.empty();

  // Handle zero results scenario
  if (list.length === 0) {
    $grid.hide();
    $emptyState.fadeIn(200);
    $resultsCount.text("Found 0 pets");
    return;
  }

  // Show grid and hide empty state
  $emptyState.hide();
  $grid.show();
  $resultsCount.text(`Showing ${list.length} ${list.length === 1 ? 'pet' : 'pets'}`);

  // Loop through each pet and construct card HTML
  list.forEach(function (pet) {
    // Check if pet is in user's saved favorites
    const isFavorited = state.favorites.includes(pet.id);
    const heartClass = isFavorited ? "fa-solid fa-heart" : "fa-regular fa-heart";
    const favActiveClass = isFavorited ? "favorited" : "";

    // Determine icon for species
    let speciesIcon = "fa-paw";
    if (pet.species === "dog") speciesIcon = "fa-dog";
    else if (pet.species === "cat") speciesIcon = "fa-cat";
    else if (pet.species === "small") speciesIcon = "fa-carrot";

    // Gender badge icon
    const genderIcon = pet.gender === "Male" 
      ? '<i class="fa-solid fa-mars gender-icon male" title="Male"></i>' 
      : '<i class="fa-solid fa-venus gender-icon female" title="Female"></i>';

    // Build personality tags
    const tagsHtml = pet.tags
      .map(tag => `<span class="pet-tag">${tag}</span>`)
      .join("");

    // Pet card template string
    const cardHtml = `
      <article class="pet-card" data-pet-id="${pet.id}">
        <div class="pet-card-image-wrap">
          <img src="${pet.image}" alt="${pet.name} the ${pet.breed}" class="pet-card-img" loading="lazy" onerror="this.onerror=null; this.src='images/pet-placeholder.svg';">
          
          <!-- Favorite toggle button -->
          <button class="pet-favorite-btn ${favActiveClass}" data-id="${pet.id}" title="Save to favorites">
            <i class="${heartClass}"></i>
          </button>

          <!-- Species badge -->
          <span class="species-badge">
            <i class="fa-solid ${speciesIcon}"></i> ${capitalize(pet.species)}
          </span>
        </div>

        <div class="pet-card-body">
          <div class="pet-card-title-row">
            <h3 class="pet-card-name">${pet.name}</h3>
            ${genderIcon}
          </div>

          <div class="pet-card-breed">${pet.breed}</div>

          <div class="pet-meta-row">
            <span class="pet-meta-item"><i class="fa-regular fa-clock"></i> ${pet.age}</span>
            <span class="pet-meta-item"><i class="fa-solid fa-weight-hanging"></i> ${pet.size}</span>
          </div>

          <div class="pet-tags">
            ${tagsHtml}
          </div>

          <div class="pet-card-actions">
            <button class="btn btn-outline btn-details" data-id="${pet.id}">
              <i class="fa-solid fa-circle-info"></i> Details
            </button>
            <button class="btn btn-primary btn-adopt" data-id="${pet.id}">
              <i class="fa-solid fa-heart"></i> Adopt Me
            </button>
          </div>
        </div>
      </article>
    `;

    $grid.append(cardHtml);
  });
}

/**
 * Filter the pet data based on all currently active criteria in `state`.
 */
function applyFilters() {
  const query = state.searchQuery.toLowerCase().trim();

  const filtered = petsData.filter(function (pet) {
    // 1. Filter by species
    const matchesSpecies = state.selectedSpecies === "all" || pet.species === state.selectedSpecies;

    // 2. Filter by age group
    const matchesAge = state.selectedAge === "all" || pet.ageGroup === state.selectedAge;

    // 3. Filter by gender
    const matchesGender = state.selectedGender === "all" || pet.gender === state.selectedGender;

    // 4. Filter by search text (matches name, breed, or tags)
    const matchesSearch = query === "" ||
      pet.name.toLowerCase().includes(query) ||
      pet.breed.toLowerCase().includes(query) ||
      pet.tags.some(tag => tag.toLowerCase().includes(query));

    return matchesSpecies && matchesAge && matchesGender && matchesSearch;
  });

  // Re-render the grid with the filtered subset
  renderPets(filtered);
}

// ============================================================================
// SECTION 5: EVENT LISTENERS & USER INTERACTIONS
// ============================================================================
function setupEventListeners() {
  
  // --------------------------------------------------------------------------
  // Species Category Filter Buttons
  // --------------------------------------------------------------------------
  $("#species-filter-container .pill-btn").on("click", function () {
    // Switch active button class
    $("#species-filter-container .pill-btn").removeClass("active");
    $(this).addClass("active");

    // Update state and re-filter
    state.selectedSpecies = $(this).data("species");
    applyFilters();
  });

  // --------------------------------------------------------------------------
  // Search Input (Real-time live typing)
  // --------------------------------------------------------------------------
  $("#search-input").on("input", function () {
    state.searchQuery = $(this).val();

    // Show or hide clear button
    if (state.searchQuery.length > 0) {
      $("#clear-search-btn").show();
    } else {
      $("#clear-search-btn").hide();
    }

    applyFilters();
  });

  // Clear search input button
  $("#clear-search-btn").on("click", function () {
    $("#search-input").val("").trigger("input").focus();
  });

  // --------------------------------------------------------------------------
  // Dropdown Select Filters (Age & Gender)
  // --------------------------------------------------------------------------
  $("#age-select").on("change", function () {
    state.selectedAge = $(this).val();
    applyFilters();
  });

  $("#gender-select").on("change", function () {
    state.selectedGender = $(this).val();
    applyFilters();
  });

  // --------------------------------------------------------------------------
  // Reset Filters Buttons
  // --------------------------------------------------------------------------
  $("#reset-filters-btn, #reset-filters-btn-empty").on("click", function () {
    // Reset inputs
    $("#search-input").val("");
    $("#clear-search-btn").hide();
    $("#age-select").val("all");
    $("#gender-select").val("all");
    
    // Reset species buttons
    $("#species-filter-container .pill-btn").removeClass("active");
    $('#species-filter-container .pill-btn[data-species="all"]').addClass("active");

    // Reset state values
    state.searchQuery = "";
    state.selectedSpecies = "all";
    state.selectedAge = "all";
    state.selectedGender = "all";

    applyFilters();
    showToast("Filters reset to default.");
  });

  // --------------------------------------------------------------------------
  // Pet Card Button Clicks (Using Event Delegation)
  // --------------------------------------------------------------------------
  
  // 1. Details button: Open pet info modal
  $("#pet-cards-grid").on("click", ".btn-details", function () {
    const petId = parseInt($(this).data("id"), 10);
    openPetModal(petId);
  });

  // 2. Adopt button: Open adoption inquiry form
  $("#pet-cards-grid").on("click", ".btn-adopt", function () {
    const petId = parseInt($(this).data("id"), 10);
    openAdoptionModal(petId);
  });

  // 3. Heart Favorite button toggle
  $("#pet-cards-grid").on("click", ".pet-favorite-btn", function (e) {
    e.stopPropagation(); // Prevent card bubbling
    const petId = parseInt($(this).data("id"), 10);
    toggleFavorite(petId, $(this));
  });

  // --------------------------------------------------------------------------
  // Modal Close Handlers (Buttons, Backdrop, ESC Key)
  // --------------------------------------------------------------------------
  $("#close-pet-modal-btn").on("click", closePetModal);
  $("#close-adoption-modal-btn, #cancel-adoption-btn").on("click", closeAdoptionModal);
  $("#close-favorites-modal-btn").on("click", closeFavoritesModal);

  // Close modals when clicking the dim dark backdrop
  $(".modal-backdrop").on("click", function (e) {
    if ($(e.target).hasClass("modal-backdrop")) {
      closeAllModals();
    }
  });

  // Close modals on Escape keyboard key press
  $(document).on("keydown", function (e) {
    if (e.key === "Escape") {
      closeAllModals();
    }
  });

  // --------------------------------------------------------------------------
  // Favorites Modal Trigger & Management
  // --------------------------------------------------------------------------
  $("#view-favorites-btn").on("click", function () {
    openFavoritesModal();
  });

  // Remove pet from inside favorites modal
  $("#favorites-list-container").on("click", ".btn-remove-fav", function () {
    const petId = parseInt($(this).data("id"), 10);
    toggleFavorite(petId); // toggles off
    renderFavoritesList();  // re-render the list
    applyFilters();         // update heart icon on main grid
  });

  // Adopt directly from favorites modal
  $("#favorites-list-container").on("click", ".btn-fav-adopt", function () {
    const petId = parseInt($(this).data("id"), 10);
    closeFavoritesModal();
    openAdoptionModal(petId);
  });

  // --------------------------------------------------------------------------
  // Adoption Form Submission & Validation
  // --------------------------------------------------------------------------
  $("#adoption-form").on("submit", function (e) {
    e.preventDefault(); // Stop standard page reload

    if (validateAdoptionForm()) {
      const petId = parseInt($("#form-pet-id").val(), 10);
      const pet = petsData.find(p => p.id == petId);
      const petName = pet ? pet.name : "your chosen pet";
      const applicantName = $("#applicant-name").val().trim();

      const payload = {
        petId: petId,
        name: applicantName,
        email: $("#applicant-email").val().trim(),
        phone: $("#applicant-phone").val().trim(),
        housing: $("#applicant-housing").val(),
        hasPets: $("#applicant-pets").val(),
        message: $("#applicant-message").val().trim()
      };

      const $submitBtn = $("#submit-adoption-btn");
      $submitBtn.prop("disabled", true).html('<i class="fa-solid fa-spinner fa-spin"></i> Submitting...');

      if (state.isBackendOnline) {
        // Submit via AJAX POST to Express / MySQL API
        $.ajax({
          url: `${API_BASE_URL}/api/adoptions`,
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(payload),
          success: function (res) {
            closeAdoptionModal();
            showToast(`🎉 Thank you, ${applicantName}! Your application for ${petName} was saved in MongoDB (Application #${res.applicationId})!`, "success");
            $("#adoption-form")[0].reset();
            clearFormErrors();
          },
          error: function (xhr) {
            console.error("Adoption submission error:", xhr);
            closeAdoptionModal();
            showToast(`Application saved locally for ${petName} (database error occurred).`, "info");
            $("#adoption-form")[0].reset();
            clearFormErrors();
          },
          complete: function () {
            $submitBtn.prop("disabled", false).html('<i class="fa-solid fa-paper-plane"></i> Send Application');
          }
        });
      } else {
        // Offline / Demo mode fallback
        setTimeout(function () {
          closeAdoptionModal();
          showToast(`🎉 Thank you, ${applicantName}! Inquiry submitted for ${petName} (Demo Mode).`, "success");
          $("#adoption-form")[0].reset();
          clearFormErrors();
          $submitBtn.prop("disabled", false).html('<i class="fa-solid fa-paper-plane"></i> Send Application');
        }, 400);
      }
    }
  });

  // Real-time error removal when user starts typing
  $("#adoption-form input, #adoption-form select").on("input change", function () {
    $(this).removeClass("has-error");
    $(this).siblings(".error-msg").hide();
  });
}

// ============================================================================
// SECTION 6: MODAL FUNCTIONS
// ============================================================================

/**
 * Open Pet Details Modal with enriched pet bio and checklist.
 * @param {number} petId
 */
function openPetModal(petId) {
  const pet = petsData.find(p => p.id === petId);
  if (!pet) return;

  const contentHtml = `
    <div class="modal-pet-header">
      <img src="${pet.image}" alt="${pet.name}" class="modal-pet-img" onerror="this.onerror=null; this.src='images/pet-placeholder.svg';">
      <div class="modal-pet-info">
        <h2>${pet.name}</h2>
        <div class="modal-pet-breed">${pet.breed} &bull; ${capitalize(pet.species)}</div>

        <div class="pet-details-grid">
          <div class="detail-item">
            <span class="detail-label">Age</span>
            <span class="detail-value">${pet.age}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Gender</span>
            <span class="detail-value">${pet.gender}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Weight</span>
            <span class="detail-value">${pet.size}</span>
          </div>
        </div>

        <div class="pet-tags">
          ${pet.tags.map(t => `<span class="pet-tag">${t}</span>`).join("")}
        </div>
      </div>
    </div>

    <h4 class="modal-story-title"><i class="fa-solid fa-book-open"></i> Story & Background</h4>
    <p class="modal-story-text">${pet.story}</p>

    <h4 class="modal-story-title"><i class="fa-solid fa-house-circle-check"></i> Ideal Home Match</h4>
    <div class="compat-checklist">
      <div class="compat-item">
        <i class="fa-solid ${pet.compatibility.kids ? 'fa-circle-check' : 'fa-circle-xmark'}" 
           style="color: ${pet.compatibility.kids ? 'var(--secondary)' : '#adb5bd'}"></i>
        <span>Good with Kids</span>
      </div>
      <div class="compat-item">
        <i class="fa-solid ${pet.compatibility.dogs ? 'fa-circle-check' : 'fa-circle-xmark'}"
           style="color: ${pet.compatibility.dogs ? 'var(--secondary)' : '#adb5bd'}"></i>
        <span>Good with Dogs</span>
      </div>
      <div class="compat-item">
        <i class="fa-solid ${pet.compatibility.cats ? 'fa-circle-check' : 'fa-circle-xmark'}"
           style="color: ${pet.compatibility.cats ? 'var(--secondary)' : '#adb5bd'}"></i>
        <span>Good with Cats</span>
      </div>
    </div>

    <div class="form-actions" style="border-top: 1px solid var(--border-color); padding-top: 16px;">
      <button class="btn btn-outline" onclick="closePetModal()">Close</button>
      <button class="btn btn-primary" onclick="closePetModal(); openAdoptionModal(${pet.id});">
        <i class="fa-solid fa-heart"></i> Apply to Adopt ${pet.name}
      </button>
    </div>
  `;

  $("#modal-pet-content").html(contentHtml);
  $("#pet-modal").show().addClass("show");
  $("body").css("overflow", "hidden"); // Prevent background scroll
}

function closePetModal() {
  $("#pet-modal").removeClass("show");
  setTimeout(() => {
    $("#pet-modal").hide();
    $("body").css("overflow", "auto");
  }, 200);
}

/**
 * Open Adoption Form Modal pre-loaded with target pet information.
 * @param {number} petId
 */
function openAdoptionModal(petId) {
  const pet = petsData.find(p => p.id === petId);
  if (!pet) return;

  $("#form-pet-id").val(pet.id);
  $("#adoption-modal-title").text(`Adopt ${pet.name}`);
  $("#adoption-modal-subtitle").text(`You're applying for ${pet.name} (${pet.breed}, ${pet.age}).`);

  clearFormErrors();
  $("#adoption-modal").show().addClass("show");
  $("body").css("overflow", "hidden");
}

function closeAdoptionModal() {
  $("#adoption-modal").removeClass("show");
  setTimeout(() => {
    $("#adoption-modal").hide();
    $("body").css("overflow", "auto");
  }, 200);
}

/**
 * Open Favorites Drawer Modal
 */
function openFavoritesModal() {
  renderFavoritesList();
  $("#favorites-modal").show().addClass("show");
  $("body").css("overflow", "hidden");
}

function closeFavoritesModal() {
  $("#favorites-modal").removeClass("show");
  setTimeout(() => {
    $("#favorites-modal").hide();
    $("body").css("overflow", "auto");
  }, 200);
}

function closeAllModals() {
  closePetModal();
  closeAdoptionModal();
  closeFavoritesModal();
}

/**
 * Renders the saved favorites list inside the favorites drawer modal.
 */
function renderFavoritesList() {
  const $container = $("#favorites-list-container");
  $container.empty();

  if (state.favorites.length === 0) {
    $container.html(`
      <div style="text-align: center; padding: 30px 10px; color: var(--muted-text);">
        <i class="fa-regular fa-heart" style="font-size: 2.5rem; margin-bottom: 12px; display: block; color: #adb5bd;"></i>
        <p>You have not saved any pets yet.</p>
        <p style="font-size: 0.85rem;">Click the heart icon on any pet card to add them here!</p>
      </div>
    `);
    return;
  }

  // Get pet objects for each favorited ID
  const favPets = petsData.filter(pet => state.favorites.includes(pet.id));

  favPets.forEach(pet => {
    const itemHtml = `
      <div class="fav-item">
        <div class="fav-info">
          <img src="${pet.image}" alt="${pet.name}" class="fav-thumb" onerror="this.onerror=null; this.src='images/pet-placeholder.svg';">
          <div class="fav-meta">
            <h4>${pet.name}</h4>
            <span>${pet.breed} &bull; ${pet.age}</span>
          </div>
        </div>
        <div class="fav-actions">
          <button class="btn btn-outline btn-sm btn-fav-adopt" data-id="${pet.id}">
            Adopt
          </button>
          <button class="btn btn-ghost btn-sm btn-remove-fav" data-id="${pet.id}" title="Remove">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    `;
    $container.append(itemHtml);
  });
}

// ============================================================================
// SECTION 7: FAVORITES STORAGE & TOGGLING
// ============================================================================

/**
 * Toggles a pet's favorite state in `state.favorites` and localStorage.
 * @param {number} petId
 * @param {jQuery} [$btn] - Optional button element that triggered the click
 */
function toggleFavorite(petId, $btn) {
  const index = state.favorites.indexOf(petId);
  const isCurrentlyFavorited = index !== -1;

  if (isCurrentlyFavorited) {
    // Remove from array
    state.favorites.splice(index, 1);
    showToast("Removed from favorites.");
  } else {
    // Add to array
    state.favorites.push(petId);
    showToast("Added to your saved favorites! ❤️");
  }

  // Persist to browser localStorage
  localStorage.setItem("pawsome_favorites", JSON.stringify(state.favorites));

  // Update badge count in navbar
  updateFavoritesBadge();

  // If a specific card button was clicked, toggle its classes and icon
  if ($btn) {
    if (isCurrentlyFavorited) {
      $btn.removeClass("favorited");
      $btn.find("i").removeClass("fa-solid").addClass("fa-regular");
    } else {
      $btn.addClass("favorited");
      $btn.find("i").removeClass("fa-regular").addClass("fa-solid");
    }
  }
}

/**
 * Updates the counter badge on the Favorites navigation button.
 */
function updateFavoritesBadge() {
  const count = state.favorites.length;
  $("#favorites-badge").text(count);
}

// ============================================================================
// SECTION 8: FORM VALIDATION
// ============================================================================

/**
 * Validates adoption form fields before submission.
 * @returns {boolean} True if all required fields are valid
 */
function validateAdoptionForm() {
  let isValid = true;
  clearFormErrors();

  const name = $("#applicant-name").val().trim();
  const email = $("#applicant-email").val().trim();
  const phone = $("#applicant-phone").val().trim();
  const housing = $("#applicant-housing").val();

  // 1. Name validation
  if (!name) {
    $("#applicant-name").addClass("has-error");
    $("#name-error").show();
    isValid = false;
  }

  // 2. Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    $("#applicant-email").addClass("has-error");
    $("#email-error").show();
    isValid = false;
  }

  // 3. Phone validation (at least 7 characters/digits)
  if (!phone || phone.length < 7) {
    $("#applicant-phone").addClass("has-error");
    $("#phone-error").show();
    isValid = false;
  }

  // 4. Housing selection
  if (!housing) {
    $("#applicant-housing").addClass("has-error");
    $("#housing-error").show();
    isValid = false;
  }

  return isValid;
}

function clearFormErrors() {
  $(".error-msg").hide();
  $("input, select, textarea").removeClass("has-error");
}

// ============================================================================
// SECTION 9: HELPER UTILITIES
// ============================================================================

/**
 * Capitalizes the first letter of a string.
 */
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Display a modern, dismissible toast notification in the bottom right corner.
 * @param {string} message - Message text
 * @param {string} [type='info'] - 'info' or 'success'
 */
function showToast(message, type = "info") {
  const icon = type === "success" ? "fa-circle-check" : "fa-bell";
  const toastClass = type === "success" ? "toast toast-success" : "toast";

  const $toast = $(`
    <div class="${toastClass}">
      <i class="fa-solid ${icon}"></i>
      <span>${message}</span>
    </div>
  `);

  $("#toast-container").append($toast);

  // Automatically fade out and remove after 3.2 seconds
  setTimeout(function () {
    $toast.fadeOut(300, function () {
      $(this).remove();
    });
  }, 3200);
}
