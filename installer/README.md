# Installer pubblico di Vencord Italiano

L'installer Windows viene compilato automaticamente da GitHub Actions a partire dal sorgente open source ufficiale di Vencord Installer.

- Sorgente upstream: Vencord/Installer
- Commit upstream fissato: fe6e041a550b01d1853db6c8ea157d42c7480510
- Licenza upstream: GPL-3.0
- Destinazione degli aggiornamenti: davidev3p0/Vencord-Italiano
- File pubblico: Vencord-Italiano-Setup.exe

## Sicurezza e trasparenza

La build non usa packer, UPX, cifratura dell'eseguibile, offuscamento o script PowerShell eseguiti sul PC dell'utente. PowerShell viene usato soltanto nel runner GitHub per preparare la build.

Ogni release pubblica:
- l'EXE nativo;
- il relativo SHA-256;
- una GitHub Artifact Attestation della provenienza della build.

L'installer scarica esclusivamente i file della release piu recente di questo repository necessari a Vencord Italiano e usa il rilevamento Stable, Canary e PTB dell'installer Vencord upstream.

Nota: un EXE non firmato con un certificato Authenticode attendibile puo comunque mostrare l'avviso SmartScreen "Editore sconosciuto". Questo e distinto da un rilevamento malware.
