/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Vendicated and contributors
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

import { openNotificationLogModal } from "@api/Notifications/notificationLog";
import { useSettings } from "@api/Settings";
import { Divider } from "@components/Divider";
import { FormSwitch } from "@components/FormSwitch";
import { FolderIcon, GithubIcon, LogIcon, PaintbrushIcon, RestartIcon } from "@components/Icons";
import { QuickAction, QuickActionCard } from "@components/settings/QuickAction";
import { SpecialCard } from "@components/settings/SpecialCard";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import { openContributorModal } from "@components/settings/tabs/plugins/ContributorModal";
import { openPluginModal } from "@components/settings/tabs/plugins/PluginModal";
import SettingsPlugin from "@plugins/_core/settings";
import { gitRemote } from "@shared/vencordUserAgent";
import { IS_WINDOWS } from "@utils/constants";
import { Margins } from "@utils/margins";
import { isPluginDev } from "@utils/misc";
import { relaunch } from "@utils/native";
import { ConfirmModal, Forms, openModal, React, useMemo, UserStore } from "@webpack/common";

import { DonateButtonComponent, isDonor } from "./DonateButton";
import { MacOSVibrancySettings } from "./MacVibrancySettings";
import { NotificationSection } from "./NotificationSettings";
import { WindowsMaterialSettings } from "./WindowsMaterialSettings";

const DEFAULT_DONATE_IMAGE = "https://cdn.discordapp.com/emojis/1026533090627174460.png";
const SHIGGY_DONATE_IMAGE = "https://media.discordapp.net/stickers/1039992459209490513.png";
const VENNIE_DONATOR_IMAGE = "https://cdn.discordapp.com/emojis/1238120638020063377.png";
const COZY_CONTRIB_IMAGE = "https://cdn.discordapp.com/emojis/1026533070955872337.png";
const DONOR_BACKGROUND_IMAGE = "https://media.discordapp.net/stickers/1311070116305436712.png?size=2048";
const CONTRIB_BACKGROUND_IMAGE = "https://media.discordapp.net/stickers/1311070166481895484.png?size=2048";

type KeysOfType<Object, Type> = {
    [K in keyof Object]: Object[K] extends Type ? K : never;
}[keyof Object];

function Switches() {
    const settings = useSettings(["useQuickCss", "enableReactDevtools", "frameless", "winNativeTitleBar", "transparent", "winCtrlQ", "disableMinSize"]);

    const Switches = [
        {
            key: "useQuickCss",
            title: "Abilita CSS personalizzato",
            description: "Applica il QuickCSS configurato"
        },
        !IS_WEB && (!IS_DISCORD_DESKTOP || !IS_WINDOWS ? {
            key: "frameless",
            title: "Disabilita cornice finestra",
            restartRequired: true
        } : {
            key: "winNativeTitleBar",
            title: "Usa la barra del titolo nativa di Windows invece di quella personalizzata di Discord",
            restartRequired: true
        }),
        !IS_WEB && {
            key: "transparent",
            title: "Abilita trasparenza finestra",
            description: "È necessario un tema che supporti la trasparenza, altrimenti non avrà effetto. Come effetto collaterale impedisce il ridimensionamento della finestra",
            restartRequired: true
        },
        IS_DISCORD_DESKTOP && {
            key: "disableMinSize",
            title: "Disabilita dimensione minima finestra",
            description: "Consente di ridimensionare la finestra a qualsiasi dimensione, anche inferiore al minimo di Discord",
            restartRequired: true
        },
        !IS_WEB && IS_WINDOWS && {
            key: "winCtrlQ",
            title: "Registra Ctrl+Q come scorciatoia per chiudere Discord (alternativa ad Alt+F4)",
            restartRequired: true
        },
        !IS_WEB && {
            key: "enableReactDevtools",
            title: "Abilita React Developer Tools",
            description: "Utile soprattutto agli sviluppatori di plugin. Ignora questa opzione se non sai cosa sia",
            restartRequired: true
        },
    ] satisfies Array<false | {
        key: KeysOfType<typeof settings, boolean>;
        title: string;
        description?: string;
        restartRequired?: boolean;
    }>;

    return Switches.map(setting => {
        if (!setting) {
            return null;
        }

        const { key, title, description, restartRequired } = setting;

        return (
            <FormSwitch
                key={key}
                title={title}
                description={description}
                value={settings[key]}
                hideBorder
                onChange={v => {
                    settings[key] = v;

                    if (restartRequired) {
                        openModal(props => (
                            <ConfirmModal
                                {...props}
                                title="Riavvio necessario"
                                subtitle="È necessario riavviare per applicare questa modifica"
                                confirmText="Riavvia ora"
                                cancelText="Più tardi!"
                                variant="primary"
                                onConfirm={relaunch}
                            />
                        ));
                    }
                }}
            />
        );
    });
}

function VencordSettings() {
    const donateImage = useMemo(() =>
        Math.random() > 0.5 ? DEFAULT_DONATE_IMAGE : SHIGGY_DONATE_IMAGE,
        []
    );

    const user = UserStore?.getCurrentUser();

    return (
        <SettingsTab>
            {isDonor(user?.id)
                ? (
                    <SpecialCard
                        title="Donazioni"
                        subtitle="Grazie per la donazione!"
                        description="Puoi gestire i tuoi vantaggi in qualsiasi momento scrivendo a @vending.machine."
                        cardImage={VENNIE_DONATOR_IMAGE}
                        backgroundImage={DONOR_BACKGROUND_IMAGE}
                        backgroundColor="#ED87A9"
                    >
                        <DonateButtonComponent />
                    </SpecialCard>
                )
                : (
                    <SpecialCard
                        title="Sostieni il progetto"
                        description="Valuta di sostenere lo sviluppo di Vencord con una donazione!"
                        cardImage={donateImage}
                        backgroundImage={DONOR_BACKGROUND_IMAGE}
                        backgroundColor="#c3a3ce"
                    >
                        <DonateButtonComponent />
                    </SpecialCard>
                )
            }

            {isPluginDev(user?.id) && (
                <SpecialCard
                    title="Contributi"
                    subtitle="Grazie per il tuo contributo!"
                    description="Dato che hai contribuito a Vencord, ora hai un nuovo badge!"
                    cardImage={COZY_CONTRIB_IMAGE}
                    backgroundImage={CONTRIB_BACKGROUND_IMAGE}
                    backgroundColor="#EDCC87"
                    buttonTitle="Vedi a cosa hai contribuito"
                    buttonOnClick={() => openContributorModal(user)}
                />
            )}

            <section>
                <Forms.FormTitle tag="h5">Azioni rapide</Forms.FormTitle>

                <QuickActionCard>
                    <QuickAction
                        Icon={LogIcon}
                        text="Registro notifiche"
                        action={openNotificationLogModal}
                    />
                    <QuickAction
                        Icon={PaintbrushIcon}
                        text="Modifica QuickCSS"
                        action={() => VencordNative.quickCss.openEditor()}
                    />
                    {!IS_WEB && (
                        <>
                            <QuickAction
                                Icon={RestartIcon}
                                text="Riavvia Discord"
                                action={relaunch}
                            />
                            <QuickAction
                                Icon={FolderIcon}
                                text="Apri cartella impostazioni"
                                action={() => VencordNative.settings.openFolder()}
                            />
                        </>
                    )}
                    <QuickAction
                        Icon={GithubIcon}
                        text="Visualizza codice sorgente"
                        action={() => VencordNative.native.openExternal("https://github.com/" + gitRemote)}
                    />
                </QuickActionCard>
            </section>

            <Divider />

            <section className={Margins.top16}>
                <Forms.FormTitle tag="h5">Impostazioni</Forms.FormTitle>
                <Forms.FormText className={Margins.bottom20} style={{ color: "var(--text-muted)" }}>
                    Suggerimento: puoi cambiare la posizione di questa sezione delle impostazioni nelle{" "}
                    <a onClick={() => openPluginModal(SettingsPlugin)}>
                        impostazioni del plugin Impostazioni
                    </a>!
                </Forms.FormText>

                <div className="vc-settings-switches">
                    <Switches />
                </div>
            </section>


            <MacOSVibrancySettings />
            <WindowsMaterialSettings />

            <NotificationSection />
        </SettingsTab>
    );
}

export default wrapTab(VencordSettings, "Impostazioni Vencord");
