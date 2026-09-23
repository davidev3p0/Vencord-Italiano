/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { getUserSettingLazy } from "@api/UserSettings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { UserSettingsProtoStore } from "@webpack/common";

let savedStatus: string | null;

const StatusSettings = getUserSettingLazy<string>("status", "status")!;

const settings = definePluginSettings({
    statusToSet: {
        type: OptionType.SELECT,
        description: "Stato da impostare mentre giochi",
        options: [
            {
                label: "Online",
                value: "online",
            },
            {
                label: "Inattivo",
                value: "idle",
            },
            {
                label: "Non disturbare",
                value: "dnd",
                default: true
            },
            {
                label: "Invisibile",
                value: "invisible",
            }
        ]
    }
});

let lastStatus: string | null = null;

function handleUserSettingsChange() {
    const status = StatusSettings.getSetting();
    if (status !== lastStatus) {
        lastStatus = status;

        savedStatus = null;
    }
}

async function setStatus(status: string) {
    lastStatus = status;
    await StatusSettings.updateSetting(status);
}


export default definePlugin({
    name: "AutoDNDWhilePlaying",
    description: "Aggiorna automaticamente il tuo stato online (online, inattivo, non disturbare) quando avvii un gioco",
    tags: ["Activity", "Utility"],
    authors: [Devs.thororen],
    settings,

    flux: {
        async RUNNING_GAMES_CHANGE({ games }) {
            const status = StatusSettings.getSetting();

            if (games.length > 0) {
                if (status !== settings.store.statusToSet && status !== "invisible") {
                    savedStatus = status;
                    await setStatus(settings.store.statusToSet);
                }
            } else if (savedStatus) {
                const toRestore = savedStatus;
                savedStatus = null;

                if (status !== toRestore) {
                    await setStatus(toRestore);
                }
            }
        }
    },

    start() {
        lastStatus = StatusSettings.getSetting();
        UserSettingsProtoStore.addChangeListener(handleUserSettingsChange);
    },

    stop() {
        UserSettingsProtoStore.removeChangeListener(handleUserSettingsChange);
    }
});
