/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ErrorCard } from "@components/ErrorCard";
import { relativeLuminance } from "@plugins/clientTheme/utils/colorUtils";
import { createOrUpdateThemeColorVars } from "@plugins/clientTheme/utils/styleUtils";
import { classNameFactory } from "@utils/css";
import { Margins } from "@utils/margins";
import { findByCodeLazy, findStoreLazy } from "@webpack";
import { Button, ColorPicker, Forms, ThemeStore, useStateFromStores } from "@webpack/common";

import { settings } from "..";

const saveClientTheme = findByCodeLazy('type:"UNSYNCED_USER_SETTINGS_UPDATE', '"system"===');
const NitroThemeStore = findStoreLazy("ClientThemesBackgroundStore");

const cl = classNameFactory("vc-clientTheme-");

const colorPresets = [
    "#1E1514", "#172019", "#13171B", "#1C1C28", "#402D2D",
    "#3A483D", "#344242", "#313D4B", "#2D2F47", "#322B42",
    "#3C2E42", "#422938", "#b6908f", "#bfa088", "#d3c77d",
    "#86ac86", "#88aab3", "#8693b5", "#8a89ba", "#ad94bb",
];

function onPickColor(color: number) {
    const hexColor = color.toString(16).padStart(6, "0");

    settings.store.color = hexColor;
    createOrUpdateThemeColorVars(hexColor);
}

function setDiscordTheme(theme: string) {
    saveClientTheme({ theme });
}

export function ThemeSettingsComponent() {
    const currentTheme = useStateFromStores([ThemeStore], () => ThemeStore.theme);
    const isLightTheme = currentTheme === "light";
    const oppositeTheme = isLightTheme ? "Dark" : "Light";

    const nitroThemeEnabled = useStateFromStores([NitroThemeStore], () => NitroThemeStore.gradientPreset != null);

    const selectedLuminance = relativeLuminance(settings.store.color);

    let contrastWarning = false;
    let fixableContrast = true;

    if ((isLightTheme && selectedLuminance < 0.26) || !isLightTheme && selectedLuminance > 0.12) {
        contrastWarning = true;
    }

    if (selectedLuminance < 0.26 && selectedLuminance > 0.12) {
        fixableContrast = false;
    }

    // Light mode with values greater than 65 leads to background colors getting crushed together and poor text contrast for muted channels
    if (isLightTheme && selectedLuminance > 0.65) {
        contrastWarning = true;
        fixableContrast = false;
    }

    return (
        <div className={cl("settings")}>
            <div className={cl("container")}>
                <div className={cl("settings-labels")}>
                    <Forms.FormTitle tag="h3">Colore tema</Forms.FormTitle>
                    <Forms.FormText>Aggiungi un colore al tema del client Discord</Forms.FormText>
                </div>
                <ColorPicker
                    color={parseInt(settings.store.color, 16)}
                    onChange={onPickColor}
                    showEyeDropper={false}
                    suggestedColors={colorPresets}
                />
            </div>
            {(contrastWarning || nitroThemeEnabled) && (<>
                <ErrorCard className={Margins.top8}>
                    <Forms.FormTitle tag="h2">Il tema potrebbe non essere visualizzato correttamente!</Forms.FormTitle>

                    {contrastWarning && <Forms.FormText>{">"} Il colore selezionato non contrasta bene con il testo</Forms.FormText>}
                    {nitroThemeEnabled && <Forms.FormText>{">"} I temi Nitro non sono supportati</Forms.FormText>}

                    <div className={cl("buttons-container")}>
                        {(contrastWarning && fixableContrast) && <Button onClick={() => setDiscordTheme(oppositeTheme)} color={Button.Colors.RED}>Passa alla modalità {oppositeTheme}</Button>}
                        {(nitroThemeEnabled) && <Button onClick={() => setDiscordTheme(currentTheme)} color={Button.Colors.RED}>Disabilita tema Nitro</Button>}
                    </div>
                </ErrorCard>
            </>)}
        </div>
    );
}

export function ResetThemeColorComponent() {
    return (
        <Button onClick={() => onPickColor(0x313338)}>
            Ripristina colore tema
        </Button>
    );
}
