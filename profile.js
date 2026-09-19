// ========================================
// INSIDER PROFILE PAGE
// ========================================

// ========================================
// MOBILE MENU
// ========================================

const menuBtn = document.getElementById("menuBtn");

const sidebar = document.getElementById("sidebar");

if (menuBtn && sidebar) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("show");

    menuBtn.textContent = sidebar.classList.contains("show") ? "✕" : "☰";
  });
}

// ========================================
// LOGOUT
// ========================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("insiderUser");

    localStorage.removeItem("insiderProfile");

    window.location.href = "index.html";
  });
}

// ========================================
// GET USER
// ========================================

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("insiderUser") || "{}");
  } catch (error) {
    console.error("Could not load user:", error);

    return {};
  }
}

// ========================================
// GET PROFILE
// ========================================

function getProfile() {
  try {
    const savedProfile = localStorage.getItem("insiderProfile");

    if (savedProfile) {
      const saved = JSON.parse(savedProfile);

      return {
        name: saved.name || "",

        role: saved.role || "",

        location: saved.location || "",

        email: saved.email || "",

        about: saved.about || "",

        skills: Array.isArray(saved.skills) ? saved.skills : [],

        experience: saved.experience || "",

        projects: saved.projects || "",

        achievements: saved.achievements || "",

        education: saved.education || "",

        github: saved.github || "",

        linkedin: saved.linkedin || "",

        portfolio: saved.portfolio || "",

        cv: saved.cv || null,
      };
    }
  } catch (error) {
    console.error("Could not load profile:", error);
  }

  const user = getUser();

  return {
    name: user.name || "",

    role: "",

    location: "",

    email: user.email || "",

    about: "",

    skills: [],

    experience: "",

    projects: "",

    achievements: "",

    education: "",

    github: "",

    linkedin: "",

    portfolio: "",

    cv: null,
  };
}

let profile = getProfile();

// ========================================
// VALUE CHECK
// ========================================

function hasValue(value) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== undefined && value !== null && String(value).trim() !== "";
}

// ========================================
// PROFILE COMPLETION
// ========================================

function calculateCompletion(profile) {
  let completed = 0;

  const total = 9;

  // 1. BASIC INFORMATION

  if (
    hasValue(profile.name) &&
    hasValue(profile.role) &&
    hasValue(profile.location)
  ) {
    completed++;
  }

  // 2. ABOUT

  if (hasValue(profile.about)) {
    completed++;
  }

  // 3. SKILLS

  if (hasValue(profile.skills)) {
    completed++;
  }

  // 4. EXPERIENCE

  if (hasValue(profile.experience)) {
    completed++;
  }

  // 5. PROJECTS

  if (hasValue(profile.projects)) {
    completed++;
  }

  // 6. ACHIEVEMENTS

  if (hasValue(profile.achievements)) {
    completed++;
  }

  // 7. EDUCATION

  if (hasValue(profile.education)) {
    completed++;
  }

  // 8. PROFESSIONAL LINKS

  if (
    hasValue(profile.github) ||
    hasValue(profile.linkedin) ||
    hasValue(profile.portfolio)
  ) {
    completed++;
  }

  // 9. CV

  if (profile.cv && hasValue(profile.cv.name)) {
    completed++;
  }

  return Math.round((completed / total) * 100);
}

// ========================================
// EDIT MODAL
// ========================================

const editModal = document.getElementById("editModal");

const editProfileBtn = document.getElementById("editProfileBtn");

const closeModal = document.getElementById("closeModal");

const cancelModal = document.getElementById("cancelModal");

// ========================================
// OPEN MODAL
// ========================================

function openModal() {
  if (!editModal) return;

  loadForm();

  editModal.classList.add("show");

  document.body.style.overflow = "hidden";
}

if (editProfileBtn) {
  editProfileBtn.addEventListener("click", openModal);
}

// ========================================
// CLOSE MODAL
// ========================================

function closeEditModal() {
  if (!editModal) return;

  editModal.classList.remove("show");

  document.body.style.overflow = "";
}

if (closeModal) {
  closeModal.addEventListener("click", closeEditModal);
}

if (cancelModal) {
  cancelModal.addEventListener("click", closeEditModal);
}

// ========================================
// CLOSE EDIT MODAL OUTSIDE
// ========================================

if (editModal) {
  editModal.addEventListener("click", (event) => {
    if (event.target === editModal) {
      closeEditModal();
    }
  });
}

// ========================================
// LOAD PROFILE
// ========================================

function loadProfile() {
  profile = getProfile();

  // NAME

  const profileName = document.getElementById("profileName");

  if (profileName) {
    profileName.textContent = profile.name || "Your Name";
  }

  // ROLE

  const profileRole = document.getElementById("profileRole");

  if (profileRole) {
    profileRole.textContent = profile.role || "Add your professional role";
  }

  // LOCATION

  const profileLocation = document.getElementById("profileLocation");

  if (profileLocation) {
    profileLocation.textContent = profile.location
      ? `📍 ${profile.location}`
      : "📍 Add your location";
  }

  // AVATARS

  const profileAvatar = document.getElementById("profileAvatar");

  const topAvatar = document.getElementById("topAvatar");

  const firstLetter = profile.name ? profile.name.charAt(0).toUpperCase() : "U";

  if (profileAvatar) {
    profileAvatar.textContent = firstLetter;
  }

  if (topAvatar) {
    topAvatar.textContent = firstLetter;
  }

  // ABOUT

  const profileAbout = document.getElementById("profileAbout");

  if (profileAbout) {
    profileAbout.textContent =
      profile.about ||
      "Tell employers who you are, what you do and what you bring to a team.";
  }

  // SKILLS

  const skillList = document.getElementById("skillList");

  if (skillList) {
    skillList.innerHTML = "";

    if (Array.isArray(profile.skills) && profile.skills.length) {
      profile.skills.forEach((skill) => {
        const skillElement = document.createElement("span");

        skillElement.className = "skill-tag";

        skillElement.textContent = skill;

        skillList.appendChild(skillElement);
      });
    } else {
      skillList.innerHTML = "<p>No skills added yet.</p>";
    }
  }

  // EXPERIENCE

  renderTextSection(
    "experienceContent",
    profile.experience,
    "No experience added yet.",
  );

  // PROJECTS

  renderTextSection(
    "projectsContent",
    profile.projects,
    "No projects added yet.",
  );

  // ACHIEVEMENTS

  renderTextSection(
    "achievementsContent",
    profile.achievements,
    "No achievements added yet.",
  );

  // EDUCATION

  renderTextSection(
    "educationContent",
    profile.education,
    "No education information added yet.",
  );

  // LINKS

  updateLink("githubLink", "githubText", profile.github);

  updateLink("linkedinLink", "linkedinText", profile.linkedin);

  updateLink("portfolioLink", "portfolioText", profile.portfolio);

  // PROFILE STRENGTH

  const percentage = calculateCompletion(profile);

  const percentageElement = document.getElementById("profilePercentage");

  if (percentageElement) {
    percentageElement.textContent = `${percentage}%`;
  }

  const strengthBar = document.getElementById("strengthBar");

  if (strengthBar) {
    strengthBar.style.width = `${percentage}%`;
  }

  const strengthMessage = document.getElementById("strengthMessage");

  if (strengthMessage) {
    if (percentage === 100) {
      strengthMessage.textContent = "Your profile is complete.";
    } else if (percentage >= 75) {
      strengthMessage.textContent = "Your profile is looking strong.";
    } else if (percentage >= 50) {
      strengthMessage.textContent = "You're making good progress.";
    } else {
      strengthMessage.textContent =
        "Complete your profile to improve your opportunities.";
    }
  }

  // CV

  renderCV();
}

// ========================================
// RENDER TEXT SECTION
// ========================================

function renderTextSection(elementId, value, emptyMessage) {
  const element = document.getElementById(elementId);

  if (!element) return;

  element.innerHTML = "";

  if (hasValue(value)) {
    const content = document.createElement("p");

    content.textContent = value;

    element.appendChild(content);
  } else {
    const empty = document.createElement("div");

    empty.className = "empty-state";

    empty.innerHTML = `
            <div>📋</div>
            <p>${emptyMessage}</p>
        `;

    element.appendChild(empty);
  }
}

// ========================================
// UPDATE LINK
// ========================================

function updateLink(linkId, textId, url) {
  const link = document.getElementById(linkId);

  const text = document.getElementById(textId);

  if (!link) return;

  if (hasValue(url)) {
    link.href = url;

    if (text) {
      text.textContent = url;
    }
  } else {
    link.removeAttribute("href");

    if (text) {
      text.textContent = "Not added";
    }
  }
}

// ========================================
// LOAD FORM
// ========================================

function loadForm() {
  profile = getProfile();

  const fields = {
    fullName: profile.name,

    professionalRole: profile.role,

    location: profile.location,

    email: profile.email,

    about: profile.about,

    skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : "",

    experience: profile.experience,

    projects: profile.projects,

    achievements: profile.achievements,

    education: profile.education,

    github: profile.github,

    linkedin: profile.linkedin,

    portfolio: profile.portfolio,
  };

  Object.keys(fields).forEach((id) => {
    const field = document.getElementById(id);

    if (field) {
      field.value = fields[id] || "";
    }
  });
}

// ========================================
// SAVE PROFILE
// ========================================

const profileForm = document.getElementById("profileForm");

if (profileForm) {
  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const skillsInput = document.getElementById("skills");

    const existingCV = profile.cv || null;

    profile = {
      name: document.getElementById("fullName")?.value.trim() || "",

      role: document.getElementById("professionalRole")?.value.trim() || "",

      location: document.getElementById("location")?.value.trim() || "",

      email: document.getElementById("email")?.value.trim() || "",

      about: document.getElementById("about")?.value.trim() || "",

      skills: skillsInput
        ? skillsInput.value
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [],

      experience: document.getElementById("experience")?.value.trim() || "",

      projects: document.getElementById("projects")?.value.trim() || "",

      achievements: document.getElementById("achievements")?.value.trim() || "",

      education: document.getElementById("education")?.value.trim() || "",

      github: document.getElementById("github")?.value.trim() || "",

      linkedin: document.getElementById("linkedin")?.value.trim() || "",

      portfolio: document.getElementById("portfolio")?.value.trim() || "",

      // Keep uploaded CV

      cv: existingCV,
    };

    localStorage.setItem("insiderProfile", JSON.stringify(profile));

    loadProfile();

    closeEditModal();

    showProfileMessage("Profile updated successfully!");
  });
}

// ========================================
// SUCCESS MESSAGE
// ========================================

function showProfileMessage(message) {
  let messageBox = document.getElementById("profileMessage");

  if (!messageBox) {
    messageBox = document.createElement("div");

    messageBox.id = "profileMessage";

    messageBox.style.position = "fixed";

    messageBox.style.top = "30px";

    messageBox.style.right = "30px";

    messageBox.style.padding = "14px 20px";

    messageBox.style.background = "#0b7a43";

    messageBox.style.color = "#ffffff";

    messageBox.style.borderRadius = "10px";

    messageBox.style.fontWeight = "600";

    messageBox.style.zIndex = "99999";

    messageBox.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)";

    document.body.appendChild(messageBox);
  }

  messageBox.textContent = message;

  messageBox.style.display = "block";

  clearTimeout(window.profileMessageTimer);

  window.profileMessageTimer = setTimeout(() => {
    messageBox.style.display = "none";
  }, 2500);
}

// ========================================
// CV ELEMENTS
// ========================================

const cvButton = document.getElementById("cvButton");

const cvInput = document.getElementById("cvInput");

const cvStatus = document.getElementById("cvStatus");

const cvFileInfo = document.getElementById("cvFileInfo");

const cvFileName = document.getElementById("cvFileName");

const removeCvButton = document.getElementById("removeCvButton");

// ========================================
// RENDER CV
// ========================================

function renderCV() {
  const savedCV = profile.cv;

  if (savedCV && savedCV.name) {
    if (cvStatus) {
      cvStatus.textContent =
        "Your CV is uploaded and ready to be used by Insider.";
    }

    if (cvFileInfo) {
      cvFileInfo.style.display = "flex";
    }

    if (cvFileName) {
      cvFileName.textContent = savedCV.name;
    }

    if (cvButton) {
      cvButton.textContent = "Replace CV";
    }

    if (removeCvButton) {
      removeCvButton.style.display = "inline-block";
    }
  } else {
    if (cvStatus) {
      cvStatus.textContent =
        "Upload your CV so Insider can understand your experience and use it as evidence during interview preparation.";
    }

    if (cvFileInfo) {
      cvFileInfo.style.display = "none";
    }

    if (cvButton) {
      cvButton.textContent = "Upload CV";
    }

    if (removeCvButton) {
      removeCvButton.style.display = "none";
    }
  }
}

// ========================================
// OPEN FILE PICKER
// ========================================

if (cvButton && cvInput) {
  cvButton.addEventListener("click", () => {
    cvInput.click();
  });
}

// ========================================
// CV UPLOAD
// ========================================

if (cvInput) {
  cvInput.addEventListener("change", async () => {
    const file = cvInput.files[0];

    if (!file) {
      return;
    }

    // FILE TYPE

    const extension = file.name.split(".").pop().toLowerCase();

    const allowedExtensions = ["pdf", "doc", "docx"];

    if (!allowedExtensions.includes(extension)) {
      showProfileMessage("Please upload a PDF, DOC or DOCX file.");

      cvInput.value = "";

      return;
    }

    // FILE SIZE

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      showProfileMessage("Your CV must be smaller than 10MB.");

      cvInput.value = "";

      return;
    }

    const user = getUser();

    // SAVE LOCAL CV DATA

    profile.cv = {
      name: file.name,

      type: file.type,

      size: file.size,

      uploadedAt: new Date().toISOString(),
    };

    localStorage.setItem("insiderProfile", JSON.stringify(profile));

    // SHOW UPLOADING

    if (cvButton) {
      cvButton.disabled = true;

      cvButton.textContent = "Uploading...";
    }

    // BACKEND UPLOAD
    // PDF/DOCX/TXT text extraction runs server-side (pypdf/python-docx).

    {
      try {
        const formData = new FormData();
        formData.append("cv", file);

        const response = await fetch("/api/profile/cv/upload", {
          method: "POST",
          body: formData,
        });

        let data = {};

        try {
          data = await response.json();
        } catch {
          data = {};
        }

        if (!response.ok) {
          throw new Error(data.error?.message || "CV upload failed.");
        }

        profile.cv.text = data.cv_text || "";
        profile.evidence = data.evidence || profile.evidence;
        localStorage.setItem("insiderProfile", JSON.stringify(profile));
      } catch (error) {
        console.error("CV upload error:", error);

        if (cvButton) {
          cvButton.disabled = false;
        }

        showProfileMessage(
          "CV saved to your profile, but the server upload failed.",
        );

        loadProfile();

        cvInput.value = "";

        return;
      }
    } else {
      showProfileMessage(
        "CV saved to your profile. PDF/DOC parsing isn't wired up yet, so evidence extraction won't run for this file.",
      );
    }

    // FINISH

    if (cvButton) {
      cvButton.disabled = false;
    }

    loadProfile();

    renderCV();

    showProfileMessage("CV uploaded successfully!");

    cvInput.value = "";
  });
}

// ========================================
// CUSTOM CONFIRMATION ALERT
// ========================================

const confirmOverlay = document.getElementById("confirmOverlay");

const confirmCancel = document.getElementById("confirmCancel");

const confirmDelete = document.getElementById("confirmDelete");

// ========================================
// OPEN CONFIRMATION
// ========================================

if (removeCvButton) {
  removeCvButton.addEventListener("click", () => {
    if (confirmOverlay) {
      confirmOverlay.classList.add("show");

      document.body.style.overflow = "hidden";
    }
  });
}

// ========================================
// CLOSE CONFIRMATION
// ========================================

function closeConfirmAlert() {
  if (confirmOverlay) {
    confirmOverlay.classList.remove("show");

    document.body.style.overflow = "";
  }
}

// ========================================
// CANCEL
// ========================================

if (confirmCancel) {
  confirmCancel.addEventListener("click", closeConfirmAlert);
}

// ========================================
// CONFIRM REMOVE
// ========================================

if (confirmDelete) {
  confirmDelete.addEventListener("click", () => {
    delete profile.cv;

    localStorage.setItem("insiderProfile", JSON.stringify(profile));

    loadProfile();

    renderCV();

    closeConfirmAlert();

    showProfileMessage("CV removed from your profile.");
  });
}

// ========================================
// CLICK OUTSIDE CONFIRMATION
// ========================================

if (confirmOverlay) {
  confirmOverlay.addEventListener("click", (event) => {
    if (event.target === confirmOverlay) {
      closeConfirmAlert();
    }
  });
}

// ========================================
// ESCAPE KEY
// ========================================

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    confirmOverlay &&
    confirmOverlay.classList.contains("show")
  ) {
    closeConfirmAlert();
  }
});

// ========================================
// INITIAL LOAD
// ========================================

loadProfile();

// ========================================
// REFRESH WHEN RETURNING
// ========================================

window.addEventListener("pageshow", () => {
  loadProfile();
});
