/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings({
    onlySnow: {
        type: OptionType.BOOLEAN,
        description: "Riproduci solo il tema Snow Halation",
        default: false,
        restartNeeded: true
    }
});

export default definePlugin({
    name: "SecretRingToneEnabler",
    description: "Riproduce sempre la versione segreta della suoneria di Discord, tranne durante gli eventi con suonerie speciali",
    tags: ["Notifications", "Fun"],
    authors: [Devs.AndrewDLO, Devs.FieryFlames, Devs.RamziAH],
    settings,
    patches: [
        {
            find: '"call_ringing_beat"',
            replacement: [
                {
                    match: /500!==\i\(\)\.random\(1,1e3\)/,
                    replace: "false"
                },
                {
                    predicate: () => settings.store.onlySnow,
                    match: /"call_ringing_beat",/,
                    replace: ""
                }
            ]
        }
    ]
});
