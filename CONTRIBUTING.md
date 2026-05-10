# Contributing

Thanks for taking a look at RentEase.

## Local setup

```bash
git clone <repo-url>
cd rentease-rental-platform

cd backend
npm install
copy .env.example .env
npm run dev

cd ../frontend
npm install
copy .env.example .env
npm run dev
```

## Working rules

- Keep changes small and focused.
- Match the existing code style.
- Update documentation when behavior changes.
- Avoid unnecessary dependencies or abstractions.
- Do not commit `.env` files or generated files.

## Commit messages

- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation
- `refactor:` code cleanup
- `chore:` maintenance

## Pull requests

- Explain what changed and why.
- Include screenshots if the UI changed.
- Mention any setup or config changes.
- Keep the PR scoped to one task when possible.