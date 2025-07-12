// [FINAL SCRIPT] Menggabungkan semua logika: slider, auto-slide, dan menu mobile.

document.addEventListener("DOMContentLoaded", () => {
  // Bagian renderContent() dan CONFIG akan ada di sini jika Anda menggunakannya nanti.
  // Untuk sekarang, kita fokus pada logika interaktif di dalam App.

  const App = {
    init() {
      // Urutan pemanggilan penting
      this.initMobileMenu();
      this.initHeroSlider();
      this.initFaqAccordion();
      this.initOrderModal();
    },
    initOrderModal() {
      const orderButtons = document.querySelectorAll(".btn-order");
      const modalOverlay = document.getElementById("order-modal-overlay");
      const closeModalBtn = document.getElementById("close-modal-btn");

      // Elemen link di dalam modal
      const modalWaLink = document.getElementById("modal-wa-link");
      const modalShopeeLink = document.getElementById("modal-shopee-link");

      if (!modalOverlay) return; // Keluar jika tidak di halaman yang ada modal

      // Fungsi untuk membuka modal
      const openModal = (e) => {
        const button = e.currentTarget;
        const waLink = button.dataset.waLink;
        const shopeeLink = button.dataset.shopeeLink;

        // Update link di dalam modal
        modalWaLink.href = waLink;
        modalShopeeLink.href = shopeeLink;

        modalOverlay.classList.add("active");
      };

      // Fungsi untuk menutup modal
      const closeModal = () => {
        modalOverlay.classList.remove("active");
      };

      // Tambahkan event listener ke setiap tombol "Pesan"
      orderButtons.forEach((button) => {
        button.addEventListener("click", openModal);
      });

      // Event listener untuk tombol close dan overlay
      closeModalBtn.addEventListener("click", closeModal);
      modalOverlay.addEventListener("click", (e) => {
        // Hanya tutup jika klik di overlay, bukan di modalnya
        if (e.target === modalOverlay) {
          closeModal();
        }
      });
    },
    initFaqAccordion() {
      const accordionItems = document.querySelectorAll(".accordion-item");

      accordionItems.forEach((item) => {
        const header = item.querySelector(".accordion-header");
        const content = item.querySelector(".accordion-content");
        const icon = header.querySelector("i");

        header.addEventListener("click", () => {
          // Toggle kelas 'active' pada item
          const isActive = item.classList.toggle("active");

          // Ganti ikon berdasarkan status aktif
          if (isActive) {
            icon.classList.remove("fa-plus");
            icon.classList.add("fa-minus");
            // Set max-height sesuai tinggi konten agar muncul
            content.style.maxHeight = content.scrollHeight + "px";
          } else {
            icon.classList.remove("fa-minus");
            icon.classList.add("fa-plus");
            // Kembalikan max-height ke 0 agar tersembunyi
            content.style.maxHeight = "0px";
          }
        });
      });
    },

    // [BARU] Logika untuk menu hamburger di mobile
    initMobileMenu() {
      const hamburger = document.querySelector("#hamburger-menu");
      const navbarNav = document.querySelector(".navbar-nav");

      if (hamburger && navbarNav) {
        hamburger.addEventListener("click", function (e) {
          e.preventDefault(); // Mencegah link '#' menggulir ke atas
          navbarNav.classList.toggle("active");
        });

        // Klik di luar sidebar untuk menghilangkan nav
        document.addEventListener("click", function (e) {
          if (!hamburger.contains(e.target) && !navbarNav.contains(e.target)) {
            navbarNav.classList.remove("active");
          }
        });
      }
    },

    // [UPDATE] Logika slider diperbaiki dan ditambahkan auto-slide
    initHeroSlider() {
      const container = document.querySelector(".slider-container");
      const wrapper = document.querySelector(".slider-wrapper");
      if (!container || !wrapper) return;

      const slides = document.querySelectorAll(".slide");
      const dotsContainer = document.querySelector(".slider-dots");

      let currentIndex = 0;
      let autoSlideInterval;
      const slideCount = slides.length;

      // Variabel untuk logika drag/swipe
      let isDragging = false;
      let startPos = 0;
      let currentTranslate = 0;
      let prevTranslate = 0;

      if (slideCount === 0) return;

      // ===================================
      // === FUNGSI-FUNGSI UTAMA SLIDER ===
      // ===================================

      function goToSlide(index) {
        currentIndex = (index + slideCount) % slideCount;
        currentTranslate = currentIndex * -slides[0].offsetWidth;
        prevTranslate = currentTranslate;
        setWrapperPosition();
        updateDots();
      }

      function setWrapperPosition() {
        wrapper.style.transform = `translateX(${currentTranslate}px)`;
      }

      function updateDots() {
        dotsContainer.innerHTML = "";
        for (let i = 0; i < slideCount; i++) {
          const dot = document.createElement("div");
          dot.classList.add("dot");
          if (i === currentIndex) dot.classList.add("active");
          dot.addEventListener("click", () => {
            goToSlide(i);
            stopAutoSlide();
            startAutoSlide();
          });
          dotsContainer.appendChild(dot);
        }
      }

      function startAutoSlide() {
        stopAutoSlide();
        autoSlideInterval = setInterval(() => {
          goToSlide(currentIndex + 1);
        }, 5000);
      }

      function stopAutoSlide() {
        clearInterval(autoSlideInterval);
      }

      // ===================================
      // === LOGIKA UNTUK DRAG & SWIPE ===
      // ===================================

      function getPositionX(event) {
        return event.type.includes("mouse")
          ? event.pageX
          : event.touches[0].clientX;
      }

      function dragStart(event) {
        isDragging = true;
        startPos = getPositionX(event);
        stopAutoSlide();
        // Menghilangkan transisi smooth saat sedang di-drag
        wrapper.style.transition = "none";
      }

      function dragMove(event) {
        if (isDragging) {
          const currentPosition = getPositionX(event);
          currentTranslate = prevTranslate + currentPosition - startPos;
          setWrapperPosition();
        }
      }

      function dragEnd() {
        isDragging = false;
        // Mengaktifkan kembali transisi smooth
        wrapper.style.transition = "transform 0.5s ease-in-out";

        const movedBy = currentTranslate - prevTranslate;

        // Logika "snap" ke slide berikutnya atau kembali
        // Jika geser lebih dari 1/4 lebar slide, maka pindah
        if (movedBy < -50 && currentIndex < slideCount - 1) {
          goToSlide(currentIndex + 1);
        } else if (movedBy > 50 && currentIndex > 0) {
          goToSlide(currentIndex - 1);
        } else {
          // Jika tidak, kembali ke posisi semula
          goToSlide(currentIndex);
        }

        startAutoSlide();
      }

      // ===================================
      // === EVENT LISTENERS ===
      // ===================================

      // Event untuk Desktop (Mouse)
      container.addEventListener("mousedown", dragStart);
      container.addEventListener("mouseup", dragEnd);
      container.addEventListener("mouseleave", dragEnd);
      container.addEventListener("mousemove", dragMove);

      // Event untuk Mobile (Touch)
      container.addEventListener("touchstart", dragStart);
      container.addEventListener("touchend", dragEnd);
      container.addEventListener("touchmove", dragMove);

      // Event listener untuk pause auto-slide saat hover (tetap dipertahankan)
      container.addEventListener("mouseenter", stopAutoSlide);
      container.addEventListener("mouseleave", startAutoSlide);

      // Mencegah browser melakukan drag gambar bawaan
      window.oncontextmenu = function (event) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      };

      // Inisialisasi slider
      goToSlide(0);
    },
  };

  // Menjalankan aplikasi
  App.init();
});
