const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

menuBtn.addEventListener("click", () => {

    const isOpen = navLinks.classList.toggle("show");

    if (isOpen) {
        menuBtn.innerHTML = "✕";
        menuBtn.setAttribute(
            "aria-label",
            "Close navigation menu"
        );
    } else {
        menuBtn.innerHTML = "☰";
        menuBtn.setAttribute(
            "aria-label",
            "Open navigation menu"
        );
    }

    menuBtn.setAttribute(
        "aria-expanded",
        isOpen
    );
});


// Close mobile menu after clicking a link

const navItems = navLinks.querySelectorAll("a");

navItems.forEach(item => {

    item.addEventListener("click", () => {

        navLinks.classList.remove("show");

        menuBtn.innerHTML = "☰";

        menuBtn.setAttribute(
            "aria-expanded",
            "false"
        );

    });

});