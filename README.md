## Run

`pnpm run dev` starts the Vite dev server. Open the printed local URL (usually
`http://localhost:3001`).

## API key

You can provide `INVINITE_API_KEY` two ways:

- UI: on the home page (`/`), enter the key in the API key field. It is stored
  in `localStorage` (`invinite-api-key`) and used for client requests.
- Env var: set `INVINITE_API_KEY` in your environment (or a `.env` file) before
  starting the dev server. This is used on the server/SSR side.

## Routes

- `/` — landing page, API key input, and intro cards.
- `/$ticker` — company overview + market data (e.g. `/AAPL`).
- `/$ticker/financials-standardized` — standardized financial statements with
  filters.
- `/$ticker/financials-as-reported` — as-reported financial statements.
- `/$ticker/filings` — SEC filings with filters, HTML/PDF viewers.
- `/$ticker/dividends` — dividends history.
- `/$ticker/stock-splits` — stock split history.
