# KSbackend

Backend fork for Project Kandi, based on PekoraSource / OpenPekora (Marine, Korone fork).

This repository keeps upstream code lineage and attribution. KSbackend-specific integration work is being developed on the `ksbackend/integration` branch before it is considered stable.

## Project status

- Backend: ASP.NET Core / .NET 8.
- Database and cache: PostgreSQL and Redis.
- Asset validation: Go service in `AssetValidationServiceV2`.
- Kandi integration: in progress; existing routes and response shapes must be verified before frontend methods are marked connected.
- Game execution and rendering: require separate infrastructure and are not considered available merely because the website API starts.

## Upstream notes

I won't give you a tutorial on how to set this thing up, it's the same procedure as Economy Simulator but the account creation is different and requires you to tamper with some shit in the join_applications table on the database.

Also before you work on this, read Notes.md

If you plan on hosting this as a public revival please use these instead of Economy Simulator Source</br></br>
[RBLX.local (open-source + recommended for use)](https://github.com/rblx-local/rblxlocal)</br>
[Mercury Core (difficult to setup but has a nice frontend design)](https://github.com/tp-link-extender/MercuryCore)
