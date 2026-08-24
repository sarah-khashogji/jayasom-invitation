# Jayasom · AMAALA — Opening Invitation

An interactive digital invitation for the Jayasom AMAALA opening, **Sunday 13 September 2026, 5:30 PM**.
Guests receive the link by WhatsApp, watch the Jayasom wordmark draw itself out of a constellation,
read the invitation, and confirm attendance without ever leaving the page.

**It is one static HTML file.** No build step is required to deploy it, no server, no database,
no dependencies. Put `index.html` on any web host and it works.

---

## Deploying

`index.html` is entirely self-contained — all CSS, JavaScript and the logo artwork are inlined. The
only external request is to Google Fonts. Any of these work with zero configuration:

| Host | How |
|---|---|
| **GitHub Pages** | Push this folder to a repo → Settings → Pages → deploy from branch. `.nojekyll` is already present so the build is not filtered. |
| **Azure Static Web Apps** | Point it at the repo. `staticwebapp.config.json` is included. Best fit if Jayasom runs on Microsoft 365. |
| **Netlify** | Drag this folder onto the Netlify dashboard, or connect the repo. `netlify.toml` is included. |
| **Vercel** | Import the repo. `vercel.json` is included. |
| **Any web server** | Copy `index.html` to the document root. Nothing else is needed. |

### Custom domain

The guest-facing URL should be a Jayasom subdomain — e.g. `invitation.jayasom.com`. On GitHub Pages
that is one `CNAME` DNS record pointing at the Pages address, plus the domain entered under
Settings → Pages. On Azure and Netlify it is one entry in the custom-domain panel. HTTPS is issued
automatically on all three.

---

## Where RSVP answers go

Every submission is posted to the endpoint configured at the top of the `<script>` block in
`index.html`:

```js
const RSVP = {
  endpoint: 'https://submit.jotform.com/submit/262356522129052',
  fields:   { name: '...', mobile: '...', email: '...', attending: '...' },
  mode:     'form'
};
```

`mode: 'form'` posts URL-encoded form data through a hidden iframe, which is what Jotform and most
form services expect and which avoids cross-origin restrictions. `mode: 'json'` posts JSON via
`fetch` instead — use that for a custom API endpoint.

**To change where answers land, edit those few lines and redeploy.** Nothing else in the page
depends on the destination. If IT would rather submissions went to a SharePoint list, a Power
Automate flow, a Microsoft Forms backend, or an internal API, that is the only place to change.

⚠️ **Before sending the link to real guests, submit one test RSVP and confirm it arrives.** A
misconfigured endpoint fails silently by design — the guest still sees the confirmation screen,
because a guest should never be shown a technical error on an invitation.

---

## Editing the content

Everything a non-developer would want to change lives in one place: the `COPY` object at the top of
the `<script>` block in `index.html`, which holds the English and Arabic text side by side. Event
date and time are the `EVENT_AT` constant just below it.

For larger changes, edit the files in `src/` and rebuild:

```bash
python3 build.py     # writes dist/index.html and dist/artifact.html
```

- `src/head.html` — all styles
- `src/body.html` — page structure
- `src/script.js` — copy, animation, form logic
- `src/constellation.json` — the 39 star positions that draw the wordmark
- `src/logo_paths.html` — the official logo, as vector paths from the brand PDF

---

## Tests

Run against a built `dist/index.html` with `node tests/<name>.js` (needs `playwright`):

| Test | Checks |
|---|---|
| `fit.js` | The RSVP button clears the fold at 375×667, 390×844, 412×915, 1440×900 |
| `audit.js` | WCAG AA contrast and 44px minimum tap targets |
| `edge.js` | Reduced motion, 320px screens, keyboard-only completion, return visits |
| `links.js` | The RSVP stars light and connect in the right order |
| `langbug.js` | Switching language mid-animation does not blank the page |
| `timing.js` | Animation milestones |
| `shots.js` | Screenshots of the whole journey |

Run all of them after any change. Several exist because they caught real bugs — see below.

---

## Things that will bite you

- **Century Gothic is not a web font.** The stack asks for it first, so it renders true on any
  machine with Microsoft Office, and falls back to Questrial (same geometric bones) everywhere else.
  Making it exact for every guest needs a licensed webfont conversion. Arabic uses Alexandria from
  Google Fonts and is exact everywhere.
- **Two animation flags, not one.** `introDone` means the header controls are visible; `revealDone`
  means every word has finished arriving. They are about five seconds apart. Guarding anything on
  the wrong one silently breaks Skip.
- **Anything that re-renders the word spans must settle the animation first.** Replacing the text
  mid-animation orphans the timers and leaves the event details permanently blank. The language
  toggle handles this by completing the reveal.
- **Adding any line to the invitation pushes the RSVP button below the fold.** Re-run `tests/fit.js`.
- **The Arabic time is wrapped in Unicode isolates** (`U+2066`/`U+2069`) so the bidirectional
  algorithm cannot reorder ٥:٣٠. Do not strip them.
- **`#rsvp` on the URL** skips the animation and opens the form directly — useful for guests
  returning to finish, and for testing.

---

## Browser support

Chrome, Safari, Firefox and Edge, current versions, desktop and mobile — including the in-app
browsers WhatsApp opens. Respects `prefers-reduced-motion`. Fully keyboard operable.
