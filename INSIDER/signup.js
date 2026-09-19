const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");

const togglePassword = document.getElementById("togglePassword");

// =========================
// PASSWORD TOGGLE
// =========================

togglePassword.addEventListener("click", () => {
  if (password.type === "password") {
    password.type = "text";
    confirmPassword.type = "text";

    togglePassword.textContent = "🙈";
  } else {
    password.type = "password";
    confirmPassword.type = "password";

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

const alertClose = document.getElementById("alertClose");

const alertButton = document.getElementById("alertButton");

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

// Close when clicking outside the alert

alertOverlay.addEventListener("click", (event) => {
  if (event.target === alertOverlay) {
    closeAlert();
  }
});

// =========================
// SIGN UP FORM
// =========================

const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const fullname = document.getElementById("fullname").value.trim();

  const email = document.getElementById("email").value.trim();

  const passwordValue = password.value;

  const confirmPasswordValue = confirmPassword.value;

  // PASSWORD MATCH

  if (passwordValue !== confirmPasswordValue) {
    showAlert(
      "Passwords Don't Match",
      "Please make sure both passwords are the same.",
      "error",
    );

    return;
  }

  // PASSWORD LENGTH

  if (passwordValue.length < 8) {
    showAlert(
      "Password Too Short",
      "Your password must contain at least 8 characters.",
      "error",
    );

    return;
  }

  // SUCCESS

  showAlert(
    "Welcome to Insider!",
    `Your account for ${fullname} has been created successfully.`,
    "success",
  );
  alertButton.onclick = () => {
    window.location.href = "dashboard.html";
  };

  console.log("Name:", fullname);
  console.log("Email:", email);

  // Later:
  // window.location.href = "profile.html";
});
