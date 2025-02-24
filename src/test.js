// Star Background with Wind Momentum, Wrap-Around, and Minimal Gravity
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = [];
const numStars = 100;

// Mouse position & wind vector variables
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let windX = 0;
let windY = 0;

// Track mouse movement and calculate wind vector
let rafId;
window.addEventListener("mousemove", (e) => {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    windX = e.clientX - mouseX;
    windY = e.clientY - mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
});

// Parameters for influence, wind effect, and gravity
const influenceRadius = 50; // pixels
const windFactor = 0.05; // multiplier for the wind effect
const friction = 0.98; // friction factor to gradually reduce momentum
const gravity = 0.005; // minimal gravity applied to every star

class Star {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.radius = Math.random() * 2;
    // Initial base speed for downward motion (used as starting velocity)
    this.speed = Math.random() * 0.5;
    // Velocity components (for momentum)
    this.vx = 0;
    this.vy = this.speed;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }

  update() {
    // Calculate distance from star to mouse pointer
    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If within influence radius, add wind vector to velocity
    if (distance < influenceRadius) {
      this.vx += windX * windFactor;
      this.vy += windY * windFactor;
    }

    // Apply a minimal gravity to all stars
    this.vy += gravity;

    // Apply friction to dampen velocity (momentum decays over time)
    this.vx *= friction;
    this.vy *= friction;

    // Update star position using velocity
    this.x += this.vx;
    this.y += this.vy;

    // Wrap-around logic for horizontal boundaries
    if (this.x > canvas.width) {
      this.x = 0;
    } else if (this.x < 0) {
      this.x = canvas.width;
    }

    // Wrap-around logic for vertical boundaries
    if (this.y > canvas.height) {
      this.y = 0;
    } else if (this.y < 0) {
      this.y = canvas.height;
    }
  }
}

// Create stars
for (let i = 0; i < numStars; i++) {
  stars.push(new Star());
}

// Animation loop
function animateStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach((star) => {
    star.update();
    star.draw();
  });

  requestAnimationFrame(animateStars);
}
animateStars();

// Handle window resize
let resizeId;
window.addEventListener("resize", () => {
  if (resizeId) cancelAnimationFrame(resizeId);
  resizeId = requestAnimationFrame(() => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
});

//Scroll Effect for navigation

document.addEventListener("DOMContentLoaded", () => {
  const links = document.querySelectorAll("nav a");
  let currentSection = document.getElementById("section1");
  let currentIndex = parseInt(currentSection.dataset.index, 10);

  // Apply no-underline class to the first link
  links[0].classList.add("no-underline");

  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      const targetIndex = parseInt(link.dataset.index, 10);
      if (targetIndex === currentIndex) return;

      const targetSection = document.querySelector(
        `section[data-index="${targetIndex}"]`
      );

      const directionDown = targetIndex > currentIndex;

      // Prepare the target section
      targetSection.style.transition = "none";
      targetSection.style.transform = directionDown
        ? "translateY(100%)"
        : "translateY(-100%)";
      targetSection.style.opacity = "0";
      targetSection.style.display = "block";
      targetSection.style.zIndex = "6";

      // Reset animations on the leaving section
      const oldAnimatedDivs = currentSection.querySelectorAll(".content-animation");
      oldAnimatedDivs.forEach((div) => {
        div.classList.remove("animate-in"); // Remove the class to reset animation
      });

      // Force reflow
      targetSection.offsetHeight;

      // Apply transitions with 1.5s delay to the target section
      requestAnimationFrame(() => {
        targetSection.style.transition =
          "transform 0.8s ease 1.5s, opacity 0.8s ease 1.5s";

        // Start transition for the current section
        currentSection.style.transition =
          "transform 0.8s ease, opacity 0.8s ease";
        currentSection.style.transform = directionDown
          ? "translateY(-100%)"
          : "translateY(100%)";
        currentSection.style.opacity = "0";

        // Start transition for the target section
        targetSection.style.transform = "translateY(0)";
        targetSection.style.opacity = "1";
      });

      // Remove active class after the current section has transitioned out
      setTimeout(() => {
        currentSection.classList.remove("active");
        currentSection.style.display = "none";
      }, 800); // Transition duration of current section

      // Add active class to the target section after the total transition time
      setTimeout(() => {
        targetSection.classList.add("active");

        // Remove active class from all nav links
        links.forEach((navLink) => {
          navLink.classList.remove("active");
        });

        // Add active class to the clicked nav link, except the first one
        if (targetIndex !== 0) {
          link.classList.add("active");
        }

        // Trigger staggered animations for `.content-animation` inside the new active section
        const animatedDivs = targetSection.querySelectorAll(".content-animation");
        animatedDivs.forEach((div, index) => {
          setTimeout(() => {
            div.classList.add("animate-in");
          }, index * 200); // 200ms delay between each div
        });

        // Cleanup styles
        currentSection.style.transform = "";
        currentSection.style.opacity = "";
        currentSection.style.zIndex = "";

        targetSection.style.transform = "";
        targetSection.style.opacity = "";
        targetSection.style.zIndex = "";

        currentSection = targetSection;
        currentIndex = targetIndex;
      }, 2300); // Total delay (1.5s delay + 0.8s transition)
    });
  });
});

