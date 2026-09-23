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

import { BaseText } from "@components/BaseText";
import ErrorBoundary from "@components/ErrorBoundary";
import { ErrorCard } from "@components/ErrorCard";
import { Flex } from "@components/Flex";
import { Paragraph } from "@components/Paragraph";
import { Devs, IS_MAC } from "@utils/constants";
import { Margins } from "@utils/margins";
import definePlugin from "@utils/types";
import { findByPropsLazy } from "@webpack";
import { React } from "@webpack/common";


const KbdStyles = findByPropsLazy("key", "combo");
const modKey = IS_MAC ? "cmd" : "ctrl";
const altKey = IS_MAC ? "opt" : "alt";

export default definePlugin({
    name: "Experiments",
    description: "Abilita l'accesso agli Esperimenti e ad altre funzioni di Discord riservate agli sviluppatori!",
    tags: ["Developers", "Utility"],
    authors: [
        Devs.Megu,
        Devs.Ven,
        Devs.Nickyux,
        Devs.BanTheNons,
        Devs.Nuckyz,
    ],

    patches: [
        {
            find: "Object.defineProperties(this,{isDeveloper",
            replacement: {
                match: /(?<={isDeveloper:\{[^}]+?,get:\(\)=>)\i/,
                replace: "true"
            }
        },
        {
            find: 'type:"user",revision',
            replacement: {
                match: /!(\i)(?=&&"CONNECTION_OPEN")/,
                replace: "!($1=true)"
            }
        },
        {
            find: 'placeholder: "Cerca esperimenti"',
            replacement: [
                {
                    match: /(?<=children:\[)(?=null!=.{0,150}"Installation ID:)/,
                    replace: "$self.WarningCard(),"
                },
                // for some reason the installation id and copy buttons are on
                // different lines so it looks stupid when the card above is added
                {
                    match: /(?<=,marginBottom:16)(?=\},children:\[)/,
                    replace: ',flexDirection:"row",alignItems:"center"'
                }
            ]
        },
        // Enable experiment embed on sent experiment links
        {
            find: "Clear Treatment ",
            replacement: [
                {
                    match: /\i\?\.isStaff\(\)/,
                    replace: "true"
                },
                // Fix some tricky experiments name causing a client crash
                {
                    match: /\.isStaffPersonal\(\).+?if\(null==(\i)\|\|null==\i(?=\)return null;)/,
                    replace: "$&||({})[$1]!=null"
                }
            ]
        },
        // Fix another function which cases crashes with tricky experiment names and the experiment embed
        {
            find: "}getServerAssignment(",
            replacement: {
                match: /}getServerAssignment\((\i),\i,\i\){/,
                replace: "$&if($1==null)return;"
            }
        },
        // Enable playground embed on sent playground links
        // dev://playground/mana, dev://playground/payments, dev://playground/virtual-currency,
        // dev://playground/nitro, dev://playground/mfa, dev://playground/cms, dev://playground/void
        {
            find: '"Open Playground',
            replacement: {
                match: "isStaff()||",
                replace: "$& true||"
            }
        },
        {
            // Expands the experiment uri regex to allow negative numbers, e.g. dev://experiment/2026-02-mana-playground-access/-1
            // -1 is "Not Eligible"
            find: '"^dev://experiment/',
            replacement: {
                match: /(?<=dev:\/\/experiment.{0,20}?)\[0-9\]\+/,
                replace: "[0-9-]+"
            }
        }
    ],

    settingsAboutComponent: () => {
        return (
            <Paragraph size="md">
                Suggerimento: puoi aprire gli strumenti per sviluppatori di Discord con {" "}
                <div className={KbdStyles.combo} style={{ display: "inline-flex" }}>
                    <kbd className={KbdStyles.key}>{modKey}</kbd>{" "}
                    <kbd className={KbdStyles.key}>{altKey}</kbd>{" "}
                    <kbd className={KbdStyles.key}>O</kbd>{" "}
                </div>
            </Paragraph>
        );
    },

    WarningCard: ErrorBoundary.wrap(() => (
        <ErrorCard id="vc-experiments-warning-card" className={Margins.bottom16}>
            <Flex flexDirection="column" gap={8}>
                <BaseText tag="h2" weight="bold" size="lg">Attenzione!!</BaseText>

                <Paragraph>
                    Gli esperimenti sono funzionalità di Discord non ancora pubblicate. Potrebbero non funzionare, danneggiare il client o persino causare la disabilitazione dell’account.
                </Paragraph>

                <Paragraph>
                    Usa gli esperimenti solo se sai cosa stai facendo. Vencord non è responsabile di eventuali problemi causati dalla loro attivazione. Se non sai cosa fa un esperimento, ignoralo. Non chiedere al supporto cosa faccia: probabilmente non lo sappiamo.
                </Paragraph>

                <Paragraph>
                    <b>Non puoi usare funzionalità lato server, come selezionare la casella "Invia al client".</b>
                </Paragraph>
            </Flex>
        </ErrorCard>
    ), { noop: true })
});
