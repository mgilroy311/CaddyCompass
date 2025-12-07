/* =========================================================
   Utility Helpers
   ========================================================= */

// Shorthand for querySelector
const $ = (sel) => document.querySelector(sel);

// Load CSV with PapaParse
async function loadCSV(path) {
  try {
    const response = await fetch(path);
    const text = await response.text();
    return Papa.parse(text, { header: true, skipEmptyLines: true }).data;
  } catch (err) {
    console.error("CSV load error:", err);
    return [];
  }
}

// Clean inconsistent CSV photo paths
function cleanPhotoPath(value) {
  return (value || "")
    .trim()
    .replace(/^assets\//i, "")
    .replace(/^photos\//i, "");
}

// Shuffle array (for random featured picks)
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Prevent a course from appearing more than once
function uniqueByCourse(rows) {
  const seen = new Set();
  const out = [];

  for (const r of rows) {
    const key = (r.Course || "").trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}


/* =========================================================
   Featured Signature Holes Rendering (Home Page)
   ========================================================= */

function renderFeatured(rows) {
  const container = $("#featured");
  const noPhotosMsg = $("#noPhotos");
  container.innerHTML = "";

  // Only rows with usable photos
  const validPhotos = rows.filter((r) => {
    const cleaned = cleanPhotoPath(r.photo);
    const file = cleaned.split("/").pop()?.toLowerCase();
    return file && file !== "nophoto.png";
  });

  // Random 3 distinct courses
  const picks = shuffle(uniqueByCourse(validPhotos)).slice(0, 3);

  if (!picks.length) {
    noPhotosMsg.style.display = "block";
    return;
  }

  picks.forEach((r) => {
    const imgSrc = "assets/photos/" + cleanPhotoPath(r.photo);

    const card = document.createElement("div");
    card.className = "hole-card";

    card.innerHTML = `
      <img class="hole-img"
           src="${imgSrc}"
           data-large="${imgSrc}"
           loading="lazy"
           alt="${r.Course || ""} – Hole ${r.Hole || ""}">
      <div class="hole-title">${r.Course || ""}</div>
      <div class="hole-sub">
        Hole ${r.Hole || ""}${
          r.par ? ` · Par ${r.par}` : ""
        }${r.yardage ? ` · ${r.yardage} yds` : ""}
      </div>
    `;

    // Click → open modal
    card.querySelector(".hole-img").addEventListener("click", () => {
      $("#modalImg").src = imgSrc;
      $("#photoModal").classList.add("show");
      $("#photoModal").setAttribute("aria-hidden", "false");
    });

    container.appendChild(card);
  });
}


/* =========================================================
   Lightbox Modal Controls
   ========================================================= */

document.addEventListener("click", (e) => {
  const modal = $("#photoModal");

  // Close button or clicking the backdrop
  if (
    e.target.classList.contains("modal-close") ||
    e.target === modal
  ) {
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
    $("#modalImg").src = "";
  }
});

// Escape key closes modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && $("#photoModal").classList.contains("show")) {
    $("#photoModal").classList.remove("show");
    $("#modalImg").src = "";
  }
});


/* =========================================================
   Back to Top Button
   ========================================================= */

document.addEventListener("click", (e) => {
  if (e.target.closest(".back-to-top")) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});


/* =========================================================
   Newsletter (simple placeholder)
   ========================================================= */

const newsletter = $("#newsletter");

if (newsletter) {
  newsletter.addEventListener("submit", (e) => {
    e.preventDefault();
    alert("Thanks for joining our newsletter!");
    newsletter.reset();
  });
}


/* =========================================================
   Initialize Home Page
   ========================================================= */

(async () => {
  const rows = await loadCSV("assets/courses_holes.csv");
  renderFeatured(rows);
})();
