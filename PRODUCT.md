# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

static HTML/CSS/JS, no framework, no build step (existing choice, preserved)

## Users

Spanish-speaking parents of children aged 7–14, arriving mostly from cold Meta ad traffic on mobile, deciding whether to trust an online English academy enough to pay for a trial.

## Product Purpose

LET Academy sells live, teacher-led English classes for kids in small groups, 100% online. The site's job is to convert a skeptical parent into a $15/2-week trial signup via WhatsApp.

## Positioning

Live classes with a fixed teacher (not rotating, not pre-recorded), small groups, gamified practice (XP/streaks/hearts) that makes a session feel like a game the kid asks to attend.

## Operating Context

Every enrol CTA goes to `/cupo` (cupo.html + cupo.js): intro → 3 taps (age, country, level) → open groups converted to the family's local time → WhatsApp with answers + chosen slot prefilled → thank-you screen. Group schedule lives at the top of cupo.js. No login/dashboard on this site; the product itself (the class) happens on a video call, not on this page.

## Brand Commitments

Name: LET Academy (aka LET Junior). Existing real assets in use: teacher photos (Jordi, Sofia, Ersa), student photos, 4 video testimonials, 4 written reviews with photos, a globe logo mark. These are real people and must not be redrawn as illustration or replaced.

## Evidence on Hand

Real teacher and student photography in `assets/optimized/`, real video testimonials (YouTube), real written reviews with attributed names/photos. No confirmed pricing beyond what's already published ($15/2wk, $50/mo) — not to be changed as part of this redesign. Several placeholders (teacher certifications, legal footer details) remain marked TODO in the HTML; this redesign does not resolve them.

## Product Principles

- Trust before conversion: a first-time visitor on cold traffic must believe this is a real school with real teachers before being asked to pay anything.
- Mobile is the primary surface, not an adaptation of desktop.
- The gamified demo lesson is the proof, not a gimmick — it must stay fully functional through any visual change.
- Real photography and named reviewers are never abstracted into generic iconography.

## Accessibility & Inclusion

Existing WCAG AA text-contrast discipline (ink-safe color twins for brand hues) must be preserved under any new palette.
