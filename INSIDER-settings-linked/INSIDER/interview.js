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
    
  "Stanbic IBTC": [
    "Software Engineer",
    "Data Analyst",
    "Product Manager",
    "Risk Analyst",
    "Relationship Manager"
  ],

  "MTN Nigeria": [
    "Sales Representative",
    "Customer Relations",
    "Data Analyst",
    "Product Manager",
    "Co-ordinator"
  ],

  "GTB": [
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
  ],

  "Flutterwave": [
    "Backend Engineer",
    "Frontend Engineer",
    "Product Manager",
    "Data Analyst",
    "Risk Analyst"
  ]
};


// =========================================
// COMPANY QUESTIONS
// =========================================

const companyQuestions = {

    "Stanbic IBTC": [

        "Why do you want to work at Stanbic IBTC?",

        "What interests you about financial technology and banking?",

        "Tell me about a project that demonstrates your ability for this role.",

        "How would you solve a problem affecting customers of a digital banking platform?",

        "Tell me about a time you worked with a difficult stakeholder."

    ],


    "MTN Nigeria": [

        "Why do you want to work at MTN Nigeria?",

        "How would you use technology to improve the experience of MTN customers?",

        "Tell me about a project that demonstrates your technical or professional skills.",

        "Describe a difficult problem you solved and how you approached it.",

        "How do you handle working in a large organization with multiple teams?"

    ],


    "GTB": [

        "Why are you interested in working at GTB?",

        "What interests you about digital banking?",

        "Tell me about a project that demonstrates your ability for this role.",

        "How would you improve a digital banking experience for customers?",

        "Tell me about a time you had to make an important decision with limited information."

    ],


    "Microsoft": [

        "Why do you want to work at Microsoft?",

        "Which Microsoft product or technology interests you most and why?",

        "Tell me about a technically challenging project you have worked on.",

        "Describe how you approach solving a complex problem.",

        "Tell me about a time you learned a new technology quickly."

    ],


    "Flutterwave": [

        "Why do you want to work at Flutterwave?",

        "What interests you about payments and financial technology?",

        "Tell me about a project that demonstrates your ability for this role.",

        "How would you improve a payment experience for users?",

        "Describe a difficult technical or product problem you solved."

    ]

};


// =========================================
// ROLE QUESTIONS
// =========================================

const roleQuestions = {

    "Software Engineer": [

        "Walk me through a software project you have built.",

        "How do you approach debugging a difficult issue?",

        "How do you ensure your code is maintainable?",

        "Tell me about a technical decision you made and why."

    ],


    "Frontend Engineer": [

        "Tell me about a frontend application you have built.",

        "How do you approach responsive web design?",

        "How do you improve frontend performance?",

        "How do you handle state and user interactions in a web application?"

    ],


    "Backend Engineer": [

        "Tell me about a backend system or API you have built.",

        "How would you design a scalable REST API?",

        "How do you approach database performance?",

        "How would you secure an API?"

    ],


    "Data Analyst": [

        "Tell me about a dataset you have analyzed.",

        "How do you handle missing or inconsistent data?",

        "How would you explain a complex data insight to a non-technical stakeholder?",

        "Which tools do you use for data analysis?"

    ],


    "Data Scientist": [

        "Tell me about a machine-learning or data-science project you have worked on.",

        "How do you decide which model to use?",

        "How do you evaluate a machine-learning model?",

        "How would you explain a model's result to a non-technical person?"

    ],


    "Product Manager": [

        "How would you prioritize competing product requirements?",

        "Tell me about a product you helped build or improve.",

        "How would you measure whether a product feature is successful?",

        "How do you work with engineering and design teams?"

    ],


    "UX Designer": [

        "Walk me through your UX design process.",

        "How do you identify user problems?",

        "Tell me about a design decision you made based on user research.",

        "How do you measure whether a user experience is successful?"

    ],


    "Cloud Engineer": [

        "Tell me about your experience with cloud technologies.",

        "How would you design a scalable cloud application?",

        "How do you monitor cloud infrastructure?",

        "How would you troubleshoot a cloud service outage?"

    ],


    "Risk Analyst": [

        "How would you identify a potential business risk?",

        "Tell me about a time you analyzed risk.",

        "How would you communicate a significant risk to management?",

        "How do you balance risk and business opportunity?"

    ],


    "Relationship Manager": [

        "How would you build a strong relationship with a customer?",

        "Tell me about a time you handled a difficult customer.",

        "How would you identify a customer's needs?",

        "How do you maintain trust with clients?"

    ],


    "Digital Banking Specialist": [

        "What makes a good digital banking experience?",

        "How would you improve a banking app?",

        "How would you investigate a customer complaint about digital banking?",

        "How do you balance convenience and security?"

    ],


    "DevOps Engineer": [

        "Tell me about your CI/CD experience.",

        "How would you deploy an application safely?",

        "How do you monitor production systems?",

        "How would you respond to a production outage?"

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
// BUILD QUESTIONS
// =========================================

function buildQuestions() {

    const companyQs =
        companyQuestions[
            selectedCompany
        ] || [];


    const roleQs =
        roleQuestions[
            selectedRole
        ] || [];


    const combined = [

        ...companyQs.slice(0, 3),

        ...roleQs.slice(0, 3),

        `Why should ${selectedCompany} hire you for the ${selectedRole} role?`

    ];


    return combined.slice(
        0,
        7
    );

}


// =========================================
// START INTERVIEW
// =========================================

function startInterview() {

    currentQuestion =
        0;

    answers = [];

    questions =
        buildQuestions();


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
        questions.length;


    interviewStarted =
        true;


    interviewStartTime =
        Date.now();


    setupSpeechRecognition();


    showQuestion();

}


// =========================================
// SHOW QUESTION
// =========================================

function showQuestion() {

    if (
        currentQuestion >=
        questions.length
    ) {

        finishInterview();

        return;

    }


    const question =
        questions[
            currentQuestion
        ];


    questionNumber.textContent =
        currentQuestion + 1;


    questionText.textContent =
        question;


    updateListeningCriteria(
        question
    );


    clearTranscript();


    stopListening();


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

function speakQuestion(
    text
) {

    if (
        isMuted ||
        !("speechSynthesis" in window)
    ) {

        return;

    }


    window.speechSynthesis.cancel();


    const utterance =
        new SpeechSynthesisUtterance(
            text
        );


    utterance.rate =
        0.92;


    utterance.pitch =
        1;


    utterance.volume =
        1;


    utterance.onstart =
        () => {

            isSpeaking =
                true;


            speakingRing.classList.add(
                "active"
            );


            voiceWave.classList.add(
                "active"
            );


            voiceStatus.textContent =
                "AI is speaking...";


            speakingStatus.textContent =
                "Speaking";

        };


    utterance.onend =
        () => {

            isSpeaking =
                false;


            speakingRing.classList.remove(
                "active"
            );


            voiceWave.classList.remove(
                "active"
            );


            voiceStatus.textContent =
                "Your turn";


            speakingStatus.textContent =
                "Listening";

        };


    window.speechSynthesis.speak(
        utterance
    );

}


// =========================================
// HEAR QUESTION AGAIN
// =========================================

if (hearQuestionBtn) {

    hearQuestionBtn.addEventListener(
        "click",
        () => {

            speakQuestion(
                questionText.textContent
            );

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


    answers.push({

        question:
            questions[currentQuestion],

        answer:
            answer,

        timestamp:
            new Date().toISOString()

    });


    detectEvidence(
        answer
    );


    currentQuestion++;


    setTimeout(
        () => {

            if (
                currentQuestion <
                questions.length
            ) {

                showQuestion();

            } else {

                finishInterview();

            }

        },
        1200
    );

}


// =========================================
// DETECT EVIDENCE
// =========================================

function detectEvidence(
    answer
) {

    if (
        !liveEvidence ||
        !evidenceText
    ) {

        return;

    }


    const lower =
        answer.toLowerCase();


    const evidence = [];


    if (
        lower.includes("built") ||
        lower.includes("created") ||
        lower.includes("developed")
    ) {

        evidence.push(
            "Project-building experience"
        );

    }


    if (
        lower.includes("led") ||
        lower.includes("managed")
    ) {

        evidence.push(
            "Leadership experience"
        );

    }


    if (
        lower.includes("solved") ||
        lower.includes("fixed")
    ) {

        evidence.push(
            "Problem-solving evidence"
        );

    }


    if (
        lower.includes("team") ||
        lower.includes("collaborated")
    ) {

        evidence.push(
            "Team collaboration"
        );

    }


    if (!evidence.length) {

        evidence.push(
            "Relevant experience detected in response"
        );

    }


    evidenceText.textContent =
        evidence.join(
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


    const score =
        questions.length
            ? Math.round(
                (
                    answers.length /
                    questions.length
                ) * 100
            )
            : 0;


    const interviewData = {

        company:
            selectedCompany,

        role:
            selectedRole,

        questions:
            questions,

        answers:
            answers,

        score:
            score,

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


    performanceScore.textContent =
        `${data.score}%`;


    evidenceCount.textContent =
        data.answers.length;


    progressScore.textContent =
        `${data.score}%`;


    overallSummary.textContent =

        `You completed your ${data.role} interview preparation for ${data.company}. Insider captured ${data.answers.length} answered question${data.answers.length === 1 ? "" : "s"} as evidence. Continue practicing with specific examples, measurable outcomes and clear explanations of your personal contribution.`;



    strengthsList.innerHTML = `

        <li>
            Completed a realistic ${data.company}
            interview simulation.
        </li>

        <li>
            Practiced questions relevant to
            the ${data.role} role.
        </li>

        <li>
            Provided ${data.answers.length}
            answer${data.answers.length === 1 ? "" : "s"}
            that Insider can use as evidence.
        </li>

    `;



    gapsList.innerHTML = `

        <li>
            Add measurable results to your
            examples where possible.
        </li>

        <li>
            Explain your personal contribution
            clearly when discussing projects.
        </li>

        <li>
            Continue practicing company-specific
            questions.
        </li>

    `;



    coachingList.innerHTML = `

        <li>
            Use the STAR structure for
            behavioural questions.
        </li>

        <li>
            Give concrete examples instead
            of general statements.
        </li>

        <li>
            Connect your experience directly
            to the role you're targeting.
        </li>

    `;

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