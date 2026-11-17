// ===== Ensure page starts at Hero section on reload / fresh load =====
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

if (window.location.hash) {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}

window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

window.addEventListener('beforeunload', () => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
});

// ===== DOM Elements =====
const header = document.getElementById('header');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');

// ===== Create overlay for mobile menu =====
const overlay = document.createElement('div');
overlay.classList.add('nav__overlay');
document.body.appendChild(overlay);

// ===== Mobile Menu Toggle =====
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navMenu.classList.toggle('open');
  overlay.classList.toggle('active');
  document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
});

// Close menu when clicking overlay
overlay.addEventListener('click', () => {
  navToggle.classList.remove('active');
  navMenu.classList.remove('open');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
});

// Close menu when clicking a nav link
document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navMenu.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// ===== Header shadow on scroll =====
window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ===== Typewriter Effect =====
const typewriterEl = document.getElementById('typewriter-text');
const phrases = [
  {
    text: 'I turn ideas into products.',
    highlights: [['ideas', 'kw-purple'], ['products', 'kw-blue']]
  },
  {
    text: 'I design journeys that connect.',
    highlights: [['journeys', 'kw-cyan'], ['connect', 'kw-green']]
  },
  {
    text: 'I simplify complexity into clarity.',
    highlights: [['complexity', 'kw-red'], ['clarity', 'kw-green']]
  },
  {
    text: 'I craft products that scale.',
    highlights: [['products', 'kw-blue'], ['scale', 'kw-green']]
  }
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

const TYPING_SPEED = 60;
const DELETING_SPEED = 35;
const PAUSE_AFTER_TYPING = 1100;
const PAUSE_AFTER_DELETING = 400;

function buildHighlightedHTML(fullText, visibleLength, highlights) {
  // Precompute keyword ranges
  const charClasses = new Array(fullText.length).fill(null);
  for (const [word, cls] of highlights) {
    let startIdx = 0;
    while (true) {
      const idx = fullText.indexOf(word, startIdx);
      if (idx === -1) break;
      for (let i = idx; i < idx + word.length; i++) {
        charClasses[i] = cls;
      }
      startIdx = idx + 1;
    }
  }

  // Build HTML character by character up to visibleLength
  let html = '';
  let currentClass = null;
  for (let i = 0; i < visibleLength; i++) {
    const cls = charClasses[i];
    if (cls !== currentClass) {
      if (currentClass) html += '</span>';
      if (cls) html += `<span class="${cls}">`;
      currentClass = cls;
    }
    html += fullText[i];
  }
  if (currentClass) html += '</span>';
  return html;
}

function typewrite() {
  const current = phrases[phraseIndex];
  const plainText = current.text;

  if (!isDeleting) {
    charIndex++;
    typewriterEl.innerHTML = buildHighlightedHTML(plainText, charIndex, current.highlights);

    if (charIndex === plainText.length) {
      isDeleting = true;
      setTimeout(typewrite, PAUSE_AFTER_TYPING);
      return;
    }
    setTimeout(typewrite, TYPING_SPEED);
  } else {
    charIndex--;
    typewriterEl.innerHTML = buildHighlightedHTML(plainText, charIndex, current.highlights);

    if (charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(typewrite, PAUSE_AFTER_DELETING);
      return;
    }
    setTimeout(typewrite, DELETING_SPEED);
  }
}

// Start the typewriter
typewrite();



// ===== FLOATING CHATBOT ("Gairik") CONTROLLER =====
const chatbotContainer = document.getElementById('chatbot-container');
const chatbotLauncher = document.getElementById('chatbot-launcher');
const chatbotCloseBtn = document.getElementById('chatbot-close-btn');
const chatbotForm = document.getElementById('chatbot-form');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatTyping = document.getElementById('chat-typing');
const welcomeTimeEl = document.getElementById('welcome-time');

if (chatbotContainer && chatbotLauncher && chatbotCloseBtn && chatbotForm && chatbotInput && chatbotMessages) {
  // Format current time nicely
  const getFormattedTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (welcomeTimeEl) {
    welcomeTimeEl.textContent = getFormattedTime();
  }

  // Auto-open chatbot on page load / reload with smooth delay
  window.addEventListener('load', () => {
    setTimeout(() => {
      chatbotContainer.classList.add('is-open');
    }, 850);
  });

  // Re-open via floating launcher button
  chatbotLauncher.addEventListener('click', () => {
    chatbotContainer.classList.add('is-open');
    setTimeout(() => chatbotInput.focus(), 350);
  });

  // Close / Minimize via header close button
  chatbotCloseBtn.addEventListener('click', () => {
    chatbotContainer.classList.remove('is-open');
  });

  // Scroll to bottom helper
  const scrollToBottom = () => {
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  };

  // Append a message to the chat body
  const appendMessage = (text, sender = 'bot', isHTML = false) => {
    const msgEl = document.createElement('div');
    msgEl.className = `chat-msg chat-msg--${sender}`;

    const bubbleEl = document.createElement('div');
    bubbleEl.className = 'chat-msg__bubble';
    if (isHTML) {
      bubbleEl.innerHTML = text;
    } else {
      bubbleEl.textContent = text;
    }

    const timeEl = document.createElement('span');
    timeEl.className = 'chat-msg__time';
    timeEl.textContent = getFormattedTime();

    msgEl.appendChild(bubbleEl);
    msgEl.appendChild(timeEl);

    // Insert before typing indicator if it's there
    if (chatTyping && chatTyping.parentNode === chatbotMessages) {
      chatbotMessages.insertBefore(msgEl, chatTyping);
    } else {
      chatbotMessages.appendChild(msgEl);
    }

    scrollToBottom();
  };

  // Bot response knowledge bank & matcher
  const generateBotReply = (query) => {
    const q = query.toLowerCase().trim();

    if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('sup') || q.includes('good')) {
      return "Hey! Great to connect with you. Feel free to ask about my product philosophy, projects, or how to get in touch.";
    }

    if (q.includes('what do you do') || q.includes('role') || q.includes('product manager') || q.includes('who are you') || q.includes('about')) {
      return "I'm a Product Manager passionate about transforming complex problems into simple, high-impact digital experiences. I lead product strategy, discovery, design-engineering alignment, and metric-driven execution.";
    }

    if (q.includes('experience') || q.includes('background') || q.includes('career') || q.includes('work')) {
      return "I have hands-on experience guiding products from 0-to-1 and scaling features to hundreds of thousands of users. My focus is user-centric problem solving, robust roadmapping, and agile iteration.";
    }

    if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('case study') || q.includes('build')) {
      return "I've built and delivered web and mobile products spanning enterprise workflows, consumer tools, and data-driven systems. Explore the <a href='#works'>Works</a> section for details!";
    }

    if (q.includes('skill') || q.includes('tool') || q.includes('stack') || q.includes('methodolog')) {
      return "My core competencies include: Product Strategy & Roadmapping, User Research & Wireframing, Agile / Scrum leadership, Data Analytics & KPIs, and Stakeholder Management.";
    }

    if (q.includes('contact') || q.includes('email') || q.includes('touch') || q.includes('reach') || q.includes('hire') || q.includes('message')) {
      return "I'd love to chat! You can reach out directly via the <a href='#contact'>Contact</a> section or shoot me an email. I'm always open to exciting product conversations.";
    }

    if (q.includes('resume') || q.includes('cv') || q.includes('download')) {
      return "You can download my CV directly from the hero section or <a href='#' download>click here to download CV</a>.";
    }

    if (q.includes('education') || q.includes('degree') || q.includes('college') || q.includes('university')) {
      return "I have a strong foundation in technology and business analysis, combining technical fluency with high empathy for customer needs.";
    }

    // Default thoughtful fallback
    return "Thanks for asking! As a Product Manager, I thrive on tackling interesting challenges and building products that scale. Check out the sections above or tap 'Get in touch' to start a conversation!";
  };

  // Remove starter suggestion chips smoothly
  const removeStarterChips = () => {
    const chipsContainer = document.getElementById('chat-chips');
    if (chipsContainer) {
      chipsContainer.classList.add('fade-out');
      setTimeout(() => {
        if (chipsContainer && chipsContainer.parentNode) {
          chipsContainer.remove();
        }
      }, 260);
    }
  };

  // Handle message submission
  const handleSendMessage = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Disappear starter prompts upon interaction
    removeStarterChips();

    // 1. Append User Message
    appendMessage(trimmed, 'user');
    chatbotInput.value = '';

    // 2. Show Typing Indicator
    if (chatTyping) {
      chatbotMessages.appendChild(chatTyping);
      chatTyping.classList.add('is-visible');
      scrollToBottom();
    }

    // 3. Realistic response delay (600ms - 900ms)
    const replyDelay = Math.floor(Math.random() * 300) + 650;
    setTimeout(() => {
      if (chatTyping) {
        chatTyping.classList.remove('is-visible');
      }
      const reply = generateBotReply(trimmed);
      appendMessage(reply, 'bot', true);
    }, replyDelay);
  };

  // Form submit handler
  chatbotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handleSendMessage(chatbotInput.value);
  });

  // Suggestion chips handler
  chatbotMessages.addEventListener('click', (e) => {
    const chip = e.target.closest('.chat-chip');
    if (chip && chip.dataset.query) {
      handleSendMessage(chip.dataset.query);
    }
  });
}

// ===== ABOUT ME ANTIGRAVITY EXPANDING CARD CONTROLLER =====
const aboutTrack = document.getElementById('about');
const aboutCard = document.getElementById('about-card');
const aboutCardInner = document.getElementById('about-card-inner');

// Timeline elements (About Education)
const timeline = document.getElementById('about-timeline');
const timelineSpine = document.getElementById('timeline-spine');
const timelineSpineFill = document.getElementById('timeline-spine-fill');
const milestone1 = document.getElementById('milestone-1');
const milestone2 = document.getElementById('milestone-2');
const node1 = document.getElementById('node-1');
const node2 = document.getElementById('node-2');
const card1 = document.getElementById('card-1');
const card2 = document.getElementById('card-2');

// Experience Timeline elements
const expTimeline = document.getElementById('experience-timeline');
const expTimelineSpine = document.getElementById('exp-timeline-spine');
const expTimelineSpineFill = document.getElementById('exp-timeline-spine-fill');
const expMilestone1 = document.getElementById('exp-milestone-1');
const expMilestone2 = document.getElementById('exp-milestone-2');
const expMilestone3 = document.getElementById('exp-milestone-3');
const expNode1 = document.getElementById('exp-node-1');
const expNode2 = document.getElementById('exp-node-2');
const expNode3 = document.getElementById('exp-node-3');
const expCard1 = document.getElementById('exp-card-1');
const expCard2 = document.getElementById('exp-card-2');
const expCard3 = document.getElementById('exp-card-3');
const expMetricAcc = document.getElementById('exp-metric-acc');
const expMetricPort = document.getElementById('exp-metric-port');
const expMetricC3_1 = document.getElementById('exp-metric-c3-1');
const expMetricC3_2 = document.getElementById('exp-metric-c3-2');
const expMetricC3_3 = document.getElementById('exp-metric-c3-3');
const expMetricC3_4 = document.getElementById('exp-metric-c3-4');

if (aboutTrack && aboutCard) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Antigravity Expanding Card:
  // Card starts inset with rounded corners and floating with generous white space above/around it.
  // As you scroll down, it expands in width, flattens, and surges upward faster than scroll,
  // touching the hero section seamlessly right as it reaches maximum width (100vw, 0px border-radius).
  const updateAboutCardExpansion = () => {
    if (prefersReducedMotion) return;

    const trackRect = aboutTrack.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const isMobile = window.innerWidth <= 768;
    const initialInset = isMobile ? 4 : 5;
    const initialR = isMobile ? 20 : 28;
    const initialOffsetY = isMobile ? 70 : 130;

    // 1. Top expansion & uncurving (untouched)
    const startY = viewportHeight * 0.95;
    const endY = viewportHeight * 0.50;

    const progress = Math.min(1, Math.max(0, (startY - trackRect.top) / (startY - endY)));
    const ease = Math.pow(progress, 1.4);

    const currentInset = initialInset * (1 - ease);
    const currentTopR = initialR * (1 - ease);
    const currentOffsetY = initialOffsetY * (1 - ease);
    const currentOpacity = 0.88 + 0.12 * ease;

    // 2. Down side shrink animation:
    // Starts shrinking from full width late when the black portion reaches 50% of viewport
    // (the exact same position where the upper side went to full width), ending at 5% of viewport
    const cardRect = aboutCard.getBoundingClientRect();
    const bottomStartY = viewportHeight * 0.50;
    const bottomEndY = viewportHeight * 0.05;

    const bottomProgress = Math.min(1, Math.max(0, (bottomStartY - cardRect.bottom) / (bottomStartY - bottomEndY)));
    const bottomEase = Math.pow(bottomProgress, 1.4);

    const currentBottomInset = initialInset * bottomEase;
    const currentBottomR = initialR * bottomEase;

    if (ease >= 0.999) {
      aboutCard.style.width = '100%';
      aboutCard.style.transform = 'translate3d(0, 0px, 0)';
      if (bottomProgress > 0) {
        aboutCard.style.clipPath = `inset(0% ${currentBottomInset.toFixed(2)}% 0% ${currentBottomInset.toFixed(2)}% round 0px 0px ${currentBottomR.toFixed(1)}px ${currentBottomR.toFixed(1)}px)`;
        aboutCard.style.borderRadius = `0 0 ${currentBottomR.toFixed(1)}px ${currentBottomR.toFixed(1)}px`;
      } else {
        aboutCard.style.clipPath = 'none';
        aboutCard.style.borderRadius = '0px';
      }
    } else {
      aboutCard.style.width = '100%';
      aboutCard.style.borderRadius = `${currentTopR.toFixed(1)}px ${currentTopR.toFixed(1)}px ${initialR}px ${initialR}px`;
      aboutCard.style.clipPath = `inset(0% ${currentInset.toFixed(2)}% 0% ${currentInset.toFixed(2)}% round ${currentTopR.toFixed(1)}px ${currentTopR.toFixed(1)}px ${initialR}px ${initialR}px)`;
      aboutCard.style.transform = `translate3d(0, ${currentOffsetY.toFixed(1)}px, 0)`;
    }

    if (aboutCardInner) {
      aboutCardInner.style.opacity = currentOpacity.toFixed(2);
      aboutCardInner.style.transform = 'none';
    }
  };

  // Header dark-mode synchronization:
  const updateHeaderMode = () => {
    if (!header) return;
    const cardRect = aboutCard.getBoundingClientRect();
    if (cardRect.top <= 72 && cardRect.bottom > 72) {
      header.classList.add('header--dark');
    } else {
      header.classList.remove('header--dark');
    }
  };

  // Dynamic Chatbot Inversion: turn white/dark when over the black about section
  const updateChatbotColor = () => {
    if (!chatbotContainer || !chatbotLauncher) return;

    const launcherRect = chatbotLauncher.getBoundingClientRect();
    const cardRect = aboutCard.getBoundingClientRect();

    if (
      launcherRect.top < cardRect.bottom &&
      launcherRect.bottom > cardRect.top &&
      launcherRect.left < cardRect.right &&
      launcherRect.right > cardRect.left
    ) {
      chatbotContainer.classList.add('chatbot--on-dark');
    } else {
      chatbotContainer.classList.remove('chatbot--on-dark');
    }
  };

  // Center spine exactly between the middle of card 1 (node 1) and the middle of card 2 (node 2)
  const updateTimelineSpinePosition = () => {
    if (!timeline || !timelineSpine || !milestone1 || !milestone2) return;

    let center1, center2;
    if (milestone1.offsetParent === timeline) {
      center1 = milestone1.offsetTop + (milestone1.offsetHeight / 2);
      center2 = milestone2.offsetTop + (milestone2.offsetHeight / 2);
    } else {
      const tRect = timeline.getBoundingClientRect();
      const m1Rect = milestone1.getBoundingClientRect();
      const m2Rect = milestone2.getBoundingClientRect();
      center1 = (m1Rect.top - tRect.top) + (m1Rect.height / 2);
      center2 = (m2Rect.top - tRect.top) + (m2Rect.height / 2);
    }

    const spineTop = Math.round(center1);
    const spineHeight = Math.max(0, Math.round(center2 - center1));

    timelineSpine.style.top = `${spineTop}px`;
    timelineSpine.style.height = `${spineHeight}px`;
    timelineSpine.style.bottom = 'auto';
  };

  // Education Timeline Progress: orange line fills downward as user scrolls
  const updateEducationTimeline = () => {
    if (!timeline || !timelineSpineFill) return;

    updateTimelineSpinePosition();

    if (!card1 || !card2) return;

    const card1Rect = card1.getBoundingClientRect();
    const card2Rect = card2.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Timeline fill window:
    // Begins when top of Card 1 reaches comfortable viewing area (82% of viewport)
    const startThreshold = viewportHeight * 0.82;
    // Ends when Card 2 fully appears on the screen (bottom of Card 2 has cleared viewport with margin)
    const endThreshold = viewportHeight - 24;

    const totalSpan = card2Rect.bottom - card1Rect.top;
    const totalDistance = Math.max(100, (startThreshold + totalSpan) - endThreshold);
    const currentProgressPx = startThreshold - card1Rect.top;
    const progress = Math.min(1, Math.max(0, currentProgressPx / totalDistance));

    timelineSpineFill.style.height = `${(progress * 100).toFixed(1)}%`;

    // Milestone 1 (NMIMS MBA) activation: lights up once line starts filling
    if (node1 && card1) {
      if (progress > 0) {
        node1.classList.add('timeline-node--active');
        card1.classList.add('timeline-card--active');
      } else {
        node1.classList.remove('timeline-node--active');
        card1.classList.remove('timeline-card--active');
      }
    }

    // Milestone 2 (PDPU B.Tech) activation: lights up when Card 2 fully appears on screen or line reaches node 2
    if (node2 && card2) {
      const card2FullyVisible = card2Rect.bottom <= (viewportHeight - 16);
      if (progress >= 0.96 || card2FullyVisible) {
        node2.classList.add('timeline-node--active');
        card2.classList.add('timeline-card--active');
      } else {
        node2.classList.remove('timeline-node--active');
        card2.classList.remove('timeline-card--active');
      }
    }
  };

  // Fast count-up animation for both impact metrics (82.04% and ₹28M), settling smoothly
  let metricHasAnimated = false;
  const animateMetricCounter = () => {
    if (metricHasAnimated) return;
    metricHasAnimated = true;

    const targetAcc = 82.04;
    const targetPort = 28;
    const duration = 1200; // fast count-up ~1.2s settling smoothly
    let startTime = null;

    // Subtle cubic ease-out: smooth deceleration, zero bounce
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(1, elapsed / duration);
      const ease = easeOutCubic(t);

      if (t < 1) {
        if (expMetricAcc) {
          const currentAcc = ease * targetAcc;
          expMetricAcc.textContent = `${currentAcc.toFixed(2)}%`;
        }
        if (expMetricPort) {
          const currentPort = Math.round(ease * targetPort);
          expMetricPort.textContent = `₹${currentPort}M`;
        }
        requestAnimationFrame(step);
      } else {
        if (expMetricAcc) expMetricAcc.textContent = `${targetAcc.toFixed(2)}%`;
        if (expMetricPort) expMetricPort.textContent = `₹${targetPort}M`;
      }
    };

    requestAnimationFrame(step);
  };

  // Fast count-up animation for Card 3 impact metrics (320+, 2–10×, ₹4 Cr+, 200+), settling smoothly
  let card3MetricHasAnimated = false;
  const animateCard3MetricCounter = () => {
    if (card3MetricHasAnimated) return;
    card3MetricHasAnimated = true;

    const targetPipelines = 320;
    const targetBudget = 4;
    const targetJobs = 200;
    const duration = 1200;
    let startTime = null;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(1, elapsed / duration);
      const ease = easeOutCubic(t);

      if (t < 1) {
        if (expMetricC3_1) {
          const currentPipelines = Math.round(ease * targetPipelines);
          expMetricC3_1.textContent = `${currentPipelines}+`;
        }
        if (expMetricC3_2) {
          const currentSpeed = Math.round(ease * 10);
          expMetricC3_2.textContent = `${currentSpeed}×`;
        }
        if (expMetricC3_3) {
          const currentBudget = Math.round(ease * targetBudget);
          expMetricC3_3.textContent = `₹${currentBudget} Cr+`;
        }
        if (expMetricC3_4) {
          const currentJobs = Math.round(ease * targetJobs);
          expMetricC3_4.textContent = `${currentJobs}+`;
        }
        requestAnimationFrame(step);
      } else {
        if (expMetricC3_1) expMetricC3_1.textContent = `${targetPipelines}+`;
        if (expMetricC3_2) expMetricC3_2.textContent = `10×`;
        if (expMetricC3_3) expMetricC3_3.textContent = `₹${targetBudget} Cr+`;
        if (expMetricC3_4) expMetricC3_4.textContent = `${targetJobs}+`;
      }
    };

    requestAnimationFrame(step);
  };

  // Center experience timeline spine between the center of node 1 and center of the last node (node 3)
  const updateExpTimelineSpinePosition = () => {
    if (!expTimeline || !expTimelineSpine || !expNode1) return;
    const lastNode = expNode3 || expNode2;
    if (!lastNode) return;

    const tRect = expTimeline.getBoundingClientRect();
    const n1Rect = expNode1.getBoundingClientRect();
    const lastRect = lastNode.getBoundingClientRect();

    const center1 = (n1Rect.top - tRect.top) + (n1Rect.height / 2);
    const centerLast = (lastRect.top - tRect.top) + (lastRect.height / 2);

    const spineTop = Math.round(center1);
    const spineHeight = Math.max(0, Math.round(centerLast - center1));

    expTimelineSpine.style.top = `${spineTop}px`;
    expTimelineSpine.style.height = `${spineHeight}px`;
    expTimelineSpine.style.bottom = 'auto';
  };

  // Experience Timeline Progress: orange line fills downward across all 3 milestones on scroll
  const updateExperienceTimeline = () => {
    if (!expTimeline || !expTimelineSpineFill || !expNode1 || !expNode2 || !expCard1 || !expCard2) return;

    updateExpTimelineSpinePosition();

    const card1Rect = expCard1.getBoundingClientRect();
    const card2Rect = expCard2.getBoundingClientRect();
    const card3Rect = expCard3 ? expCard3.getBoundingClientRect() : null;

    const n1Rect = expNode1.getBoundingClientRect();
    const n2Rect = expNode2.getBoundingClientRect();
    const n3Rect = expNode3 ? expNode3.getBoundingClientRect() : n2Rect;

    const viewportHeight = window.innerHeight;
    const n1CenterY = n1Rect.top + (n1Rect.height / 2);
    const n2CenterY = n2Rect.top + (n2Rect.height / 2);
    const n3CenterY = n3Rect.top + (n3Rect.height / 2);

    const triggerStart = viewportHeight * 0.82;
    const triggerEnd = viewportHeight * 0.42;

    // Spine fill progress between Node 1 and Node 3
    let progress = 0;
    const totalDistance = Math.max(1, n3CenterY - n1CenterY);
    if (n1CenterY <= triggerStart) {
      const scrolled = triggerStart - n1CenterY;
      progress = Math.min(1, Math.max(0, scrolled / totalDistance));
    }

    expTimelineSpineFill.style.height = `${(progress * 100).toFixed(1)}%`;

    const fillHeightPx = progress * totalDistance;
    const nodeRadius = 7; // .exp-timeline-node radius (14px diameter)

    // Milestone 1: lights up once the line begins filling (progress > 0)
    const node1Touched = progress > 0;
    if (node1Touched) {
      expNode1.classList.add('exp-timeline-node--active');
      expCard1.classList.add('exp-card--active');
    } else {
      expNode1.classList.remove('exp-timeline-node--active');
      expCard1.classList.remove('exp-card--active');
    }

    // Milestone 2: lights up ONLY when the orange line physically reaches the top of Node 2
    const n2Distance = n2CenterY - n1CenterY;
    const node2Touched = fillHeightPx >= (n2Distance - nodeRadius);

    if (node2Touched) {
      expNode2.classList.add('exp-timeline-node--active');
      expCard2.classList.add('exp-card--active');
      animateMetricCounter();
    } else {
      expNode2.classList.remove('exp-timeline-node--active');
      expCard2.classList.remove('exp-card--active');
    }

    // Milestone 3: lights up ONLY when the orange line physically reaches the top of Node 3
    if (expNode3 && expCard3) {
      const node3Touched = fillHeightPx >= (totalDistance - nodeRadius);
      if (node3Touched) {
        expNode3.classList.add('exp-timeline-node--active');
        expCard3.classList.add('exp-card--active');
        animateCard3MetricCounter();
      } else {
        expNode3.classList.remove('exp-timeline-node--active');
        expCard3.classList.remove('exp-card--active');
      }
    }
  };

  let ticking = false;
  const onScrollOrResize = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateAboutCardExpansion();
        updateHeaderMode();
        updateEducationTimeline();
        updateExperienceTimeline();
        updateChatbotColor();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  window.addEventListener('load', () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    updateTimelineSpinePosition();
    updateEducationTimeline();
    updateExpTimelineSpinePosition();
    updateExperienceTimeline();
  });
  if (document.fonts) {
    document.fonts.ready.then(() => {
      updateTimelineSpinePosition();
      updateEducationTimeline();
      updateExpTimelineSpinePosition();
      updateExperienceTimeline();
    });
  }
  if (window.ResizeObserver) {
    if (timeline) {
      const ro = new ResizeObserver(() => {
        updateTimelineSpinePosition();
      });
      ro.observe(timeline);
      if (card1) ro.observe(card1);
      if (card2) ro.observe(card2);
    }
    if (expTimeline) {
      const roExp = new ResizeObserver(() => {
        updateExpTimelineSpinePosition();
      });
      roExp.observe(expTimeline);
      if (expCard1) roExp.observe(expCard1);
      if (expCard2) roExp.observe(expCard2);
      if (expCard3) roExp.observe(expCard3);
    }
  }
  
  // Initial run
  updateAboutCardExpansion();
  updateHeaderMode();
  updateEducationTimeline();
  updateExperienceTimeline();
  updateChatbotColor();
}
