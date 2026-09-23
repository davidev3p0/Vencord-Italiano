/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import type { Channel, Emoji } from "@vencord/discord-types";

const settings = definePluginSettings({
    shownEmojis: {
        description: "Tipi di emoji da mostrare nel menu di completamento automatico.",
        type: OptionType.SELECT,
        default: "onlyUnicode",
        options: [
            { label: "Solo emoji Unicode", value: "onlyUnicode" },
            { label: "Emoji Unicode ed emoji del server corrente", value: "currentServer" },
            { label: "Emoji Unicode e tutte le emoji dei server (predefinito Discord)", value: "all" }
        ]
    }
});

export default definePlugin({
    name: "NoServerEmojis",
    authors: [Devs.UlyssesZhan],
    description: "Non mostrare le emoji dei server nel menu di completamento automatico.",
    tags: ["Emotes", "Servers"],
    settings,

    patches: [
        {
            find: "}searchWithoutFetchingLatest(",
            replacement: {
                match: /\.nameMatchesChain\(\i\)\.reduce\(\((\i),(\i)\)=>\{(?<=channel:(\i).+?)/,
                replace: "$&if($self.shouldSkip($3,$2))return $1;"
            }
        }
    ],

    shouldSkip(channel: Channel | undefined | null, emoji: Emoji) {
        if (emoji.type !== 1) {
            return false;
        }

        if (settings.store.shownEmojis === "onlyUnicode") {
            return true;
        }

        if (settings.store.shownEmojis === "currentServer") {
            return emoji.guildId !== (channel != null ? channel.getGuildId() : null);
        }

        return false;
    }
});
