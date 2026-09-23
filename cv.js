// =========================================
// LOAD PROFILE
// =========================================

function getProfile() {
  try {
    return JSON.parse(localStorage.getItem("insiderProfile") || "{}");
  } catch {
    return {};
  }
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("insiderUser") || "{}");
  } catch {
    return {};
  }
}

const profile = getProfile();
const user = getUser();

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value || "";
}

function toggleSection(sectionId, hasValue) {
  const el = document.getElementById(sectionId);
  if (el) el.classList.toggle("hidden", !hasValue);
}

// =========================================
// RENDER
// =========================================

const name = profile.name || user.name || "Your Name";
const role = profile.role || "";
const about = profile.about || "";
const skills = Array.isArray(profile.skills) ? profile.skills : [];
const experience = profile.experience || "";
const projects = profile.projects || "";
const achievements = profile.achievements || "";
const education = profile.education || "";

setText("cvName", name);
setText("cvRole", role || "Add a professional role in your profile");

// CONTACT LINE
const contactParts = [];
if (profile.email || user.email) contactParts.push(profile.email || user.email);
if (profile.location) contactParts.push(profile.location);
document.getElementById("cvContact").textContent = contactParts.join("  ·  ");

// ABOUT
setText("cvAbout", about);
toggleSection("cvAboutSection", !!about);

// SKILLS
const skillsEl = document.getElementById("cvSkills");
if (skills.length) {
  skillsEl.innerHTML = skills
    .map((skill) => `<span class="cv-skill">${escapeHTML(skill)}</span>`)
    .join("");
}
toggleSection("cvSkillsSection", skills.length > 0);

// EXPERIENCE / PROJECTS / ACHIEVEMENTS / EDUCATION
setText("cvExperience", experience);
toggleSection("cvExperienceSection", !!experience);

setText("cvProjects", projects);
toggleSection("cvProjectsSection", !!projects);

setText("cvAchievements", achievements);
toggleSection("cvAchievementsSection", !!achievements);

setText("cvEducation", education);
toggleSection("cvEducationSection", !!education);

// LINKS
const links = [
  { label: "GitHub", url: profile.github },
  { label: "LinkedIn", url: profile.linkedin },
  { label: "Portfolio", url: profile.portfolio },
].filter((link) => link.url);

const linksEl = document.getElementById("cvLinks");
if (links.length) {
  linksEl.innerHTML = links
    .map(
      (link) =>
        `<a href="${escapeAttr(link.url)}" target="_blank" rel="noopener noreferrer">${link.label}</a>`,
    )
    .join("");
}
toggleSection("cvLinksSection", links.length > 0);

// EMPTY-PROFILE NOTICE
const filledFieldCount = [about, experience, projects, achievements, education].filter(Boolean).length
  + (skills.length > 0 ? 1 : 0);

if (filledFieldCount === 0) {
  document.getElementById("cvEmptyNotice").classList.remove("hidden");
}

// =========================================
// HELPERS
// =========================================

function escapeHTML(text) {
  const el = document.createElement("div");
  el.textContent = text;
  return el.innerHTML;
}

function escapeAttr(text) {
  return escapeHTML(text).replace(/"/g, "&quot;");
}

// =========================================
// DOWNLOAD (browser print-to-PDF)
// =========================================

document.getElementById("downloadBtn").addEventListener("click", () => {
  window.print();
});
