/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "ImageLink",
    description: "Non nascondere mai i link alle immagini nei messaggi, anche se sono l'unico contenuto",
    tags: ["Media", "Appearance"],
    authors: [Devs.Kyuuhachi, Devs.Sqaaakoi],

    patches: [
        {
            find: "unknownUserMentionPlaceholder:",
            replacement: {
                // SimpleEmbedTypes.has(embed.type) && isEmbedInline(embed)
                match: /\i\.has\(\i\.type\)&&\(0,\i\.\i\)\(\i\)/,
                replace: "false",
            }
        }
    ]
});
