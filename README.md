# Vencord Italiano

[![Test](https://github.com/davidev3p0/Vencord-Italiano/actions/workflows/test.yml/badge.svg?branch=vencord-italiano)](https://github.com/davidev3p0/Vencord-Italiano/actions/workflows/test.yml)
[![Release](https://github.com/davidev3p0/Vencord-Italiano/actions/workflows/release-italiano.yml/badge.svg)](https://github.com/davidev3p0/Vencord-Italiano/actions/workflows/release-italiano.yml)
[![Latest release](https://img.shields.io/github/v/release/davidev3p0/Vencord-Italiano?include_prereleases&sort=semver)](https://github.com/davidev3p0/Vencord-Italiano/releases/latest)
[![License](https://img.shields.io/github/license/davidev3p0/Vencord-Italiano)](LICENSE)

Fork/community build di Vencord con interfaccia italiana, nomi plugin localizzati, **RealVoiceTTS** e aggiornamenti automatici collegati alle release di questo repository.

> **Nota:** questo progetto non è il Vencord ufficiale e non è affiliato con Discord Inc. Il codice upstream deriva da Vencord e mantiene le relative licenze e attribuzioni.

## Download consigliato

Per gli utenti Windows consigliamo l'installer dedicato e open source:

**[Scarica Vencord Italiano Installer](https://github.com/davidev3p0/Vencord-Italiano-Installer/releases/latest)**

Repository installer:

- [davidev3p0/Vencord-Italiano-Installer](https://github.com/davidev3p0/Vencord-Italiano-Installer)

L'installer supporta Discord Stable, Canary e PTB, verifica i file della release e non richiede Git, Node.js o pnpm.

## Cosa include

- interfaccia e descrizioni Vencord localizzate in italiano;
- nomi visualizzati dei plugin in italiano senza cambiare gli ID interni;
- **RealVoiceTTS**, con lettura vocale dei messaggi;
- aggiornamenti automatici dal repository `davidev3p0/Vencord-Italiano`;
- release pubbliche riproducibili tramite GitHub Actions;
- SHA-256 e GitHub build provenance per gli artefatti pubblicati;
- compatibilità mantenuta con la struttura upstream Vencord.

## Aggiornamenti automatici

Le build standalone sono compilate con:

```text
VENCORD_REMOTE=davidev3p0/Vencord-Italiano
```

In Discord, **Impostazioni Vencord → Aggiornamenti** mostra questo repository come origine. Quando viene pubblicata una nuova release, Vencord Italiano può scaricarla e applicarla automaticamente.

## RealVoiceTTS

RealVoiceTTS è incluso come user plugin del fork. La configurazione attuale supporta la lettura dei messaggi tramite **Ctrl + clic** e usa le voci disponibili tramite Discord/Chromium e il sistema operativo.

## Sicurezza e trasparenza

- sorgente pubblico;
- build GitHub Actions;
- release con checksum e provenienza verificabile;
- nessun packer o offuscamento introdotto dal progetto italiano;
- nessuna telemetria specifica aggiunta dal progetto;
- installer mantenuto in un repository separato e verificabile.

Documentazione:

- [Privacy policy](PRIVACY.md)
- [Security policy](SECURITY.md)
- [Code signing policy](CODE_SIGNING_POLICY.md)
- [Supporto Vencord Italiano](SUPPORT_ITALIANO.md)
- [Roadmap Vencord Italiano](ROADMAP_ITALIANO.md)
- [Changelog Vencord Italiano](CHANGELOG_ITALIANO.md)

## Build da sorgente

Per una build locale:

```powershell
pnpm install --frozen-lockfile
$env:VENCORD_REMOTE="davidev3p0/Vencord-Italiano"
pnpm buildStandalone
pnpm inject
```

Per contribuire al codice upstream conserva e rispetta anche le regole originali in [CONTRIBUTING.md](CONTRIBUTING.md).

## Upstream Vencord

Le sezioni seguenti derivano dalla documentazione upstream di Vencord.

## Features

-   Easy to install
-   [100+ built in plugins](https://vencord.dev/plugins)
-   Fairly lightweight despite the many inbuilt plugins
-   Excellent Browser Support: Run Vencord in your Browser via extension or UserScript
-   Works on any Discord branch: Stable, Canary or PTB all work
-   Custom CSS and Themes: Inbuilt css editor with support to import any css files (including BetterDiscord themes)
-   Privacy friendly: blocks Discord analytics & crash reporting out of the box and has no telemetry
-   Maintained very actively, broken plugins are usually fixed within 12 hours
-   Settings sync: Keep your plugins and their settings synchronised between devices / apps (optional)


## Installing / Uninstalling

Visit https://vencord.dev/download

## Join our Support/Community Server

https://discord.gg/D9uwnFnqmd

## Sponsors

|     **Thanks a lot to all Vencord [sponsors](https://github.com/sponsors/Vendicated)!!**     |
| :------------------------------------------------------------------------------------------: |
|   [![](https://meow.vendicated.dev/sponsors.png)](https://github.com/sponsors/Vendicated)    |
| *generated using [github-sponsor-graph](https://github.com/Vendicated/github-sponsor-graph)* |


## Star History

<a href="https://star-history.com/#Vendicated/Vencord&Timeline">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Vendicated/Vencord&type=Timeline&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Vendicated/Vencord&type=Timeline" />
    <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Vendicated/Vencord&type=Timeline" />
  </picture>
</a>

## Disclaimer

Discord is trademark of Discord Inc. and solely mentioned for the sake of descriptivity.
Mention of it does not imply any affiliation with or endorsement by Discord Inc.

<details>
<summary>Using Vencord violates Discord's terms of service</summary>

Client modifications are against Discord’s Terms of Service.

However, Discord is pretty indifferent about them and there are no known cases of users getting banned for using client mods! So you should generally be fine as long as you don’t use any plugins that implement abusive behaviour. But no worries, all inbuilt plugins are safe to use!

Regardless, if your account is very important to you and it getting disabled would be a disaster for you, you should probably not use any client mods (not exclusive to Vencord), just to be safe

Additionally, make sure not to post screenshots with Vencord in a server where you might get banned for it

</details>
