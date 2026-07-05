gsap.registerPlugin(ScrollTrigger, Flip);

window.scrollTo(0, 0);

const musicControl = $("#musicControl");
const playPauseIcon = document.querySelector("#playPause");
const bgMusic = document.querySelector("audio");

if (bgMusic) {
  bgMusic.load();
}

const bgMusicPlay = (play = true) => {
  if (bgMusic) {
    bgMusic.loop = true;
    bgMusic.controls = false;

    if (play == true) {
      bgMusic.play();
    } else {
      bgMusic.pause();
    }
  }
};

if (musicControl) {
  musicControl.on("click", (event) => {
    if (bgMusic.paused == true) {
      bgMusicPlay();
      playPauseIcon.classList.replace("icofont-music-alt", "icofont-ui-pause");
    } else {
      bgMusicPlay(false);
      playPauseIcon.classList.replace("icofont-ui-pause", "icofont-music-alt");
    }
  });
}

const guestAmoutSelect = document.querySelector(
  ".rsvp-section form select[name='jumlah']",
);
const newOptionGuestAmount = document.createElement("option");
newOptionGuestAmount.value = "";
newOptionGuestAmount.selected = true;
newOptionGuestAmount.hidden = true;
newOptionGuestAmount.textContent = "";
if (guestAmoutSelect)
  guestAmoutSelect.insertBefore(
    newOptionGuestAmount,
    guestAmoutSelect.firstElementChild,
  );

// Handle tab visibility change
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    // Pause the music when the tab is not visible
    bgMusicPlay(false);
    playPauseIcon.classList.replace("icofont-ui-pause", "icofont-music-alt");
  } else if (document.visibilityState === "visible" && !bgMusic.paused) {
    // Optionally, resume playing when the tab is visible again
    bgMusicPlay();
    playPauseIcon.classList.replace("icofont-music-alt", "icofont-ui-pause");
  }
});

$("body").css("overflow-y", "hidden");

$("#btn-envelope").on("click", function () {
  $("body").css("overflow-y", "auto");

  $(".logo-viding").addClass("custom-position");

  $(".cover-section").addClass("cover-opened");

  runAnimationOrnament();
  runAnimationLoop();
  bgMusicPlay();

  const coverTime = setTimeout(() => {
    $(".cover-section").hide();
    ScrollTrigger.refresh();
    clearTimeout(coverTime);
  }, 1200);

  const headerTime = setTimeout(() => {
    ScrollTrigger.refresh();
    clearTimeout(headerTime);
  }, 2500);
});

let previousScroll = 70;
$(window).scroll(function (e) {
  // add/remove class to navbar when scrolling to hide/show
  var scroll = $(window).scrollTop();
  if (scroll >= previousScroll) {
    $("nav").addClass("navbar-hide");
    $("nav").removeClass("scrolled");
  } else if (scroll < previousScroll) {
    $("nav").removeClass("navbar-hide");
    $("nav").addClass("scrolled");
  }

  if (scroll == 0) {
    $("nav").removeClass("navbar-hide");
    $("nav").removeClass("scrolled");
  }
  previousScroll = scroll;
});

const cd = document.querySelector(".countdown");

if (cd) Countdown(cd.getAttribute("date"));

// Egift section
const giftWrap = document.querySelector(".egift-section");
if (giftWrap) {
  const tabsWrap = giftWrap.querySelector(".tabs-gift");
  const tab = tabsWrap.querySelectorAll(".tab");
  const glider = tabsWrap.querySelector(".glider");
  tab.forEach((el) => {
    el.classList.forEach((c) => {
      if (c === "active") {
        giftWrap.querySelectorAll(el.dataset.tab).forEach((tb) => {
          tb.classList.add("show");
        });

        ScrollTrigger.refresh();
      }
    });

    el.addEventListener("click", (e) => {
      const flipState = Flip.getState(glider);

      if (tabsWrap.querySelector(".active")) {
        tabsWrap.querySelector(".active").classList.remove("active");
        giftWrap.querySelectorAll(".show").forEach((se) => {
          se.classList.remove("show");
        });
      }

      el.classList.add("active");
      el.appendChild(glider);
      giftWrap.querySelectorAll(el.dataset.tab).forEach((tb) => {
        tb.classList.add("show");
      });

      Flip.from(flipState, { duration: 0.25, ease: "power1.inOut" });

      ScrollTrigger.refresh();
    });
  });
}

if (document.querySelectorAll("[data-anim]")) {
  document.querySelectorAll("[data-anim]").forEach((ada) => {
    ada.classList.add("animation-invisible");
  });
}

const runAnimationOrnament = () => {
  document.querySelectorAll("[data-anim]").forEach((da) => {
    ScrollTrigger.create({
      trigger: da,
      start: da.dataset.animAnchor ? da.dataset.animAnchor : "top bottom",
      onToggle: (self) => {
        if (!self.isActive) {
          if (da.classList.contains("animate-loop")) {
            return da.classList.add("animate-paused");
          } else {
            return null;
          }
        }
        if (da.dataset.loadAnimation) {
          if (da.classList.contains("animate-loop")) {
            return da.classList.remove("animate-paused");
          } else {
            return self.kill();
          }
        }

        if (da.dataset.animDuration)
          da.style.animationDuration = da.dataset.animDuration;

        if (da.dataset.animDelay) {
          setTimeout(() => {
            da.classList.add("has-animate");
            da.classList.remove("animation-invisible");
            da.dataset.loadAnimation = true;
          }, da.dataset.animDelay);
        } else {
          da.classList.add("has-animate");
          da.classList.remove("animation-invisible");
          da.dataset.loadAnimation = true;
        }
      },
    });
  });
};

const runAnimationOrnamentCover = () => {
  document.querySelectorAll(".cover-section [data-anim]").forEach((vs) => {
    ScrollTrigger.create({
      trigger: vs,
      start: "top bottom",
      onToggle: (self) => {
        if (self.isActive) {
          if (vs.dataset.animDuration)
            vs.style.animationDuration = vs.dataset.animDuration;

          if (vs.dataset.animDelay) {
            setTimeout(() => {
              vs.classList.add("has-animate");
              vs.classList.remove("animation-invisible");
              vs.dataset.loadAnimation = true;
              self.kill();
            }, vs.dataset.animDelay);
          } else {
            vs.classList.add("has-animate");
            vs.classList.remove("animation-invisible");
            vs.dataset.loadAnimation = true;
            self.kill();
          }
        } else {
          vs.classList.add("animation-invisible");
          self.kill();
        }
      },
    });
  });
};

const runAnimationLoop = () => {
  document.querySelectorAll("[data-animationloop]").forEach((al) => {
    ScrollTrigger.create({
      trigger: al,
      start: "-10% bottom",
      onToggle: (self) =>
        self.isActive
          ? al.classList.add("animation-loop")
          : al.classList.remove("animation-loop"),
    });
  });
};

const getLoadedIframe = (ifr) => {
  return new Promise((resolve, reject) => {
    ifr.onload = () => resolve("maps loaded!");
    ifr.onerror = () =>
      reject("Iframe Load Failed: Please Check Again Your URL!");
    ifr.src = ifr.dataset.src;
  });
};

// Modal Event Handler
const mapModal = document.querySelectorAll(".modal");

mapModal.forEach((modal) => {
  modal.addEventListener("shown.bs.modal", (e) => {
    const loader = e.target.querySelector(".loader-wrapper-modal");
    const iframe = e.target.querySelector("iframe");

    getLoadedIframe(iframe)
      .then(() => {
        loader.classList.add("loaded");
      })
      .catch((err) => {
        console.log(err);
      });
  });

  modal.addEventListener("hidden.bs.modal", (e) => {
    const iframe = e.target.querySelector("iframe");
    const loader = e.target.querySelector(".loader-wrapper-modal");
    iframe.src = "";
    loader.classList.remove("loaded");
  });
});

if (document.querySelector("#zoom-gallery-default")) {
  $("#zoom-gallery-default").magnificPopup({
    delegate: "li a",
    type: "image",
    mainClass: "mfp-with-zoom mfp-img-mobile",
    gallery: {
      enabled: true,
    },
    zoom: {
      enabled: true,
      easing: "ease-in-out",
    },
  });
}

const brandName = document.querySelector(
  ".header-section .header-content .header .header-title-content .brand-name",
);
if (brandName) brandName.classList.add("notranslate");

const siteName = document
  .querySelector('meta[property="og:site_name"]')
  ?.getAttribute("content");

if (siteName === "anchadea.viding.co") {
  const btnIgs = document.querySelectorAll(
    ".couple-section .couple .sosmed-wrap .sosmed",
  );

  btnIgs.forEach((btnIg) => {
    const splitUrl = btnIg.href.split("/");

    const username = splitUrl[splitUrl.length - 1];
    btnIg.querySelector("small").innerHTML = `
			<i class="fab fa-instagram"></i> ${username}
		`;
  });
} else if (siteName === "tunangandheaaditya.viding.co") {
  const events = document.querySelectorAll(
    ".venue-section .venue-content .card",
  );

  events.forEach((event) => {
    const eventName = event.querySelector(".event-name h4").textContent.trim();

    if (eventName === "Engagement") {
      const pTag = event.querySelectorAll(".event-name p");
      const jam = pTag[pTag.length - 1];

      const newJam = jam.textContent
        .trim()
        .replace("WIB", "")
        .replace("-", "WIB -");

      jam.textContent = newJam;
    }
  });

  const reminderBtn = document.querySelector(".reminder-wrap .btn-reminder");
  if (reminderBtn) {
    const url = new URL(reminderBtn.href);

    url.searchParams.set("text", "The engagement of Aditya & Dhea");

    reminderBtn.href = url.toString();
  }
} else if (siteName === "khitanataladanalbi.viding.co") {
  const reminderBtn = document.querySelector(".reminder-wrap .btn-reminder");
  if (reminderBtn) {
    const url = new URL(reminderBtn.href);

    url.searchParams.set("text", "Walimatul Khitan Atala & Albi");

    reminderBtn.href = url.toString();
  }
} else if (siteName === "auliaistheanswer.viding.co") {
  const coverDesc = document.querySelector(".cover-section .cover-description");
  const greeting = coverDesc.querySelector(".greeting-wrapper");

  if (greeting) {
    coverDesc.insertBefore(
      greeting,
      coverDesc.querySelector(".elements-widget"),
    );
  }
} else if (siteName === "malamramahtamahlunaxel.viding.co") {
  const events = document.querySelectorAll(".venue-content .card");

  events.forEach((event) => {
    const eventName = event.querySelector(".event-name h4");

    if (eventName) {
      const originalText = eventName.innerHTML;

      // Add space between camelCase words
      const spacedText = originalText.replace(/([a-z])([A-Z])/g, "$1 $2");

      // Split and format the text
      let parts = spacedText.split(": ");
      if (parts.length > 1) {
        const title = parts[1];

        let formattedText =
          parts[0] +
          ":<br><span style='font-size: 0.6em; font-weight: normal;'>";

        // Specific handling for your case - split after "Tukar Tapak Sirih"
        if (title.includes("Tukar Tapak Sirih A")) {
          formattedText += title.replace(
            "Tukar Tapak Sirih A",
            "Tukar Tapak Sirih<br>A",
          );
        } else {
          // General case: try to split before "A " when it appears after the main title
          const alternativeSplit = title.replace(
            /(.*?) (A [A-Z].*)/,
            "$1<br>$2",
          );
          formattedText += alternativeSplit;
        }

        formattedText += "</span>";
        eventName.innerHTML = formattedText;
      } else {
        // Fallback: use the original logic
        const newEventName =
          spacedText.replace(
            " : ",
            ":<br><span style='font-size: 0.6em; font-weight: normal;'>",
          ) + "</span>";
        eventName.innerHTML = newEventName;
      }
    }
  });
}
