/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useSettings } from "@api/Settings";
import { Card } from "@components/Card";
import { Flex } from "@components/Flex";
import { Forms, TextArea, useState } from "@webpack/common";

export function OnlineThemesTab() {
    const settings = useSettings(["themeLinks"]);

    const [themeText, setThemeText] = useState(settings.themeLinks.join("\n"));

    // When the user leaves the online theme textbox, update the settings
    function onBlur() {
        settings.themeLinks = [...new Set(
            themeText
                .trim()
                .split(/\n+/)
                .map(s => s.trim())
                .filter(Boolean)
        )];
    }

    return (
        <Flex flexDirection="column" gap="1em">
            <Card variant="warning" defaultPadding>
                <Forms.FormText size="md">
                    Questa sezione è destinata agli utenti avanzati. Se hai difficoltà a usarla, utilizza invece la scheda Temi locali.
                </Forms.FormText>
            </Card>
            <Card>
                <Forms.FormTitle tag="h5">Incolla qui i link ai file CSS</Forms.FormTitle>
                <Forms.FormText>Un link per riga</Forms.FormText>
                <Forms.FormText>Puoi anteporre @light o @dark alle righe per attivarle in base al tema di Discord</Forms.FormText>
                <Forms.FormText>Assicurati di usare link diretti ai file (raw o github.io)!</Forms.FormText>
            </Card>

            <section>
                <Forms.FormTitle tag="h5">Temi online</Forms.FormTitle>
                <TextArea
                    value={themeText}
                    onChange={setThemeText}
                    className={"vc-settings-theme-links"}
                    placeholder="Inserisci link dei temi..."
                    spellCheck={false}
                    onBlur={onBlur}
                    rows={10}
                />
            </section>
        </Flex>
    );
}
