/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";


export default definePlugin({
    name: "DynamicImageModalAPI",
    authors: [Devs.sadan, Devs.Nuckyz],
    description: "Consente di omettere larghezza o altezza quando si apre una finestra immagine",
    patches: [
        {
            find: ".renderLinkComponent",
            replacement: {
                // widthAndHeightPassed = w != null && w !== 0 && h == null || h === 0
                match: /(?<=\i=)(null!=\i&&0!==\i)&&(null!=\i&&0!==\i)/,
                replace: "($1)||($2)"
            }
        }
    ]
});
