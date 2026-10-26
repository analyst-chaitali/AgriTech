
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const API_URL = "http://localhost:5000/api/farms";

const crops = [
  { name: "Wheat", icon: "🌾", season: "Winter", soil: "Loamy", water: "Medium" },
  { name: "Rice", icon: "🌾", season: "Monsoon", soil: "Clayey", water: "High" },
  { name: "Maize", icon: "🌽", season: "Summer / Monsoon", soil: "Loamy", water: "Medium" },
  { name: "Soybean", icon: "🫘", season: "Monsoon", soil: "Well-drained", water: "Medium" },
  { name: "Cotton", icon: "☁️", season: "Summer", soil: "Black soil", water: "Medium" },
  { name: "Chickpea", icon: "🌱", season: "Winter", soil: "Loamy", water: "Low" },
];

export default function App() {
  const [page, setPage] = useState("Dashboard");
  const [farms, setFarms] = useState([]);
  const [farmsLoading, setFarmsLoading] = useState(false);
  const [farmError, setFarmError] = useState("");
  const [farmSuccess, setFarmSuccess] = useState("");
  const [editingFarmId, setEditingFarmId] = useState(null);
  const [savingFarm, setSavingFarm] = useState(false);

  const [farmName, setFarmName] = useState("");
  const [farmerName, setFarmerName] = useState("");
  const [location, setLocation] = useState("");
  const [area, setArea] = useState("");
  const [crop, setCrop] = useState("Wheat");

  const [soil, setSoil] = useState("Loamy");
  const [ph, setPh] = useState("6.5");
  const [nitrogen, setNitrogen] = useState("60");
  const [rainfall, setRainfall] = useState("700");
  const [recommendation, setRecommendation] = useState("");

  const [city, setCity] = useState("Indore");
  const [weather, setWeather] = useState(null);
  const [weatherError, setWeatherError] = useState("");
  const [loadingWeather, setLoadingWeather] = useState(false);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "assistant",
      text: "Hello! I am Agri Assistant. Ask me about crop selection, soil health, and farming.",
    },
  ]);

  const navItems = [
    ["Dashboard", "🏡"],
    ["Crop Advisor", "🌱"],
    ["Weather", "🌦️"],
    ["Farm Management", "🚜"],
    ["Crop Library", "📚"],
    ["AI Assistant", "💬"],
  ];

  async function loadFarms() {
    setFarmsLoading(true);
    setFarmError("");

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error("Unable to load farm records.");
      }

      const data = await response.json();

      setFarms(
        data.map((farm) => ({
          id: farm._id,
          name: farm.farmName,
          farmerName: farm.farmerName,
          location: farm.location,
          area: farm.size,
          crop: farm.cropType,
        }))
      );
    } catch (error) {
      setFarmError(error.message || "Unable to connect to the backend.");
    } finally {
      setFarmsLoading(false);
    }
  }

  useEffect(() => {
    loadFarms();
  }, []);

  function resetFarmForm() {
    setFarmName("");
    setFarmerName("");
    setLocation("");
    setArea("");
    setCrop("Wheat");
    setEditingFarmId(null);
  }

  function startEditingFarm(farm) {
    setEditingFarmId(farm.id);
    setFarmName(farm.name);
    setFarmerName(farm.farmerName);
    setLocation(farm.location);
    setArea(String(farm.area));
    setCrop(farm.crop);
    setFarmError("");
    setFarmSuccess("");
  }

  function cancelEditingFarm() {
    resetFarmForm();
    setFarmError("");
    setFarmSuccess("Editing cancelled.");
  }

  async function saveFarm(event) {
    event.preventDefault();
    setFarmError("");
    setFarmSuccess("");

    if (
      !farmName.trim() ||
      !farmerName.trim() ||
      !location.trim() ||
      !area ||
      !Number.isFinite(Number(area)) ||
      Number(area) <= 0
    ) {
      setFarmError("Please enter valid details in all fields.");
      return;
    }

    const farmData = {
      farmName: farmName.trim(),
      farmerName: farmerName.trim(),
      location: location.trim(),
      size: Number(area),
      cropType: crop,
    };

    setSavingFarm(true);

    try {
      const isEditing = Boolean(editingFarmId);

      const response = await fetch(
        isEditing ? `${API_URL}/${editingFarmId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(farmData),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            (isEditing ? "Unable to update farm." : "Unable to save farm.")
        );
      }

      setFarmSuccess(
        isEditing
          ? "Farm details updated successfully!"
          : "Farm saved successfully to MongoDB!"
      );

      resetFarmForm();
      await loadFarms();
    } catch (error) {
      setFarmError(error.message || "Unable to complete the request.");
    } finally {
      setSavingFarm(false);
    }
  }

  async function deleteFarm(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this farm?"
    );

    if (!confirmed) return;

    setFarmError("");
    setFarmSuccess("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || data.error || "Unable to delete farm.");
      }

      if (editingFarmId === id) {
        resetFarmForm();
      }

      setFarmSuccess("Farm deleted successfully.");
      await loadFarms();
    } catch (error) {
      setFarmError(error.message || "Unable to delete farm.");
    }
  }

  function getRecommendation(event) {
    event.preventDefault();

    const phValue = Number(ph);
    const nValue = Number(nitrogen);
    const rain = Number(rainfall);

    let result = "Maize";

    if (soil === "Black soil") {
      result = "Cotton";
    } else if (rain < 450) {
      result = "Chickpea";
    } else if (rain > 1000) {
      result = "Rice";
    } else if (phValue >= 6 && phValue <= 7.5 && nValue >= 40) {
      result = "Wheat";
    }

    setRecommendation(result);
  }

  async function fetchWeather(event) {
    event.preventDefault();
    setLoadingWeather(true);
    setWeatherError("");
    setWeather(null);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );

      if (!geoResponse.ok) {
        throw new Error("Location search failed.");
      }

      const geoData = await geoResponse.json();

      if (!geoData.results?.length) {
        throw new Error("City not found. Please check the city name.");
      }

      const place = geoData.results[0];

      const forecastResponse = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`
      );

      if (!forecastResponse.ok) {
        throw new Error("Unable to fetch weather data.");
      }

      const data = await forecastResponse.json();

      setWeather({
        place,
        current: data.current,
        daily: data.daily,
      });
    } catch (error) {
      setWeatherError(error.message || "Unable to load weather. Check your internet connection.");
    } finally {
      setLoadingWeather(false);
    }
  }

  function sendQuestion(event) {
    event.preventDefault();

    if (!question.trim()) return;

    const q = question.trim();
    const lowerQ = q.toLowerCase();

    let answer =
      "Consider local soil, season, and weather conditions when choosing crops. Consult your local Krishi Vigyan Kendra or agriculture expert before making major farming decisions.";

    if (/yellow|peela|yellowing/.test(lowerQ)) {
      answer =
        "Yellow leaves can be caused by nutrient deficiencies, excess water, or disease. Check soil moisture and crop symptoms. Avoid applying fertilizer or pesticides without identifying the cause.";
    } else if (/water|pani|irrigation/.test(lowerQ)) {
      answer =
        "Irrigation depends on crop stage, soil moisture, and weather. Check soil moisture and avoid unnecessary irrigation when heavy rainfall is forecast.";
    } else if (/pest|insect|keet/.test(lowerQ)) {
      answer =
        "Inspect affected leaves and crop symptoms. Ask a local agriculture expert to identify the pest. Avoid spraying pesticides before identifying the problem.";
    } else if (/soil|mitti|ph/.test(lowerQ)) {
      answer =
        "Soil testing helps determine pH and nutrient levels. Plan fertilizer use based on your Soil Health Card or a local soil testing laboratory report.";
    }

    setMessages((previous) => [
      ...previous,
      { from: "user", text: q },
      { from: "assistant", text: answer },
    ]);

    setQuestion("");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">🌿</span>
          <div>
            <strong>AgriTech</strong>
            <small>SMART FARMING</small>
          </div>
        </div>

        <div className="nav-caption">WORKSPACE</div>

        {navItems.map(([label, icon]) => (
          <button
            key={label}
            className={`nav-link ${page === label ? "active" : ""}`}
            onClick={() => setPage(label)}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}

        <div className="sidebar-bottom">
          <span className="status-dot"></span>
          Farming for a better future
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">AGRICULTURE MANAGEMENT</span>
            <h1>{page}</h1>
          </div>
          <div className="topbar-right">
            <span className="live-badge">● Farmer workspace</span>
            <div className="avatar">F</div>
          </div>
        </header>

        {page === "Dashboard" && (
          <div className="page-content">
            <section className="hero">
              <div className="hero-content">
                <span className="hero-tag">🌱 SMART FARMING, BETTER HARVESTS</span>
                <h2>Grow smarter.<br />Harvest better.</h2>
                <p>
                  Manage your farm, explore crops, and make informed decisions
                  with AgriTech.
                </p>
                <button className="primary-btn" onClick={() => setPage("Crop Advisor")}>
                  Explore Crop Advisor →
                </button>
              </div>

              <div className="hero-art" aria-label="Illustration of farm fields">
                <div className="sun"></div>
                <div className="hill hill-one"></div>
                <div className="hill hill-two"></div>
                <div className="field-lines"></div>
                <div className="plant plant-one">🌾</div>
                <div className="plant plant-two">🌱</div>
              </div>
            </section>

            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">🚜</span>
                <span className="stat-label">Registered farms</span>
                <strong>{farms.length}</strong>
                <small>Your farm records</small>
              </div>

              <div className="stat-card">
                <span className="stat-icon">🌾</span>
                <span className="stat-label">Crop varieties</span>
                <strong>{crops.length}</strong>
                <small>Explore the crop library</small>
              </div>

              <div className="stat-card">
                <span className="stat-icon">📍</span>
                <span className="stat-label">Primary region</span>
                <strong>MP, India</strong>
                <small>Localize your farm data</small>
              </div>

              <div className="stat-card">
                <span className="stat-icon">🌦️</span>
                <span className="stat-label">Weather service</span>
                <strong>
                  {weather ? `${Math.round(weather.current.temperature_2m)}°C` : "Available"}
                </strong>
                <small>{weather ? weather.place.name : "Fetch your local forecast"}</small>
              </div>
            </div>

            <section className="section-block">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">GET STARTED</span>
                  <h2>Explore your workspace</h2>
                </div>
                <button className="text-btn" onClick={() => setPage("Crop Library")}>
                  View all crops →
                </button>
              </div>

              <div className="crop-grid">
                {crops.slice(0, 3).map((item) => (
                  <div className="crop-card" key={item.name}>
                    <div className="crop-emoji">{item.icon}</div>
                    <h3>{item.name}</h3>
                    <p>{item.season} season</p>
                    <div className="crop-meta">
                      <span>Soil: {item.soil}</span>
                      <span>Water: {item.water}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="tip-banner">
              <span>💡</span>
              <div>
                <strong>Smart farming tip</strong>
                <p>
                  Soil testing helps you make informed decisions about nutrients
                  and fertilizer use.
                </p>
              </div>
            </div>
          </div>
        )}

        {page === "Crop Advisor" && (
          <div className="page-content two-column">
            <section className="panel">
              <span className="eyebrow">CROP PLANNING</span>
              <h2>Crop recommendation</h2>
              <p className="muted">
                Enter soil and rainfall details for an illustrative suggestion.
              </p>

              <form onSubmit={getRecommendation} className="form-stack">
                <label>
                  Soil type
                  <select value={soil} onChange={(event) => setSoil(event.target.value)}>
                    <option>Loamy</option>
                    <option>Clayey</option>
                    <option>Black soil</option>
                    <option>Sandy</option>
                  </select>
                </label>

                <label>
                  Soil pH
                  <input type="number" min="0" max="14" step="0.1" value={ph}
                    onChange={(event) => setPh(event.target.value)} required />
                </label>

                <label>
                  Nitrogen estimate (kg/ha)
                  <input type="number" min="0" value={nitrogen}
                    onChange={(event) => setNitrogen(event.target.value)} required />
                </label>

                <label>
                  Annual rainfall (mm)
                  <input type="number" min="0" value={rainfall}
                    onChange={(event) => setRainfall(event.target.value)} required />
                </label>

                <button className="primary-btn" type="submit">Get suggestion →</button>
              </form>
            </section>

            <section className="panel recommendation-panel">
              <div className="big-emoji">🌱</div>
              <h2>{recommendation || "Your crop suggestion"}</h2>
              {recommendation ? (
                <>
                  <p>Rule-based suggestion using the details you entered.</p>
                  <div className="notice">
                    This is a demonstration, not a validated agronomic prediction.
                    Confirm suitability with local agriculture experts and soil test data.
                  </div>
                </>
              ) : (
                <p className="muted">Complete the form to generate a crop suggestion.</p>
              )}
            </section>
          </div>
        )}

        {page === "Weather" && (
          <div className="page-content">
            <section className="panel weather-panel">
              <span className="eyebrow">WEATHER FORECAST</span>
              <h2>Weather for your farm</h2>
              <p className="muted">Fetch current conditions and a short forecast using Open-Meteo.</p>

              <form className="weather-search" onSubmit={fetchWeather}>
                <input value={city} onChange={(event) => setCity(event.target.value)}
                  placeholder="Enter city, e.g. Indore" required />
                <button className="primary-btn" disabled={loadingWeather}>
                  {loadingWeather ? "Loading..." : "Get weather"}
                </button>
              </form>

              {weatherError && <div className="notice error-notice">{weatherError}</div>}

              {weather && (
                <>
                  <div className="weather-current">
                    <div>
                      <span className="muted">{weather.place.name}, {weather.place.country}</span>
                      <div className="temperature">{Math.round(weather.current.temperature_2m)}°C</div>
                      <span>Current temperature</span>
                    </div>

                    <div className="weather-metrics">
                      <div><span>Humidity</span><strong>{weather.current.relative_humidity_2m}%</strong></div>
                      <div><span>Precipitation</span><strong>{weather.current.precipitation} mm</strong></div>
                      <div><span>Wind</span><strong>{weather.current.wind_speed_10m} km/h</strong></div>
                    </div>
                  </div>

                  <h3 className="forecast-title">Next 5 days</h3>
                  <div className="forecast-grid">
                    {weather.daily.time.slice(0, 5).map((day, index) => (
                      <div className="forecast-day" key={day}>
                        <span>
                          {new Date(day + "T12:00:00").toLocaleDateString("en-IN", { weekday: "short" })}
                        </span>
                        <strong>
                          {Math.round(weather.daily.temperature_2m_max[index])}° /{" "}
                          {Math.round(weather.daily.temperature_2m_min[index])}°
                        </strong>
                        <small>Rain chance: {weather.daily.precipitation_probability_max[index]}%</small>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {page === "Farm Management" && (
          <div className="page-content two-column farm-layout">
            <section className="panel">
              <span className="eyebrow">FARM RECORDS</span>
              <h2>{editingFarmId ? "Edit farm details" : "Add a farm"}</h2>

              <form onSubmit={saveFarm} className="form-stack">
                <label>
                  Farm name
                  <input value={farmName} onChange={(event) => setFarmName(event.target.value)}
                    placeholder="e.g. My farm" required />
                </label>

                <label>
                  Farmer name
                  <input value={farmerName} onChange={(event) => setFarmerName(event.target.value)}
                    placeholder="Farmer full name" required />
                </label>

                <label>
                  Location
                  <input value={location} onChange={(event) => setLocation(event.target.value)}
                    placeholder="Village, district" required />
                </label>

                <label>
                  Area (acres)
                  <input type="number" min="0.1" step="0.1" value={area}
                    onChange={(event) => setArea(event.target.value)} required />
                </label>

                <label>
                  Main crop
                  <select value={crop} onChange={(event) => setCrop(event.target.value)}>
                    {crops.map((item) => (
                      <option key={item.name} value={item.name}>{item.name}</option>
                    ))}
                  </select>
                </label>

                <button className="primary-btn" type="submit" disabled={savingFarm}>
                  {savingFarm
                    ? "Saving..."
                    : editingFarmId
                      ? "Save Changes"
                      : "+ Add Farm"}
                </button>

                {editingFarmId && (
                  <button className="text-btn" type="button" onClick={cancelEditingFarm}>
                    Cancel
                  </button>
                )}

                {farmError && <div className="notice error-notice">{farmError}</div>}
                {farmSuccess && <div className="notice">{farmSuccess}</div>}
              </form>
            </section>

            <section className="panel">
              <span className="eyebrow">YOUR FARMS</span>
              <h2>Farm records ({farms.length})</h2>

              {farmsLoading ? (
                <p className="muted">Loading farm records...</p>
              ) : (
                <div className="farm-list">
                  {farms.map((farm) => (
                    <div className="farm-item" key={farm.id}>
                      <div className="farm-icon">🚜</div>
                      <div className="farm-info">
                        <strong>{farm.name}</strong>
                        <span>{farm.location} · {farm.area} acres · {farm.crop}</span>
                        <small>Farmer: {farm.farmerName}</small>
                      </div>

                      <div className="farm-actions">
                        <button
                          className="edit-btn"
                          type="button"
                          onClick={() => startEditingFarm(farm)}
                          disabled={savingFarm}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          type="button"
                          onClick={() => deleteFarm(farm.id)}
                          disabled={savingFarm}
                          aria-label={`Delete ${farm.name}`}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!farmsLoading && farms.length === 0 && (
                <p className="muted">No farms saved yet. Add your first farm using the form.</p>
              )}

              <button className="primary-btn" type="button" onClick={loadFarms} disabled={farmsLoading}>
                {farmsLoading ? "Refreshing..." : "Refresh Farm Records"}
              </button>

              <p className="muted small-note">Farm records are loaded from the backend API.</p>
            </section>
          </div>
        )}

        {page === "Crop Library" && (
          <div className="page-content">
            <section className="section-block">
              <span className="eyebrow">KNOW YOUR CROPS</span>
              <h2>Crop Library</h2>
              <p className="muted">
                General reference information; suitability varies by local conditions.
              </p>

              <div className="crop-grid library-grid">
                {crops.map((item) => (
                  <article className="crop-card" key={item.name}>
                    <div className="crop-emoji">{item.icon}</div>
                    <h3>{item.name}</h3>
                    <p>{item.season} season</p>
                    <div className="crop-meta">
                      <span>Soil: {item.soil}</span>
                      <span>Water: {item.water}</span>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {page === "AI Assistant" && (
          <div className="page-content">
            <section className="panel chat-panel">
              <span className="eyebrow">FARMING HELP</span>
              <h2>Agri Assistant</h2>
              <p className="muted">
                This demo uses predefined responses, not a live AI model or professional diagnosis.
              </p>

              <div className="chat-messages">
                {messages.map((message, index) => (
                  <div className={`chat-bubble ${message.from}`} key={index}>
                    <strong>{message.from === "user" ? "You" : "Agri Assistant"}</strong>
                    <p>{message.text}</p>
                  </div>
                ))}
              </div>

              <form className="chat-form" onSubmit={sendQuestion}>
                <input value={question} onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Ask about soil, water, pests..." required />
                <button className="primary-btn" type="submit">Send</button>
              </form>
            </section>
          </div>
        )}

        <footer className="footer">
          AgriTech · Digital tools for informed farming
          <span>Built with React</span>
        </footer>
      </main>
    </div>
  );
}
