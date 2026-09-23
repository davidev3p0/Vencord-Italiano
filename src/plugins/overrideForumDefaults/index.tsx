/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings({
    defaultLayout: {
        type: OptionType.SELECT,
        options: [
            { label: "Elenco", value: 1, default: true },
            { label: "Galleria", value: 2 }
        ],
        description: "Layout da usare come predefinito"
    },
    defaultSortOrder: {
        type: OptionType.SELECT,
        options: [
            { label: "Attivi di recente", value: 0, default: true },
            { label: "Data di pubblicazione", value: 1 }
        ],
        description: "Ordinamento da usare come predefinito"
    }
});

export default definePlugin({
    name: "OverrideForumDefaults",
    description: "Consente di sostituire il layout e l'ordinamento predefiniti dei forum. Puoi comunque modificarli per ogni singolo canale",
    tags: ["Servers", "Organisation", "Customisation"],
    authors: [Devs.Inbestigator],
    patches: [
        {
            find: "getDefaultLayout(){",
            replacement: [
                {
                    match: /}getDefaultLayout\(\){/,
                    replace: "$&return $self.getLayout();"
                },
                {
                    match: /}getDefaultSortOrder\(\){/,
                    replace: "$&return $self.getSortOrder();"
                }
            ]
        }
    ],

    getLayout: () => settings.store.defaultLayout,
    getSortOrder: () => settings.store.defaultSortOrder,

    settings
});
