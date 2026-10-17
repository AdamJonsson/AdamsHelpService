# AdamsHelpService

A birthday present for Helena Wennstig: **Adams Hjälptjänst**, a (Swedish) ordering site for
help with frogs, high shelves, math and movie nights. Everything is paid in fika or food.

Plain HTML, CSS and JavaScript. No build step and no backend.

## Run locally

```bash
python -m http.server 8765
```

Then open http://localhost:8765. Opening `index.html` directly also works.

## Settings

Edit `js/config.js`:

- `ORDER_EMAIL`: where orders are sent. When Helena places an order, her mail app opens with a
  pre-filled email to this address. The page also shows a receipt and a "Kopiera" button in case
  no mail app opens.
- `CUSTOMER_NAME` / `PROVIDER_NAME`: names used in the checkout and the email.

## Deploy to GitHub Pages

1. Push the repository to GitHub.
2. Go to **Settings → Pages**, choose **Deploy from a branch**, then `main` and `/ (root)`.
3. The site is published at `https://<user>.github.io/<repo>/`.

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | The page: gift intro, hero, services, FAQ, and the order dialogs |
| `css/styles.css` | All styling |
| `js/services.js` | The four services: their order forms, prices and summaries |
| `js/app.js` | Gift intro, order dialog, cart, checkout and email |
| `js/icons.js` | Hand-drawn SVG icons (fika currency, frog, hoodie) |
| `assets/*.jpg` | Original illustrations |
| `assets/web/*.webp` | Resized copies of the illustrations, used by the site |

To change a price, edit the `price()` function of the service in `js/services.js`.

The gift intro is shown once per browser session. Use "Öppna presenten igen" in the footer to
see it again.
