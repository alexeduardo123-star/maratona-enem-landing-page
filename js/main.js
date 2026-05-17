(function () {
  'use strict';

  /* ──────────────────────────────────────
     LOADER
  ────────────────────────────────────── */
  const loader    = document.getElementById('page-loader');
  const loaderLogo = loader.querySelector('.loader-logo');
  const loaderBar  = document.getElementById('loader-bar');

  gsap.to(loaderLogo, { opacity: 1, y: 0, duration: 0.5, delay: 0.1, ease: 'power2.out' });
  gsap.fromTo(loaderBar, { scaleX: 0 }, {
    scaleX: 1,
    duration: 1.2,
    ease: 'power2.inOut',
    transformOrigin: 'left',
    onComplete: () => {
      gsap.to(loader, {
        scaleY: 0,
        duration: 0.8,
        ease: 'power4.inOut',
        transformOrigin: 'top',
        onComplete: () => {
          loader.style.display = 'none';
          runHeroEntrance();
        }
      });
    }
  });

  function runHeroEntrance() {
    const tl = gsap.timeline();
    tl.to('#hero-eyebrow', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .to('#hero-title',   { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.2')
      .to('#hero-sub',     { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      .to('#hero-ctas',    { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .to('#scroll-ind',   { opacity: 1, duration: 0.5, ease: 'power2.out' }, '-=0.1');

    gsap.from('#hero-canvas', {
      scale: 0.5,
      opacity: 0,
      duration: 1.6,
      ease: 'elastic.out(1, 0.5)',
      delay: 0.3
    });
  }

  /* ──────────────────────────────────────
     THREE.JS — HERO 3D CRYSTAL
  ────────────────────────────────────── */
  const canvas = document.getElementById('hero-canvas');
  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const ambientLight = new THREE.AmbientLight(0xFF2200, 0.4);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xFF4500, 4, 12);
  pointLight.position.set(2, 2, 3);
  scene.add(pointLight);

  const rimLight = new THREE.PointLight(0xFF8800, 1.5, 10);
  rimLight.position.set(-3, -1, 2);
  scene.add(rimLight);

  const geoMain = new THREE.IcosahedronGeometry(1.6, 1);
  const matMain = new THREE.MeshStandardMaterial({
    color: 0xFF3300,
    emissive: 0xFF1100,
    emissiveIntensity: 0.25,
    metalness: 0.9,
    roughness: 0.08,
  });
  const crystal = new THREE.Mesh(geoMain, matMain);
  scene.add(crystal);

  const geoInner = new THREE.IcosahedronGeometry(1.0, 0);
  const matInner = new THREE.MeshStandardMaterial({
    color: 0xFF6600,
    emissive: 0xFF4400,
    emissiveIntensity: 0.8,
    metalness: 0.3,
    roughness: 0.5,
    transparent: true,
    opacity: 0.5,
    wireframe: true,
  });
  const innerCrystal = new THREE.Mesh(geoInner, matInner);
  scene.add(innerCrystal);

  const particleCount = 180;
  const positions = new Float32Array(particleCount * 3);
  const speeds    = new Float32Array(particleCount);
  for (let i = 0; i < particleCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos((Math.random() * 2) - 1);
    const r     = 2.2 + Math.random() * 2.5;
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    speeds[i] = 0.3 + Math.random() * 0.7;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xFF6600,
    size: 0.04,
    transparent: true,
    opacity: 0.65,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  const ringGeo = new THREE.TorusGeometry(2.4, 0.012, 4, 80);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xFF4500, transparent: true, opacity: 0.25 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 4;
  scene.add(ring);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.0, 0.008, 4, 60),
    new THREE.MeshBasicMaterial({ color: 0xFF8800, transparent: true, opacity: 0.15 })
  );
  ring2.rotation.x = -Math.PI / 3;
  ring2.rotation.y = Math.PI / 5;
  scene.add(ring2);

  let targetRotX = 0, targetRotY = 0;
  let currentRotX = 0, currentRotY = 0;

  document.addEventListener('mousemove', (e) => {
    targetRotY =  (e.clientX / window.innerWidth  - 0.5) * 1.4;
    targetRotX = -(e.clientY / window.innerHeight - 0.5) * 0.9;

    gsap.to(pointLight.position, {
      x: (e.clientX / window.innerWidth - 0.5) * 8,
      y: -(e.clientY / window.innerHeight - 0.5) * 8,
      duration: 0.9,
      ease: 'power2.out'
    });
  });

  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame++;

    currentRotX += (targetRotX - currentRotX) * 0.04;
    currentRotY += (targetRotY - currentRotY) * 0.04;

    crystal.rotation.x = currentRotX + frame * 0.002;
    crystal.rotation.y = currentRotY + frame * 0.003;
    innerCrystal.rotation.x = -currentRotX + frame * 0.004;
    innerCrystal.rotation.y = -currentRotY + frame * 0.005;

    crystal.position.y      = Math.sin(frame * 0.012) * 0.18;
    innerCrystal.position.y = Math.sin(frame * 0.012 + 0.5) * 0.18;

    particles.rotation.y += 0.0006;
    particles.rotation.x += 0.0002;

    ring.rotation.z  += 0.004;
    ring2.rotation.z -= 0.003;

    const pulse = 0.2 + Math.sin(frame * 0.025) * 0.12;
    matMain.emissiveIntensity  = pulse;
    matInner.emissiveIntensity = pulse * 3;
    particleMat.opacity = 0.5 + Math.sin(frame * 0.018) * 0.2;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  /* ──────────────────────────────────────
     CUSTOM CURSOR
  ────────────────────────────────────── */
  const cursorEl  = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursor-dot');
  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.08 });
  });

  function animateCursor() {
    curX += (mouseX - curX) * 0.12;
    curY += (mouseY - curY) * 0.12;
    cursorEl.style.transform = `translate(${curX - 18}px, ${curY - 18}px)`;
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  document.querySelectorAll('a, button, .hoverable').forEach(el => {
    el.addEventListener('mouseenter', () => {
      gsap.to(cursorEl, { scale: 2.2, duration: 0.3, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(cursorEl, { scale: 1, duration: 0.3, ease: 'power2.out' });
    });
  });

  /* ──────────────────────────────────────
     NAVBAR SCROLL
  ────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ──────────────────────────────────────
     GSAP SCROLL REVEAL
  ────────────────────────────────────── */
  gsap.registerPlugin(ScrollTrigger);

  gsap.utils.toArray('.reveal').forEach(el => {
    gsap.fromTo(el,
      { y: 60, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
      }
    );
  });

  gsap.utils.toArray('.reveal-left').forEach(el => {
    gsap.fromTo(el,
      { x: -70, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
      }
    );
  });

  gsap.utils.toArray('.reveal-right').forEach(el => {
    gsap.fromTo(el,
      { x: 70, opacity: 0 },
      {
        x: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' }
      }
    );
  });

  gsap.to('#hero-back', {
    yPercent: 30,
    ease: 'none',
    scrollTrigger: {
      trigger: '#hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true
    }
  });

  gsap.to('.countdown-bg-text', {
    yPercent: 20,
    ease: 'none',
    scrollTrigger: {
      trigger: '.countdown-section',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  /* ──────────────────────────────────────
     STAT COUNTERS
  ────────────────────────────────────── */
  document.querySelectorAll('[data-target]').forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    const isMillions  = target >= 1000000;
    const isThousands = target >= 1000 && !isMillions;

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            const v = Math.round(obj.val);
            if (isMillions) {
              el.textContent = (v / 1000000).toFixed(1) + 'M+';
            } else if (isThousands) {
              el.textContent = (v / 1000).toFixed(0) + 'k+';
            } else {
              el.textContent = v + (target === 94 ? '%' : '');
            }
          }
        });
      }
    });
  });

  /* ──────────────────────────────────────
     COUNTDOWN TIMER
  ────────────────────────────────────── */
  const ENEM_DATE = new Date('2026-11-08T09:00:00-03:00');

  function pad(n) { return String(n).padStart(2, '0'); }

  function flipNum(el, newVal) {
    const cur = el.textContent;
    if (cur === newVal) return;
    el.classList.add('flip');
    setTimeout(() => {
      el.textContent = newVal;
      el.classList.remove('flip');
    }, 150);
  }

  function updateCountdown() {
    const now  = new Date();
    const diff = ENEM_DATE - now;
    if (diff <= 0) return;

    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000)  / 60000);
    const seconds = Math.floor((diff % 60000)    / 1000);

    flipNum(document.getElementById('cd-days'),    pad(days));
    flipNum(document.getElementById('cd-hours'),   pad(hours));
    flipNum(document.getElementById('cd-minutes'), pad(minutes));
    flipNum(document.getElementById('cd-seconds'), pad(seconds));

    document.getElementById('m-days').textContent = pad(days);
    document.getElementById('m-hrs').textContent  = pad(hours);
    document.getElementById('m-min').textContent  = pad(minutes);
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ──────────────────────────────────────
     HIDE CURSOR ON LEAVE / TOUCH
  ────────────────────────────────────── */
  document.addEventListener('mouseleave', () => {
    gsap.to([cursorEl, cursorDot], { opacity: 0, duration: 0.2 });
  });
  document.addEventListener('mouseenter', () => {
    gsap.to([cursorEl, cursorDot], { opacity: 1, duration: 0.2 });
  });

  if ('ontouchstart' in window) {
    cursorEl.style.display  = 'none';
    cursorDot.style.display = 'none';
    document.body.style.cursor = 'auto';
  }

})();
