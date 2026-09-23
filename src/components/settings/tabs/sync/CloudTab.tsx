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

import { useSettings } from "@api/Settings";
import { authorizeCloud, deauthorizeCloud } from "@api/SettingsSync/cloudSetup";
import { deleteCloudSettings, eraseAllCloudData, getCloudSettings, getCloudSyncDirection, putCloudSettings, setCloudSyncDirection } from "@api/SettingsSync/cloudSync";
import { BaseText } from "@components/BaseText";
import { Button, ButtonProps } from "@components/Button";
import { CheckedTextInput } from "@components/CheckedTextInput";
import { Divider } from "@components/Divider";
import { Flex } from "@components/Flex";
import { FormSwitch } from "@components/FormSwitch";
import { Grid } from "@components/Grid";
import { Heading } from "@components/Heading";
import { CloudDownloadIcon, CloudUploadIcon, DeleteIcon, RestartIcon } from "@components/Icons";
import { Link } from "@components/Link";
import { Paragraph } from "@components/Paragraph";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { IconComponent } from "@utils/types";
import { ConfirmModal,openModal, Select, Tooltip, useState } from "@webpack/common";

function validateUrl(url: string) {
    try {
        new URL(url);
        return true;
    } catch {
        return "URL non valido";
    }
}

const SectionHeading = ({ text }: { text: string; }) => (
    <BaseText
        tag="h5"
        size="lg"
        weight="semibold"
        className={Margins.bottom16}
    >
        {text}
    </BaseText>
);

function ButtonWithIcon({ children, Icon, className, ...buttonProps }: ButtonProps & { Icon: IconComponent; }) {
    return (
        <Button {...buttonProps} className={classes("vc-cloud-icon-with-button", className)}>
            <Icon className={"vc-cloud-button-icon"} />
            {children}
        </Button>
    );
}

function CloudSetupSection() {
    const { cloud } = useSettings(["cloud.authenticated", "cloud.url"]);

    return (
        <section>
            <SectionHeading text="Integrazioni cloud" />

            <Paragraph size="md" className={Margins.bottom20}>
                Vencord include un’integrazione cloud che aggiunge funzioni come la sincronizzazione delle impostazioni tra dispositivi.
                <Link href="https://vencord.dev/cloud/privacy">Rispetta la tua privacy</Link> e il
                <Link href="https://github.com/Vencord/Backend">codice sorgente</Link> è distribuito con licenza AGPL 3.0, quindi
                puoi ospitarlo autonomamente.
            </Paragraph>
            <FormSwitch
                key="backend"
                title="Abilita integrazioni cloud"
                description="Verrà richiesta l’autorizzazione se non hai ancora configurato le integrazioni cloud."
                value={cloud.authenticated}
                onChange={v => {
                    if (v)
                        authorizeCloud();
                    else
                        cloud.authenticated = v;
                }}
            />
            <Heading tag="h5" className={Margins.top16}>URL backend</Heading>
            <Paragraph className={Margins.bottom8}>
                Backend da utilizzare per le integrazioni cloud.
            </Paragraph>
            <CheckedTextInput
                key="backendUrl"
                initialValue={cloud.url}
                onChange={async v => {
                    cloud.url = v;
                    cloud.authenticated = false;
                    deauthorizeCloud();
                }}
                validate={validateUrl}
            />

            <Grid columns={1} gap="1em" className={Margins.top8}>
                <ButtonWithIcon
                    variant="primary"
                    disabled={!cloud.authenticated}
                    onClick={async () => {
                        await deauthorizeCloud();
                        cloud.authenticated = false;
                        await authorizeCloud();
                    }}
                    Icon={RestartIcon}
                >
                    Autorizza di nuovo
                </ButtonWithIcon>
            </Grid>
        </section>
    );
}

function SettingsSyncSection() {
    const { cloud } = useSettings(["cloud.authenticated", "cloud.settingsSync"]);
    const [syncDirection, setSyncDirection] = useState(getCloudSyncDirection);
    const sectionEnabled = cloud.authenticated && cloud.settingsSync;

    return (
        <section>
            <SectionHeading text="Sincronizzazione impostazioni" />
            <Flex flexDirection="column" gap="1em">
                <FormSwitch
                    key="cloud-sync"
                    title="Abilita sincronizzazione impostazioni"
                    description="Salva le impostazioni di Vencord nel cloud per mantenerle facilmente sincronizzate su tutti i tuoi dispositivi"
                    value={cloud.settingsSync}
                    onChange={v => { cloud.settingsSync = v; }}
                    disabled={!cloud.authenticated}
                    hideBorder
                />

                <div>
                    <Heading tag="h5">
                        Regole di sincronizzazione per questo dispositivo
                    </Heading>
                    <Paragraph className={Margins.bottom8}>
                        Questa impostazione controlla come vengono trasferite le impostazioni tra <strong>questo dispositivo</strong> e il cloud.
                        Puoi sincronizzare le modifiche in entrambe le direzioni oppure scegliere una sorgente principale.
                    </Paragraph>
                    <Select
                        options={[
                            {
                                label: "Sincronizzazione bidirezionale (le modifiche vanno in entrambe le direzioni)",
                                value: "both",
                                default: true,
                            },
                            {
                                label: "Questo dispositivo è la sorgente (solo caricamento)",
                                value: "push",
                            },
                            {
                                label: "Il cloud è la sorgente (solo download)",
                                value: "pull",
                            },
                            {
                                label: "Non sincronizzare automaticamente (solo sincronizzazione manuale tramite i pulsanti sotto)",
                                value: "manual",
                            }
                        ]}
                        isSelected={v => v === syncDirection}
                        serialize={v => String(v)}
                        select={v => {
                            setCloudSyncDirection(v);
                            setSyncDirection(v);
                        }}
                        closeOnSelect={true}
                    />
                </div>

                <Grid columns={2} gap="1em" className={Margins.top20}>
                    <ButtonWithIcon
                        variant="positive"
                        disabled={!sectionEnabled}
                        onClick={() => putCloudSettings(true)}
                        Icon={CloudUploadIcon}
                    >
                        Carica impostazioni
                    </ButtonWithIcon>
                    <Tooltip text="Le impostazioni correnti verranno sostituite con quelle salvate nel cloud. Attenzione!">
                        {({ onMouseLeave, onMouseEnter }) => (
                            <ButtonWithIcon
                                variant="dangerPrimary"
                                onMouseLeave={onMouseLeave}
                                onMouseEnter={onMouseEnter}
                                disabled={!sectionEnabled}
                                onClick={() => getCloudSettings(true, true)}
                                Icon={CloudDownloadIcon}
                            >
                                Scarica impostazioni
                            </ButtonWithIcon>
                        )}
                    </Tooltip>
                </Grid>
            </Flex>
        </section>
    );
}

function ResetSection() {
    const { authenticated, settingsSync } = useSettings(["cloud.authenticated", "cloud.settingsSync"]).cloud;

    return (
        <section>
            <SectionHeading text="Reimposta dati cloud" />

            <Grid columns={2} gap="1em">
                <ButtonWithIcon
                    variant="dangerPrimary"
                    disabled={!authenticated || !settingsSync}
                    onClick={() => deleteCloudSettings()}
                    Icon={DeleteIcon}
                >
                    Elimina impostazioni dal cloud
                </ButtonWithIcon>
                <ButtonWithIcon
                    variant="dangerPrimary"
                    disabled={!authenticated}
                    onClick={() => openModal(props => (
                        <ConfirmModal
                            {...props}
                            title="Sei sicuro?"
                            subtitle="Una volta cancellati, i dati non potranno essere recuperati. L’operazione è irreversibile!"
                            onConfirm={eraseAllCloudData}
                            confirmText="Cancella"
                            cancelText="Annulla"
                        />
                    ))}
                    Icon={DeleteIcon}
                >
                    Elimina account cloud
                </ButtonWithIcon>
            </Grid>
        </section>
    );
}

function CloudTab() {
    return (
        <SettingsTab>
            <Flex flexDirection="column" gap="1em">
                <CloudSetupSection />
                <Divider />
                <SettingsSyncSection />
                <Divider />
                <ResetSection />
            </Flex>
        </SettingsTab>
    );
}

export default wrapTab(CloudTab, "Cloud");
