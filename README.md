# AudioTextHub Template One

AudioTextHub AI SaaS Startups in hours.

![preview](preview.png)

## Quick Start

1. Clone the repository

```bash
git clone https://github.com/audiotexthub/audiotexthub-template-one.git
```

2. Install dependencies

```bash
pnpm install
```

3. Run the development server

```bash
pnpm dev
```

## Customize

- Set your environment variables

```bash
cp .env.example .env.local
```

- Set your theme in `app/theme.css`

[shadcn-ui-theme-generator](https://zippystarter.com/tools/shadcn-ui-theme-generator)

- Set your landing page content in `i18n/pages/landing`

- Set your i18n messages in `i18n/messages`

## Deploy

- Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Faudiotexthub%2Faudiotexthub-template-one&project-name=my-audiotexthub-project&repository-name=my-audiotexthub-project&redirect-url=https%3A%2F%2Faudiotexthub.com&demo-title=AudioTextHub&demo-description=AI%20Text%20to%20Speech%20Platform&demo-url=https%3A%2F%2Faudiotexthub.com&demo-image=https%3A%2F%2Fpbs.twimg.com%2Fmedia%2FGgGSW3La8AAGJgU%3Fformat%3Djpg%26name%3Dlarge)

- Deploy to Cloudflare

1. Customize your environment variables

```bash
cp .env.example .env.production
cp wrangler.toml.example wrangler.toml
```

edit your environment variables in `.env.production`

and put all the environment variables under `[vars]` in `wrangler.toml`

2. Deploy

```bash
npm run cf:deploy
```

## Community

- [AudioTextHub](https://audiotexthub.com)
- [Documentation](https://docs.audiotexthub.com)
- [Discord](https://discord.gg/HQNnrzjZQS)

## License

- [AudioTextHub AI SaaS Boilerplate License Agreement](LICENSE)
