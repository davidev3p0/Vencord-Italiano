/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { TextButton } from "@components/Button";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { OptionType } from "@utils/types";
import { Forms, SettingsRouter } from "@webpack/common";

import DecorPlugin from ".";
import DecorSection from "./ui/components/DecorSection";

export const settings = definePluginSettings({
    changeDecoration: {
        type: OptionType.COMPONENT,
        component({ closePluginSettings }) {
            if (!DecorPlugin.started) return <Forms.FormText>
                Abilita Decor e riavvia il client per cambiare la decorazione dell’avatar.
            </Forms.FormText>;

            return <div>
                <DecorSection hideTitle hideDivider noMargin />
                <Forms.FormText className={classes(Margins.top8, Margins.bottom8)}>
                    Puoi accedere alle decorazioni Decor anche dalla pagina <TextButton
                        variant="link"
                        onClick={async () => {
                            closePluginSettings();
                            SettingsRouter.openUserSettings("profile_panel");
                        }}
                    >Profili</TextButton>
                </Forms.FormText>
            </div>;
        }
    },
    agreedToGuidelines: {
        type: OptionType.BOOLEAN,
        description: "Linee guida accettate",
        hidden: true,
        default: false
    }
});
