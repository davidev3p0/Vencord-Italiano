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
import { Devs, IS_MAC } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { SettingsRouter } from "@webpack/common";


const settings = definePluginSettings({
    showNavigationButtons: {
        type: OptionType.BOOLEAN,
        description: "Mostra i pulsanti di navigazione indietro/avanti nella barra del titolo.",
        default: true,
        restartNeeded: true
    },
    overrideCommonKeybinds: {
        type: OptionType.BOOLEAN,
        description: "Consente a Discord di sostituire le scorciatoie più comuni per la navigazione tra schede (Ctrl+T, Ctrl+Maiusc+T, Ctrl+Tab, Ctrl+Maiusc+Tab, Ctrl+N). Funziona solo in alcuni browser che permettono alle scorciatoie dei siti di avere priorità su quelle native.",
        default: IS_VESKTOP,
        restartNeeded: true,
    }
});

export default definePlugin({
    name: "WebKeybinds",
    description: "Ripristina le scorciatoie mancanti nella versione web di Discord. Funziona completamente solo su Vesktop/Legcord, non nel browser",
    tags: ["Shortcuts"],
    authors: [Devs.Ven, Devs.Davri],
    enabledByDefault: true,

    settings,

    patches: [
        {
            // Replace the list of blocked keybinds with our own.
            find: '"Duplicate keyboard shortcuts defined:"',
            replacement: {
                match: /\[\.\.\.\i\.\i\.binds,/,
                replace: "$self.getBlockedKeybinds()||$&"
            }
        },
        {
            find: '?"BACK_FORWARD_NAVIGATION":',
            replacement: {
                match: /\({showBackForwardButtons:(\i)/,
                replace: "({showBackForwardButtons:($1=true)"
            },
            predicate: () => settings.store.showNavigationButtons,
        }
    ],

    start() {
        document.addEventListener("keydown", this.onKey);
    },

    stop() {
        document.removeEventListener("keydown", this.onKey);
    },

    onKey(e: KeyboardEvent) {
        const hasCtrl = e.ctrlKey || (e.metaKey && IS_MAC);

        // Cmd+, is a native shortcut on macos (Vesktop/src/main/mainWindow.ts)
        const hasNativeShortcut = IS_VESKTOP && IS_MAC;

        if (hasCtrl && e.key === "," && !hasNativeShortcut) {
            e.preventDefault();
            SettingsRouter.openUserSettings();
        }
    },

    getBlockedKeybinds() {
        // Zoom shortcuts, allowing these would cause unpredictable zooming behavior on macos
        const blocked: string[] = ["mod+plus", "mod+minus", "mod+0"];

        if (!settings.store.overrideCommonKeybinds)
            blocked.push("ctrl+shift+tab", "ctrl+tab", "mod+n", "mod+t", "mod+shift+t");

        return blocked.map(k => k.replace("mod", IS_MAC ? "cmd" : "ctrl"));
    }
});
