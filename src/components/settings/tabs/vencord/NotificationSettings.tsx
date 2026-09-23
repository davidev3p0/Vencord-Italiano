/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { openNotificationLogModal } from "@api/Notifications/notificationLog";
import { useSettings } from "@api/Settings";
import { ErrorCard } from "@components/ErrorCard";
import { Flex } from "@components/Flex";
import { Margins } from "@utils/margins";
import { identity } from "@utils/misc";
import { Button, Forms, Modal,openModal, Select, Slider } from "@webpack/common";

export function NotificationSection() {
    return (
        <section className={Margins.top16}>
            <Forms.FormTitle tag="h5">Notifiche</Forms.FormTitle>
            <Forms.FormText className={Margins.bottom8}>
                Impostazioni per le notifiche inviate da Vencord.
                NON include le notifiche di Discord (messaggi, ecc.)
            </Forms.FormText>
            <Flex>
                <Button onClick={openNotificationSettingsModal}>
                    Impostazioni notifiche
                </Button>
                <Button onClick={openNotificationLogModal}>
                    Visualizza registro notifiche
                </Button>
            </Flex>
        </section>
    );
}

export function openNotificationSettingsModal() {
    openModal(props => (
        <Modal
            {...props}
            size="lg"
            title="Impostazioni notifiche"
        >
            <NotificationSettings />
        </Modal>
    ));
}

function NotificationSettings() {
    const settings = useSettings(["notifications.*"]).notifications;

    return (
        <>
            <Forms.FormTitle tag="h5">Stile notifiche</Forms.FormTitle>
            {settings.useNative !== "never" && Notification?.permission === "denied" && (
                <ErrorCard style={{ padding: "1em" }} className={Margins.bottom8}>
                    <Forms.FormTitle tag="h5">Permesso notifiche desktop negato</Forms.FormTitle>
                    <Forms.FormText>Hai negato il permesso per le notifiche. Le notifiche desktop non funzioneranno!</Forms.FormText>
                </ErrorCard>
            )}
            <Forms.FormText className={Margins.bottom8}>
                Alcuni plugin possono mostrarti notifiche. Sono disponibili in due stili:
                <ul>
                    <li><strong>Notifiche Vencord</strong>: Sono notifiche visualizzate nell’app</li>
                    <li><strong>Notifiche desktop</strong>: Notifiche desktop native (come quando ricevi una menzione)</li>
                </ul>
            </Forms.FormText>
            <Select
                placeholder="Stile notifiche"
                options={[
                    { label: "Usa le notifiche desktop solo quando Discord non è in primo piano", value: "not-focused", default: true },
                    { label: "Usa sempre le notifiche desktop", value: "always" },
                    { label: "Usa sempre le notifiche Vencord", value: "never" },
                ] satisfies Array<{ value: typeof settings["useNative"]; } & Record<string, any>>}
                closeOnSelect={true}
                select={v => settings.useNative = v}
                isSelected={v => v === settings.useNative}
                serialize={identity}
            />

            <Forms.FormTitle tag="h5" className={Margins.top16 + " " + Margins.bottom8}>Posizione notifiche</Forms.FormTitle>
            <Select
                isDisabled={settings.useNative === "always"}
                placeholder="Posizione notifiche"
                options={[
                    { label: "In basso a destra", value: "bottom-right", default: true },
                    { label: "In alto a destra", value: "top-right" },
                ] satisfies Array<{ value: typeof settings["position"]; } & Record<string, any>>}
                select={v => settings.position = v}
                isSelected={v => v === settings.position}
                serialize={identity}
            />

            <Forms.FormTitle tag="h5" className={Margins.top16 + " " + Margins.bottom8}>Durata notifiche</Forms.FormTitle>
            <Forms.FormText className={Margins.bottom16}>Imposta 0 s per non farle mai scadere automaticamente</Forms.FormText>
            <Slider
                disabled={settings.useNative === "always"}
                markers={[0, 1000, 2500, 5000, 10_000, 20_000]}
                minValue={0}
                maxValue={20_000}
                initialValue={settings.timeout}
                onValueChange={v => settings.timeout = v}
                onValueRender={v => (v / 1000).toFixed(2) + "s"}
                onMarkerRender={v => (v / 1000) + "s"}
                stickToMarkers={false}
            />

            <Forms.FormTitle tag="h5" className={Margins.top16 + " " + Margins.bottom8}>Limite registro notifiche</Forms.FormTitle>
            <Forms.FormText className={Margins.bottom16}>
                Numero di notifiche da salvare nel registro prima di rimuovere quelle più vecchie.
                Imposta <code>0</code> per disabilitare il registro notifiche e <code>∞</code> per non rimuovere mai automaticamente le vecchie notifiche
            </Forms.FormText>
            <Slider
                markers={[0, 25, 50, 75, 100, 200]}
                minValue={0}
                maxValue={200}
                stickToMarkers={true}
                initialValue={settings.logLimit}
                onValueChange={v => settings.logLimit = v}
                onValueRender={v => v === 200 ? "∞" : v}
                onMarkerRender={v => v === 200 ? "∞" : v}
            />
        </>
    );
}
