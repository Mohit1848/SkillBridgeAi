# Backend App

Node.js backend for:

- API gateway
- Resume parsing
- Skill extraction
- Matching engine
- Gap analyzer
- Roadmap engine
- Recommendation service
- Score engine

Microservice-ready module split:

- `engines`
  Pure business logic with explicit inputs and outputs. These do not fetch seeded data or talk to Express directly.
- `orchestrators`
  Compose multiple engines into end-to-end workflows such as profile analysis or simulation.
- `repositories`
  Provide data catalogs and persistence access. These are the easiest pieces to swap when moving to real external services.
- `controllers`
  Thin request handlers that translate HTTP input into orchestrator calls.
- `routes`
  Route registration that maps URLs to controllers.
- `app`
  App bootstrap and shared dependency wiring.
- `services`
  External integrations such as Firebase Admin, MongoDB, and file parsing.
- `middleware`
  HTTP auth and request pipeline behavior.

Current extraction-friendly flow:

1. HTTP layer accepts requests.
2. Repositories provide jobs, courses, and skill catalogs.
3. Orchestrators call pure engines.
4. Persistence orchestrator writes to MongoDB when auth and DB are available.

This keeps engines independent now and makes it easier to move parsing, matching, roadmap, or recommendation into standalone microservices later.
