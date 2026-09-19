// =========================
// PASSWORD TOGGLE
// =========================

const passwordInput = document.getElementById("password");

const togglePassword = document.getElementById("togglePassword");

togglePassword.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglePassword.textContent = "🙈";
  } else {
    passwordInput.type = "password";
    togglePassword.textContent = "👁";
  }
});

// =========================
// CUSTOM ALERT
// =========================

const alertOverlay = document.getElementById("alertOverlay");

const alertTitle = document.getElementById("alertTitle");

const alertMessage = document.getElementById("alertMessage");

const alertIcon = document.getElementById("alertIcon");

const alertButton = document.getElementById("alertButton");

const alertClose = document.getElementById("alertClose");

function showAlert(title, message, type = "success") {
  alertTitle.textContent = title;
  alertMessage.textContent = message;

  if (type === "success") {
    alertIcon.textContent = "✓";

    alertIcon.style.background = "#e7f8ef";
    alertIcon.style.color = "#00a651";

    alertButton.style.background = "#00a651";
  }

  if (type === "error") {
    alertIcon.textContent = "!";

    alertIcon.style.background = "#fff0f0";
    alertIcon.style.color = "#e53935";

    alertButton.style.background = "#e53935";
  }

  alertOverlay.classList.add("show");
}

function closeAlert() {
  alertOverlay.classList.remove("show");
}

alertClose.addEventListener("click", closeAlert);

alertButton.addEventListener("click", closeAlert);

// Close when clicking outside

alertOverlay.addEventListener("click", (event) => {
  if (event.target === alertOverlay) {
    closeAlert();
  }
});

// =========================
// LOGIN FORM
// =========================

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();

  const password = document.getElementById("password").value;

  // Check empty fields

  if (!email || !password) {
    showAlert(
      "Missing Information",
      "Please enter your email address and password.",
      "error",
    );

    return;
  }

  // Demo login
  // Later this will connect to your backend/database

  showAlert(
    "Welcome Back!",
    "You have successfully signed in to Insider.",
    "success",
  );

  alertButton.onclick = () => {
    window.location.href = "dashboard.html";
  };

  console.log("Email:", email);

  // When your backend is connected,
  // redirect to the dashboard:

  // window.location.href = "dashboard.html";
});
