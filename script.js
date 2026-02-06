(function () {
  'use strict';

  // ===== DOM Elements =====
  const card = document.getElementById('card');
  const btnYes = document.getElementById('btn-yes');
  const btnNo = document.getElementById('btn-no');
  const celebration = document.getElementById('celebration');
  const confettiContainer = document.getElementById('confetti');

  // ===== Dodge Config =====
  const DODGE_THRESHOLD = 80;
  const DODGE_DISTANCE = 60;
  const YES_SCALE_INCREMENT = 0.02;
  const YES_MAX_SCALE = 1.3;
  const NO_SHRINK_FACTOR = 0.95;
  const NO_MIN_SCALE = 0.5;
  const SCREEN_PADDING = 20;

  // ===== Dodge State =====
  let dodgeCount = 0;
  let isDodging = false;
  let yesScale = 1;
  let noScale = 1;
  let ticking = false;

  // ===== No Button Dodge Logic =====

  function switchToFixed() {
    if (isDodging) return;

    const btnRect = btnNo.getBoundingClientRect();

    // Capture current viewport position before switching to fixed
    btnNo.classList.add('dodging');
    btnNo.style.left = btnRect.left + 'px';
    btnNo.style.top = btnRect.top + 'px';

    isDodging = true;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function dodgeButton(mouseX, mouseY) {
    switchToFixed();

    const btnRect = btnNo.getBoundingClientRect();
    const btnCenterX = btnRect.left + btnRect.width / 2;
    const btnCenterY = btnRect.top + btnRect.height / 2;

    // Escape direction: away from mouse, with small random offset
    const angle = Math.atan2(btnCenterY - mouseY, btnCenterX - mouseX);
    const randomOffset = (Math.random() - 0.5) * (Math.PI / 3);
    const escapeAngle = angle + randomOffset;

    let newX = btnCenterX + Math.cos(escapeAngle) * DODGE_DISTANCE - btnRect.width / 2;
    let newY = btnCenterY + Math.sin(escapeAngle) * DODGE_DISTANCE - btnRect.height / 2;

    // Clamp within viewport
    const maxX = window.innerWidth - btnRect.width - SCREEN_PADDING;
    const maxY = window.innerHeight - btnRect.height - SCREEN_PADDING;

    newX = clamp(newX, SCREEN_PADDING, maxX);
    newY = clamp(newY, SCREEN_PADDING, maxY);

    // If still too close to mouse (cornered against screen edge), jump to opposite side
    const distAfter = Math.sqrt(
      Math.pow(newX + btnRect.width / 2 - mouseX, 2) +
      Math.pow(newY + btnRect.height / 2 - mouseY, 2)
    );

    if (distAfter < DODGE_THRESHOLD * 0.6) {
      newX = mouseX < window.innerWidth / 2 ? maxX : SCREEN_PADDING;
      newY = mouseY < window.innerHeight / 2 ? maxY : SCREEN_PADDING;
    }

    btnNo.style.left = newX + 'px';
    btnNo.style.top = newY + 'px';

    dodgeCount++;
    growYes();
    shrinkNo();
  }

  function growYes() {
    yesScale = Math.min(yesScale + YES_SCALE_INCREMENT, YES_MAX_SCALE);
    btnYes.style.transform = 'scale(' + yesScale + ')';
  }

  function shrinkNo() {
    // No button stays the same size
  }

  // ===== Mouse Event Handler (listen on whole document) =====
  document.addEventListener('mousemove', function (e) {
    if (!ticking) {
      requestAnimationFrame(function () {
        const btnRect = btnNo.getBoundingClientRect();
        const btnCenterX = btnRect.left + btnRect.width / 2;
        const btnCenterY = btnRect.top + btnRect.height / 2;

        const dx = e.clientX - btnCenterX;
        const dy = e.clientY - btnCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < DODGE_THRESHOLD) {
          dodgeButton(e.clientX, e.clientY);
        }

        ticking = false;
      });
      ticking = true;
    }
  });

  // ===== Mobile Touch Handler =====
  btnNo.addEventListener('touchstart', function (e) {
    e.preventDefault();

    switchToFixed();

    const btnRect = btnNo.getBoundingClientRect();
    const maxX = window.innerWidth - btnRect.width - SCREEN_PADDING;
    const maxY = window.innerHeight - btnRect.height - SCREEN_PADDING;

    // Move to a random position on screen
    const newX = SCREEN_PADDING + Math.random() * (maxX - SCREEN_PADDING);
    const newY = SCREEN_PADDING + Math.random() * (maxY - SCREEN_PADDING);

    btnNo.style.left = newX + 'px';
    btnNo.style.top = newY + 'px';

    dodgeCount++;
    growYes();
    shrinkNo();
  }, { passive: false });

  // Prevent click on No button from doing anything once dodging
  btnNo.addEventListener('click', function (e) {
    if (isDodging) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  // ===== Yes Button: Trigger Celebration =====
  btnYes.addEventListener('click', function () {
    // Hide No button
    btnNo.style.display = 'none';

    card.classList.add('hidden');

    setTimeout(function () {
      celebration.classList.remove('hidden');
      generateConfetti(60);
    }, 300);
  });

  // ===== Confetti Generator =====
  function generateConfetti(count) {
    var colors = ['#ff4778', '#ff85a2', '#ffb6c8', '#ff6b9d', '#ffd700', '#ff69b4', '#e74c6f', '#ff1493'];

    for (var i = 0; i < count; i++) {
      var piece = document.createElement('div');
      piece.classList.add('confetti-piece');
      piece.style.setProperty('--x', (Math.random() * 100) + 'vw');
      piece.style.setProperty('--color', colors[Math.floor(Math.random() * colors.length)]);
      piece.style.setProperty('--size', (Math.random() * 8 + 5) + 'px');
      piece.style.setProperty('--delay', (Math.random() * 2.5) + 's');
      piece.style.setProperty('--fall-duration', (Math.random() * 2 + 2.5) + 's');
      piece.style.setProperty('--sway', (Math.random() * 60 - 30) + 'px');
      piece.style.setProperty('--shape', Math.random() > 0.5 ? '50%' : '2px');
      confettiContainer.appendChild(piece);
    }

    // Clean up after animations
    setTimeout(function () {
      confettiContainer.innerHTML = '';
    }, 6000);
  }

  // ===== Preload celebration GIF =====
  var preload = new Image();
  preload.src = 'kiss.gif';

})();
