/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { IS_MAC } from "@utils/constants";
import { Margins } from "@utils/margins";
import { identity } from "@utils/misc";
import { Forms, Select } from "@webpack/common";

export function MacOSVibrancySettings() {
    const settings = useSettings(["macosVibrancyStyle"]);

    if (!IS_MAC || IS_WEB) return null;

    return (
        <ErrorBoundary noop>
            <Forms.FormTitle tag="h5">Stile vibrancy finestra macOS (richiede riavvio)</Forms.FormTitle>
            <Select
                className={Margins.bottom20}
                placeholder="Stile vibrancy finestra"
                options={[
                    // Sorted from most opaque to most transparent
                    {
                        label: "Nessuna vibrancy", value: undefined
                    },
                    {
                        label: "Sotto la pagina (colorazione finestra)",
                        value: "under-page"
                    },
                    {
                        label: "Contenuto",
                        value: "content"
                    },
                    {
                        label: "Finestra",
                        value: "window"
                    },
                    {
                        label: "Selezione",
                        value: "selection"
                    },
                    {
                        label: "Barra del titolo",
                        value: "titlebar"
                    },
                    {
                        label: "Intestazione",
                        value: "header"
                    },
                    {
                        label: "Barra laterale",
                        value: "sidebar"
                    },
                    {
                        label: "Suggerimento",
                        value: "tooltip"
                    },
                    {
                        label: "Menu",
                        value: "menu"
                    },
                    {
                        label: "Popup",
                        value: "popover"
                    },
                    {
                        label: "Interfaccia a schermo intero (trasparente ma leggermente attenuata)",
                        value: "fullscreen-ui"
                    },
                    {
                        label: "HUD (massima trasparenza)",
                        value: "hud"
                    },
                ]}
                select={v => settings.macosVibrancyStyle = v}
                isSelected={v => settings.macosVibrancyStyle === v}
                serialize={identity}
            />
        </ErrorBoundary>
    );
}
