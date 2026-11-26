# Private runtime database data

This directory is present in the repository only as an empty mount point.

The current Pekora backend stores platform accounts and application data through the PostgreSQL connection configured by the `Postgres` environment variable, and uses Redis through `Redis`. Do not create a second SQLite account store here: it would split account data from the existing Pekora services.

On the VPS, mount a persistent private volume here only for runtime files or database backups that a service explicitly needs. Files matching `*.db`, `*.sqlite*`, and database sidecar patterns are ignored by Git and must never be committed.

Never store plaintext passwords, session cookies, API keys, Discord bot tokens, or production database credentials in this directory or in the repository. User passwords must remain handled by the backend's existing password service.
