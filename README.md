# Gairik Chakraborty — Portfolio

**Personal portfolio website showcasing product management experience, education, working approach, and professional impact.**

Explore the live portfolio: [gairik.tech](https://gairik.tech)

## Overview

This repository contains the source for my personal portfolio website. It presents my background as a Product Manager, highlights my experience and education, and provides an interactive way to learn about my approach to product work.

## What's included

- **Introduction:** Product management positioning with an animated typewriter message and a hero video
- **About:** Professional story, education timeline, working principles, and interests beyond work
- **Experience:** A visual career timeline covering product management, banking, and technology roles, with selected outcomes and metrics
- **Ask Gairik:** An on-page, scripted chatbot interface with suggested questions about my background, experience, skills, and contact details
- **Responsive navigation:** Section-based navigation with a mobile menu
- **Visual presentation:** Scroll interactions, animated timelines, custom typography, and supporting imagery

## Built with

- HTML5
- CSS3
- Vanilla JavaScript
- Google Fonts
- HTML video and image assets

The site is implemented as a lightweight static website without a frontend framework or package-manager build step.

## Run locally

### 1. Clone the repository

```bash
git clone https://github.com/gairikzzz/Portfolio.git
cd Portfolio
```

### 2. Open the website

Open `index.html` directly in a browser, or serve the folder using a local static server.

For example, with Python:

```bash
python -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

## Project structure

```text
.
├── assets/       # Profile images, company and university logos, and video assets
├── index.html    # Page content and section structure
├── styles.css    # Layout, responsive styling, and animations
├── script.js     # Navigation, scroll interactions, timelines, and chatbot behaviour
└── README.md
```

## Notes

- The chatbot currently uses predefined JavaScript responses; it is a scripted interface rather than a connected AI backend.
- The hero's **Download CV** link in the current HTML is a placeholder (`href="#" `). Add the intended CV file and update that link before relying on it.
- The website loads fonts from Google Fonts and uses local media from the `assets/` directory.

---

Built by [Gairik Chakraborty](https://github.com/gairikzzz) · [Portfolio](https://gairik.tech) · [LinkedIn](https://www.linkedin.com/in/gairikchakraborty)
