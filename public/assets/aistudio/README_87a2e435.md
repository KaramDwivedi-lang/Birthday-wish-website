# Birthday Wish Website — 5 Pages

A personal birthday surprise with a password-protected entrance.

## Pages

| Page | File | What's inside |
|------|------|---------------|
| 1 | `index.html` | Golden-white theme, cute cat/bow/chocolate/teddy art, **password gate** |
| 2 | `page2.html` | Birthday hero + confetti celebration |
| 3 | `page3.html` | Personal message from you |
| 4 | `page4.html` | Friendship memories |
| 5 | `page5.html` | Interactive cake + make a wish |

## Quick Start

Open `index.html` in your browser.

## Password

Default password: **`priya`**

To change it, edit `js/auth.js`:

```js
const BIRTHDAY_PASSWORD = "priya";
```

Pages 2–5 are locked until the correct password is entered. The unlock lasts for the browser session (closing the tab resets it).

## Customize

| What | Where |
|------|-------|
| Friend's name | Search `Priya` in all HTML files |
| Your name | `page3.html` message signature |
| Password | `js/auth.js` |
| Personal message | `page3.html` |
| Memories | `page4.html` |
| Password hint | `index.html` → `.gate__hint` |

## Project Structure

```
birthday-wish/
├── index.html          ← Page 1: password gate
├── page2.html          ← Welcome
├── page3.html          ← Message
├── page4.html          ← Memories
├── page5.html          ← Wish
├── css/
│   ├── gate.css        ← Page 1 styles
│   ├── pages.css       ← Pages 2–5 styles
│   └── pages-nav.css   ← Bottom navigation
└── js/
    ├── auth.js         ← Password logic
    ├── gate.js         ← Page 1 interactions
    └── pages.js        ← Confetti, cake, auth guard
```
