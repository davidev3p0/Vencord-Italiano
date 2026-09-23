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

import { downloadSettingsBackup, uploadSettingsBackup } from "@api/SettingsSync/offline";
import { Card } from "@components/Card";
import { Flex } from "@components/Flex";
import { Heading } from "@components/Heading";
import { Paragraph } from "@components/Paragraph";
import { SettingsTab, wrapTab } from "@components/settings/tabs/BaseTab";
import { Margins } from "@utils/margins";
import { Button, Text } from "@webpack/common";

function BackupAndRestoreTab() {
    return (
        <SettingsTab>
            <Flex flexDirection="column" gap="0.5em">
                <Card variant="warning">
                    <Heading tag="h4">Attenzione</Heading>
                    <Paragraph>Importare un file di impostazioni sovrascriverà le impostazioni correnti.</Paragraph>
                </Card>

                <Text variant="text-md/normal" className={Margins.bottom8}>
                    Puoi importare ed esportare le impostazioni di Vencord come file JSON.
                    In questo modo puoi trasferire facilmente le impostazioni su un altro dispositivo,
                    oppure recuperarle dopo aver reinstallato Vencord o Discord.
                </Text>

                <Heading tag="h4">L’esportazione delle impostazioni contiene:</Heading>
                <Text variant="text-md/normal" className={Margins.bottom8}>
                    <ul>
                        <li>&mdash; QuickCSS personalizzato</li>
                        <li>&mdash; Link dei temi</li>
                        <li>&mdash; Impostazioni plugin</li>
                    </ul>
                </Text>

                <Flex>
                    <Button onClick={() => uploadSettingsBackup()}>
                        Importa impostazioni
                    </Button>
                    <Button onClick={downloadSettingsBackup}>
                        Esporta impostazioni
                    </Button>
                </Flex>
            </Flex>
        </SettingsTab >
    );
}

export default wrapTab(BackupAndRestoreTab, "Backup e ripristino");
