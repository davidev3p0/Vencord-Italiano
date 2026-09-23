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
import { OptionType } from "@utils/types";

export default definePluginSettings({
    notices: {
        type: OptionType.BOOLEAN,
        description: "Mostra anche un avviso nella parte superiore dello schermo quando vieni rimosso (usalo se non vuoi perdere alcuna notifica).",
        default: false
    },
    offlineRemovals: {
        type: OptionType.BOOLEAN,
        description: "Avvisami all'avvio di Discord se sono stato rimosso mentre ero offline.",
        default: true
    },
    friends: {
        type: OptionType.BOOLEAN,
        description: "Avvisa quando un amico ti rimuove",
        default: true
    },
    friendRequestCancels: {
        type: OptionType.BOOLEAN,
        description: "Avvisa quando una richiesta di amicizia viene annullata",
        default: true
    },
    servers: {
        type: OptionType.BOOLEAN,
        description: "Avvisa quando vieni rimosso da un server",
        default: true
    },
    groups: {
        type: OptionType.BOOLEAN,
        description: "Avvisa quando vieni rimosso da una chat di gruppo",
        default: true
    }
});
