/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated, ant0n, FieryFlames and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { UserStore } from "@webpack/common";

export const settings = definePluginSettings({
    superReactByDefault: {
        type: OptionType.BOOLEAN,
        description: "Il selettore reazioni userà le Super Reazioni per impostazione predefinita",
        default: true,
    },
    unlimitedSuperReactionPlaying: {
        type: OptionType.BOOLEAN,
        description: "Rimuovi il limite di Super Reazioni riprodotte contemporaneamente",
        default: false,
    },

    superReactionPlayingLimit: {
        description: "Numero massimo di Super Reazioni da riprodurre contemporaneamente. 0 per disabilitarne la riproduzione",
        type: OptionType.SLIDER,
        default: 20,
        markers: [0, 5, 10, 20, 40, 60, 80, 100],
        stickToMarkers: true,
    },
}, {
    superReactionPlayingLimit: {
        disabled() { return this.store.unlimitedSuperReactionPlaying; },
    }
});

export default definePlugin({
    name: "SuperReactionTweaks",
    description: "Personalizza il limite di Super Reazioni riprodotte contemporaneamente e usa le Super Reazioni per impostazione predefinita",
    tags: ["Reactions", "Emotes"],
    authors: [Devs.FieryFlames, Devs.ant0n],
    patches: [
        {
            find: ",BURST_REACTION_EFFECT_PLAY",
            replacement: [
                {
                    // if (inlinedCalculatePlayingCount(a,b) >= limit) return;
                    match: /(BURST_REACTION_EFFECT_PLAY:(?:\i=>|function\(\i\)){.+?if\()(\(?(?:function)?\(\i,\i\)(?:=>)?{.+?\(\i,\i\))>=5+?(?=\))/,
                    replace: (_, rest, playingCount) => `${rest}!$self.shouldPlayBurstReaction(${playingCount})`
                }
            ]
        },
        {
            find: ".EMOJI_PICKER_CONSTANTS_EMOJI_CONTAINER_PADDING_HORIZONTAL)",
            replacement: {
                match: /(openPopoutType:void 0(?=.+?isBurstReaction:(\i).+?\.intention===(\i\.\i\.REACTION)).+?\[\2,\i\]=\i\.useState\()!1\)(?<=pickerIntention:(\i).+?)/,
                replace: (_, rest, _isBurstReactionVariable, REACTION_INTENTION, pickerIntention) => `${rest}$self.shouldSuperReactByDefault&&${pickerIntention}===${REACTION_INTENTION})`
            }
        }
    ],
    settings,

    shouldPlayBurstReaction(playingCount: number) {
        if (settings.store.unlimitedSuperReactionPlaying) return true;
        if (settings.store.superReactionPlayingLimit > playingCount) return true;
        return false;
    },

    get shouldSuperReactByDefault() {
        return settings.store.superReactByDefault && UserStore.getCurrentUser().premiumType != null;
    }
});
