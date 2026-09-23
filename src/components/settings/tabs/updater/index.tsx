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

import { useSettings } from "@api/Settings";
import { Button } from "@components/Button";
import { Card } from "@components/Card";
import { Divider } from "@components/Divider";
import { Flex } from "@components/Flex";
import { FormSwitch } from "@components/FormSwitch";
import { HeadingSecondary } from "@components/Heading";
import { Link } from "@components/Link";
import { Paragraph } from "@components/Paragraph";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { useAwaiter } from "@utils/react";
import { getRepo, isNewer, UpdateLogger } from "@utils/updater";
import { Forms, React } from "@webpack/common";

import gitHash from "~git-hash";

import { CommonProps, HashLink, Newer, Updatable } from "./Components";

function VesktopSection() {
    if (!IS_VESKTOP) return null;

    const [isVesktopOutdated] = useAwaiter<boolean>(VesktopNative.app.isOutdated, { fallbackValue: false });

    return (
        <Flex className={Margins.bottom20} flexDirection="column" gap="1em">
            <Card variant="info">
                <HeadingSecondary>Vesktop e Vencord</HeadingSecondary>
                <Paragraph>Vesktop e Vencord sono due elementi separati. Questo strumento aggiorna Vencord.</Paragraph>
                <Paragraph className={Margins.top8}>
                    Riceverai avvisi separati per gli aggiornamenti di Vesktop. Puoi anche aggiornarlo manualmente installando la <Link href="https://vesktop.dev/install">versione più recente</Link>.
                </Paragraph>
            </Card>

            {isVesktopOutdated && (
                <Card variant="warning">
                    <HeadingSecondary>Vesktop non aggiornato</HeadingSecondary>
                    <Flex flexDirection="column" gap="0.5em">
                        <Paragraph>La tua versione di Vesktop non è aggiornata!</Paragraph>
                        <Button variant="link" onClick={() => VesktopNative.app.openUpdater()}>Apri aggiornamento Vesktop</Button>
                    </Flex>
                </Card>
            )}
        </Flex>
    );
}

function Updater() {
    const settings = useSettings(["autoUpdate", "autoUpdateNotification"]);

    const [repo, err, repoPending] = useAwaiter(getRepo, {
        fallbackValue: "Caricamento...",
        onError: e => UpdateLogger.error("Impossibile recuperare il repository", err)
    });

    const commonProps: CommonProps = {
        repo,
        repoPending
    };

    return (
        <SettingsTab>
            <VesktopSection />

            <div className="vc-settings-switches">
                <FormSwitch
                    title="Aggiorna automaticamente"
                    description="Aggiorna automaticamente Vencord senza chiedere conferma"
                    value={settings.autoUpdate}
                    onChange={(v: boolean) => settings.autoUpdate = v}
                    hideBorder
                />
                <FormSwitch
                    title="Notifica al termine di un aggiornamento automatico"
                    description="Mostra una notifica quando Vencord viene aggiornato automaticamente"
                    value={settings.autoUpdateNotification}
                    onChange={(v: boolean) => settings.autoUpdateNotification = v}
                    disabled={!settings.autoUpdate}
                    hideBorder
                />
            </div>

            <Forms.FormTitle tag="h5" className={Margins.top20}>Repository</Forms.FormTitle>

            <Forms.FormText>
                {repoPending
                    ? repo
                    : err
                        ? "Recupero non riuscito - controlla la console"
                        : (
                            <Link href={repo}>
                                {repo.split("/").slice(-2).join("/")}
                            </Link>
                        )
                }
                {" "}
                (<HashLink hash={gitHash} repo={repo} disabled={repoPending} />)
            </Forms.FormText>

            <Divider className={classes(Margins.top16, Margins.bottom16)} />

            <Forms.FormTitle tag="h5">Aggiornamenti</Forms.FormTitle>

            {isNewer
                ? <Newer {...commonProps} />
                : <Updatable {...commonProps} />
            }
        </SettingsTab>
    );
}

export default IS_UPDATER_DISABLED
    ? null
    : wrapTab(Updater, "Aggiornamenti");
