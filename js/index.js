// =========================================================
// Utility Functions
// =========================================================

// Shortcut for querySelector
const $ = (selector) => document.querySelector(selector);

// Load CSV using PapaParse
async function loadCSV(path) {
  try {
    const response = await fetch(path);
    const text = await response.text();
    return Papa.parse(text, { header: true, skipEmptyLines: true }).data;
  } catch (error) {
    console.error("CSV load error:", error);
    return [];
  }
}

// Clean photo paths from CSV
function cleanPhotoPath(value) {
  return (value || "")
    .trim()
    .replace(/^assets\//i, "")
    .replace(/^photos\//i, "");
}

// Random shuffle for selecting featured holes
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Ensure each course only appears once in the featured section
function uniqueByCourse(rows) {
  const seen = new Set();
  const result = [];

  for (const row of rows) {
    const courseKey = (row.Course || "").trim().toLowerCase();
    if (!courseKey || seen.has(courseKey)) continue;

    seen.add(courseKey);
    result.push(row);
  }
  return result;
}

// =========================================================
// Featured Signature Holes Rendering
// =========================================================

function renderFeatured(rows) {
  const featuredBox = $("#featured");
  const noPhotosMsg = $("#noPhotos");
  featuredBox.innerHTML = "";

  // Filter rows that actually contain images
  const withPhotos = rows.filter((r) => {
    const cleanPath = cleanPhotoPath(r.photo);
    const filename = cleanPath.split("/").pop()?.toLowerCase();
    return filename && filename !== "nophoto.png";
  });

  const picks = shuffle(uniqueByCourse(withPhotos)).slice(0, 3);

  if (!picks.length) {
    noPhotosMsg.style.display = "block";
    return;
  }

  picks.forEach((r) => {
    const imgSrc = "assets/photos/" + cleanPhotoPath(r.photo);

    const card = document.createElement("div");
    card.className = "hole-card";

    card.innerHTML = `
      <img class="hole-img" loading="lazy"
        src="${imgSrc}"
        alt="${r.Course || ""} – Hole ${r.Hole || ""}">
      <div class="hole-title">${r.Course || ""}</div>
      <div class="hole-sub">
        Hole ${r.Hole || ""}${
          r.par ? ` · Par ${r.par}` : ""
        }${r.yardage ? ` · ${r.yardage} yds` : ""}
      </div>
    `;

    // When image clicked → open modal
    card.querySelector(".hole-img").addEventListener("click", function () {
      const modal = $("#photoModal");
      const modalImg = $("#modalImg");

      modalImg.src = imgSrc;
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
    });

    featuredBox.appendChild(card);
  });
}

// =========================================================
// Modal Lightbox Close Events
// =========================================================

document.addEventListener("click", (event) => {
  const modal = $("#photoModal");

  if (event.target.classList.contains("modal-close") || event.target === modal) {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    $("#modalImg").src = "";
  }
});

document.addEventListener("keydown", (event) => {
  const modal = $("#photoModal");
  if (event.key === "Escape" && modal.classList.contains("show")) {
    modal.classList.remove("show");
    $("#modalImg").src = "";
  }
});

// =========================================================
// Back to Top Button
// =========================================================

document.addEventListener("click", (event) => {
  if (event.target.closest(".back-to-top")) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

// =========================================================
// Newsletter Form (non-functional placeholder)
// =========================================================

const newsletterForm = document.getElementById("newsletter");

if (newsletterForm) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    alert("Thanks for joining our newsletter!");
    newsletterForm.reset();
  });
}

// =========================================================
// INITIALIZE PAGE ON LOAD
// =========================================================

(async () => {
  const holeRows = await loadCSV("assets/courses_holes.csv");
  renderFeatured(holeRows);
})();
