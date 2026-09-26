# Code signing policy

## Scope

Vencord Italiano pubblica principalmente gli asset runtime JavaScript/CSS utilizzati dall'updater interno di Vencord.

L'installer Windows è mantenuto separatamente in:

- https://github.com/davidev3p0/Vencord-Italiano-Installer

La relativa policy di firma è pubblicata in quel repository.

## Build provenance

Le release Vencord Italiano devono essere generate da GitHub Actions a partire da una revisione pubblica del repository.

Regole:

- niente packer o cifratura degli artefatti per nascondere il comportamento;
- niente offuscamento introdotto con lo scopo di eludere strumenti di sicurezza;
- gli artefatti devono corrispondere a un commit pubblico;
- checksum e/o build provenance devono essere pubblicati quando disponibili;
- eventuali binari Windows devono essere prodotti dal repository installer dedicato.

## Maintainer

- [davidev3p0](https://github.com/davidev3p0)

## Privacy

Vedi [PRIVACY.md](PRIVACY.md).

## Security

Vedi [SECURITY.md](SECURITY.md).
