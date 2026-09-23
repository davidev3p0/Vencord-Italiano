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
import { hash as h64 } from "@intrnl/xxhash64";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { useMemo } from "@webpack/common";

// Calculate a CSS color string based on the user ID
function calculateNameColorForUser(id?: string) {
    const { lightness } = settings.use(["lightness"]);
    const idHash = useMemo(() => id ? h64(id) : null, [id]);

    return idHash && `hsl(${idHash % 360n}, 100%, ${lightness}%)`;
}

const settings = definePluginSettings({
    lightness: {
        description: "Luminosità, in %. Modificala se i colori sono troppo chiari o troppo scuri",
        type: OptionType.NUMBER,
        default: 70,
    },
    memberListColors: {
        description: "Sostituisci i colori dei ruoli nell'elenco membri",
        restartNeeded: true,
        type: OptionType.BOOLEAN,
        default: true
    },
    applyColorOnlyToUsersWithoutColor: {
        description: "Applica i colori solo agli utenti che non hanno un colore predefinito",
        restartNeeded: false,
        type: OptionType.BOOLEAN,
        default: false
    },
    applyColorOnlyInDms: {
        displayName: "Applica colore solo nei messaggi diretti",
        description: "Applica i colori solo nei messaggi diretti; non applicarli nei server.",
        restartNeeded: false,
        type: OptionType.BOOLEAN,
        default: false
    }
});

export default definePlugin({
    name: "IrcColors",
    description: "Rende unici i colori dei nomi utente in chat, come nei client IRC",
    tags: ["Appearance", "Customisation"],
    authors: [Devs.Grzesiek11, Devs.jamesbt365],
    settings,

    patches: [
        {
            find: '="SYSTEM_TAG"',
            replacement: {
                // Override colorString with our custom color and disable gradients if applying the custom color.
                match: /(?<=colorString:\i,colorStrings:\i,colorRoleName:\i.*?}=)(\i),/,
                replace: "$self.wrapMessageColorProps($1, arguments[0]),"
            }
        },
        {
            find: "#{intl::GUILD_OWNER}),children:",
            replacement: {
                match: /(?<=roleName:\i,)colorString:/,
                replace: "colorString:$self.calculateNameColorForListContext(arguments[0]),originalColor:"
            },
            predicate: () => settings.store.memberListColors
        }
    ],

    wrapMessageColorProps(colorProps: { colorString: string, colorStrings?: Record<"primaryColor" | "secondaryColor" | "tertiaryColor", string>; }, context: any) {
        try {
            const colorString = this.calculateNameColorForMessageContext(context);
            if (colorString === colorProps.colorString) {
                return colorProps;
            }

            return {
                ...colorProps,
                colorString,
                colorStrings: colorProps.colorStrings && {
                    primaryColor: colorString,
                    secondaryColor: undefined,
                    tertiaryColor: undefined
                }
            };
        } catch (e) {
            console.error("Failed to calculate message color strings:", e);
            return colorProps;
        }
    },

    calculateNameColorForMessageContext(context: any) {
        const userId: string | undefined = context?.message?.author?.id;
        const colorString = context?.author?.colorString;
        const color = calculateNameColorForUser(userId);

        // Color preview in role settings
        if (context?.message?.channel_id === "1337" && userId === "313337")
            return colorString;

        if (settings.store.applyColorOnlyInDms && !context?.channel?.isPrivate()) {
            return colorString;
        }

        return (!settings.store.applyColorOnlyToUsersWithoutColor || !colorString)
            ? color
            : colorString;
    },

    calculateNameColorForListContext(context: any) {
        try {
            const id = context?.user?.id;
            const colorString = context?.colorString;
            const color = calculateNameColorForUser(id);

            if (settings.store.applyColorOnlyInDms && context?.guildId !== undefined) {
                return colorString;
            }

            return (!settings.store.applyColorOnlyToUsersWithoutColor || !colorString)
                ? color
                : colorString;
        } catch (e) {
            console.error("Failed to calculate name color for list context:", e);
        }
    }
});
