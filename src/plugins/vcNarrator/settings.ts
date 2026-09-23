/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Logger } from "@utils/Logger";
import { OptionType } from "@utils/types";

import { VoiceSettingSection } from "./VoiceSetting";

export const getDefaultVoice = () => window.speechSynthesis?.getVoices().find(v => v.default);

export function getCurrentVoice(voices = window.speechSynthesis?.getVoices()) {
    if (!voices) return undefined;

    if (settings.store.voice) {
        const voice = voices.find(v => v.voiceURI === settings.store.voice);
        if (voice) return voice;

        new Logger("VcNarrator").error(`Voice "${settings.store.voice}" not found. Resetting to default.`);
    }

    const voice = voices.find(v => v.default);
    settings.store.voice = voice?.voiceURI;
    return voice;
}

export const settings = definePluginSettings({
    voice: {
        type: OptionType.COMPONENT,
        component: VoiceSettingSection,
        get default() {
            return getDefaultVoice()?.voiceURI;
        }
    },
    volume: {
        type: OptionType.SLIDER,
        description: "Volume narratore",
        default: 1,
        markers: [0, 0.25, 0.5, 0.75, 1],
        stickToMarkers: false
    },
    rate: {
        type: OptionType.SLIDER,
        description: "Velocità narratore",
        default: 1,
        markers: [0.1, 0.5, 1, 2, 5, 10],
        stickToMarkers: false
    },
    sayOwnName: {
        description: "Pronuncia il proprio nome",
        type: OptionType.BOOLEAN,
        default: false
    },
    latinOnly: {
        description: "Rimuovi i caratteri non latini dai nomi prima di pronunciarli",
        type: OptionType.BOOLEAN,
        default: false
    },
    joinMessage: {
        type: OptionType.STRING,
        description: "Messaggio di entrata",
        default: "{{USER}} è entrato"
    },
    leaveMessage: {
        type: OptionType.STRING,
        description: "Messaggio di uscita",
        default: "{{USER}} è uscito"
    },
    moveMessage: {
        type: OptionType.STRING,
        description: "Messaggio di spostamento",
        default: "{{USER}} si è spostato in {{CHANNEL}}"
    },
    muteMessage: {
        type: OptionType.STRING,
        description: "Messaggio microfono disattivato (per ora solo se stessi)",
        default: "{{USER}} ha disattivato il microfono"
    },
    unmuteMessage: {
        type: OptionType.STRING,
        description: "Messaggio microfono riattivato (per ora solo se stessi)",
        default: "{{USER}} ha riattivato il microfono"
    },
    deafenMessage: {
        type: OptionType.STRING,
        description: "Messaggio audio disattivato (per ora solo se stessi)",
        default: "{{USER}} ha disattivato l'audio"
    },
    undeafenMessage: {
        type: OptionType.STRING,
        description: "Messaggio audio riattivato (per ora solo se stessi)",
        default: "{{USER}} ha riattivato l'audio"
    }
});
