/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

export default definePlugin({
    name: "BetterGifPicker",
    description: "Fa aprire al selettore GIF la categoria Preferiti per impostazione predefinita",
    authors: [Devs.Samwich],
    tags: ["Emotes", "Customisation"],
    patches: [
        {
            find: "renderHeaderContent(){",
            replacement: [
                {
                    match: /(?<=state={resultType:)null/,
                    replace: '"Favorites"'
                }
            ]
        }
    ]
});
