/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { MessageJSON } from "@vencord/discord-types";
import { ChannelType } from "@vencord/discord-types/enums";
import { ChannelStore, ReadStateStore, UserStore } from "@webpack/common";

const settings = definePluginSettings({
    channelToAffect: {
        type: OptionType.SELECT,
        description: "Seleziona il tipo di messaggi diretti su cui deve agire il plugin",
        options: [
            { label: "Entrambi", value: "both_dms", default: true },
            { label: "Messaggi diretti utente", value: "user_dm" },
            { label: "Messaggi diretti di gruppo", value: "group_dm" },
        ]
    },
    allowMentions: {
        type: OptionType.BOOLEAN,
        description: "Riproduci un avviso sonoro per le @menzioni",
        default: false,
    },
    allowEveryone: {
        type: OptionType.BOOLEAN,
        description: "Riproduci un avviso sonoro per @everyone e @here nei messaggi diretti di gruppo",
        default: false,
    },
});

export default definePlugin({
    name: "OnePingPerDM",
    description: "Se un utente invia più messaggi diretti non letti, riceverai un solo avviso sonoro. Leggi i messaggi per reimpostare il limite",
    tags: ["Notifications", "Customisation"],
    authors: [Devs.ProffDea],
    settings,
    patches: [
        {
            find: '"NotificationStore"',
            replacement: [
                {
                    match: /(\i\.\i\.getDesktopType\(\)===\i\.\i\.NEVER)\)/,
                    replace: "$&if(!$self.isPrivateChannelRead(arguments[0]?.message))return;else "
                },
                {
                    match: /sound:(\i\?\i:void 0,volume:\i,onClick)/,
                    replace: "sound:!$self.isPrivateChannelRead(arguments[0]?.message)?undefined:$1"
                }
            ]
        }
    ],
    isPrivateChannelRead(message: MessageJSON) {
        const channelType = ChannelStore.getChannel(message.channel_id)?.type;
        if (
            (channelType !== ChannelType.DM && channelType !== ChannelType.GROUP_DM) ||
            (channelType === ChannelType.DM && settings.store.channelToAffect === "group_dm") ||
            (channelType === ChannelType.GROUP_DM && settings.store.channelToAffect === "user_dm") ||
            (settings.store.allowMentions && message.mentions.some(m => m.id === UserStore.getCurrentUser().id)) ||
            (settings.store.allowEveryone && message.mention_everyone)
        ) {
            return true;
        }
        return ReadStateStore.getOldestUnreadMessageId(message.channel_id) === message.id;
    },
});
