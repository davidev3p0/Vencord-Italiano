/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { useSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Heading } from "@components/Heading";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { IS_WINDOWS } from "@utils/constants";
import { Select } from "@webpack/common";

export function WindowsMaterialSettings() {
    const settings = useSettings(["windowsMaterial"]);

    if (!IS_WINDOWS || IS_WEB || !VencordNative.native.supportsWindowsMaterial()) return null;

    return (
        <ErrorBoundary noop>
            <Heading tag="h5">Materiale dello sfondo</Heading>
            <Paragraph className={Margins.bottom8}>
                Effetti di sfondo trasparente di Windows. Serve un tema che supporti la trasparenza, altrimenti questa opzione non avrà effetto. Dopo aver modificato questa impostazione è necessario riavviare.
            </Paragraph>

            <Select
                placeholder="Nessuno"
                options={[
                    {
                        label: "Nessuno",
                        value: "none",
                        default: true
                    },
                    {
                        label: "Mica (usa tema di sistema e sfondo desktop per creare lo sfondo)",
                        value: "mica"
                    },
                    {
                        label: "Tabbed (variante di Mica con colorazione di sfondo più intensa)",
                        value: "tabbed"
                    },
                    {
                        label: "Acrylic (sfoca la finestra dietro Vesktop per uno sfondo traslucido)",
                        value: "acrylic"
                    }
                ]}
                closeOnSelect={true}
                select={v => (settings.windowsMaterial = v)}
                isSelected={v => v === settings.windowsMaterial}
                serialize={s => s}
            />
        </ErrorBoundary>
    );
}
