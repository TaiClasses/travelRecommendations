let travelData = null;

const DEFAULT_MESSAGE = `
      <div>
        <h3>Discover Amazing Destinations</h3>
        <p>Use the search above to find your perfect travel destination!</p>
      </div>
    `;

async function fetchTravelData() {
  try {
    const response = await fetch("./travel_recommendation_api.json");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    travelData = await response.json();
    console.log("Travel data loaded successfully:", travelData);
    return travelData;
  } catch (error) {
    console.error("Error fetching travel data:", error);
    throw error;
  }
}

function normalizeSearchTerm(term) {
  const normalized = term.toLowerCase().trim();

  const keywordMap = {
    beach: [
      "beach",
      "beaches",
      "coast",
      "coastal",
      "shore",
      "shoreline",
      "seaside",
    ],
    beaches: [
      "beach",
      "beaches",
      "coast",
      "coastal",
      "shore",
      "shoreline",
      "seaside",
    ],
    coast: [
      "beach",
      "beaches",
      "coast",
      "coastal",
      "shore",
      "shoreline",
      "seaside",
    ],
    coastal: [
      "beach",
      "beaches",
      "coast",
      "coastal",
      "shore",
      "shoreline",
      "seaside",
    ],
    shore: [
      "beach",
      "beaches",
      "coast",
      "coastal",
      "shore",
      "shoreline",
      "seaside",
    ],
    seaside: [
      "beach",
      "beaches",
      "coast",
      "coastal",
      "shore",
      "shoreline",
      "seaside",
    ],
    temple: [
      "temple",
      "temples",
      "shrine",
      "shrines",
      "sanctuary",
      "sanctuaries",
    ],
    temples: [
      "temple",
      "temples",
      "shrine",
      "shrines",
      "sanctuary",
      "sanctuaries",
    ],
    shrine: [
      "temple",
      "temples",
      "shrine",
      "shrines",
      "sanctuary",
      "sanctuaries",
    ],
    shrines: [
      "temple",
      "temples",
      "shrine",
      "shrines",
      "sanctuary",
      "sanctuaries",
    ],
    sanctuary: [
      "temple",
      "temples",
      "shrine",
      "shrines",
      "sanctuary",
      "sanctuaries",
    ],
    sanctuaries: [
      "temple",
      "temples",
      "shrine",
      "shrines",
      "sanctuary",
      "sanctuaries",
    ],
    country: ["country", "countries", "nation", "nations"],
    countries: ["country", "countries", "nation", "nations"],
    nation: ["country", "countries", "nation", "nations"],
    nations: ["country", "countries", "nation", "nations"],
    city: ["city", "cities", "town", "towns"],
    cities: ["city", "cities", "town", "towns"],
    town: ["city", "cities", "town", "towns"],
    towns: ["city", "cities", "town", "towns"],
  };

  return keywordMap[normalized] || [normalized];
}

function matchesSearchTerms(text, searchVariations) {
  const lowerText = text.toLowerCase();
  return searchVariations.some((variation) => lowerText.includes(variation));
}

function searchDestinations(query) {
  if (!travelData) {
    console.warn("Travel data not loaded yet");
    return [];
  }

  if (!query || query.trim() === "") {
    return [];
  }

  const searchTerm = query.toLowerCase().trim();
  const searchVariations = normalizeSearchTerm(searchTerm);
  const results = [];

  const isBeachSearch = searchVariations.some((term) =>
    [
      "beach",
      "beaches",
      "coast",
      "coastal",
      "shore",
      "shoreline",
      "seaside",
    ].includes(term)
  );
  const isTempleSearch = searchVariations.some((term) =>
    [
      "temple",
      "temples",
      "shrine",
      "shrines",
      "sanctuary",
      "sanctuaries",
    ].includes(term)
  );
  const isCountrySearch = searchVariations.some((term) =>
    ["country", "countries", "nation", "nations"].includes(term)
  );

  const isPureCategorySearch = [
    "beach",
    "beaches",
    "temple",
    "temples",
    "country",
    "countries",
    "nation",
    "nations",
    "city",
    "cities",
    "town",
    "towns",
  ].includes(searchTerm);

  if (isBeachSearch && isPureCategorySearch) {
    travelData.beaches.forEach((beach) => {
      results.push({
        type: "beach",
        ...beach,
      });
    });
    return results;
  }

  if (isTempleSearch && isPureCategorySearch) {
    travelData.temples.forEach((temple) => {
      results.push({
        type: "temple",
        ...temple,
      });
    });
    return results;
  }

  if (isCountrySearch && isPureCategorySearch) {
    travelData.countries.forEach((country) => {
      country.cities.forEach((city) => {
        results.push({
          type: "city",
          country: country.name,
          ...city,
        });
      });
    });
    return results;
  }

  travelData.countries.forEach((country) => {
    if (matchesSearchTerms(country.name, searchVariations)) {
      country.cities.forEach((city) => {
        results.push({
          type: "city",
          country: country.name,
          ...city,
        });
      });
    } else {
      country.cities.forEach((city) => {
        if (
          matchesSearchTerms(city.name, searchVariations) ||
          matchesSearchTerms(city.description, searchVariations)
        ) {
          results.push({
            type: "city",
            country: country.name,
            ...city,
          });
        }
      });
    }
  });

  travelData.temples.forEach((temple) => {
    if (
      matchesSearchTerms(temple.name, searchVariations) ||
      matchesSearchTerms(temple.description, searchVariations)
    ) {
      const isDuplicate = results.some(
        (result) => result.type === "temple" && result.name === temple.name
      );
      if (!isDuplicate) {
        results.push({
          type: "temple",
          ...temple,
        });
      }
    }
  });

  travelData.beaches.forEach((beach) => {
    if (
      matchesSearchTerms(beach.name, searchVariations) ||
      matchesSearchTerms(beach.description, searchVariations)
    ) {
      const isDuplicate = results.some(
        (result) => result.type === "beach" && result.name === beach.name
      );
      if (!isDuplicate) {
        results.push({
          type: "beach",
          ...beach,
        });
      }
    }
  });

  return results;
}

const renderImage = (result) =>
  `<img src="${result.imageUrl}" alt="${result.name}" onerror="this.src='https://placehold.co/400x120?text=TopTravel'"></img>`;
const renderType = (result) =>
  `<span class="result-type">${
    result.type.charAt(0).toUpperCase() + result.type.slice(1)
  }</span>`;

const renderResult = (result) => `
    <div class="result-card">
        ${renderImage(result)}
        <div class="result-content">
            <h3>${result.name}</h3>
            ${renderType(result)}
            <p class="result-description">${result.description}</p>
        </div>
    </div>
`;

function displayResults(results) {
  const resultsContainer = document.getElementById("searchResults");

  if (!resultsContainer) {
    console.warn("Results container not found");
    return;
  }

  if (results.length === 0) {
    resultsContainer.innerHTML =
      "<p>No destinations found. Try searching for 'beach', 'temple', 'country', or specific destination names.</p>";
    return;
  }

  let html = `<h3>Found ${results.length} destination${
    results.length === 1 ? "" : "s"
  }:</h3>`;
  html += '<div class="results-grid">';
  html += results.map(renderResult).join("");

  html += "</div>";
  resultsContainer.innerHTML = html;
}

function handleSearch() {
  const searchInput = document.getElementById("destinationInput");
  const query = searchInput.value;

  if (!query || query.trim() === "") {
    alert("Please enter a destination or keyword to search.");
    return;
  }

  if (!travelData) {
    console.log("Loading travel data...");
    fetchTravelData()
      .then(() => {
        performSearch(query);
      })
      .catch(() => {
        alert(
          "Failed to load travel data. Please check your connection and try again."
        );
      });
  } else {
    performSearch(query);
  }
}

function performSearch(query) {
  console.log("Searching for:", query);
  console.log(
    "Normalized variations:",
    normalizeSearchTerm(query.toLowerCase().trim())
  );

  const results = searchDestinations(query);
  console.log("Search results found:", results.length);

  displayResults(results);
}

function handleClear() {
  const searchInput = document.getElementById("destinationInput");
  const resultsContainer = document.getElementById("searchResults");

  searchInput.value = "";
  if (resultsContainer) {
    resultsContainer.innerHTML = DEFAULT_MESSAGE;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const resultsContainer = document.getElementById("searchResults");
  if (resultsContainer) {
    resultsContainer.innerHTML = DEFAULT_MESSAGE;
  }

  const searchBtn = document.getElementById("btnSearch");
  const clearBtn = document.getElementById("btnClear");
  const searchInput = document.getElementById("destinationInput");

  if (searchBtn) {
    searchBtn.addEventListener("click", function (e) {
      e.preventDefault();
      handleSearch();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", function (e) {
      e.preventDefault();
      handleClear();
    });
  }

  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    });
  }
});

window.travelApp = {
  fetchTravelData,
  searchDestinations,
  displayResults,
  handleSearch,
  handleClear,
};
