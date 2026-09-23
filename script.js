const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if (menuBtn && navLinks) {
    menuBtn.addEventListener("click", () => {

        const isOpen = navLinks.classList.toggle("show");

        if (isOpen) {
            menuBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            menuBtn.setAttribute(
                "aria-label",
                "Close navigation menu"
            );
        } else {
            menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
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

            menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';

            menuBtn.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });
}