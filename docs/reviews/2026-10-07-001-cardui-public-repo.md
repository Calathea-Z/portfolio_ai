# Cardui public repository

Status: approved by Zach on 2026-10-07.

## What changed

The budgeting project now links to https://github.com/Calathea-Z/Cardui. Copy that said the repository was private, or that there was no public repository, is gone from the Now card, the project page, the resume data the chat uses, and the chat prompt.

The product name on the site stays “Budgeting and debt planning.” Cardui appears as the repository name in the URL. The project is still marked in progress, so it is not listed with shipped work. Planning Poker is unchanged; that tool is still internal.

## Agent checks

- `Budgeting_IsCurrentWork_AndNotListedAsShipped` passed. It checks that the current-work answer includes the Cardui URL and no longer says the project is private.
- `npm run typecheck` in `web/` passed.

## Manual check

No data was changed. Please confirm in the running site:

- The Now card says the source is public and “View on GitHub” opens https://github.com/Calathea-Z/Cardui.
- `/projects/budgeting` no longer says the repository is private or that there is no public demo or repository. Both GitHub links open the Cardui repo.
- Asking the portfolio chat what you are working on cites that repository and does not say it is private.

Zach approved this review on 2026-10-07.
