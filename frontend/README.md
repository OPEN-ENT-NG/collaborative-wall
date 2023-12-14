# Edifice React Boilerplate with Vite

This is a [ReactJS](https://reactjs.org) + [Vite](https://vitejs.dev) boilerplate.

## Getting Started

Create the project inside the project of your app

```bash
npx degit opendigitaleducation/edifice-react-boilerplate .
```

Go to the project directory.

```bash
cd frontend
```

## Install

### With Docker

Install all dependencies.

```bash
./build.sh initDev
```

### Without Docker

Install all dependencies.

```bash
./build-noDocker.sh initDev
```

or

```bash
node scripts/package.cjs && pnpm install
```

## Dev

### Start project

Open your project with Vite Server + HMR at <http://localhost:3000>.

```bash
pnpm dev
```

### [Server Options](https://vitejs.dev/config/server-options.html)

You can change Vite Server by editing `vite.config.ts`

```bash
server: {
  host: "0.0.0.0",
  port: 3000,
  open: true // open the page on <http://localhost:3000> when dev server starts.
}
```

### Lint

```bash
pnpm lint
```

### Prettier

```bash
pnpm format
```

### Lighthouse

> LHCI will check if your app respect at least 90% of these categories: performance, a11y, Best practices and seo

```bash
pnpm lh
```

### Pre-commit

When committing your work, `pre-commit` will start `pnpm lint-staged`:

> lint-staged starts lint + prettier

```bash
pnpm pre-commit
```

## Build

TypeScript check + Vite Build

```bash
pnpm build
```

## Preview

```bash
pnpm preview
```

## License

This project is licensed under the AGPL-3.0 license.
