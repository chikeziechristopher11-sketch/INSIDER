// =========================================
// MOBILE MENU / LOGOUT (shared pattern)
// =========================================

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

if (menuBtn && sidebar) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("show");
    menuBtn.innerHTML = sidebar.classList.contains("show")
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
  });
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("insiderUser");
    localStorage.removeItem("insiderProfile");
    window.location.href = "sign-up.html";
  });
}

// =========================================
// ELEMENTS
// =========================================

const trackScreen = document.getElementById("trackScreen");
const introScreen = document.getElementById("introScreen");
const testScreen = document.getElementById("testScreen");
const resultsScreen = document.getElementById("resultsScreen");

const trackGrid = document.getElementById("trackGrid");
const backToTracksBtn = document.getElementById("backToTracksBtn");
const selectedTrackLabel = document.getElementById("selectedTrackLabel");

const startTestBtn = document.getElementById("startTestBtn");
const introDuration = document.getElementById("introDuration");
const introCount = document.getElementById("introCount");
const introCategories = document.getElementById("introCategories");

const questionCounter = document.getElementById("questionCounter");
const categoryPill = document.getElementById("categoryPill");
const timerEl = document.getElementById("timer");
const progressFill = document.getElementById("progressFill");
const questionText = document.getElementById("questionText");
const optionsList = document.getElementById("optionsList");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const submitBtn = document.getElementById("submitBtn");

const scoreValue = document.getElementById("scoreValue");
const scoreCorrect = document.getElementById("scoreCorrect");
const scoreTotal = document.getElementById("scoreTotal");
const scoreSummary = document.getElementById("scoreSummary");
const resultsHeadline = document.getElementById("resultsHeadline");
const categoryBreakdown = document.getElementById("categoryBreakdown");
const retryBtn = document.getElementById("retryBtn");

const CATEGORY_LABELS = {
  numerical: "Numerical",
  logical: "Logical",
  verbal: "Verbal",
  attention: "Attention to detail",
  technical: "Technical",
  marketing: "Marketing",
};

const TRACK_ICONS = {
  general: "fa-layer-group",
  software_engineer: "fa-code",
  marketer: "fa-bullhorn",
};

const TRACK_DESCRIPTIONS = {
  general: "Core reasoning only — numerical, logical, verbal, attention to detail.",
  software_engineer: "Core reasoning plus technical questions on algorithms, git, SQL and data structures.",
  marketer: "Core reasoning plus marketing questions on CAC, LTV, conversion and campaign metrics.",
};

// =========================================
// STATE
// =========================================

let questions = [];
let answers = {}; // { [questionId]: selectedIndex }
let currentIndex = 0;
let secondsRemaining = 0;
let timerInterval = null;
let selectedTrack = "software_engineer";

function showScreen(screen) {
  [trackScreen, introScreen, testScreen, resultsScreen].forEach((el) => {
    el.classList.toggle("hidden", el !== screen);
    el.classList.toggle("active", el === screen);
  });
}

// =========================================
// TRACK SELECTION
// =========================================

async function loadTracks() {
  try {
    const response = await fetch("/api/aptitude/tracks");
    if (!response.ok) throw new Error("Could not load tracks");
    const data = await response.json();

    trackGrid.innerHTML = "";
    data.tracks.forEach((track) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "track-card";
      card.innerHTML = `
        <div class="track-icon"><i class="fa-solid ${TRACK_ICONS[track.id] || "fa-layer-group"}"></i></div>
        <h3>${track.label}</h3>
        <p>${TRACK_DESCRIPTIONS[track.id] || ""}</p>
        <span class="track-arrow">→</span>
      `;
      card.addEventListener("click", () => selectTrack(track.id, track.label));
      trackGrid.appendChild(card);
    });
  } catch (error) {
    console.error("Failed to load tracks:", error);
    trackGrid.innerHTML = "<p>Could not load tracks. Refresh and try again.</p>";
  }
}

function selectTrack(trackId, trackLabel) {
  selectedTrack = trackId;
  selectedTrackLabel.textContent = trackLabel;
  showScreen(introScreen);
}

if (backToTracksBtn) {
  backToTracksBtn.addEventListener("click", () => showScreen(trackScreen));
}

loadTracks();

// =========================================
// START TEST
// =========================================

async function startTest() {
  startTestBtn.disabled = true;
  startTestBtn.textContent = "Loading questions...";

  try {
    const response = await fetch("/api/aptitude/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: 12, track: selectedTrack }),
    });

    if (!response.ok) throw new Error("Could not load the aptitude test");

    const data = await response.json();
    questions = data.questions;
    secondsRemaining = data.duration_seconds;
    answers = {};
    currentIndex = 0;

    introCount.textContent = questions.length;
    introCategories.textContent = new Set(questions.map((q) => q.category)).size;

    showScreen(testScreen);
    renderQuestion();
    startTimer();
  } catch (error) {
    console.error("Aptitude start failed:", error);
    startTestBtn.disabled = false;
    startTestBtn.textContent = "Start Test →";
    alert("Could not load the test. Check your connection and try again.");
  }
}

startTestBtn.addEventListener("click", startTest);

// =========================================
// TIMER
// =========================================

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function startTimer() {
  introDuration.textContent = Math.round(secondsRemaining / 60);
  timerEl.textContent = formatTime(secondsRemaining);

  window.clearInterval(timerInterval);
  timerInterval = window.setInterval(() => {
    secondsRemaining--;
    timerEl.textContent = formatTime(Math.max(0, secondsRemaining));

    timerEl.classList.toggle("urgent", secondsRemaining <= 60);

    if (secondsRemaining <= 0) {
      window.clearInterval(timerInterval);
      submitTest();
    }
  }, 1000);
}

// =========================================
// RENDER QUESTION
// =========================================

function renderQuestion() {
  const question = questions[currentIndex];

  questionCounter.textContent = `Question ${currentIndex + 1} / ${questions.length}`;
  categoryPill.textContent = CATEGORY_LABELS[question.category] || question.category;
  progressFill.style.width = `${((currentIndex + 1) / questions.length) * 100}%`;

  questionText.textContent = question.question;

  optionsList.innerHTML = "";
  question.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn";
    if (answers[question.id] === index) button.classList.add("selected");
    button.textContent = option;
    button.addEventListener("click", () => selectOption(question.id, index));
    optionsList.appendChild(button);
  });

  prevBtn.disabled = currentIndex === 0;

  const isLast = currentIndex === questions.length - 1;
  nextBtn.classList.toggle("hidden", isLast);
  submitBtn.classList.toggle("hidden", !isLast);
}

function selectOption(questionId, index) {
  answers[questionId] = index;
  [...optionsList.children].forEach((button, i) => {
    button.classList.toggle("selected", i === index);
  });
}

prevBtn.addEventListener("click", () => {
  if (currentIndex > 0) {
    currentIndex--;
    renderQuestion();
  }
});

nextBtn.addEventListener("click", () => {
  if (currentIndex < questions.length - 1) {
    currentIndex++;
    renderQuestion();
  }
});

// =========================================
// SUBMIT TEST
// =========================================

async function submitTest() {
  window.clearInterval(timerInterval);

  submitBtn.disabled = true;
  nextBtn.disabled = true;

  const payload = {
    answers: questions.map((question) => ({
      id: question.id,
      selected_index: answers[question.id] ?? -1,
    })),
  };

  try {
    const response = await fetch("/api/aptitude/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error("Could not score the test");

    const result = await response.json();
    renderResults(result);
  } catch (error) {
    console.error("Aptitude submit failed:", error);
    alert("Could not submit the test. Check your connection and try again.");
    submitBtn.disabled = false;
    nextBtn.disabled = false;
  }
}

submitBtn.addEventListener("click", submitTest);

// =========================================
// RESULTS
// =========================================

function renderResults(result) {
  showScreen(resultsScreen);

  scoreValue.textContent = result.score;
  scoreCorrect.textContent = result.correct;
  scoreTotal.textContent = result.total;

  if (result.score >= 80) {
    resultsHeadline.textContent = "Strong performance.";
  } else if (result.score >= 50) {
    resultsHeadline.textContent = "Solid, with room to grow.";
  } else {
    resultsHeadline.textContent = "Good starting point — keep practicing.";
  }

  categoryBreakdown.innerHTML = "";
  Object.entries(result.by_category).forEach(([category, stats]) => {
    const row = document.createElement("div");
    row.className = "category-row";
    row.innerHTML = `
      <span class="category-name">${CATEGORY_LABELS[category] || category}</span>
      <div class="category-bar">
        <div class="category-bar-fill" style="width:${stats.score}%"></div>
      </div>
      <span class="category-score">${stats.correct}/${stats.total}</span>
    `;
    categoryBreakdown.appendChild(row);
  });

  try {
    const history = JSON.parse(localStorage.getItem("insiderAptitudeHistory") || "[]");
    history.push({ score: result.score, completedAt: new Date().toISOString() });
    localStorage.setItem("insiderAptitudeHistory", JSON.stringify(history.slice(-10)));
  } catch {
    // non-critical
  }
}

retryBtn.addEventListener("click", () => {
  showScreen(introScreen);
  startTestBtn.disabled = false;
  startTestBtn.textContent = "Start Test →";
});
