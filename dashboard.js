// ========================================
// INSIDER DASHBOARD
// ========================================

// MOBILE MENU
const menuBtn = document.getElementById("menuBtn");
const sidebar = document.getElementById("sidebar");

if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("show");

        menuBtn.textContent = sidebar.classList.contains("show")
            ? "✕"
            : "☰";
    });
}


// ========================================
// LOGOUT
// ========================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("insiderUser");
        window.location.href = "index.html";
    });
}


// ========================================
// GET SAVED PROFILE
// ========================================

function getProfile() {

    const savedProfile = localStorage.getItem("insiderProfile");

    if (savedProfile) {
        try {
            return JSON.parse(savedProfile);
        } catch (error) {
            console.error("Could not read profile:", error);
        }
    }

    return {
        name: "",
        role: "",
        location: "",
        email: "",
        about: "",
        skills: [],
        experience: "",
        projects: "",
        achievements: "",
        education: "",
        github: "",
        linkedin: "",
        portfolio: ""
    };
}


// ========================================
// CHECK FIELD
// ========================================

function hasValue(value) {

    if (Array.isArray(value)) {
        return value.length > 0;
    }

    return (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
    );
}


// ========================================
// PROFILE COMPLETION
// ========================================

function calculateProfileCompletion(profile) {

    let completed = 0;

    const sections = [

        // Basic information
        (
            hasValue(profile.name) &&
            hasValue(profile.role) &&
            hasValue(profile.location)
        ),

        // About
        hasValue(profile.about),

        // Skills
        hasValue(profile.skills),

        // Experience
        hasValue(profile.experience),

        // Projects
        hasValue(profile.projects),

        // Achievements
        hasValue(profile.achievements),

        // Education
        hasValue(profile.education),

        // Professional links
        (
            hasValue(profile.github) ||
            hasValue(profile.linkedin) ||
            hasValue(profile.portfolio)
        )
    ];

    sections.forEach(section => {
        if (section) {
            completed++;
        }
    });

    return Math.round(
        (completed / sections.length) * 100
    );
}


// ========================================
// UPDATE DASHBOARD
// ========================================

function updateDashboard() {

    const profile = getProfile();

    const percentage =
        calculateProfileCompletion(profile);


    console.log("Insider Profile:", profile);
    console.log("Profile Completion:", percentage + "%");


    // ====================================
    // WELCOME NAME
    // ====================================

    const welcomeName =
        document.querySelector(".topbar h1 span");

    if (welcomeName) {

        let name = profile.name;

        // If profile name is empty,
        // try the logged-in user.
        if (!hasValue(name)) {

            const user =
                JSON.parse(
                    localStorage.getItem("insiderUser") || "{}"
                );

            name = user.name || "there";
        }

        const firstName =
            name.split(" ")[0];

        welcomeName.textContent =
            firstName;
    }


    // ====================================
    // AVATAR
    // ====================================

    const avatar =
        document.querySelector(".avatar");

    if (avatar) {

        let name = profile.name || "User";

        avatar.textContent =
            name.charAt(0).toUpperCase();
    }


    // ====================================
    // PROFILE PERCENTAGE
    // ====================================

    const percentageText =
        document.querySelector(
            ".progress-number strong"
        );

    if (percentageText) {

        percentageText.textContent =
            percentage + "%";
    }


    // ====================================
    // PROGRESS BAR
    // ====================================

    const progressBar =
        document.querySelector(
            ".progress-bar div"
        );

    if (progressBar) {

        progressBar.style.width =
            percentage + "%";

        progressBar.style.transition =
            "width 0.6s ease";
    }


    // ====================================
    // PROFILE DESCRIPTION
    // ====================================

    const profileMessage =
        document.querySelector(
            ".profile-info p"
        );

    if (profileMessage) {

        if (percentage === 100) {

            profileMessage.textContent =
                "Your profile is complete. You're ready to explore opportunities.";

        } else if (percentage >= 75) {

            profileMessage.textContent =
                "Your profile is looking strong. Add a few more details to complete it.";

        } else if (percentage >= 50) {

            profileMessage.textContent =
                "You're making good progress. Keep adding information to strengthen your profile.";

        } else {

            profileMessage.textContent =
                "A complete profile helps Insider prepare you better for opportunities.";
        }
    }


    // ====================================
    // COMPLETE PROFILE BUTTON
    // ====================================

    const completeProfile =
        document.querySelector(
            ".profile-progress a"
        );

    if (completeProfile) {
        completeProfile.href = "profile.html";
    }


    // ====================================
    // QUICK ACTION CARDS
    // ====================================

    const quickCards =
        document.querySelectorAll(
            ".quick-card"
        );

    if (quickCards.length >= 3) {

        quickCards[0].href =
            "profile.html";

        quickCards[1].href =
            "interview.html";

        quickCards[2].href =
            "opportunities.html";
    }


    // ====================================
    // VIEW ALL
    // ====================================

    const viewAll =
        document.querySelector(".view-all");

    if (viewAll) {
        viewAll.href =
            "opportunities.html";
    }


    // ====================================
    // AI COACH
    // ====================================

    const aiButton =
        document.querySelector(
            ".ai-card button"
        );

    if (aiButton) {

        aiButton.onclick = () => {
            window.location.href =
                "interview.html";
        };
    }


    // ====================================
    // PROGRESS CHECKLIST
    // ====================================

    const progressItems =
        document.querySelectorAll(
            ".progress-item"
        );


    // ACCOUNT
    if (progressItems[0]) {

        const icon =
            progressItems[0].querySelector("span");

        const text =
            progressItems[0].querySelector("small");

        if (icon) {
            icon.textContent = "✓";
            icon.className = "check";
        }

        if (text) {
            text.textContent = "Completed";
        }
    }


    // BASIC PROFILE
    if (progressItems[1]) {

        const basicProfileComplete =
            hasValue(profile.name) &&
            hasValue(profile.role) &&
            hasValue(profile.location);

        const icon =
            progressItems[1].querySelector("span");

        const text =
            progressItems[1].querySelector("small");

        if (basicProfileComplete) {

            if (icon) {
                icon.textContent = "✓";
                icon.className = "check";
            }

            if (text) {
                text.textContent = "Completed";
            }

        } else {

            if (icon) {
                icon.textContent = "○";
                icon.className = "pending";
            }

            if (text) {
                text.textContent = "Not completed";
            }
        }
    }


    // PROJECTS
    if (progressItems[2]) {

        const icon =
            progressItems[2].querySelector("span");

        const text =
            progressItems[2].querySelector("small");

        if (hasValue(profile.projects)) {

            if (icon) {
                icon.textContent = "✓";
                icon.className = "check";
            }

            if (text) {
                text.textContent = "Completed";
            }

        } else {

            if (icon) {
                icon.textContent = "○";
                icon.className = "pending";
            }

            if (text) {
                text.textContent = "Not completed";
            }
        }
    }


    // INTERVIEW
    if (progressItems[3]) {

        const interviewDone =
            localStorage.getItem(
                "insiderInterviewCompleted"
            ) === "true";

        const icon =
            progressItems[3].querySelector("span");

        const text =
            progressItems[3].querySelector("small");

        if (interviewDone) {

            if (icon) {
                icon.textContent = "✓";
                icon.className = "check";
            }

            if (text) {
                text.textContent = "Completed";
            }

        } else {

            if (icon) {
                icon.textContent = "○";
                icon.className = "pending";
            }

            if (text) {
                text.textContent = "Not completed";
            }
        }
    }
}


// ========================================
// RUN
// ========================================

updateDashboard();


// ========================================
// UPDATE WHEN RETURNING TO PAGE
// ========================================

window.addEventListener(
    "pageshow",
    updateDashboard
);


// ========================================
// UPDATE IF LOCALSTORAGE CHANGES
// ========================================

window.addEventListener(
    "storage",
    updateDashboard
);