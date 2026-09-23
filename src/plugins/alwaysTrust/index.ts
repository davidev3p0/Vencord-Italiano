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
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings({
    domain: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Rimuovi l'avviso di dominio non attendibile quando apri i link",
        restartNeeded: true
    },
    file: {
        type: OptionType.BOOLEAN,
        default: true,
        description: "Rimuovi l'avviso 'Download potenzialmente pericoloso' quando apri i link",
        restartNeeded: true
    }
});

export default definePlugin({
    name: "AlwaysTrust",
    description: "Rimuove i fastidiosi avvisi per domini non attendibili e file sospetti",
    tags: ["Utility"],
    authors: [Devs.zt, Devs.Trwy],
    patches: [
        {
            find: '="MaskedLinkStore",',
            replacement: {
                match: /(?<=isTrustedDomain\(\i\){)return \i\(\i\)/,
                replace: "return true"
            },
            predicate: () => settings.store.domain
        },
        {
            find: "bitbucket.org",
            replacement: {
                match: /function \i\(\i\){(?=.{0,30}pathname:\i)/,
                replace: "$&return null;"
            },
            predicate: () => settings.store.file
        }
    ],
    settings
});
