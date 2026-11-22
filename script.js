// ===== Ensure page starts at Hero section on reload / fresh load =====
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

if (window.location.hash) {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}

window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

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

  // Chatbot stays collapsed by default and opens on launcher click
  // (prevents covering case study CTA buttons and cards on load)

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

    if (q.includes('project') || q.includes('work') || q.includes('portfolio') || q.includes('case study') || q.includes('build') || q.includes('product thinking') || q.includes('teardown') || q.includes('junglee') || q.includes('rummy') || q.includes('saffola') || q.includes('crunchiez') || q.includes('hairvive') || q.includes('ridesafe') || q.includes('atmos')) {
      return "I've built and delivered enterprise AI platforms, agentic workflows, consumer products, and user-centric teardowns. Explore the <a href='#product-thinking'>Product Thinking</a> section for case studies on Sensei.AI, dAIgest, DemocraTech, PawPal, Saffola Crunchiez, HairVive, and RideSafe, plus my teardowns on <a href='#product-teardowns'>Junglee Rummy Shadow Play</a> and <a href='#teardown-atmos'>Atmos Connected Entertainment</a>!";
    }

    if (q.includes('skill') || q.includes('tool') || q.includes('stack') || q.includes('methodolog')) {
      return "My core competencies include Product Management (0→1 discovery, PRDs, roadmaps), AI & Agentic Systems (LangGraph, MCP, RAG), Data Analytics (SQL, Python, Power BI), and Cloud Orchestrations. Explore the <a href='#skills'>Skills</a> section for my complete skills matrix!";
    }

    if (q.includes('contact') || q.includes('email') || q.includes('touch') || q.includes('reach') || q.includes('hire') || q.includes('message')) {
      return "I'd love to chat! You can reach out directly via the <a href='#contact'>Contact</a> section or shoot me an email. I'm always open to exciting product conversations.";
    }

    if (q.includes('resume') || q.includes('cv') || q.includes('download')) {
      return "You can view my CV directly from the hero section or <a href='assets/Gairik_Chakraborty_CV.pdf' target='_blank' rel='noopener noreferrer'>click here to open CV</a>.";
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

// ===== ABOUT ME & PRODUCT THINKING EXPANDING CARD CONTROLLER =====
const aboutTrack = document.getElementById('about');
const aboutCard = document.getElementById('about-card');
const aboutCardInner = document.getElementById('about-card-inner');

const ptTrack = document.getElementById('product-thinking');
const ptCard = document.getElementById('pt-card');
const ptCardInner = document.getElementById('pt-card-inner');

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
const expMilestone4 = document.getElementById('exp-milestone-4');
const expMilestone5 = document.getElementById('exp-milestone-5');
const expMilestone6 = document.getElementById('exp-milestone-6');
const expNode1 = document.getElementById('exp-node-1');
const expNode2 = document.getElementById('exp-node-2');
const expNode3 = document.getElementById('exp-node-3');
const expNode4 = document.getElementById('exp-node-4');
const expNode5 = document.getElementById('exp-node-5');
const expNode6 = document.getElementById('exp-node-6');
const expCard1 = document.getElementById('exp-card-1');
const expCard2 = document.getElementById('exp-card-2');
const expCard3 = document.getElementById('exp-card-3');
const expCard4 = document.getElementById('exp-card-4');
const expCard5 = document.getElementById('exp-card-5');
const expCard6 = document.getElementById('exp-card-6');
const expMetricC1_1 = document.getElementById('exp-metric-c1-1');
const expMetricC1_2 = document.getElementById('exp-metric-c1-2');
const expMetricC1_3 = document.getElementById('exp-metric-c1-3');
const expMetricC1_4 = document.getElementById('exp-metric-c1-4');
const expMetricC2_1 = document.getElementById('exp-metric-c2-1');
const expMetricC2_2 = document.getElementById('exp-metric-c2-2');
const expMetricC2_3 = document.getElementById('exp-metric-c2-3');
const expMetricC2_4 = document.getElementById('exp-metric-c2-4');
const expMetricAcc = document.getElementById('exp-metric-acc');
const expMetricPort = document.getElementById('exp-metric-port');
const expMetricC4_1 = document.getElementById('exp-metric-c4-1');
const expMetricC4_2 = document.getElementById('exp-metric-c4-2');
const expMetricC4_3 = document.getElementById('exp-metric-c4-3');
const expMetricC4_4 = document.getElementById('exp-metric-c4-4');

// Achievements 3-Step Timeline elements
const achieveTimeline = document.getElementById('achieve-steps-timeline');
const achieveSpine = document.getElementById('achieve-spine');
const achieveSpineFill = document.getElementById('achieve-spine-fill');
const achieveNode1 = document.getElementById('achieve-node-1');
const achieveNode2 = document.getElementById('achieve-node-2');
const achieveNode3 = document.getElementById('achieve-node-3');
const achieveCard1 = document.querySelector('#achieve-step-1 .achieve-step-card');
const achieveCard2 = document.querySelector('#achieve-step-2 .achieve-step-card');
const achieveCard3 = document.querySelector('#achieve-step-3 .achieve-step-card');

if (aboutTrack && aboutCard) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Expanding Card Animation Effect (Shared across About Me & Product Thinking)
  const updateCardExpansion = (track, card, cardInner) => {
    if (!track || !card) return;
    if (prefersReducedMotion) return;

    const trackRect = track.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const isMobile = window.innerWidth <= 768;
    const initialInset = isMobile ? 4 : 5;
    const initialR = isMobile ? 20 : 28;
    const initialOffsetY = isMobile ? 70 : 130;

    // 1. Top expansion & uncurving
    const startY = viewportHeight * 0.95;
    const endY = viewportHeight * 0.50;

    const progress = Math.min(1, Math.max(0, (startY - trackRect.top) / (startY - endY)));
    const ease = Math.pow(progress, 1.4);

    const currentInset = initialInset * (1 - ease);
    const currentTopR = initialR * (1 - ease);
    const currentOffsetY = initialOffsetY * (1 - ease);
    const currentOpacity = 0.88 + 0.12 * ease;

    // 2. Down side shrink animation:
    const cardRect = card.getBoundingClientRect();
    const bottomStartY = viewportHeight * 0.50;
    const bottomEndY = viewportHeight * 0.05;

    const bottomProgress = Math.min(1, Math.max(0, (bottomStartY - cardRect.bottom) / (bottomStartY - bottomEndY)));
    const bottomEase = Math.pow(bottomProgress, 1.4);

    const currentBottomInset = initialInset * bottomEase;
    const currentBottomR = initialR * bottomEase;

    if (ease >= 0.999) {
      card.style.width = '100%';
      card.style.transform = 'none';
      if (bottomProgress > 0) {
        card.style.clipPath = `inset(0% ${currentBottomInset.toFixed(2)}% 0% ${currentBottomInset.toFixed(2)}% round 0px 0px ${currentBottomR.toFixed(1)}px ${currentBottomR.toFixed(1)}px)`;
        card.style.borderRadius = `0 0 ${currentBottomR.toFixed(1)}px ${currentBottomR.toFixed(1)}px`;
      } else {
        card.style.clipPath = 'none';
        card.style.borderRadius = '0px';
      }
    } else {
      card.style.width = '100%';
      card.style.borderRadius = `${currentTopR.toFixed(1)}px ${currentTopR.toFixed(1)}px ${initialR}px ${initialR}px`;
      card.style.clipPath = `inset(0% ${currentInset.toFixed(2)}% 0% ${currentInset.toFixed(2)}% round ${currentTopR.toFixed(1)}px ${currentTopR.toFixed(1)}px ${initialR}px ${initialR}px)`;
      card.style.transform = `translate3d(0, ${currentOffsetY.toFixed(1)}px, 0)`;
    }

    if (cardInner) {
      cardInner.style.opacity = currentOpacity.toFixed(2);
      cardInner.style.transform = 'none';
    }
  };

  const updateAboutCardExpansion = () => {
    updateCardExpansion(aboutTrack, aboutCard, aboutCardInner);
    updateCardExpansion(ptTrack, ptCard, ptCardInner);
  };

  // Header dark-mode synchronization across black cards and achievements section
  const updateHeaderMode = () => {
    if (!header) return;
    const achievementsSection = document.getElementById('achievements');
    const isCardUnderHeader = (card) => {
      if (!card) return false;
      const rect = card.getBoundingClientRect();
      return rect.top <= 72 && rect.bottom > 72;
    };

    if (isCardUnderHeader(aboutCard) || isCardUnderHeader(ptCard) || isCardUnderHeader(achievementsSection)) {
      header.classList.add('header--dark');
    } else {
      header.classList.remove('header--dark');
    }
  };

  // Dynamic Chatbot Inversion: turn white/dark when over any black section
  const updateChatbotColor = () => {
    if (!chatbotContainer || !chatbotLauncher) return;
    const achievementsSection = document.getElementById('achievements');

    const launcherRect = chatbotLauncher.getBoundingClientRect();
    const isLauncherOverCard = (card) => {
      if (!card) return false;
      const rect = card.getBoundingClientRect();
      return (
        launcherRect.top < rect.bottom &&
        launcherRect.bottom > rect.top &&
        launcherRect.left < rect.right &&
        launcherRect.right > rect.left
      );
    };

    if (isLauncherOverCard(aboutCard) || isLauncherOverCard(ptCard) || isLauncherOverCard(achievementsSection)) {
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

  // Fast count-up animation for Card 1 impact metrics (642+, $34.1K / 48x, 83.3%, 7,650 / $0.65M), settling smoothly
  let card1MetricHasAnimated = false;
  const animateCard1MetricCounter = () => {
    if (card1MetricHasAnimated) return;
    card1MetricHasAnimated = true;

    const targetHours = 642;
    const targetAvoidance = 34.1;
    const targetRoi = 48;
    const targetEffort = 83.3;
    const targetSprintHours = 7650;
    const targetSprintSavings = 0.65;
    const duration = 1200;
    let startTime = null;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(1, elapsed / duration);
      const ease = easeOutCubic(t);

      if (t < 1) {
        if (expMetricC1_1) {
          const cur = Math.round(ease * targetHours);
          expMetricC1_1.textContent = `${cur}+`;
        }
        if (expMetricC1_2) {
          const curAvoidance = (ease * targetAvoidance).toFixed(1);
          const curRoi = Math.round(ease * targetRoi);
          expMetricC1_2.textContent = `$${curAvoidance}K / ${curRoi}x`;
        }
        if (expMetricC1_3) {
          const curEffort = (ease * targetEffort).toFixed(1);
          expMetricC1_3.textContent = `${curEffort}%`;
        }
        if (expMetricC1_4) {
          const curHours = Math.round(ease * targetSprintHours).toLocaleString();
          const curSavings = (ease * targetSprintSavings).toFixed(2);
          expMetricC1_4.textContent = `${curHours} / $${curSavings}M`;
        }
        requestAnimationFrame(step);
      } else {
        if (expMetricC1_1) expMetricC1_1.textContent = `${targetHours}+`;
        if (expMetricC1_2) expMetricC1_2.textContent = `$${targetAvoidance}K / ${targetRoi}x`;
        if (expMetricC1_3) expMetricC1_3.textContent = `${targetEffort}%`;
        if (expMetricC1_4) expMetricC1_4.textContent = `${targetSprintHours.toLocaleString()} / $${targetSprintSavings}M`;
      }
    };

    requestAnimationFrame(step);
  };

  // Fast count-up animation for Card 2 (Junglee Games CX) impact metrics (₹3–6 Cr, 4,567, 13% / 7%, 176% / 16.9%), settling smoothly
  let card2MetricHasAnimated = false;
  const animateCard2MetricCounter = () => {
    if (card2MetricHasAnimated) return;
    card2MetricHasAnimated = true;

    const targetUsers = 4567;
    const targetDelivery = 13;
    const targetEngagement = 7;
    const targetTotalVol = 176;
    const targetStarVol = 16.9;
    const duration = 1200;
    let startTime = null;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(1, elapsed / duration);
      const ease = easeOutCubic(t);

      if (t < 1) {
        if (expMetricC2_1) {
          const curMin = Math.round(ease * 3);
          const curMax = Math.round(ease * 6);
          expMetricC2_1.textContent = `₹${curMin}-${curMax} Cr`;
        }
        if (expMetricC2_2) {
          const curUsers = Math.round(ease * targetUsers).toLocaleString();
          expMetricC2_2.textContent = `${curUsers}`;
        }
        if (expMetricC2_3) {
          const curDel = Math.round(ease * targetDelivery);
          const curEng = Math.round(ease * targetEngagement);
          expMetricC2_3.textContent = `${curDel}% / ${curEng}%`;
        }
        if (expMetricC2_4) {
          const curTot = Math.round(ease * targetTotalVol);
          const curStar = (ease * targetStarVol).toFixed(1);
          expMetricC2_4.textContent = `${curTot}% / ${curStar}%`;
        }
        requestAnimationFrame(step);
      } else {
        if (expMetricC2_1) expMetricC2_1.textContent = '₹3-6 Cr';
        if (expMetricC2_2) expMetricC2_2.textContent = '4,567';
        if (expMetricC2_3) expMetricC2_3.textContent = '13% / 7%';
        if (expMetricC2_4) expMetricC2_4.textContent = '176% / 16.9%';
      }
    };

    requestAnimationFrame(step);
  };

  // Fast count-up animation for Card 3 (HDFC Bank) impact metrics (82.04% and ₹28M), settling smoothly
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

  // Fast count-up animation for Card 4 (Cognizant) impact metrics (320+, 10×, ₹4 Cr+, 200+), settling smoothly
  let card4MetricHasAnimated = false;
  const animateCard4MetricCounter = () => {
    if (card4MetricHasAnimated) return;
    card4MetricHasAnimated = true;

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
        if (expMetricC4_1) {
          const currentPipelines = Math.round(ease * targetPipelines);
          expMetricC4_1.textContent = `${currentPipelines}+`;
        }
        if (expMetricC4_2) {
          const currentSpeed = Math.round(ease * 10);
          expMetricC4_2.textContent = `${currentSpeed}×`;
        }
        if (expMetricC4_3) {
          const currentBudget = Math.round(ease * targetBudget);
          expMetricC4_3.textContent = `₹${currentBudget} Cr+`;
        }
        if (expMetricC4_4) {
          const currentJobs = Math.round(ease * targetJobs);
          expMetricC4_4.textContent = `${currentJobs}+`;
        }
        requestAnimationFrame(step);
      } else {
        if (expMetricC4_1) expMetricC4_1.textContent = `${targetPipelines}+`;
        if (expMetricC4_2) expMetricC4_2.textContent = `10×`;
        if (expMetricC4_3) expMetricC4_3.textContent = `₹${targetBudget} Cr+`;
        if (expMetricC4_4) expMetricC4_4.textContent = `${targetJobs}+`;
      }
    };

    requestAnimationFrame(step);
  };

  // Center experience timeline spine between the center of node 1 and center of the last node (node 6)
  const updateExpTimelineSpinePosition = () => {
    if (!expTimeline || !expTimelineSpine || !expNode1) return;
    const lastNode = expNode6 || expNode5 || expNode4 || expNode3 || expNode2;
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

  // Experience Timeline Progress: orange line fills downward across all 6 milestones on scroll
  const updateExperienceTimeline = () => {
    if (!expTimeline || !expTimelineSpineFill || !expNode1 || !expNode2 || !expCard1 || !expCard2) return;

    updateExpTimelineSpinePosition();

    const card1Rect = expCard1.getBoundingClientRect();
    const card2Rect = expCard2 ? expCard2.getBoundingClientRect() : null;
    const card3Rect = expCard3 ? expCard3.getBoundingClientRect() : null;
    const card4Rect = expCard4 ? expCard4.getBoundingClientRect() : null;
    const card5Rect = expCard5 ? expCard5.getBoundingClientRect() : null;
    const card6Rect = expCard6 ? expCard6.getBoundingClientRect() : null;

    const n1Rect = expNode1.getBoundingClientRect();
    const n2Rect = expNode2.getBoundingClientRect();
    const n3Rect = expNode3 ? expNode3.getBoundingClientRect() : n2Rect;
    const n4Rect = expNode4 ? expNode4.getBoundingClientRect() : n3Rect;
    const n5Rect = expNode5 ? expNode5.getBoundingClientRect() : n4Rect;
    const n6Rect = expNode6 ? expNode6.getBoundingClientRect() : n5Rect;

    const viewportHeight = window.innerHeight;
    const n1CenterY = n1Rect.top + (n1Rect.height / 2);
    const n2CenterY = n2Rect.top + (n2Rect.height / 2);
    const n3CenterY = n3Rect.top + (n3Rect.height / 2);
    const n4CenterY = n4Rect.top + (n4Rect.height / 2);
    const n5CenterY = n5Rect.top + (n5Rect.height / 2);
    const n6CenterY = n6Rect.top + (n6Rect.height / 2);

    const triggerStart = viewportHeight * 0.82;

    // Spine fill progress between Node 1 and Node 6
    let progress = 0;
    const totalDistance = Math.max(1, n6CenterY - n1CenterY);
    if (n1CenterY <= triggerStart) {
      const scrolled = triggerStart - n1CenterY;
      progress = Math.min(1, Math.max(0, scrolled / totalDistance));
    }

    expTimelineSpineFill.style.height = `${(progress * 100).toFixed(1)}%`;

    const fillHeightPx = progress * totalDistance;
    const nodeRadius = 7; // .exp-timeline-node radius (14px diameter)

    // Milestone 1: lights up once the line begins filling (progress > 0) or card1 is in view
    const node1Touched = progress > 0 || (card1Rect.top <= viewportHeight * 0.88);
    if (node1Touched) {
      expNode1.classList.add('exp-timeline-node--active');
      expCard1.classList.add('exp-card--active');
      animateCard1MetricCounter();
    } else {
      expNode1.classList.remove('exp-timeline-node--active');
      expCard1.classList.remove('exp-card--active');
    }

    // Milestone 2 (Junglee Games CX): lights up ONLY when the orange line reaches Node 2
    const n2Distance = n2CenterY - n1CenterY;
    const node2Touched = fillHeightPx >= (n2Distance - nodeRadius) || (card2Rect && card2Rect.top <= viewportHeight * 0.75);

    if (node2Touched) {
      expNode2.classList.add('exp-timeline-node--active');
      expCard2.classList.add('exp-card--active');
      animateCard2MetricCounter();
    } else {
      expNode2.classList.remove('exp-timeline-node--active');
      expCard2.classList.remove('exp-card--active');
    }

    // Milestone 3 (HDFC Bank): lights up ONLY when the orange line reaches Node 3
    if (expNode3 && expCard3) {
      const n3Distance = n3CenterY - n1CenterY;
      const node3Touched = fillHeightPx >= (n3Distance - nodeRadius) || (card3Rect && card3Rect.top <= viewportHeight * 0.75);
      if (node3Touched) {
        expNode3.classList.add('exp-timeline-node--active');
        expCard3.classList.add('exp-card--active');
        animateMetricCounter();
      } else {
        expNode3.classList.remove('exp-timeline-node--active');
        expCard3.classList.remove('exp-card--active');
      }
    }

    // Milestone 4 (Cognizant): lights up ONLY when the orange line reaches Node 4
    if (expNode4 && expCard4) {
      const n4Distance = n4CenterY - n1CenterY;
      const node4Touched = fillHeightPx >= (n4Distance - nodeRadius) || (card4Rect && card4Rect.top <= viewportHeight * 0.75);
      if (node4Touched) {
        expNode4.classList.add('exp-timeline-node--active');
        expCard4.classList.add('exp-card--active');
        animateCard4MetricCounter();
      } else {
        expNode4.classList.remove('exp-timeline-node--active');
        expCard4.classList.remove('exp-card--active');
      }
    }

    // Milestone 5 (ExploreML): lights up ONLY when the orange line reaches Node 5
    if (expNode5 && expCard5) {
      const n5Distance = n5CenterY - n1CenterY;
      const node5Touched = fillHeightPx >= (n5Distance - nodeRadius) || (card5Rect && card5Rect.top <= viewportHeight * 0.75);
      if (node5Touched) {
        expNode5.classList.add('exp-timeline-node--active');
        expCard5.classList.add('exp-card--active');
      } else {
        expNode5.classList.remove('exp-timeline-node--active');
        expCard5.classList.remove('exp-card--active');
      }
    }

    // Milestone 6 (WE CARE @ Abhoy Mission): lights up ONLY when the orange line reaches Node 6 (last node)
    if (expNode6 && expCard6) {
      const node6Touched = fillHeightPx >= (totalDistance - nodeRadius) || (card6Rect && card6Rect.top <= viewportHeight * 0.75);
      if (node6Touched) {
        expNode6.classList.add('exp-timeline-node--active');
        expCard6.classList.add('exp-card--active');
      } else {
        expNode6.classList.remove('exp-timeline-node--active');
        expCard6.classList.remove('exp-card--active');
      }
    }
  };

  // Center achievements timeline spine between the center of node 1 and center of node 3
  const updateAchieveSpinePosition = () => {
    if (!achieveTimeline || !achieveSpine || !achieveNode1 || !achieveNode3) return;

    const tRect = achieveTimeline.getBoundingClientRect();
    const n1Rect = achieveNode1.getBoundingClientRect();
    const n3Rect = achieveNode3.getBoundingClientRect();

    const center1 = (n1Rect.top - tRect.top) + (n1Rect.height / 2);
    const center3 = (n3Rect.top - tRect.top) + (n3Rect.height / 2);

    const spineTop = Math.round(center1);
    const spineHeight = Math.max(0, Math.round(center3 - center1));

    achieveSpine.style.top = `${spineTop}px`;
    achieveSpine.style.height = `${spineHeight}px`;
    achieveSpine.style.bottom = 'auto';
  };

  // Achievements Timeline Progress: orange line & orange beep move downward across 3 steps on scroll
  const updateAchievementsTimeline = () => {
    if (!achieveTimeline || !achieveSpineFill || !achieveNode1 || !achieveNode2 || !achieveNode3) return;

    updateAchieveSpinePosition();

    const n1Rect = achieveNode1.getBoundingClientRect();
    const n2Rect = achieveNode2.getBoundingClientRect();
    const n3Rect = achieveNode3.getBoundingClientRect();

    const viewportHeight = window.innerHeight;
    const n1CenterY = n1Rect.top + (n1Rect.height / 2);
    const n2CenterY = n2Rect.top + (n2Rect.height / 2);
    const n3CenterY = n3Rect.top + (n3Rect.height / 2);

    const triggerStart = viewportHeight * 0.82;
    const totalDistance = Math.max(1, n3CenterY - n1CenterY);

    let progress = 0;
    if (n1CenterY <= triggerStart) {
      const scrolled = triggerStart - n1CenterY;
      progress = Math.min(1, Math.max(0, scrolled / totalDistance));
    }

    achieveSpineFill.style.height = `${(progress * 100).toFixed(1)}%`;

    const fillHeightPx = progress * totalDistance;
    const nodeRadius = 7; // .achieve-step-node radius (14px diameter)

    // Step 1: lights up once line begins filling (progress > 0)
    const node1Touched = progress > 0;
    if (node1Touched) {
      achieveNode1.classList.add('achieve-step-node--active');
      if (achieveCard1) achieveCard1.classList.add('achieve-step-card--active');
    } else {
      achieveNode1.classList.remove('achieve-step-node--active');
      if (achieveCard1) achieveCard1.classList.remove('achieve-step-card--active');
    }

    // Step 2: lights up ONLY when orange line reaches Node 2
    const n2Distance = n2CenterY - n1CenterY;
    const node2Touched = fillHeightPx >= (n2Distance - nodeRadius);
    if (node2Touched) {
      achieveNode2.classList.add('achieve-step-node--active');
      if (achieveCard2) achieveCard2.classList.add('achieve-step-card--active');
    } else {
      achieveNode2.classList.remove('achieve-step-node--active');
      if (achieveCard2) achieveCard2.classList.remove('achieve-step-card--active');
    }

    // Step 3: lights up ONLY when orange line reaches Node 3
    const node3Touched = fillHeightPx >= (totalDistance - nodeRadius);
    if (node3Touched) {
      achieveNode3.classList.add('achieve-step-node--active');
      if (achieveCard3) achieveCard3.classList.add('achieve-step-card--active');
    } else {
      achieveNode3.classList.remove('achieve-step-node--active');
      if (achieveCard3) achieveCard3.classList.remove('achieve-step-card--active');
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
        updateAchievementsTimeline();
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
    updateAchieveSpinePosition();
    updateAchievementsTimeline();
  });
  if (document.fonts) {
    document.fonts.ready.then(() => {
      updateTimelineSpinePosition();
      updateEducationTimeline();
      updateExpTimelineSpinePosition();
      updateExperienceTimeline();
      updateAchieveSpinePosition();
      updateAchievementsTimeline();
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
      if (expCard4) roExp.observe(expCard4);
      if (expCard5) roExp.observe(expCard5);
      if (expCard6) roExp.observe(expCard6);
    }
    if (achieveTimeline) {
      const roAchieve = new ResizeObserver(() => {
        updateAchieveSpinePosition();
      });
      roAchieve.observe(achieveTimeline);
      if (achieveCard1) roAchieve.observe(achieveCard1);
      if (achieveCard2) roAchieve.observe(achieveCard2);
      if (achieveCard3) roAchieve.observe(achieveCard3);
    }
  }

  // Initial run
  updateAboutCardExpansion();
  updateHeaderMode();
  updateEducationTimeline();
  updateExperienceTimeline();
  updateAchieveSpinePosition();
  updateAchievementsTimeline();
  updateChatbotColor();
}

// ===== Contact CTA Buttons (Smooth Scroll to Contact Footer) =====
function initContactCTA() {
  document.querySelectorAll('a[href="#contact"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const contactTarget = document.getElementById('contact');
      if (contactTarget) {
        e.preventDefault();
        contactTarget.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ===== Footer Word Cycler Effect (Disappearing / Reappearing) =====
function initFooterWordCycler() {
  const cycler = document.getElementById('footer-word-cycler');
  if (!cycler) return;

  const words = ['shape', 'build', 'launch'];
  let currentIdx = 0;
  const CYCLE_INTERVAL = 1500; // Matches Framer reference interval (1.5s)
  const TRANSITION_DURATION = 400; // Matches Framer reference transition duration (0.4s)

  // Ensure initial active word exists
  if (!cycler.querySelector('.footer__word--active')) {
    cycler.innerHTML = `<span class="footer__word footer__word--active">${words[0]}</span>`;
  }

  setInterval(() => {
    const nextIdx = (currentIdx + 1) % words.length;
    const currentEl = cycler.querySelector('.footer__word--active');

    // Create the incoming word element
    const nextEl = document.createElement('span');
    nextEl.className = 'footer__word footer__word--incoming is-entering';
    nextEl.textContent = words[nextIdx];
    cycler.appendChild(nextEl);

    // Force reflow
    void nextEl.offsetHeight;

    // Trigger simultaneous disappearing and reappearing transition
    if (currentEl) {
      currentEl.classList.remove('footer__word--active');
      currentEl.classList.add('is-exiting');
    }

    nextEl.classList.remove('is-entering');
    nextEl.classList.add('footer__word--active');

    // Clean up outgoing word after transition completes
    setTimeout(() => {
      if (currentEl && currentEl.parentNode === cycler) {
        cycler.removeChild(currentEl);
      }
    }, TRANSITION_DURATION + 50);

    currentIdx = nextIdx;
  }, CYCLE_INTERVAL);
}

// ===== Testimonials Infinite Loop with Intentional Scroll Support =====
function initTestimonialsMarquee() {
  const viewport = document.getElementById('testimonials-viewport');
  if (!viewport) return;
  const track = viewport.querySelector('.testi-cards-track');
  if (!track) return;

  // Reduced motion preference check
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    track.style.transform = 'translateY(0)';
    return;
  }

  // Clear any lingering CSS animation so JS controls transform smoothly
  track.style.animation = 'none';

  let halfHeight = track.scrollHeight / 2;
  let currentY = 0;
  let isManualScrolling = false;
  let manualResumeTimer = null;
  let isWindowScrolling = false;
  let windowScrollTimer = null;
  let isVisible = false;
  let animFrameId = null;
  let lastTime = performance.now();

  function updateDimensions() {
    if (track.scrollHeight > 0) {
      halfHeight = track.scrollHeight / 2;
    }
  }

  window.addEventListener('resize', updateDimensions);
  window.addEventListener('load', updateDimensions);

  // Speed in pixels per second based on viewport width:
  // Desktop: ~52s for full cycle, Tablet: ~48s, Mobile: ~45s
  function getSpeed() {
    const width = window.innerWidth;
    const duration = width <= 640 ? 45 : (width <= 992 ? 48 : 52);
    return halfHeight > 0 ? (halfHeight / duration) : 67;
  }

  // 1. Monitor continuous window scrolling
  // While the user is actively scrolling the main page, isWindowScrolling is true.
  window.addEventListener('scroll', () => {
    isWindowScrolling = true;
    clearTimeout(windowScrollTimer);
    windowScrollTimer = setTimeout(() => {
      isWindowScrolling = false;
    }, 160);
  }, { passive: true });

  // 2. Animation loop (Smooth 60/120fps requestAnimationFrame)
  function tick(now) {
    if (!isVisible) {
      animFrameId = null;
      return;
    }

    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (!isManualScrolling && halfHeight > 0) {
      currentY -= getSpeed() * dt;
      // Seamless infinite looping
      if (currentY <= -halfHeight) {
        currentY += halfHeight;
      } else if (currentY > 0) {
        currentY -= halfHeight;
      }
      track.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
    }

    animFrameId = requestAnimationFrame(tick);
  }

  // 3. IntersectionObserver: Only run RAF when testimonials are near/in viewport
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      isVisible = entry.isIntersecting;
      if (isVisible) {
        updateDimensions();
        lastTime = performance.now();
        if (!animFrameId) {
          animFrameId = requestAnimationFrame(tick);
        }
      } else if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    });
  }, { rootMargin: '300px 0px' });
  observer.observe(viewport);

  // 4. Intentional Scroll on these boxes (Desktop Wheel / Trackpad)
  viewport.addEventListener('wheel', (e) => {
    // If user was already continuously scrolling the main page:
    // Do NOT trap the scroll, and do NOT stop the cards movement!
    if (isWindowScrolling) {
      return;
    }

    if (Math.abs(e.deltaY) < 1) return;

    // Intentional scroll targeting these testimonial boxes!
    e.preventDefault(); // Stop outer page scroll
    isManualScrolling = true;
    viewport.classList.add('is-paused');

    currentY -= e.deltaY;
    // Seamless infinite wrap
    if (halfHeight > 0) {
      if (currentY <= -halfHeight) currentY += halfHeight;
      if (currentY > 0) currentY -= halfHeight;
    }
    track.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;

    // Resume auto-movement after 1s of inactivity
    clearTimeout(manualResumeTimer);
    manualResumeTimer = setTimeout(() => {
      isManualScrolling = false;
      viewport.classList.remove('is-paused');
      lastTime = performance.now();
    }, 1000);
  }, { passive: false });

  // 5. Mouse Leave: If user was manually scrolling and moves pointer away, resume after 1s
  viewport.addEventListener('mouseleave', () => {
    if (isManualScrolling) {
      clearTimeout(manualResumeTimer);
      manualResumeTimer = setTimeout(() => {
        isManualScrolling = false;
        viewport.classList.remove('is-paused');
        lastTime = performance.now();
      }, 1000);
    }
  });

  // 6. Touch Support (Mobile / Tablet)
  let touchStartY = 0;
  let touchStartTranslateY = 0;
  let isTouchDragging = false;

  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) return;
    touchStartY = e.touches[0].clientY;
    touchStartTranslateY = currentY;
    isTouchDragging = false;
  }, { passive: true });

  viewport.addEventListener('touchmove', (e) => {
    if (e.touches.length !== 1) return;
    // If user is continuously scrolling the main page, let page scroll freely!
    if (isWindowScrolling) return;

    const currentTouchY = e.touches[0].clientY;
    const diffY = currentTouchY - touchStartY;

    // Only engage if deliberate swipe (> 10px) while page is stationary
    if (!isTouchDragging && Math.abs(diffY) > 10) {
      isTouchDragging = true;
      isManualScrolling = true;
      viewport.classList.add('is-paused');
    }

    if (isTouchDragging) {
      if (e.cancelable) e.preventDefault();
      currentY = touchStartTranslateY + diffY;
      if (halfHeight > 0) {
        if (currentY <= -halfHeight) currentY += halfHeight;
        if (currentY > 0) currentY -= halfHeight;
      }
      track.style.transform = `translate3d(0, ${currentY.toFixed(2)}px, 0)`;
      clearTimeout(manualResumeTimer);
    }
  }, { passive: false });

  viewport.addEventListener('touchend', () => {
    if (isTouchDragging) {
      isTouchDragging = false;
      clearTimeout(manualResumeTimer);
      manualResumeTimer = setTimeout(() => {
        isManualScrolling = false;
        viewport.classList.remove('is-paused');
        lastTime = performance.now();
      }, 1000);
    }
  }, { passive: true });

  viewport.addEventListener('touchcancel', () => {
    isTouchDragging = false;
    isManualScrolling = false;
    viewport.classList.remove('is-paused');
    lastTime = performance.now();
  }, { passive: true });

  // 7. Click/tap on a testimonial card to hold it in place to read
  track.addEventListener('click', (e) => {
    const card = e.target.closest('.testi-card');
    if (card) {
      isManualScrolling = true;
      viewport.classList.add('is-paused');
      clearTimeout(manualResumeTimer);
      manualResumeTimer = setTimeout(() => {
        isManualScrolling = false;
        viewport.classList.remove('is-paused');
        lastTime = performance.now();
      }, 3500);
    }
  });
}

// ===== Footer Social Buttons Interaction (Prevents Sticky Hover & Tab-Return Focus) =====
function initFooterSocialButtons() {
  const socialBtns = document.querySelectorAll('.footer__social-btn');
  if (!socialBtns.length) return;

  socialBtns.forEach(btn => {
    // When clicked/tapped, immediately blur to drop focus and clear hover cache
    btn.addEventListener('click', () => {
      btn.blur();
      btn.classList.add('is-clicked');
    });

    btn.addEventListener('mouseleave', () => {
      btn.classList.remove('is-clicked');
      btn.blur();
    });

    btn.addEventListener('mouseenter', () => {
      btn.classList.remove('is-clicked');
    });

    btn.addEventListener('touchend', () => {
      setTimeout(() => {
        btn.classList.remove('is-clicked');
        btn.blur();
      }, 250);
    }, { passive: true });
  });

  // When returning to this window/tab from an opened external tab or application
  window.addEventListener('focus', () => {
    socialBtns.forEach(btn => {
      btn.blur();
    });
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }
  });

  // Clear is-clicked state as soon as mouse moves outside the button
  document.addEventListener('mousemove', (e) => {
    socialBtns.forEach(btn => {
      if (!btn.contains(e.target) && btn.classList.contains('is-clicked')) {
        btn.classList.remove('is-clicked');
      }
    });
  }, { passive: true });
}

// ===== FEATURED CASE STUDIES & TEARDOWNS STACK INTERACTION =====
function initCaseStudiesStack() {
  const stackContainers = document.querySelectorAll('.pt-cases-list, .pt-teardowns-list');
  if (!stackContainers.length) return;

  const stackGroups = Array.from(stackContainers).map(container =>
    Array.from(container.querySelectorAll('.pt-case-card'))
  ).filter(group => group.length > 0);

  const allCards = stackGroups.flat();
  if (!allCards.length) return;

  const updateCardStackVisibility = () => {
    const isMobile = window.innerWidth <= 960;

    stackGroups.forEach(caseCards => {
      caseCards.forEach((card, index) => {
        const nextCard = caseCards[index + 1];
        if (!nextCard) {
          card.classList.remove('is-covered');
          return;
        }

        const nextRect = nextCard.getBoundingClientRect();
        const stickyTop = parseFloat(window.getComputedStyle(nextCard).top) || (isMobile ? 70 : 90);

        // Once the next card reaches sticky top (or within 8px), the previous card is completely covered
        if (nextRect.top <= stickyTop + 8) {
          card.classList.add('is-covered');
        } else {
          card.classList.remove('is-covered');
        }
      });
    });
  };

  let ticking = false;
  const onScrollOrResize = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateCardStackVisibility();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  updateCardStackVisibility();

  // Click card to scroll it into sticky position
  allCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a') || e.target.closest('button')) return;

      const rect = card.getBoundingClientRect();
      const isMobile = window.innerWidth <= 960;
      const targetTop = isMobile ? 70 : 90;

      if (Math.abs(rect.top - targetTop) > 10) {
        window.scrollTo({
          top: window.scrollY + rect.top - targetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ===== PROJECT CARDS KPI METRICS COUNT-UP ANIMATION =====
// Replicates the exact count-up effect from the Experience section metrics (easeOutCubic over ~1.2s)
function initProjectKpiCounters() {
  const cards = document.querySelectorAll('.pt-case-card');
  if (!cards.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Metric text animator generator
  const createMetricAnimator = (rawText) => {
    const text = rawText.trim();
    if (!text) return null;

    // Range like 60-70% or 60–70%
    const rangeMatch = text.match(/^(\d+)\s*[–-]\s*(\d+)%$/);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1], 10);
      const max = parseInt(rangeMatch[2], 10);
      return (ease) => `${Math.round(ease * min)}-${Math.round(ease * max)}%`;
    }

    // Currency like ₹31.98 Cr
    const currMatch = text.match(/^₹([\d.]+)\s*Cr$/);
    if (currMatch) {
      const val = parseFloat(currMatch[1]);
      const dec = currMatch[1].includes('.') ? currMatch[1].split('.')[1].length : 2;
      return (ease) => `₹${(ease * val).toFixed(dec)} Cr`;
    }

    // Comma formatted like 12,452
    const commaMatch = text.match(/^([\d,]+)$/);
    if (commaMatch && text.includes(',')) {
      const val = parseInt(text.replace(/,/g, ''), 10);
      return (ease) => Math.round(ease * val).toLocaleString('en-US');
    }

    // Lakh with L+ like 4.03L+
    const lakhMatch = text.match(/^([\d.]+)L\+$/);
    if (lakhMatch) {
      const val = parseFloat(lakhMatch[1]);
      const dec = lakhMatch[1].includes('.') ? lakhMatch[1].split('.')[1].length : 2;
      return (ease) => `${(ease * val).toFixed(dec)}L+`;
    }

    // Decimal / float with unit e.g. 2.5 Years
    const unitDecimalMatch = text.match(/^([\d.]+)\s+([A-Za-z]+)$/);
    if (unitDecimalMatch) {
      const val = parseFloat(unitDecimalMatch[1]);
      const dec = unitDecimalMatch[1].includes('.') ? unitDecimalMatch[1].split('.')[1].length : 0;
      const unit = unitDecimalMatch[2];
      return (ease) => `${(ease * val).toFixed(dec)} ${unit}`;
    }

    // Suffix K like 290K
    const kMatch = text.match(/^(\d+)K$/);
    if (kMatch) {
      const val = parseInt(kMatch[1], 10);
      return (ease) => `${Math.round(ease * val)}K`;
    }

    // Suffix + like 300+
    const plusMatch = text.match(/^(\d+)\+$/);
    if (plusMatch) {
      const val = parseInt(plusMatch[1], 10);
      return (ease) => `${Math.round(ease * val)}+`;
    }

    // Percentage with or without decimals e.g. 53.3%, 39.39%, 40%
    const pctMatch = text.match(/^([\d.]+)%$/);
    if (pctMatch) {
      const val = parseFloat(pctMatch[1]);
      const dec = pctMatch[1].includes('.') ? pctMatch[1].split('.')[1].length : 0;
      return (ease) => `${(ease * val).toFixed(dec)}%`;
    }

    return null;
  };

  const cardAnimators = new Map();

  cards.forEach(card => {
    const metricNums = card.querySelectorAll('.pt-metric-num');
    const animators = [];
    const arrowEls = card.querySelectorAll('.pt-metric-arrow, .pt-metric-num svg');

    metricNums.forEach(el => {
      if (el.querySelector('svg')) return; // ignore non-numeric icon elements
      const originalText = el.textContent.trim();
      const formatFn = createMetricAnimator(originalText);
      if (formatFn) {
        animators.push({ el, originalText, formatFn });
      }
    });

    if (animators.length || arrowEls.length) {
      cardAnimators.set(card, { animators, arrowEls, hasAnimated: false });
    }
  });

  const animateCard = (card) => {
    const data = cardAnimators.get(card);
    if (!data || data.hasAnimated) return;
    data.hasAnimated = true;
    card.classList.add('is-kpi-animated');

    if (prefersReducedMotion) {
      data.animators.forEach(({ el, originalText }) => {
        el.textContent = originalText;
      });
      return;
    }

    if (data.arrowEls && data.arrowEls.length) {
      data.arrowEls.forEach((arrow, idx) => {
        arrow.style.animationDelay = `${idx * 160}ms`;
        arrow.classList.add('is-animating');
      });
    }

    const duration = 1200; // fast count-up ~1.2s settling smoothly, exactly matching Experience section
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = Math.min(1, elapsed / duration);
      const ease = easeOutCubic(t);

      data.animators.forEach(({ el, originalText, formatFn }) => {
        if (t < 1) {
          el.textContent = formatFn(ease);
        } else {
          el.textContent = originalText;
        }
      });

      if (t < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  // Trigger when metrics scroll into view so the user actually sees the numbers & arrows animate
  if ('IntersectionObserver' in window) {
    const targetToCardMap = new Map();

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const card = targetToCardMap.get(entry.target) || entry.target;
          animateCard(card);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -30px 0px',
      threshold: 0.15
    });

    cards.forEach(card => {
      if (cardAnimators.has(card)) {
        const targetEl = card.querySelector('.pt-case-metrics') || card;
        targetToCardMap.set(targetEl, card);
        observer.observe(targetEl);
      }
    });
  }

  // Also trigger on card hover/interaction in case observer threshold wasn't reached yet
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => animateCard(card), { passive: true });
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initContactCTA();
    initTestimonialsMarquee();
    initFooterWordCycler();
    initFooterSocialButtons();
    initCaseStudiesStack();
    initProjectKpiCounters();
  });
} else {
  initContactCTA();
  initTestimonialsMarquee();
  initFooterWordCycler();
  initFooterSocialButtons();
  initCaseStudiesStack();
  initProjectKpiCounters();
}

