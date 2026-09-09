# Chat frontend

Vite + React + TypeScript app with Apollo Client, MUI, GraphQL Codegen, and Vitest.

## Scripts

- `yarn start` — Vite dev server at [http://localhost:3001](http://localhost:3001)
- `yarn dev` — Vite plus GraphQL codegen watch (backend must be running)
- `yarn codegen` — Generate GraphQL types from `http://localhost:3000/api/graphql`
- `yarn test` — Vitest
- `yarn build` — Production build

Copy `.env.example` to `.env` if you need to change API URLs. GraphQL HTTP and websocket both go through the Vite proxy on port 3001 so the login cookie is sent with both.
