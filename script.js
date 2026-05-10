const SUPABASE_URL = "https://nfcubuejtqxouraynxbt.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_2EagefA6BlFEhNajIAGEgQ_y4Ww4dHk";

/** Lazy client so booking still works if UMD loads after first script parse (cache/order quirks). */
let supabaseBookingClient = null;
function getSupabaseBookingClient() {
  if (supabaseBookingClient) return supabaseBookingClient;
  if (
    typeof window === "undefined" ||
    !window.supabase ||
    typeof window.supabase.createClient !== "function"
  ) {
    return null;
  }
  try {
    supabaseBookingClient = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
    );
  } catch (e) {
    console.error("Supabase createClient failed", e);
    return null;
  }
  return supabaseBookingClient;
}

const menuButtons = document.querySelectorAll(".menu-toggle");

menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nav = button.parentElement.querySelector(".main-nav");
    if (nav) {
      nav.classList.toggle("open");
    }
  });
});

// Reservation block reveal on scroll
(() => {
  const blocks = Array.from(document.querySelectorAll(".nuru-book-block .detail-copy-bottom"));
  if (!blocks.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.24, rootMargin: "0px 0px -6% 0px" }
  );

  blocks.forEach((block) => observer.observe(block));
})();

// Testimonials carousel (left/right arrows)
(() => {
  const carousel = document.querySelector(".testimonials-carousel");
  if (!carousel) return;

  const viewport = carousel.querySelector(".carousel-viewport");
  const track = carousel.querySelector(".carousel-track");
  const leftBtn = carousel.querySelector(".carousel-arrow.left");
  const rightBtn = carousel.querySelector(".carousel-arrow.right");
  const cards = Array.from(carousel.querySelectorAll(".testimonial-card"));

  if (!viewport || !track || !leftBtn || !rightBtn || cards.length === 0) return;

  let index = 0;
  let stepPx = 0;
  let maxIndex = 0;

  const recalc = () => {
    const first = cards[0];
    const cardRect = first.getBoundingClientRect();
    const cardWidth = cardRect.width;

    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.gap || "0") || 0;

    stepPx = cardWidth + gap;

    // How many cards fit in the viewport
    const visible = Math.max(1, Math.floor((viewport.clientWidth + gap) / stepPx));
    maxIndex = Math.max(0, cards.length - visible);
    index = Math.min(index, maxIndex);

    track.style.transform = `translateX(${-index * stepPx}px)`;
  };

  const go = (dir) => {
    if (maxIndex === 0) return;
    const denom = maxIndex + 1;
    index = (index + dir + denom) % denom; // loop
    track.style.transform = `translateX(${-index * stepPx}px)`;

    leftBtn.blur();
    rightBtn.blur();
  };

  leftBtn.addEventListener("click", () => go(-1));
  rightBtn.addEventListener("click", () => go(1));

  // Initial sizing + debounce on resize
  recalc();
  let t = null;
  window.addEventListener("resize", () => {
    window.clearTimeout(t);
    t = window.setTimeout(recalc, 120);
  });
})();

// Gallery lightbox with arrows
(() => {
  const lightbox = document.querySelector(".gallery-lightbox");
  if (!lightbox) return;

  const images = Array.from(document.querySelectorAll(".gallery-openable"));
  const lightboxImg = lightbox.querySelector(".lightbox-image");
  const closeBtn = lightbox.querySelector(".lightbox-close");
  const prevBtn = lightbox.querySelector(".lightbox-prev");
  const nextBtn = lightbox.querySelector(".lightbox-next");

  if (!lightboxImg || !closeBtn || !prevBtn || !nextBtn || images.length === 0) return;

  let current = 0;

  const show = (idx) => {
    current = (idx + images.length) % images.length;
    const src = images[current].getAttribute("src");
    const alt = images[current].getAttribute("alt") || "";
    lightboxImg.setAttribute("src", src || "");
    lightboxImg.setAttribute("alt", alt);
    lightboxImg.classList.toggle("gallery-muted", Boolean(src && src.includes("galerie-06")));
  };

  const open = (idx) => {
    show(idx);
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  images.forEach((img, idx) => {
    img.addEventListener("click", () => open(idx));
  });

  prevBtn.addEventListener("click", () => show(current - 1));
  nextBtn.addEventListener("click", () => show(current + 1));
  closeBtn.addEventListener("click", close);

  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(current - 1);
    if (e.key === "ArrowRight") show(current + 1);
  });
})();

// Team single-image fade slider
(() => {
  const slider = document.querySelector(".team-fade-slider");
  if (!slider) return;

  const image = slider.querySelector(".team-slide-image");
  const name = slider.querySelector(".team-slide-name");
  const prev = slider.querySelector(".team-prev");
  const next = slider.querySelector(".team-next");
  const lightbox = document.querySelector(".team-lightbox");

  if (!image || !name || !prev || !next) return;

  const members = [
    { src: "assets/equipe-amelie.png", name: "Amélie", details: "Tantra sensoriel · Détente profonde", sliderPos: "center" },
    { src: "assets/equipe-alissa.png", name: "Alissa", details: "Rituels relaxants · Toucher précis", sliderPos: "center" },
    { src: "assets/equipe-line.png", name: "Line", details: "Massage intuitif · Ambiance cocooning", sliderPos: "center 26%" },
    { src: "assets/equipe-victoire.png", name: "Victoire", details: "Pressions expertes · Rythme apaisant", sliderPos: "center 58%" },
    { src: "assets/equipe-cloelia-v2.png", name: "Cloelia", details: "Nuru signature · Gestuelle enveloppante", sliderPos: "center 10%" },
  ];

  let idx = 0;
  const lightboxImg = lightbox?.querySelector(".team-lightbox-image");
  const lightboxName = lightbox?.querySelector(".team-lightbox-name");
  const lightboxPrev = lightbox?.querySelector(".team-lightbox-prev");
  const lightboxNext = lightbox?.querySelector(".team-lightbox-next");
  const lightboxClose = lightbox?.querySelector(".team-lightbox-close");

  const render = (newIdx, syncLightbox = true) => {
    idx = (newIdx + members.length) % members.length;
    image.style.opacity = "0";
    window.setTimeout(() => {
      image.src = members[idx].src;
      image.alt = members[idx].name;
      image.style.objectPosition = members[idx].sliderPos || "center";
      name.textContent = `${members[idx].name} · ${members[idx].details}`;
      image.style.opacity = "1";
    }, 140);

    if (syncLightbox && lightboxImg && lightboxName && lightbox?.classList.contains("open")) {
      lightboxImg.src = members[idx].src;
      lightboxImg.alt = members[idx].name;
      lightboxName.textContent = `${members[idx].name} · ${members[idx].details}`;
    }
  };

  prev.addEventListener("click", () => render(idx - 1));
  next.addEventListener("click", () => render(idx + 1));

  const openLightbox = () => {
    if (!lightbox || !lightboxImg || !lightboxName) return;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    lightboxImg.src = members[idx].src;
    lightboxImg.alt = members[idx].name;
    lightboxName.textContent = `${members[idx].name} · ${members[idx].details}`;
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  image.addEventListener("click", openLightbox);
  lightboxPrev?.addEventListener("click", () => render(idx - 1));
  lightboxNext?.addEventListener("click", () => render(idx + 1));
  lightboxClose?.addEventListener("click", closeLightbox);

  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (e) => {
    if (!lightbox?.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") render(idx - 1);
    if (e.key === "ArrowRight") render(idx + 1);
  });
})();

// Prefill contact form from query params
(() => {
  const form = document.querySelector("#reservation-form");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const intent = params.get("intent");

  const messageInput = form.querySelector("#message");

  if (messageInput && intent) {
    const parts = intent === "question"
      ? ["Bonjour, j'ai une question.", "Merci de me recontacter dès que possible."]
      : ["Bonjour, je souhaite être recontacté(e).", "Merci de revenir vers moi dès que possible."];
    messageInput.value = parts.join("\n");
  }
})();

// Booking wizard modal (open + steps + close)
(() => {
  const launchButtons = Array.from(document.querySelectorAll(".booking-launch-btn"));
  if (!launchButtons.length) return;

  /** Same modal can be opened from several CTAs; wire listeners only once per modal. */
  const bookingModalOpenHandlers = new WeakMap();

  const openModalFromTarget = (targetId) => {
    if (!targetId) return;
    const modal = document.getElementById(targetId);
    if (!modal) return;
    const revealBlock = modal.closest(".detail-copy-bottom");
    revealBlock?.classList.add("in-view");

    // Reuse the same behavior as the in-section CTA when available.
    const sourceButton = launchButtons.find((btn) => (
      !btn.classList.contains("sticky-reserve-btn")
      && btn.getAttribute("data-booking-target") === targetId
    ));

    if (sourceButton) {
      sourceButton.click();
      return;
    }

    // Safe fallback: open modal and reset wizard to first step.
    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const wizard = modal.querySelector(".booking-wizard");
    if (!wizard) return;
    const steps = Array.from(wizard.querySelectorAll(".wizard-step"));
    const progressItems = Array.from(wizard.querySelectorAll(".wizard-progress span"));
    steps.forEach((step, i) => step.classList.toggle("active", i === 0));
    progressItems.forEach((item, i) => item.classList.toggle("active", i === 0));
    wizard.classList.add("show-steps");
  };

  launchButtons.forEach((btn) => {
    const targetId = btn.getAttribute("data-booking-target");
    if (!targetId) return;
    const modal = document.getElementById(targetId);
    if (!modal) return;
    const wizard = modal.querySelector(".booking-wizard");
    if (!wizard) return;

    const existingOpen = bookingModalOpenHandlers.get(modal);
    if (existingOpen) {
      btn.addEventListener("click", existingOpen);
      return;
    }

    const closeBtn = modal.querySelector(".booking-modal-close");
    const backdrop = modal.querySelector(".booking-modal-backdrop");

    const steps = Array.from(wizard.querySelectorAll(".wizard-step"));
    const progressItems = Array.from(wizard.querySelectorAll(".wizard-progress span"));
    const optionGroups = Array.from(wizard.querySelectorAll(".option-chip-row"));
    const dateInputs = Array.from(wizard.querySelectorAll(".booking-date-input"));
    const timePickers = Array.from(wizard.querySelectorAll(".time-picker"));
    const submitBtn = wizard.querySelector(".booking-submit");
    const closeFinalBtn = wizard.querySelector(".booking-close-final");
    let index = 0;

    const validateContactStep = () => {
      const wizardId = wizard.getAttribute("id") || "";
      const prefix =
        wizard.getAttribute("data-prefix") ||
        (wizardId.startsWith("nuru")
          ? "nuru"
          : wizardId.startsWith("tantra")
            ? "tantra"
            : "home");
      const nameInput = wizard.querySelector(`#${prefix}-name`);
      const phoneInput = wizard.querySelector(`#${prefix}-phone`);
      const emailInput = wizard.querySelector(`#${prefix}-email`);
      const streetInput = wizard.querySelector(`#${prefix}-street`);
      const cityInput = wizard.querySelector(`#${prefix}-city`);
      const postalInput = wizard.querySelector(`#${prefix}-postal`);
      const formatInput = wizard.querySelector(`#${prefix}-format`);

      const mandatoryInputs = [nameInput, phoneInput, emailInput].filter(Boolean);
      for (const field of mandatoryInputs) {
        if (!field.value.trim()) {
          field.focus();
          window.alert("Merci de renseigner les champs obligatoires (Nom, Téléphone, Email).");
          return false;
        }
      }

      const homeSelected = (formatInput?.value || "").toLowerCase().includes("à domicile");
      if (homeSelected) {
        if (streetInput && !streetInput.value.trim()) {
          streetInput.focus();
          window.alert("Merci de renseigner la rue pour une réservation à domicile.");
          return false;
        }
        if (cityInput && !cityInput.value.trim()) {
          cityInput.focus();
          window.alert("Merci de renseigner la ville pour une réservation à domicile.");
          return false;
        }
        if (postalInput && !postalInput.value.trim()) {
          postalInput.focus();
          window.alert("Merci de renseigner le code postal pour une réservation à domicile.");
          return false;
        }
      }

      return true;
    };

    const render = () => {
      steps.forEach((step, i) => {
        step.classList.toggle("active", i === index);
      });
      progressItems.forEach((item, i) => {
        item.classList.toggle("active", i <= index);
      });
      wizard.classList.toggle("show-steps", index >= 0);
    };

    const openModal = () => {
      const revealBlock = modal.closest(".detail-copy-bottom");
      revealBlock?.classList.add("in-view");
      modal.classList.remove("hidden");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      index = 0;
      render();
    };

    const closeModal = () => {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    optionGroups.forEach((group) => {
      const buttons = Array.from(group.querySelectorAll(".option-chip"));
      const groupKey = group.getAttribute("data-select-group");
      const hiddenInput = groupKey ? wizard.querySelector(`#${groupKey}`) : null;

      const updateDurationButtonsForService = (serviceName) => {
        if (!groupKey || !groupKey.endsWith("-service")) return;
        const prefix = groupKey.replace("-service", "");
        const durationGroup = wizard.querySelector(`[data-select-group="${prefix}-duration"]`);
        const durationInput = wizard.querySelector(`#${prefix}-duration`);
        if (!durationGroup) return;

        const durationButtons = Array.from(durationGroup.querySelectorAll(".option-chip"));
        if (durationButtons.length < 3) return;

        const durationMap = {
          "Luxe Nuru Experience": [
            "60 min - 190 €",
            "90 min - 250 €",
            "120 min - 300 €",
          ],
          "Luxe Tantra Ritual": [
            "30 min - 100 € (Découverte)",
            "60 min - 150 €",
            "90 min - 200 €",
          ],
        };

        const nextDurations = durationMap[serviceName];
        if (!nextDurations) return;

        durationButtons.forEach((btn, i) => {
          const value = nextDurations[i] || "";
          btn.textContent = value;
          btn.setAttribute("data-value", value);
          btn.classList.toggle("active", i === 0);
        });

        if (durationInput) {
          durationInput.value = nextDurations[0];
        }
      };

      buttons.forEach((optionBtn) => {
        optionBtn.addEventListener("click", () => {
          buttons.forEach((b) => b.classList.remove("active"));
          optionBtn.classList.add("active");
          const selectedValue = optionBtn.getAttribute("data-value") || "";
          if (hiddenInput) {
            hiddenInput.value = selectedValue;
          }
          updateDurationButtonsForService(selectedValue);
        });
      });
    });

    dateInputs.forEach((input) => {
      const setMinDate = () => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        input.min = `${yyyy}-${mm}-${dd}`;
      };
      setMinDate();
      input.addEventListener("click", () => {
        if (typeof input.showPicker === "function") {
          try {
            input.showPicker();
          } catch (_) {
            /* NotAllowedError: picker must open from a direct user gesture in some cases */
          }
        }
      });
    });

    timePickers.forEach((picker) => {
      const targetId = picker.getAttribute("data-time-target");
      const hiddenInput = targetId ? wizard.querySelector(`#${targetId}`) : null;
      const displayBtn = picker.querySelector(".time-picker-display");
      const displayValue = picker.querySelector(".time-picker-value");
      const panel = picker.querySelector(".time-picker-panel");
      const hourBtns = Array.from(picker.querySelectorAll("[data-hour]"));
      const minuteBtns = Array.from(picker.querySelectorAll("[data-minute]"));
      let selectedHour = "11";
      let selectedMinute = "30";

      const sync = () => {
        const value = `${selectedHour}:${selectedMinute}`;
        if (displayValue) displayValue.textContent = value;
        if (hiddenInput) hiddenInput.value = value;
      };

      hourBtns.forEach((h) => {
        h.addEventListener("click", () => {
          selectedHour = h.getAttribute("data-hour") || selectedHour;
          hourBtns.forEach((b) => b.classList.remove("active"));
          h.classList.add("active");
          sync();
        });
      });

      minuteBtns.forEach((m) => {
        m.addEventListener("click", () => {
          selectedMinute = m.getAttribute("data-minute") || selectedMinute;
          minuteBtns.forEach((b) => b.classList.remove("active"));
          m.classList.add("active");
          sync();
        });
      });

      displayBtn?.addEventListener("click", (e) => {
        e.stopPropagation();
        panel?.classList.toggle("hidden");
        const expanded = panel && !panel.classList.contains("hidden");
        displayBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
      });

      panel?.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      document.addEventListener("click", () => {
        panel?.classList.add("hidden");
        displayBtn?.setAttribute("aria-expanded", "false");
      });

      sync();
    });

    submitBtn?.addEventListener("click", async () => {
      if (!validateContactStep()) return;

      const wizardId = wizard.getAttribute("id") || "";
      const prefix =
        wizard.getAttribute("data-prefix") ||
        (wizardId.startsWith("nuru")
          ? "nuru"
          : wizardId.startsWith("tantra")
            ? "tantra"
            : "home");

      const getVal = (field) =>
        wizard.querySelector(`#${prefix}-${field}`)?.value ?? null;

      const row = {
        source: prefix,
        service: getVal("service"),
        preferred_date: (getVal("date") || "").trim() || null,
        preferred_time: getVal("time"),
        duration: getVal("duration"),
        format: getVal("format"),
        name: getVal("name"),
        phone: getVal("phone"),
        email: getVal("email"),
        street: getVal("street"),
        city: getVal("city"),
        postal: getVal("postal"),
        message: getVal("message"),
      };

      const client = getSupabaseBookingClient();
      if (!client) {
        window.alert(
          "Connexion au service de réservation indisponible. Rechargez la page ou vérifiez votre connexion.",
        );
        return;
      }

      submitBtn.disabled = true;
      const { error } = await client.from("booking_submissions").insert([row]);
      submitBtn.disabled = false;
      if (error) {
        console.error(error);
        window.alert(
          "Impossible d'enregistrer la demande pour le moment. Réessayez dans quelques minutes.",
        );
        return;
      }

      index = Math.min(index + 1, steps.length - 1);
      render();
    });

    closeFinalBtn?.addEventListener("click", () => {
      closeModal();
    });

    wizard.querySelectorAll(".wizard-next").forEach((nextBtn) => {
      nextBtn.addEventListener("click", () => {
        if (index === 1 && !validateContactStep()) {
          return;
        }
        index = Math.min(index + 1, steps.length - 1);
        render();
      });
    });

    wizard.querySelectorAll(".wizard-prev").forEach((prevBtn) => {
      prevBtn.addEventListener("click", () => {
        index = Math.max(index - 1, 0);
        render();
      });
    });

    closeBtn?.addEventListener("click", closeModal);
    backdrop?.addEventListener("click", closeModal);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modal.classList.contains("hidden")) {
        closeModal();
      }
    });

    bookingModalOpenHandlers.set(modal, openModal);
    btn.addEventListener("click", openModal);

    if (window.location.hash === `#${targetId}`) {
      openModal();
    }
  });

  // Extra fallback for sticky button clicks (mobile + desktop).
  document.addEventListener("click", (event) => {
    const stickyBtn = event.target instanceof Element
      ? event.target.closest(".sticky-reserve-btn")
      : null;
    if (!stickyBtn) return;
    event.preventDefault();
    const targetId = stickyBtn.getAttribute("data-booking-target");
    openModalFromTarget(targetId);
  });
})();
