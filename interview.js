// =========================================
// INSIDER AI VOICE INTERVIEW
// =========================================


// =========================================
// MOBILE MENU
// =========================================

const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");

if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("show");

        menuBtn.innerHTML =
            sidebar.classList.contains("show")
                ? '<i class="fa-solid fa-xmark"></i>'
                : '<i class="fa-solid fa-bars"></i>';
    });
}


// =========================================
// LOGOUT
// =========================================

const logoutBtn =
    document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("insiderUser");
        localStorage.removeItem("insiderProfile");
        window.location.href = "sign-up.html";
    });
}


// =========================================
// COMPANY ROLES
// =========================================

const companyRoles = {
    "MTN Nigeria": [
        "Sales Representative",
        "Customer Relations",
        "Data Analyst",
        "Product Manager",
        "Co-ordinator"
    ],

    "GTCO": [
        "Software Engineer",
        "Data Analyst",
        "Product Manager",
        "Risk Analyst",
        "Digital Banking Specialist"
    ],

    "Microsoft": [
        "Software Engineer",
        "Cloud Engineer",
        "Data Scientist",
        "Product Manager",
        "UX Designer"
    ]
};


// =========================================
// ELEMENTS
// =========================================

const companyScreen = document.getElementById("companyScreen");
const roleScreen = document.getElementById("roleScreen");
const interviewScreen = document.getElementById("interviewScreen");
const debriefScreen = document.getElementById("debriefScreen");
const roleGrid = document.getElementById("roleGrid");
const selectedCompanyName = document.getElementById("selectedCompanyName");
const interviewTitle = document.getElementById("interviewTitle");
const interviewCompany = document.getElementById("interviewCompany");
const questionNumber = document.getElementById("questionNumber");
const totalQuestions = document.getElementById("totalQuestions");
const questionText = document.getElementById("questionText");
const transcriptText = document.getElementById("transcriptText");
const answerState = document.getElementById("answerState");
const micButton = document.getElementById("micButton");
const micLabel = document.getElementById("micLabel");
const micStatus = document.getElementById("micStatus");
const speakingRing = document.getElementById("speakingRing");
const voiceWave = document.getElementById("voiceWave");
const voiceStatus = document.getElementById("voiceStatus");
const speakingStatus = document.getElementById("speakingStatus");
const listeningFor = document.getElementById("listeningFor");
const liveEvidence = document.getElementById("liveEvidence");
const strengthBadge = document.getElementById("strengthBadge");
const evidenceFoundBlock = document.getElementById("evidenceFoundBlock");
const evidenceFoundList = document.getElementById("evidenceFoundList");
const missingEvidenceBlock = document.getElementById("missingEvidenceBlock");
const missingEvidenceList = document.getElementById("missingEvidenceList");
const muteButton = document.getElementById("muteButton");
const hearQuestionBtn = document.getElementById("hearQuestionBtn");
const typeInsteadBtn = document.getElementById("typeInsteadBtn");
const typedAnswerArea = document.getElementById("typedAnswerArea");
const typedAnswerInput = document.getElementById("typedAnswerInput");
const backToVoiceBtn = document.getElementById("backToVoiceBtn");
const submitTypedAnswerBtn = document.getElementById("submitTypedAnswerBtn");
const microphoneArea = document.querySelector(".microphone-area");


// =========================================
// USER PROFILE
// =========================================

let profile = {};

try {
    profile = JSON.parse(
        localStorage.getItem("insiderProfile") || "{}"
    );
} catch {
    profile = {};
}


// =========================================
// USER AVATAR
// =========================================

const userAvatar = document.getElementById("userAvatar");

if (userAvatar) {
    const name = profile.name || "User";
    userAvatar.textContent = name.charAt(0).toUpperCase();
}


// =========================================
// STATE
// =========================================

let selectedCompany = "";
let selectedRole = "";
let currentQuestion = 0;
let questions = [];
let answers = [];
let recognition = null;
let isListening = false;
let accumulatedTranscript = "";
let silenceTimer = null;
const SILENCE_TIMEOUT_MS = 2200;
let isSpeaking = false;
let isMuted = false;
let interviewStarted = false;
let interviewStartTime = null;
let timer = null;


// =========================================
// AI INTERVIEW STATE
// =========================================

const roleCompetencies = {
    "Software Engineer": ["problem_solving", "code_quality", "ownership", "communication"],
    "Frontend Engineer": ["ui_craft", "problem_solving", "ownership", "communication"],
    "Backend Engineer": ["system_design", "problem_solving", "ownership", "communication"],
    "Data Analyst": ["analytical_rigor", "communication", "business_sense", "ownership"],
    "Data Scientist": ["analytical_rigor", "problem_solving", "communication", "ownership"],
    "Product Manager": ["product_thinking", "prioritization", "influence", "execution"],
    "UX Designer": ["customer_empathy", "product_thinking", "communication", "execution"],
    "Cloud Engineer": ["system_design", "problem_solving", "ownership", "communication"],
    "Risk Analyst": ["analytical_rigor", "judgement", "communication", "ownership"],
    "Relationship Manager": ["customer_empathy", "communication", "influence", "ownership"],
    "Digital Banking Specialist": ["customer_empathy", "execution", "communication", "ownership"],
    "DevOps Engineer": ["system_design", "problem_solving", "ownership", "communication"],
    "Sales Representative": ["influence", "communication", "ownership", "business_sense"],
    "Customer Relations": ["customer_empathy", "communication", "ownership", "execution"],
    "Co-ordinator": ["execution", "communication", "ownership", "business_sense"]
};

let conversationHistory = [];
let sessionState = {};
let currentAIQuestion = null;
let interviewDebrief = null;


function buildCandidate() {
    return {
        name: profile.name || "Candidate",
        field: profile.field || profile.profession || "",
        summary: profile.summary || "",
        goals: profile.goals || [],
        skills: profile.skills || [],
        evidence: profile.evidence || []
    };
}


function buildRole() {
    return {
        company: selectedCompany,
        title: selectedRole,
        competencies: roleCompetencies[selectedRole] ||
            ["ownership", "problem_solving", "communication"]
    };
}


function updateQuestionEstimate() {
    const assessed =
        (sessionState.competencies_assessed || []).length;

    const remaining =
        (sessionState.remaining_competencies || []).length;

    const estimate =
        Math.max(assessed + remaining + 1, currentQuestion + 1);

    totalQuestions.textContent = `~${estimate}`;
}


async function requestInterviewTurn() {
    const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            candidate: buildCandidate(),
            role: buildRole(),
            history: conversationHistory,
            session_state: sessionState
        })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.error?.message || "Interview request failed"
        );
    }

    sessionState = data.session_state || {};
    updateQuestionEstimate();

    return data;
}


// =========================================
// COMPANY SELECTION
// =========================================

document.querySelectorAll(".company-card").forEach((card) => {
    card.addEventListener("click", () => {
        selectedCompany = card.dataset.company;
        showRoleScreen();
    });
});


// =========================================
// ROLE SCREEN
// =========================================

function showRoleScreen() {
    companyScreen.classList.add("hidden");
    roleScreen.classList.remove("hidden");

    selectedCompanyName.textContent = selectedCompany;
    roleGrid.innerHTML = "";

    const roles = companyRoles[selectedCompany] || [];

    roles.forEach((role) => {
        const button = document.createElement("button");
        button.className = "role-card";
        button.textContent = role;

        button.addEventListener("click", () => {
            selectedRole = role;
            startInterview();
        });

        roleGrid.appendChild(button);
    });
}


// =========================================
// START INTERVIEW
// =========================================

async function startInterview() {
    selectedRole = selectedRole || "";

    roleScreen.classList.add("hidden");
    interviewScreen.classList.remove("hidden");

    interviewTitle.textContent = selectedRole;
    interviewCompany.textContent = selectedCompany;

    currentQuestion = 0;
    answers = [];
    conversationHistory = [];
    sessionState = {};
    interviewDebrief = null;
    currentAIQuestion = null;

    interviewStarted = true;
    interviewStartTime = Date.now();

    try {
        const data = await requestInterviewTurn();

        currentAIQuestion = data;
        showQuestion();
    } catch (error) {
        console.error("Could not start interview:", error);

        questionText.textContent =
            "Unable to start the interview. Please try again.";
    }
}


// =========================================
// QUESTION DISPLAY
// =========================================

function showQuestion() {
    if (!currentAIQuestion) return;

    if (currentAIQuestion.status === "complete") {
        interviewDebrief = currentAIQuestion.debrief;
        finishInterview();
        return;
    }

    const question =
        currentAIQuestion.question || "";

    if (!question) {
        questionText.textContent =
            "Waiting for the next interview question...";
        return;
    }

    currentQuestion++;

    questionNumber.textContent = currentQuestion;
    questionText.textContent = question;

    if (transcriptText) {
        transcriptText.textContent = "";
    }

    if (typedAnswerInput) {
        typedAnswerInput.value = "";
    }

    if (!isMuted) {
        speakQuestion(question);
    }
}


// =========================================
// TEXT TO SPEECH
// =========================================

let currentQuestionAudio = null;

function speakQuestion(text) {
    if (!("speechSynthesis" in window) || isMuted) {
        return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => {
        isSpeaking = true;

        if (speakingStatus) {
            speakingStatus.textContent = "Insider is speaking...";
        }
    };

    utterance.onend = () => {
        isSpeaking = false;

        if (speakingStatus) {
            speakingStatus.textContent = "Your turn to answer";
        }
    };

    utterance.onerror = () => {
        isSpeaking = false;
    };

    window.speechSynthesis.speak(utterance);
}


// =========================================
// SPEECH RECOGNITION
// =========================================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
                accumulatedTranscript += transcript + " ";
            } else {
                interimTranscript += transcript;
            }
        }

        if (transcriptText) {
            transcriptText.textContent =
                accumulatedTranscript + interimTranscript;
        }

        clearTimeout(silenceTimer);

        silenceTimer = setTimeout(() => {
            if (isListening) {
                stopListening();
                reviewTranscriptBeforeSubmit();
            }
        }, SILENCE_TIMEOUT_MS);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);

        if (micStatus) {
            micStatus.textContent =
                "Microphone error. You can type your answer instead.";
        }

        isListening = false;
    };

    recognition.onend = () => {
        isListening = false;

        if (micLabel) {
            micLabel.textContent = "Start speaking";
        }
    };
}


// =========================================
// MICROPHONE CONTROLS
// =========================================

function startListening() {
    if (!recognition) {
        if (micStatus) {
            micStatus.textContent =
                "Speech recognition is not supported. Please type your answer.";
        }
        return;
    }

    accumulatedTranscript = "";

    if (transcriptText) {
        transcriptText.textContent = "";
    }

    try {
        recognition.start();
        isListening = true;

        if (micLabel) {
            micLabel.textContent = "Stop recording";
        }

        if (micStatus) {
            micStatus.textContent = "Listening...";
        }
    } catch (error) {
        console.error("Could not start microphone:", error);
    }
}


function stopListening() {
    clearTimeout(silenceTimer);

    if (recognition && isListening) {
        try {
            recognition.stop();
        } catch (error) {
            console.warn("Recognition already stopped:", error);
        }
    }

    isListening = false;

    if (micLabel) {
        micLabel.textContent = "Start speaking";
    }
}


function reviewTranscriptBeforeSubmit() {
    const answer = getTranscript();

    if (!answer.trim()) {
        if (answerState) {
            answerState.textContent =
                "No answer detected. Please try again or type your answer.";
        }
        return;
    }

    if (answerState) {
        answerState.textContent = "Answer recorded";
        answerState.style.color = "#00a651";
    }
}


// =========================================
// MICROPHONE BUTTON
// =========================================

if (micButton) {
    micButton.addEventListener("click", () => {
        if (!interviewStarted) return;

        if (isListening) {
            stopListening();
            reviewTranscriptBeforeSubmit();
        } else {
            startListening();
        }
    });
}


// =========================================
// GET CURRENT TRANSCRIPT
// =========================================

function getTranscript() {
    if (!transcriptText) return "";
    return transcriptText.innerText.trim();
}


// =========================================
// SUBMIT ANSWER
// =========================================

function submitAnswer(answer, statusElement) {
    if (!answer || !answer.trim()) {
        if (statusElement) {
            statusElement.textContent = "Please provide an answer first.";
        }
        return;
    }

    answers.push({
        question: currentAIQuestion?.question || "",
        answer: answer,
        timestamp: new Date().toISOString()
    });

    conversationHistory.push({
        role: "assistant",
        content: currentAIQuestion?.question || ""
    });

    conversationHistory.push({
        role: "user",
        content: answer
    });

    if (statusElement) {
        statusElement.textContent =
            "Thinking about your answer...";
    }

    requestInterviewTurn()
        .then((data) => {
            currentAIQuestion = data;

            renderEvidence(data.evaluation);

            if (data.status === "complete") {
                interviewDebrief = data.debrief;
            }

            showQuestion();
        })
        .catch((error) => {
            console.error("Interview turn failed:", error);

            if (statusElement) {
                statusElement.textContent =
                    "Could not reach the interview service. Try again.";
            }
        });
}


// =========================================
// RENDER EVIDENCE
// =========================================

function renderEvidence(evaluation) {
    if (!liveEvidence || !evaluation) return;

    const strength = evaluation.strength || "unknown";

    if (strengthBadge) {
        strengthBadge.textContent = strength;
        strengthBadge.className =
            `strength-badge strength-${strength}`;
    }

    const found = evaluation.evidence_found || [];

    if (evidenceFoundList) {
        evidenceFoundList.innerHTML = found.length
            ? found.map((item) =>
                `<li>${escapeHTML(item)}</li>`
            ).join("")
            : "<li>Nothing concrete yet — try naming a specific action and result.</li>";
    }

    const missing = evaluation.missing_evidence || [];

    if (missingEvidenceBlock) {
        missingEvidenceBlock.classList.toggle(
            "hidden",
            missing.length === 0
        );
    }

    if (missingEvidenceList) {
        missingEvidenceList.innerHTML =
            missing.map((item) =>
                `<li>${escapeHTML(item)}</li>`
            ).join("");
    }

    liveEvidence.classList.remove("hidden");
}


// =========================================
// HTML ESCAPING
// =========================================

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =========================================
// MUTE AI
// =========================================

if (muteButton) {
    muteButton.addEventListener("click", () => {
        isMuted = !isMuted;

        if (isMuted) {
            window.speechSynthesis.cancel();

            muteButton.innerHTML =
                '<i class="fa-solid fa-volume-high"></i> Unmute AI';
        } else {
            muteButton.innerHTML =
                '<i class="fa-solid fa-volume-xmark"></i> Mute AI';
        }
    });
}


// =========================================
// HEAR QUESTION AGAIN
// =========================================

if (hearQuestionBtn) {
    hearQuestionBtn.addEventListener("click", () => {
        if (currentAIQuestion?.question) {
            speakQuestion(currentAIQuestion.question);
        }
    });
}


// =========================================
// TYPE ANSWER INSTEAD
// =========================================

if (typeInsteadBtn) {
    typeInsteadBtn.addEventListener("click", () => {
        if (microphoneArea) {
            microphoneArea.classList.add("hidden");
        }

        if (typedAnswerArea) {
            typedAnswerArea.classList.remove("hidden");
        }

        if (typedAnswerInput) {
            typedAnswerInput.focus();
        }
    });
}


if (backToVoiceBtn) {
    backToVoiceBtn.addEventListener("click", () => {
        if (typedAnswerArea) {
            typedAnswerArea.classList.add("hidden");
        }

        if (microphoneArea) {
            microphoneArea.classList.remove("hidden");
        }
    });
}


if (submitTypedAnswerBtn) {
    submitTypedAnswerBtn.addEventListener("click", () => {
        const answer = typedAnswerInput?.value.trim() || "";

        if (!answer) {
            if (answerState) {
                answerState.textContent =
                    "Please type your answer first.";
            }
            return;
        }

        submitAnswer(answer, answerState);
    });
}


// =========================================
// SUBMIT VOICE ANSWER
// =========================================

const submitVoiceAnswerBtn =
    document.getElementById("submitVoiceAnswerBtn");

if (submitVoiceAnswerBtn) {
    submitVoiceAnswerBtn.addEventListener("click", () => {
        const answer = getTranscript();

        if (!answer) {
            if (answerState) {
                answerState.textContent =
                    "Please record an answer first.";
            }
            return;
        }

        submitAnswer(answer, answerState);
    });
}


// =========================================
// CUSTOM EXIT ALERT
// =========================================

const exitConfirm = document.getElementById("exitConfirm");
const cancelExit = document.getElementById("cancelExit");
const confirmExit = document.getElementById("confirmExit");
const endInterviewBtn = document.getElementById("endInterviewBtn");


function openExitConfirm() {
    if (exitConfirm) {
        exitConfirm.classList.add("show");
    }
}


function closeExitConfirm() {
    if (exitConfirm) {
        exitConfirm.classList.remove("show");
    }
}


if (endInterviewBtn) {
    endInterviewBtn.addEventListener("click", openExitConfirm);
}


if (cancelExit) {
    cancelExit.addEventListener("click", closeExitConfirm);
}


if (confirmExit) {
    confirmExit.addEventListener("click", () => {
        closeExitConfirm();
        finishInterview();
    });
}


if (exitConfirm) {
    exitConfirm.addEventListener("click", (event) => {
        if (event.target === exitConfirm) {
            closeExitConfirm();
        }
    });
}


// =========================================
// FINISH INTERVIEW
// =========================================

function finishInterview() {
    interviewStarted = false;

    stopListening();

    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }

    currentQuestionAudio?.pause();

    const debrief = interviewDebrief || {};

    const interviewData = {
        company: selectedCompany,
        role: selectedRole,
        answers: answers,
        debrief: debrief,
        completedAt: new Date().toISOString()
    };

    localStorage.setItem(
        "insiderInterview",
        JSON.stringify(interviewData)
    );

    renderDebrief(interviewData);

    interviewScreen.classList.add("hidden");
    debriefScreen.classList.remove("hidden");
}


// =========================================
// DEBRIEF
// =========================================

function renderDebrief(data) {
    const performanceScore =
        document.getElementById("performanceScore");

    const evidenceCount =
        document.getElementById("evidenceCount");

    const progressScore =
        document.getElementById("progressScore");

    const overallSummary =
        document.getElementById("overallSummary");

    const strengthsList =
        document.getElementById("strengthsList");

    const gapsList =
        document.getElementById("gapsList");

    const coachingList =
        document.getElementById("coachingList");

    const debrief = data.debrief || {};

    const strengths =
        debrief.strengths && debrief.strengths.length
            ? debrief.strengths
            : ["Completed the interview."];

    const weaknesses =
        debrief.weaknesses && debrief.weaknesses.length
            ? debrief.weaknesses
            : ["No major gaps flagged."];

    const coaching =
        debrief.specific_coaching && debrief.specific_coaching.length
            ? debrief.specific_coaching
            : ["Use the STAR structure for behavioural questions."];

    const evidenceDiscovered =
        debrief.evidence_discovered &&
        debrief.evidence_discovered.length
            ? debrief.evidence_discovered.length
            : data.answers.length;

    // Use only the score supplied by the interview evaluator.
    // Never calculate a score by counting strengths or weaknesses.
    const rawScore = debrief.performance_score;

    const hasValidScore =
        typeof rawScore === "number" &&
        Number.isFinite(rawScore) &&
        rawScore >= 0 &&
        rawScore <= 100;

    if (performanceScore) {
        performanceScore.textContent =
            hasValidScore
                ? `${Math.round(rawScore)}%`
                : "Not scored";
    }

    if (evidenceCount) {
        evidenceCount.textContent = evidenceDiscovered;
    }

    // Reaching the debrief means the interview itself is complete.
    if (progressScore) {
        progressScore.textContent = "100%";
    }

    if (overallSummary) {
        overallSummary.textContent =
            debrief.overall_summary ||
            `You completed your ${data.role} interview for ${data.company}. Insider captured ${data.answers.length} answered question${data.answers.length === 1 ? "" : "s"} as evidence.`;
    }

    if (strengthsList) {
        strengthsList.innerHTML =
            strengths.map((item) =>
                `<li>${escapeHTML(item)}</li>`
            ).join("");
    }

    if (gapsList) {
        gapsList.innerHTML =
            weaknesses.map((item) =>
                `<li>${escapeHTML(item)}</li>`
            ).join("");
    }

    if (coachingList) {
        coachingList.innerHTML =
            coaching.map((item) =>
                `<li>${escapeHTML(item)}</li>`
            ).join("");
    }
}


// =========================================
// PRACTICE ANOTHER INTERVIEW
// =========================================

const anotherInterviewBtn =
    document.getElementById("anotherInterviewBtn");

if (anotherInterviewBtn) {
    anotherInterviewBtn.addEventListener("click", () => {
        debriefScreen.classList.add("hidden");
        companyScreen.classList.remove("hidden");

        selectedCompany = "";
        selectedRole = "";
        answers = [];
        currentQuestion = 0;
        conversationHistory = [];
        sessionState = {};
        interviewDebrief = null;
        currentAIQuestion = null;
    });
}


// =========================================
// ESCAPE KEY
// =========================================

document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        exitConfirm &&
        exitConfirm.classList.contains("show")
    ) {
        closeExitConfirm();
    }
});
