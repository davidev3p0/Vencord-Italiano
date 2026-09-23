/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

import { definePluginSettings } from "@api/Settings";
import { Button } from "@components/Button";
import { OptionType } from "@utils/types";

import { openTranslateModal } from "./TranslateModal";

export const settings = definePluginSettings({
    receivedInput: {
        type: OptionType.STRING,
        description: "Lingua da cui tradurre i messaggi ricevuti",
        default: "auto",
        hidden: true
    },
    receivedOutput: {
        type: OptionType.STRING,
        description: "Lingua in cui tradurre i messaggi ricevuti",
        default: "en",
        hidden: true
    },
    sentInput: {
        type: OptionType.STRING,
        description: "Lingua da cui tradurre i tuoi messaggi",
        default: "auto",
        hidden: true
    },
    sentOutput: {
        type: OptionType.STRING,
        description: "Lingua in cui tradurre i tuoi messaggi",
        default: "en",
        hidden: true
    },
    service: {
        type: OptionType.SELECT,
        description: IS_WEB ? "Translation provider (not available on web)" : "Translation provider",
        hidden: IS_WEB,
        options: [
            { label: "Google Translate", value: "google", default: true },
            { label: "DeepL Free — chiave API richiesta", value: "deepl" },
            { label: "DeepL Pro — chiave API richiesta", value: "deepl-pro" },
            { label: "Kagi Translate — chiave API richiesta", value: "kagi" }
        ] as const,
        onChange: resetLanguageDefaults
    },
    deeplApiKey: {
        type: OptionType.STRING,
        displayName: "Chiave API DeepL",
        description: "La tua chiave API DeepL (da deepl.com/your-account)",
        default: ""
    },
    kagiSession: {
        type: OptionType.STRING,
        description: "Il tuo token di sessione Kagi (da kagi.com/settings?p=user_details)",
        default: ""
    },
    autoTranslate: {
        type: OptionType.BOOLEAN,
        description: "Traduci automaticamente i tuoi messaggi prima dell'invio. Puoi anche usare Maiusc+clic o il clic destro sul pulsante Traduci per attivare/disattivare questa funzione",
        default: false
    },
    showAutoTranslateTooltip: {
        type: OptionType.BOOLEAN,
        description: "Mostra un suggerimento sul pulsante della barra chat quando un messaggio viene tradotto automaticamente",
        default: true
    },
    manageTranslateSettings: {
        type: OptionType.COMPONENT,
        component: () => (
            <Button onClick={openTranslateModal}>
                Personalizza le lingue di traduzione e la traduzione automatica
            </Button>
        )
    }
}, {
    deeplApiKey: {
        hidden() { return this.store.service !== "deepl" && this.store.service !== "deepl-pro"; }
    },
    kagiSession: {
        hidden() { return this.store.service !== "kagi"; }
    }
}).withPrivateSettings<{
    dismissedAutoTranslateAlert?: boolean;
}>();

export function resetLanguageDefaults() {
    if (IS_WEB || settings.store.service === "google" || settings.store.service === "kagi") {
        settings.store.receivedInput = "auto";
        settings.store.receivedOutput = "en";
        settings.store.sentInput = "auto";
        settings.store.sentOutput = "en";
    } else {
        settings.store.receivedInput = "";
        settings.store.receivedOutput = "en-us";
        settings.store.sentInput = "";
        settings.store.sentOutput = "en-us";
    }
}
