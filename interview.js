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

    menuBtn.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle("show");

            menuBtn.textContent =
                sidebar.classList.contains("show")
                    ? "✕"
                    : "☰";

        }
    );

}


// =========================================
// LOGOUT
// =========================================

const logoutBtn =
    document.getElementById("logoutBtn");


if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                "insiderUser"
            );

            localStorage.removeItem(
                "insiderProfile"
            );

            window.location.href =
                "sign-up.html";

        }
    );

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

const companyScreen =
    document.getElementById(
        "companyScreen"
    );

const roleScreen =
    document.getElementById(
        "roleScreen"
    );

const interviewScreen =
    document.getElementById(
        "interviewScreen"
    );

const debriefScreen =
    document.getElementById(
        "debriefScreen"
    );

const roleGrid =
    document.getElementById(
        "roleGrid"
    );

const selectedCompanyName =
    document.getElementById(
        "selectedCompanyName"
    );

const interviewTitle =
    document.getElementById(
        "interviewTitle"
    );

const interviewCompany =
    document.getElementById(
        "interviewCompany"
    );

const questionNumber =
    document.getElementById(
        "questionNumber"
    );

const totalQuestions =
    document.getElementById(
        "totalQuestions"
    );

const questionText =
    document.getElementById(
        "questionText"
    );

const transcriptText =
    document.getElementById(
        "transcriptText"
    );

const answerState =
    document.getElementById(
        "answerState"
    );

const micButton =
    document.getElementById(
        "micButton"
    );

const micLabel =
    document.getElementById(
        "micLabel"
    );

const micStatus =
    document.getElementById(
        "micStatus"
    );

const speakingRing =
    document.getElementById(
        "speakingRing"
    );

const voiceWave =
    document.getElementById(
        "voiceWave"
    );

const voiceStatus =
    document.getElementById(
        "voiceStatus"
    );

const speakingStatus =
    document.getElementById(
        "speakingStatus"
    );

const listeningFor =
    document.getElementById(
        "listeningFor"
    );

const liveEvidence =
    document.getElementById(
        "liveEvidence"
    );

const evidenceText =
    document.getElementById(
        "evidenceText"
    );

const muteButton =
    document.getElementById(
        "muteButton"
    );

const hearQuestionBtn =
    document.getElementById(
        "hearQuestionBtn"
    );

const typeInsteadBtn =
    document.getElementById(
        "typeInsteadBtn"
    );

const typedAnswerArea =
    document.getElementById(
        "typedAnswerArea"
    );

const typedAnswerInput =
    document.getElementById(
        "typedAnswerInput"
    );

const backToVoiceBtn =
    document.getElementById(
        "backToVoiceBtn"
    );

const submitTypedAnswerBtn =
    document.getElementById(
        "submitTypedAnswerBtn"
    );

const microphoneArea =
    document.querySelector(
        ".microphone-area"
    );


// =========================================
// USER PROFILE
// =========================================

let profile = {};

try {

    profile =
        JSON.parse(
            localStorage.getItem(
                "insiderProfile"
            ) || "{}"
        );

} catch {

    profile = {};

}


// =========================================
// USER AVATAR
// =========================================

const userAvatar =
    document.getElementById(
        "userAvatar"
    );


if (userAvatar) {

    const name =
        profile.name ||
        "User";


    userAvatar.textContent =
        name
            .charAt(0)
            .toUpperCase();

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

let isSpeaking = false;

let isMuted = false;

let interviewStarted = false;

let interviewStartTime = null;

let timer = null;

// =========================================
// AI INTERVIEW STATE (backed by /api/interview)
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
    "Co-ordinator": ["execution", "communication", "ownership", "business_sense"],
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
        evidence: profile.evidence || [],
    };
}

function buildRole() {
    return {
        company: selectedCompany,
        title: selectedRole,
        competencies: roleCompetencies[selectedRole] || ["ownership", "problem_solving", "communication"],
    };
}

async function requestInterviewTurn() {
    const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            candidate: buildCandidate(),
            role: buildRole(),
            history: conversationHistory,
            session_state: sessionState,
        }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || "Interview request failed");
    }

    sessionState = data.session_state || {};

    return data;
}


// =========================================
// COMPANY SELECTION
// =========================================

document
    .querySelectorAll(".company-card")
    .forEach((card) => {

        card.addEventListener(
            "click",
            () => {

                selectedCompany =
                    card.dataset.company;

                showRoleScreen();

            }
        );

    });


// =========================================
// ROLE SCREEN
// =========================================

function showRoleScreen() {

    companyScreen.classList.add(
        "hidden"
    );

    roleScreen.classList.remove(
        "hidden"
    );


    selectedCompanyName.textContent =
        selectedCompany;


    roleGrid.innerHTML = "";


    const roles =
        companyRoles[
            selectedCompany
        ] || [];


    roles.forEach(
        (role) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "role-card";


            button.innerHTML = `

                <span class="role-icon">
                    💼
                </span>

                <strong>
                    ${role}
                </strong>

                <span class="role-arrow">
                    →
                </span>

            `;


            button.addEventListener(
                "click",
                () => {

                    selectedRole =
                        role;

                    startInterview();

                }
            );


            roleGrid.appendChild(
                button
            );

        }
    );

}


// =========================================
// BACK TO COMPANIES
// =========================================

const backToCompanies =
    document.getElementById(
        "backToCompanies"
    );


if (backToCompanies) {

    backToCompanies.addEventListener(
        "click",
        () => {

            roleScreen.classList.add(
                "hidden"
            );

            companyScreen.classList.remove(
                "hidden"
            );

        }
    );

}



// =========================================
// START INTERVIEW
// =========================================

function unlockAudioPlayback() {

    // Browsers only allow programmatic audio.play() later in the session
    // if a play() call happened synchronously inside a real user gesture.
    // This "primes" both the Audio element and speechSynthesis so the
    // question audio isn't silently blocked a moment later.

    try {

        // A minimal, guaranteed-valid silent WAV (zero data bytes) —
        // safe to decode on every browser, unlike a hand-built MP3 blob.
        const silence =
            new Audio(
                "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
            );

        silence.volume = 0;

        audioUnlockPromise =
            silence.play().catch(() => {});

    } catch {}

    try {

        if ("speechSynthesis" in window) {

            window.speechSynthesis.speak(
                new SpeechSynthesisUtterance("")
            );

        }

    } catch {}

}

function startInterview() {

    unlockAudioPlayback();

    currentQuestion =
        0;

    answers = [];

    conversationHistory = [];

    sessionState = {};

    currentAIQuestion = null;

    interviewDebrief = null;


    roleScreen.classList.add(
        "hidden"
    );

    companyScreen.classList.add(
        "hidden"
    );

    interviewScreen.classList.remove(
        "hidden"
    );


    interviewTitle.textContent =
        selectedRole;


    interviewCompany.textContent =
        selectedCompany;


    totalQuestions.textContent =
        "~7";


    interviewStarted =
        true;


    interviewStartTime =
        Date.now();


    setupSpeechRecognition();


    questionText.textContent =
        "Preparing your first question...";


    requestInterviewTurn()
        .then((data) => {

            currentAIQuestion = data;

            showQuestion();

        })
        .catch((error) => {

            console.error(
                "Interview start failed:",
                error
            );

            questionText.textContent =
                "Could not reach the interview service. Check your connection and try again.";

        });

}


// =========================================
// SHOW QUESTION
// =========================================

function showQuestion() {

    if (
        !currentAIQuestion ||
        currentAIQuestion.status === "complete"
    ) {

        finishInterview();

        return;

    }


    const question =
        currentAIQuestion.question;


    questionNumber.textContent =
        currentQuestion + 1;


    questionText.textContent =
        question;


    updateListeningCriteria(
        question
    );


    clearTranscript();


    stopListening();

    showVoiceAnswer();

    if (submitTypedAnswerBtn) {

        submitTypedAnswerBtn.disabled = false;

    }


    setTimeout(
        () => {

            speakQuestion(
                question
            );

        },
        400
    );

}


// =========================================
// LISTENING CRITERIA
// =========================================

function updateListeningCriteria(
    question
) {

    if (!listeningFor) {
        return;
    }


    let text =
        "A clear answer, a specific example, and evidence of what you personally contributed.";


    if (
        question
            .toLowerCase()
            .includes("project")
    ) {

        text =
            "Your role, what you built, the problem you solved, your decisions, and the result.";

    }


    if (
        question
            .toLowerCase()
            .includes("why")
    ) {

        text =
            "Your motivation, understanding of the company, and connection between your experience and the role.";

    }


    if (
        question
            .toLowerCase()
            .includes("difficult")
    ) {

        text =
            "The problem, your actions, how you handled the situation, and the outcome.";

    }


    listeningFor.textContent =
        text;

}


// =========================================
// SPEAK QUESTION
// =========================================

let currentQuestionAudio = null;

let audioUnlockPromise = null;

let pendingQuestionText = null;

function markSpeakingStart() {

    isSpeaking = true;

    speakingRing.classList.add("active");

    voiceWave.classList.add("active");

    voiceStatus.textContent = "AI is speaking...";

    speakingStatus.textContent = "Speaking";

}

function markSpeakingEnd() {

    isSpeaking = false;

    speakingRing.classList.remove("active");

    voiceWave.classList.remove("active");

    voiceStatus.textContent = "Your turn";

    speakingStatus.textContent = "Listening";

}

function speakWithBrowserVoice(
    text
) {

    if (!("speechSynthesis" in window)) {

        return;

    }

    window.speechSynthesis.cancel();

    const utterance =
        new SpeechSynthesisUtterance(text);

    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = markSpeakingStart;
    utterance.onend = markSpeakingEnd;

    window.speechSynthesis.speak(utterance);

}

async function speakQuestion(
    text
) {

    if (isMuted) {

        return;

    }

    currentQuestionAudio?.pause();

    pendingQuestionText = text;

    try {

        await audioUnlockPromise;

        const response = await fetch("/api/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, voice: "female" }),
        });

        if (!response.ok) throw new Error("TTS request failed");

        const audioUrl = URL.createObjectURL(await response.blob());

        currentQuestionAudio = new Audio(audioUrl);

        currentQuestionAudio.addEventListener("play", markSpeakingStart);

        currentQuestionAudio.addEventListener(
            "ended",
            () => {

                markSpeakingEnd();

                URL.revokeObjectURL(audioUrl);

                pendingQuestionText = null;

            },
            { once: true }
        );

        await currentQuestionAudio.play();

        pendingQuestionText = null;

    } catch (error) {

        console.error("Backend voice unavailable, falling back:", error);

        voiceStatus.textContent =
            "Tap 🔊 if you don't hear the question";

        hearQuestionBtn?.classList.add("pulse");

        try {

            speakWithBrowserVoice(text);

        } catch (fallbackError) {

            console.error("Browser voice also unavailable:", fallbackError);

        }

    }

}


// =========================================
// RETRY BLOCKED AUDIO ON NEXT INTERACTION
// =========================================
// If autoplay was blocked, the very next tap/click anywhere on the
// page is a real user gesture — use it to (re)play the question that
// never made it out, instead of leaving the candidate stuck silent.

document.addEventListener(
    "click",
    () => {

        if (pendingQuestionText && !isSpeaking) {

            const text = pendingQuestionText;

            pendingQuestionText = null;

            speakQuestion(text);

        }

    },
    { capture: true }
);


// =========================================
// HEAR QUESTION AGAIN
// =========================================

if (hearQuestionBtn) {

    hearQuestionBtn.addEventListener(
        "click",
        () => {

            hearQuestionBtn.classList.remove("pulse");

            speakQuestion(
                questionText.textContent
            );

        }
    );

}


// =========================================
// TYPE ANSWER INSTEAD
// =========================================

function showTypedAnswer() {

    stopListening();

    microphoneArea?.classList.add("hidden");

    typedAnswerArea?.classList.remove("hidden");

    typedAnswerInput.value = "";

    typedAnswerInput.focus();

}

function showVoiceAnswer() {

    typedAnswerArea?.classList.add("hidden");

    microphoneArea?.classList.remove("hidden");

}

if (typeInsteadBtn) {

    typeInsteadBtn.addEventListener(
        "click",
        showTypedAnswer
    );

}

if (backToVoiceBtn) {

    backToVoiceBtn.addEventListener(
        "click",
        showVoiceAnswer
    );

}

if (submitTypedAnswerBtn) {

    submitTypedAnswerBtn.addEventListener(
        "click",
        () => {

            const answer =
                typedAnswerInput.value.trim();

            if (!answer) {

                typedAnswerInput.focus();

                return;

            }

            submitTypedAnswerBtn.disabled = true;

            submitAnswer(
                answer,
                null
            );

        }
    );

}

if (typedAnswerInput) {

    typedAnswerInput.addEventListener(
        "keydown",
        (event) => {

            if (
                event.key === "Enter" &&
                (event.metaKey || event.ctrlKey)
            ) {

                submitTypedAnswerBtn?.click();

            }

        }
    );

}


// =========================================
// SPEECH RECOGNITION
// =========================================

function setupSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        console.warn(
            "Speech recognition is not supported."
        );

        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        true;


    recognition.interimResults =
        true;


    recognition.lang =
        "en-NG";


    recognition.onstart =
        () => {

            isListening =
                true;


            micButton.classList.add(
                "listening"
            );


            micLabel.textContent =
                "Stop Answer";


            micStatus.textContent =
                "Listening... speak naturally";


            answerState.textContent =
                "Listening";


            answerState.style.color =
                "#e24b4b";

        };


    recognition.onresult =
        (event) => {

            let finalTranscript =
                "";

            let interimTranscript =
                "";


            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                const result =
                    event.results[i];


                if (
                    result.isFinal
                ) {

                    finalTranscript +=
                        result[0].transcript;

                } else {

                    interimTranscript +=
                        result[0].transcript;

                }

            }


            const text =
                finalTranscript ||
                interimTranscript;


            if (text) {

                displayTranscript(
                    text
                );

            }

        };


    recognition.onerror =
        (event) => {

            console.warn(
                "Speech recognition:",
                event.error
            );


            if (
                event.error ===
                "not-allowed"
            ) {

                micStatus.textContent =
                    "Microphone permission was denied.";

            }


            stopListening();

        };


    recognition.onend =
        () => {

            if (
                isListening
            ) {

                try {

                    recognition.start();

                } catch {

                    // Already running.

                }

            }

        };

}


// =========================================
// DISPLAY TRANSCRIPT
// =========================================

function displayTranscript(
    text
) {

    transcriptText.innerHTML = `

        <div class="transcript-live">

            ${escapeHTML(text)}

        </div>

    `;

}


// =========================================
// CLEAR TRANSCRIPT
// =========================================

function clearTranscript() {

    if (!transcriptText) {

        return;

    }

    transcriptText.textContent =
        "Press the mic and start speaking. Your answer will appear here.";

}


// =========================================
// ESCAPE HTML
// =========================================

function escapeHTML(
    text
) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        text;


    return element.innerHTML;

}


// =========================================
// START LISTENING
// =========================================

function startListening() {

    if (!recognition) {

        alert(
            "Voice recognition is not available in this browser. Please use Chrome or Edge and allow microphone access."
        );

        return;

    }


    if (isSpeaking) {

        window.speechSynthesis.cancel();

    }


    try {

        recognition.start();

    } catch {

        // Already started.

    }

}


// =========================================
// STOP LISTENING
// =========================================

function stopListening() {

    if (!isListening) {

        return;

    }


    isListening =
        false;


    micButton.classList.remove(
        "listening"
    );


    micLabel.textContent =
        "Start Answer";


    micStatus.textContent =
        "Answer recorded";


    answerState.textContent =
        "Answer recorded";


    answerState.style.color =
        "#00a651";


    if (recognition) {

        try {

            recognition.stop();

        } catch {

            // Already stopped.

        }

    }

}


// =========================================
// MICROPHONE BUTTON
// =========================================

if (micButton) {

    micButton.addEventListener(
        "click",
        () => {

            if (!interviewStarted) {

                return;

            }


            if (isListening) {

                stopListening();

                submitVoiceAnswer();

            } else {

                startListening();

            }

        }
    );

}


// =========================================
// GET CURRENT TRANSCRIPT
// =========================================

function getTranscript() {

    if (!transcriptText) {

        return "";

    }


    return transcriptText.innerText
        .replace(
            "🎙️",
            ""
        )
        .trim();

}


// =========================================
// SUBMIT VOICE ANSWER
// =========================================

function submitVoiceAnswer() {

    const answer =
        getTranscript();


    if (!answer) {

        micStatus.textContent =
            "I didn't hear an answer. Try again.";

        return;

    }


    stopListening();

    submitAnswer(answer, micStatus);

}

function submitAnswer(
    answer,
    statusElement
) {

    answers.push({

        question:
            currentAIQuestion?.question || "",

        answer:
            answer,

        timestamp:
            new Date().toISOString()

    });


    conversationHistory.push(
        { role: "assistant", content: currentAIQuestion?.question || "" }
    );

    conversationHistory.push(
        { role: "user", content: answer }
    );


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

            currentQuestion++;

            showQuestion();

        })
        .catch((error) => {

            console.error(
                "Interview turn failed:",
                error
            );

            if (statusElement) {

                statusElement.textContent =
                    "Could not reach the interview service. Try again.";

            }

        });

}


// =========================================
// RENDER EVIDENCE (from real /api/interview evaluation)
// =========================================

function renderEvidence(
    evaluation
) {

    if (
        !liveEvidence ||
        !evidenceText ||
        !evaluation
    ) {

        return;

    }


    const found =
        evaluation.evidence_found &&
        evaluation.evidence_found.length
            ? evaluation.evidence_found
            : [evaluation.strength ? `Strength: ${evaluation.strength}` : "Evaluating your answer..."];


    evidenceText.textContent =
        found.join(
            " • "
        );


    liveEvidence.classList.remove(
        "hidden"
    );

}


// =========================================
// MUTE AI
// =========================================

if (muteButton) {

    muteButton.addEventListener(
        "click",
        () => {

            isMuted =
                !isMuted;


            if (isMuted) {

                window.speechSynthesis.cancel();


                muteButton.textContent =
                    "🔊 Unmute AI";

            } else {

                muteButton.textContent =
                    "🔇 Mute AI";

            }

        }
    );

}


// =========================================
// CUSTOM EXIT ALERT
// =========================================

const exitConfirm =
    document.getElementById(
        "exitConfirm"
    );

const cancelExit =
    document.getElementById(
        "cancelExit"
    );

const confirmExit =
    document.getElementById(
        "confirmExit"
    );

const endInterviewBtn =
    document.getElementById(
        "endInterviewBtn"
    );


function openExitConfirm() {

    exitConfirm.classList.add(
        "show"
    );

}


function closeExitConfirm() {

    exitConfirm.classList.remove(
        "show"
    );

}


if (endInterviewBtn) {

    endInterviewBtn.addEventListener(
        "click",
        openExitConfirm
    );

}


if (cancelExit) {

    cancelExit.addEventListener(
        "click",
        closeExitConfirm
    );

}


if (confirmExit) {

    confirmExit.addEventListener(
        "click",
        () => {

            closeExitConfirm();

            finishInterview();

        }
    );

}


if (exitConfirm) {

    exitConfirm.addEventListener(
        "click",
        (event) => {

            if (
                event.target ===
                exitConfirm
            ) {

                closeExitConfirm();

            }

        }
    );

}


// =========================================
// FINISH INTERVIEW
// =========================================

function finishInterview() {

    interviewStarted =
        false;


    stopListening();


    if (
        "speechSynthesis" in window
    ) {

        window.speechSynthesis.cancel();

    }

    currentQuestionAudio?.pause();


    const debrief =
        interviewDebrief || {};


    const interviewData = {

        company:
            selectedCompany,

        role:
            selectedRole,

        answers:
            answers,

        debrief:
            debrief,

        completedAt:
            new Date().toISOString()

    };


    localStorage.setItem(
        "insiderInterview",
        JSON.stringify(
            interviewData
        )
    );


    renderDebrief(
        interviewData
    );


    interviewScreen.classList.add(
        "hidden"
    );


    debriefScreen.classList.remove(
        "hidden"
    );

}


// =========================================
// DEBRIEF
// =========================================

function renderDebrief(
    data
) {

    const performanceScore =
        document.getElementById(
            "performanceScore"
        );

    const evidenceCount =
        document.getElementById(
            "evidenceCount"
        );

    const progressScore =
        document.getElementById(
            "progressScore"
        );

    const overallSummary =
        document.getElementById(
            "overallSummary"
        );

    const strengthsList =
        document.getElementById(
            "strengthsList"
        );

    const gapsList =
        document.getElementById(
            "gapsList"
        );

    const coachingList =
        document.getElementById(
            "coachingList"
        );


    const debrief =
        data.debrief || {};

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
        debrief.evidence_discovered && debrief.evidence_discovered.length
            ? debrief.evidence_discovered.length
            : data.answers.length;

    const score =
        Math.round(
            (
                strengths.length /
                (strengths.length + weaknesses.length)
            ) * 100
        );


    performanceScore.textContent =
        `${score}%`;


    evidenceCount.textContent =
        evidenceDiscovered;


    progressScore.textContent =
        `${score}%`;


    overallSummary.textContent =

        debrief.overall_summary ||

        `You completed your ${data.role} interview for ${data.company}. Insider captured ${data.answers.length} answered question${data.answers.length === 1 ? "" : "s"} as evidence.`;



    strengthsList.innerHTML =

        strengths
            .map((item) => `<li>${escapeHTML(item)}</li>`)
            .join("");



    gapsList.innerHTML =

        weaknesses
            .map((item) => `<li>${escapeHTML(item)}</li>`)
            .join("");



    coachingList.innerHTML =

        coaching
            .map((item) => `<li>${escapeHTML(item)}</li>`)
            .join("");

}


// =========================================
// PRACTICE ANOTHER INTERVIEW
// =========================================

const anotherInterviewBtn =
    document.getElementById(
        "anotherInterviewBtn"
    );


if (anotherInterviewBtn) {

    anotherInterviewBtn.addEventListener(
        "click",
        () => {

            debriefScreen.classList.add(
                "hidden"
            );


            companyScreen.classList.remove(
                "hidden"
            );


            selectedCompany =
                "";

            selectedRole =
                "";

            answers =
                [];

            currentQuestion =
                0;

        }
    );

}


// =========================================
// ESCAPE KEY
// =========================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            exitConfirm.classList.contains(
                "show"
            )
        ) {

            closeExitConfirm();

        }

    }
);