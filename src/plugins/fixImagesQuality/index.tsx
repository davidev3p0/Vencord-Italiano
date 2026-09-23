/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Card } from "@components/Card";
import { Flex } from "@components/Flex";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { Devs } from "@utils/constants";
import { Logger } from "@utils/Logger";
import definePlugin, { OptionType } from "@utils/types";

const settings = definePluginSettings({
    originalImagesInChat: {
        type: OptionType.BOOLEAN,
        description: "Carica anche l'immagine originale nella chat. ATTENZIONE: leggi le avvertenze sopra",
        default: false,
    }
});

export default definePlugin({
    name: "FixImagesQuality",
    description: "Migliora la qualità delle immagini caricandole alla risoluzione originale",
    tags: ["Media", "Appearance"],
    authors: [Devs.Nuckyz, Devs.Ven],
    settings,

    patches: [
        {
            find: ".handleImageLoad)",
            replacement: {
                match: /getSrc\(\i\)\{/,
                replace: "$&var _vcSrc=$self.getSrc(this?.props,arguments[1]);if(_vcSrc)return _vcSrc;"
            }
        }
    ],

    settingsAboutComponent() {
        return (
            <Card variant="normal">
                <Flex flexDirection="column" gap="4px">
                    <Paragraph size="md" weight="semibold">Il comportamento predefinito è il seguente:</Paragraph>
                    <Paragraph>
                        <ul>
                            <li>&mdash; In chat verranno caricate immagini ottimizzate ma a piena risoluzione.</li>
                            <li>&mdash; Nella finestra dell’immagine verrà caricata l’immagine originale.</li>
                        </ul>
                    </Paragraph>
                    <Paragraph size="md" weight="semibold" className={Margins.top8}>Puoi anche abilitare l’immagine originale in chat, ma considera le seguenti limitazioni:</Paragraph>
                    <Paragraph>
                        <ul>
                            <li>&mdash; Le immagini animate (GIF, WebP, ecc.) in chat saranno sempre animate, anche quando l’app non è in primo piano.</li>
                            <li>&mdash; Potrebbe causare rallentamenti.</li>
                        </ul>
                    </Paragraph>
                </Flex>
            </Card>
        );
    },

    getSrc(props: { src: string; width: number; height: number; contentType: string; mosaicStyleAlt?: boolean; trigger?: string; }, freeze?: boolean) {
        if (!props?.src) return;

        try {
            const { contentType, height, src, width, mosaicStyleAlt, trigger } = props;

            // Embed images do not have a content type set.
            // It's difficult to differentiate between images and videos. but mosaicStyleAlt seems exclusive to images
            const isImage = contentType?.startsWith("image/") ?? (typeof mosaicStyleAlt === "boolean");
            if (!isImage || src.startsWith("data:")) return;

            const url = new URL(src);
            if (!url.pathname.startsWith("/attachments/")) return;

            url.searchParams.set("animated", String(!freeze));
            if (freeze && url.pathname.endsWith(".gif")) {
                // gifs don't support animated=false, so we have no choice but to use webp
                url.searchParams.set("format", "webp");
            }

            const isModal = !!trigger;
            if (!settings.store.originalImagesInChat && !isModal) {
                // make sure the image is not too large
                const pixels = width * height;
                const limit = 2000 * 1200;

                if (pixels <= limit)
                    return url.toString();

                const scale = Math.sqrt(pixels / limit);

                url.searchParams.set("width", Math.round(width / scale).toString());
                url.searchParams.set("height", Math.round(height / scale).toString());
                return url.toString();
            }

            url.hostname = "cdn.discordapp.com";
            return url.toString();
        } catch (e) {
            new Logger("FixImagesQuality").error("Failed to make image src", e);
            return;
        }
    }
});
