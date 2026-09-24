# RealVoiceTTS per Vencord

UserPlugin Vencord che legge ad alta voce il testo dei messaggi Discord usando la sintesi vocale locale del dispositivo.

## Funzioni

- Clic sinistro su un messaggio per leggerlo.
- Secondo clic sullo stesso messaggio per interrompere.
- Pulsante altoparlante nella barra che appare passando il mouse sul messaggio.
- `ESC` interrompe immediatamente la lettura.
- Selezione automatica della migliore voce italiana disponibile, con preferenza per voci Natural/Neural/Online.
- Selettore delle voci italiane rilevate dal client.
- Regolazione di velocità, tono e volume.
- Opzione per pronunciare il nome dell'autore.
- URL lunghi semplificati in “link”.
- Nessun messaggio viene inviato a servizi TTS esterni: usa l'API `speechSynthesis` locale del client.

## Nota importante

Questo NON è un file da importare in **Vencord > Backup & Restore**. I backup JSON di Vencord ripristinano impostazioni, QuickCSS, temi e configurazioni dei plugin già presenti; un nuovo UserPlugin richiede una build Vencord da sorgente.

Nel pacchetto trovi `INSTALLA_REALVOICETTS.bat`: su Windows automatizza clonazione/aggiornamento dei sorgenti Vencord, copia del plugin, dipendenze, build e avvio dell'injector.
