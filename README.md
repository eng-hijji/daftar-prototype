This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Netlify

This repository contains the Next.js app at its root: `package.json`,
`app/`, and `netlify.toml` are siblings. `daftar-prototype` is the repository
name, not a subfolder in this checkout.

In Netlify's build settings, use:

- Base directory: repository root (leave blank or use `.`).
- Package directory: leave blank.
- Build command: `npm run build`.
- Publish directory: `.next` (relative to the base directory).

The root `netlify.toml` supplies the base, build command, and publish directory
and takes precedence over equivalent dashboard settings. Keep Netlify's automatic
Next.js framework support enabled; no SPA fallback rewrite is needed.

The repository explicitly installs `@netlify/plugin-nextjs` and declares it in
`netlify.toml` so the Next.js adapter processes `.next` during deployment. Do not
upload the raw `.next` directory as ordinary static files: its nested
`server/app/index.html` is not a working site root. The deploy log should show
the Next.js adapter running and producing the required routing and runtime output.

Trigger a new deploy from `main`, clearing the build cache if retrying the failed
deployment. Check the deploy log for the root `netlify.toml`, the resolved settings
above, and Netlify's Next.js adapter. After the deploy succeeds, open its unique
deploy URL and verify `/` loads the app, refreshing works, and JavaScript/CSS
requests under `/_next/` succeed. Then check the production URL points to that
successful deploy. A missing route should still return a normal 404.

If a different branch actually moves the app into a `daftar-prototype/`
subfolder, set the base directory to `daftar-prototype` and use its
`netlify.toml`; keep the build command and publish directory relative to that
base. Do not use that base directory for the current layout.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
