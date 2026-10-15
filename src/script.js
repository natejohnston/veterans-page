(() => {
  "use strict";

  document.documentElement.classList.add("has-js");

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const reviews = [
    {
      name: "Cheyenne R.",
      branch: "U.S. Army",
      image: "assets/cheyenne-r.jpg",
    },
    {
      name: "Oden R.",
      branch: "U.S. Air Force",
      image: "assets/oden-r.jpg",
    },
    {
      name: "Gabriel H.",
      branch: "U.S. Marine Corps",
      image: "assets/gabriel-h.jpg",
    },
    {
      name: "Christina E.",
      branch: "U.S. Army",
      image: "assets/christina-e.jpg",
    },
  ];

  const adjectiveSets = [
    ["Trustworthy", "Knowledgeable", "Streamlined"],
    ["Caring", "Easy", "Supportive"],
    ["Simple", "Personal", "Reliable"],
    ["Welcoming", "Thorough", "Kind"],
  ];

  const statistics = [
    ["476,687", "veteran reviews and counting"],
    ["4.8/5", "average customer rating"],
    ["98.2%", "would recommend VU"],
    ["2,547", "Veterans got a quote in 24 hrs"],
  ];

  const quotes = [
    [
      "Everyone there really understands what it means to be in a military family.",
      "Cheyenne R., Army",
    ],
    [
      "We handled our end and our loan squad took care of everything else.",
      "Oden R., Air Force",
    ],
    [
      "Knowledgeable, helpful and always willing to answer questions.",
      "Gabriel H., Marine Corps",
    ],
    [
      "The team had our backs and helped us finally achieve our dream.",
      "Christina E., Army",
    ],
  ];

  const columnSettings = [
    { width: 210, offset: -140 },
    { width: 210, offset: 230 },
    { width: 188, offset: -320 },
    { width: 210, offset: 80 },
    { width: 188, offset: -220 },
    { width: 210, offset: 180 },
    { width: 210, offset: -80 },
    { width: 188, offset: 260 },
  ];

  const kinds = ["photo", "words", "stat", "quote", "photo", "stat", "words", "quote"];
  const heights = [250, 230, 300, 210, 280, 240, 260, 310];
  const photoPositions = ["50% 25%", "30% 40%", "70% 30%", "50% 55%"];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function createPhotoCard(seed) {
    const review = reviews[seed % reviews.length];
    const card = element("div", "mosaic-card mosaic-card--photo");
    const image = element("img", "mosaic-kb");
    image.src = review.image;
    image.alt = "";
    image.loading = "lazy";
    image.style.objectPosition = photoPositions[seed % photoPositions.length];
    image.style.animationDelay = `${seed * -1.7}s`;

    const badge = element(
      "span",
      "mosaic-card__badge",
      review.branch.replace("U.S. ", ""),
    );
    card.append(image, badge);
    return card;
  }

  function createWordsCard(seed) {
    const words = adjectiveSets[seed % adjectiveSets.length];
    const card = element("div", "mosaic-card mosaic-card--blue");
    const list = element("p", "mosaic-card__words");

    words.forEach((word, index) => {
      const line = element("span", index === seed % words.length ? "is-active" : "", word);
      list.append(line);
    });

    const review = reviews[(seed + 1) % reviews.length];
    const byline = element("p", "mosaic-card__label", `${review.name}, ${review.branch.replace("U.S. ", "")}`);
    card.append(list, byline);
    return card;
  }

  function createStatCard(seed) {
    const [value, label] = statistics[seed % statistics.length];
    const tone = seed % 2 === 0 ? "mosaic-card--yellow" : "mosaic-card--blue";
    const card = element("div", `mosaic-card ${tone}`);
    card.append(
      element("p", "mosaic-card__value", value),
      element("p", "mosaic-card__label", label),
    );
    return card;
  }

  function createQuoteCard(seed) {
    const [quote, name] = quotes[seed % quotes.length];
    const card = element("div", "mosaic-card mosaic-card--review");
    const content = element("div");
    content.append(
      element("p", "mosaic-card__stars", "★★★★★"),
      element("p", "", `“${quote}”`),
    );
    card.append(content, element("p", "mosaic-card__label", name));
    return card;
  }

  function createMosaicCard(kind, seed) {
    if (kind === "photo") return createPhotoCard(seed);
    if (kind === "words") return createWordsCard(seed);
    if (kind === "stat") return createStatCard(seed);
    return createQuoteCard(seed);
  }

  function buildMosaic() {
    const wall = document.querySelector("[data-mosaic-wall]");
    if (!wall) return;

    const fragment = document.createDocumentFragment();

    columnSettings.forEach((settings, columnIndex) => {
      const column = element("div", "mosaic__column");
      column.style.setProperty("--column-width", `${settings.width}px`);
      column.style.setProperty("--column-offset", `${settings.offset}px`);

      for (let rowIndex = 0; rowIndex < 8; rowIndex += 1) {
        const seed = columnIndex * 8 + rowIndex;
        const kind = kinds[(columnIndex * 3 + rowIndex) % kinds.length];
        const card = createMosaicCard(kind, seed);
        card.style.height = `${heights[(columnIndex * 2 + rowIndex * 3) % heights.length]}px`;
        card.style.animationDelay = `${(seed % 10) * 45}ms`;
        column.append(card);
      }

      fragment.append(column);
    });

    wall.append(fragment);

    const section = wall.closest(".mosaic");
    if (!section || reducedMotion.matches || !("IntersectionObserver" in window)) {
      section?.setAttribute("data-in", "true");
      return;
    }

    section.setAttribute("data-animate", "tiles");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        section.setAttribute("data-in", "true");
        observer.disconnect();
      },
      { threshold: 0.12 },
    );
    observer.observe(section);
  }

  function initScrollMosaic() {
    const section = document.querySelector("[data-scroll-mosaic]");
    const wall = section?.querySelector("[data-mosaic-wall]");
    const intro = section?.querySelector("[data-mosaic-intro]");
    const outro = section?.querySelector("[data-mosaic-outro]");
    const progressBar = section?.querySelector("[data-mosaic-progress]");

    if (!section || !wall || !intro || !outro || !progressBar) return;

    const columns = [...wall.querySelectorAll(".mosaic__column")];
    const clamp = (value) => Math.min(1, Math.max(0, value));
    const easeOutCubic = (value) => 1 - Math.pow(1 - value, 3);
    let frame = 0;

    outro.inert = true;

    function update() {
      frame = 0;

      if (reducedMotion.matches) {
        wall.style.removeProperty("opacity");
        wall.style.removeProperty("transform");
        columns.forEach((column) => column.style.removeProperty("transform"));
        intro.style.opacity = "1";
        intro.style.transform = "none";
        intro.style.pointerEvents = "auto";
        outro.style.opacity = "1";
        outro.style.transform = "none";
        outro.style.pointerEvents = "auto";
        outro.inert = false;
        progressBar.style.transform = "scaleX(1)";
        return;
      }

      const bounds = section.getBoundingClientRect();
      const scrollRange = Math.max(1, bounds.height - window.innerHeight);
      const progress = clamp(-bounds.top / scrollRange);
      const open = easeOutCubic(clamp(progress / 0.55));

      wall.style.transform = [
        "perspective(1400px)",
        `rotateX(${(1 - open) * 14}deg)`,
        `rotate(${(1 - open) * -6}deg)`,
        `scale(${1.45 - open * 0.45})`,
      ].join(" ");
      wall.style.opacity = String(0.35 + open * 0.65);

      columns.forEach((column, index) => {
        const direction = index % 2 === 0 ? -1 : 1;
        const speed = 140 + (index % 3) * 90;
        const offset = direction * (progress - 0.5) * speed * 2
          + direction * (1 - open) * 220;
        column.style.transform = `translate3d(0, ${offset}px, 0)`;
      });

      const introVisibility = 1 - clamp((progress - 0.12) / 0.3);
      intro.style.opacity = String(introVisibility);
      intro.style.transform = `translateY(${(1 - introVisibility) * -40}px) scale(${1 + (1 - introVisibility) * 0.08})`;
      intro.style.pointerEvents = introVisibility < 0.2 ? "none" : "auto";

      const outroVisibility = clamp((progress - 0.72) / 0.22);
      outro.style.opacity = String(outroVisibility);
      outro.style.transform = `translateY(${(1 - outroVisibility) * 40}px) scale(${0.94 + outroVisibility * 0.06})`;
      outro.style.pointerEvents = outroVisibility < 0.2 ? "none" : "auto";
      outro.inert = outroVisibility < 0.2;

      progressBar.style.transform = `scaleX(${progress})`;
    }

    function scheduleUpdate() {
      if (!frame) frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reducedMotion.addEventListener?.("change", scheduleUpdate);
  }

  function animateCounter(node) {
    const target = Number(node.dataset.count);
    const decimals = Number(node.dataset.decimals || 0);
    const suffix = node.dataset.suffix || "";
    const formatter = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    if (!Number.isFinite(target) || reducedMotion.matches) {
      node.textContent = `${formatter.format(target)}${suffix}`;
      return;
    }

    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      node.textContent = `${formatter.format(target * eased)}${suffix}`;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function initCounters() {
    const counters = [...document.querySelectorAll("[data-count]")];
    if (!counters.length) return;

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 },
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  function initScrollReveals() {
    const items = [...document.querySelectorAll("[data-reveal]")];
    if (!items.length) return;

    items.forEach((item) => {
      const delay = Number(item.dataset.revealDelay || 0);
      item.style.setProperty("--reveal-delay", `${delay}ms`);
    });

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach((item) => item.setAttribute("data-revealed", "true"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.setAttribute("data-revealed", "true");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8%" },
    );

    items.forEach((item) => observer.observe(item));
  }

  function initAccordion() {
    document.querySelectorAll("[data-accordion]").forEach((accordion) => {
      const items = [...accordion.querySelectorAll("details")];
      items.forEach((item) => {
        item.addEventListener("toggle", () => {
          if (!item.open) return;
          items.forEach((other) => {
            if (other !== item) other.removeAttribute("open");
          });
        });
      });
    });
  }

  function initFooterExpanders() {
    const groups = [...document.querySelectorAll("[data-footer-expander]")];
    if (!groups.length) return;

    const mobileFooter = window.matchMedia("(max-width: 799px)");

    function setExpanded(group, expanded) {
      const button = group.querySelector(".expander-button");
      const content = group.querySelector(".expander-group-content");
      if (!button || !content) return;

      group.classList.toggle("expander-group-open", expanded);
      button.setAttribute("aria-expanded", String(expanded));
      content.style.maxHeight = mobileFooter.matches
        ? expanded
          ? `${content.scrollHeight}px`
          : "0px"
        : "none";
    }

    groups.forEach((group) => {
      const button = group.querySelector(".expander-button");
      if (!button) return;

      button.addEventListener("click", () => {
        if (!mobileFooter.matches) return;
        setExpanded(group, button.getAttribute("aria-expanded") !== "true");
      });
    });

    function syncGroups() {
      groups.forEach((group) => setExpanded(group, !mobileFooter.matches));
    }

    syncGroups();
    mobileFooter.addEventListener?.("change", syncGroups);
    window.addEventListener("resize", () => {
      if (!mobileFooter.matches) return;
      groups.forEach((group) => {
        const button = group.querySelector(".expander-button");
        if (button?.getAttribute("aria-expanded") === "true") {
          setExpanded(group, true);
        }
      });
    });
  }

  function initReviewKeyboardScrolling() {
    document.querySelectorAll(".testimonial__viewport").forEach((viewport) => {
      viewport.addEventListener("keydown", (event) => {
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        viewport.scrollBy({
          left: event.key === "ArrowRight" ? 344 : -344,
          behavior: reducedMotion.matches ? "auto" : "smooth",
        });
      });
    });
  }

  function initQuoteIntent() {
    let selectedLoanOption = "unspecified";

    document.querySelectorAll("[data-loan-option]").forEach((option) => {
      option.addEventListener("click", () => {
        selectedLoanOption = option.dataset.loanOption || "unspecified";
      });
    });

    document.querySelectorAll("[data-quote-action]").forEach((action) => {
      action.addEventListener("click", (event) => {
        event.preventDefault();
        document.dispatchEvent(
          new CustomEvent("vu:quote-requested", {
            detail: { loanOption: selectedLoanOption },
          }),
        );
      });
    });
  }

  buildMosaic();
  initScrollMosaic();
  initCounters();
  initScrollReveals();
  initAccordion();
  initFooterExpanders();
  initReviewKeyboardScrolling();
  initQuoteIntent();
})();
