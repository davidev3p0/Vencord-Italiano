# Security policy

## Supported releases

Le correzioni di sicurezza specifiche di Vencord Italiano vengono distribuite tramite l'ultima release pubblica.

Per vulnerabilità che riguardano il progetto upstream Vencord, usa i canali di sicurezza previsti dal progetto upstream.

## Reporting a vulnerability

Non pubblicare token Discord, credenziali, cookie, dati personali o dettagli di exploit non ancora corretti in una issue pubblica.

Per problemi non sensibili puoi usare GitHub Issues.

## Release integrity

Gli asset runtime di Vencord Italiano vengono prodotti tramite workflow GitHub Actions versionati nel repository.

L'installer Windows è un progetto separato:

https://github.com/davidev3p0/Vencord-Italiano-Installer

Il repository installer pubblica sorgente, SHA-256 e GitHub build provenance per le proprie release.

## Supply chain

Il progetto non richiede agli utenti finali di installare Git, Node.js o pnpm quando usano l'installer pubblico. Le dipendenze di sviluppo sono gestite tramite il lockfile upstream.
