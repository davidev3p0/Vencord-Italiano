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

import "./styles.css";

import { BaseText } from "@components/BaseText";
import { Card } from "@components/Card";
import { Flex } from "@components/Flex";
import { Link } from "@components/Link";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import { getStylusWebStoreUrl } from "@utils/web";
import { Forms, React, TabBar, useState } from "@webpack/common";

import { CspErrorCard } from "./CspErrorCard";
import { LocalThemesTab } from "./LocalThemesTab";
import { OnlineThemesTab } from "./OnlineThemesTab";

const enum ThemeTab {
    LOCAL,
    ONLINE
}

function ThemesTab() {
    const [currentTab, setCurrentTab] = useState(ThemeTab.LOCAL);

    return (
        <SettingsTab>
            <TabBar
                type="top"
                look="brand"
                className="vc-settings-tab-bar"
                selectedItem={currentTab}
                onItemSelect={setCurrentTab}
            >
                <TabBar.Item
                    className="vc-settings-tab-bar-item"
                    id={ThemeTab.LOCAL}
                >
                    Temi locali
                </TabBar.Item>
                <TabBar.Item
                    className="vc-settings-tab-bar-item"
                    id={ThemeTab.ONLINE}
                >
                    Temi online
                </TabBar.Item>
            </TabBar>

            <Flex flexDirection="column" gap="1em">
                <CspErrorCard />

                <Card variant="warning">
                    <BaseText tag="h3" size="md" weight="medium" className={Margins.bottom8}>Prestazioni dei temi</BaseText>
                    <Paragraph>
                        I temi e il CSS personalizzato possono causare rallentamenti importanti! Se riscontri problemi di prestazioni, prova a disabilitare temi e CSS per verificare se sono la causa. La causa più comune di rallentamenti è l’operatore <code>:has()</code>.
                    </Paragraph>
                </Card>

                {currentTab === ThemeTab.LOCAL && <LocalThemesTab />}
                {currentTab === ThemeTab.ONLINE && <OnlineThemesTab />}
            </Flex>
        </SettingsTab>
    );
}

function UserscriptThemesTab() {
    return (
        <SettingsTab>
            <Card variant="danger">
                <Forms.FormTitle tag="h5">I temi non sono supportati nello Userscript!</Forms.FormTitle>

                <Forms.FormText>
                    Puoi installare i temi usando invece l’<Link href={getStylusWebStoreUrl()}>estensione Stylus</Link>!
                </Forms.FormText>
            </Card>
        </SettingsTab>
    );
}

export default IS_USERSCRIPT
    ? wrapTab(UserscriptThemesTab, "Temi")
    : wrapTab(ThemesTab, "Temi");
