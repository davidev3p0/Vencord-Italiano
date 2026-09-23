/*
 * Vencord, a Discord client mod
 * Copyright (c) 2024 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import { Paragraph } from "@components/Paragraph";
import { Devs, IS_MAC } from "@utils/constants";
import definePlugin, { OptionType, PluginNative, ReporterTestable } from "@utils/types";
import { Activity, ActivityAssets, ActivityButton } from "@vencord/discord-types";
import { ActivityFlags, ActivityStatusDisplayType, ActivityType } from "@vencord/discord-types/enums";
import { ApplicationAssetUtils, FluxDispatcher } from "@webpack/common";

const Native = VencordNative.pluginHelpers.AppleMusicRichPresence as PluginNative<typeof import("./native")>;

export interface TrackData {
    name: string;
    album?: string;
    artist?: string;

    appleMusicLink?: string;
    appleMusicArtistLink?: string;
    songLink?: string;

    albumArtwork?: string;
    artistArtwork?: string;

    playerPosition?: number;
    duration?: number;
}

const enum AssetImageType {
    Album = "Album",
    Artist = "Artist",
    Disabled = "Disabled"
}

const enum LinkType {
    Album = "Album",
    Artist = "Artist",
    Disabled = "Disabled"
}

const applicationId = "1239490006054207550";

function setActivity(activity: Activity | null) {
    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity,
        socketId: "AppleMusic",
    });
}

const settings = definePluginSettings({
    activityType: {
        type: OptionType.SELECT,
        description: "Tipo di attività",
        options: [
            { label: "In gioco", value: ActivityType.PLAYING, default: true },
            { label: "In ascolto", value: ActivityType.LISTENING }
        ],
    },
    statusDisplayType: {
        description: "Mostra il nome del brano/artista nell'elenco membri",
        type: OptionType.SELECT,
        options: [
            {
                label: "Non mostrare (mostra un messaggio di ascolto generico)",
                value: "off",
                default: true
            },
            {
                label: "Mostra il nome dell'artista",
                value: "artist"
            },
            {
                label: "Mostra il nome del brano",
                value: "track"
            }
        ]
    },
    refreshInterval: {
        type: OptionType.SLIDER,
        description: "Intervallo tra gli aggiornamenti dell'attività (secondi)",
        markers: [1, 2, 2.5, 3, 5, 10, 15],
        default: 5,
        restartNeeded: true,
    },
    enableTimestamps: {
        type: OptionType.BOOLEAN,
        description: "Abilita i timestamp",
        default: true,
    },
    enableButtons: {
        type: OptionType.BOOLEAN,
        description: "Abilita i pulsanti",
        default: true,
    },
    nameString: {
        type: OptionType.STRING,
        description: "Formato del nome attività",
        default: "Apple Music"
    },
    detailsString: {
        type: OptionType.STRING,
        description: "Formato dei dettagli attività",
        default: "{name}"
    },
    stateString: {
        type: OptionType.STRING,
        description: "Formato dello stato attività",
        default: "{artist} · {album}"
    },
    detailsLink: {
        type: OptionType.SELECT,
        description: "Link dettagli attività",
        options: [
            { label: "Album", value: LinkType.Album, default: true },
            { label: "Artista", value: LinkType.Artist },
            { label: "Disabilitato", value: LinkType.Disabled }
        ],
    },
    stateLink: {
        type: OptionType.SELECT,
        description: "Link stato attività",
        options: [
            { label: "Album", value: LinkType.Album },
            { label: "Artista", value: LinkType.Artist, default: true },
            { label: "Disabilitato", value: LinkType.Disabled }
        ],
    },
    largeImageType: {
        type: OptionType.SELECT,
        description: "Tipo immagine grande dell'attività",
        options: [
            { label: "Copertina album", value: AssetImageType.Album, default: true },
            { label: "Immagine artista", value: AssetImageType.Artist },
            { label: "Disabilitato", value: AssetImageType.Disabled }
        ],
    },
    largeTextString: {
        type: OptionType.STRING,
        description: "Formato testo grande dell'attività",
        default: "{album}"
    },
    largeImageLink: {
        type: OptionType.SELECT,
        description: "Link immagine grande dell'attività",
        options: [
            { label: "Album", value: LinkType.Album, default: true },
            { label: "Artista", value: LinkType.Artist },
            { label: "Disabilitato", value: LinkType.Disabled }
        ],
    },
    smallImageType: {
        type: OptionType.SELECT,
        description: "Tipo immagine piccola dell'attività",
        options: [
            { label: "Copertina album", value: AssetImageType.Album },
            { label: "Immagine artista", value: AssetImageType.Artist, default: true },
            { label: "Disabilitato", value: AssetImageType.Disabled }
        ],
    },
    smallTextString: {
        type: OptionType.STRING,
        description: "Formato testo piccolo dell'attività",
        default: "{artist}"
    },
    smallImageLink: {
        type: OptionType.SELECT,
        description: "Link immagine piccola dell'attività",
        options: [
            { label: "Album", value: LinkType.Album },
            { label: "Artista", value: LinkType.Artist, default: true },
            { label: "Disabilitato", value: LinkType.Disabled }
        ],
    },
});

function customFormat(formatStr: string, data: TrackData) {
    return formatStr
        .replaceAll("{name}", data.name)
        .replaceAll("{album}", data.album ?? "")
        .replaceAll("{artist}", data.artist ?? "");
}

function getLink(type: LinkType, data: TrackData) {
    return type === LinkType.Album
        ? data.appleMusicLink
        : type === LinkType.Artist
            ? data.appleMusicArtistLink
            : undefined;
}

function getImageAsset(type: AssetImageType, data: TrackData) {
    const source = type === AssetImageType.Album
        ? data.albumArtwork
        : data.artistArtwork;

    if (!source) return undefined;

    return ApplicationAssetUtils.fetchAssetIds(applicationId, [source]).then(ids => ids[0]);
}

export default definePlugin({
    name: "AppleMusicRichPresence",
    description: "Rich Presence Discord per Apple Music!",
    tags: ["Activity", "Media"],
    authors: [Devs.RyanCaoDev],
    hidden: !IS_MAC,
    reporterTestable: ReporterTestable.None,

    settingsAboutComponent() {
        return <>
            <Paragraph>
                Nelle stringhe personalizzabili del formato attività puoi usare diversi segnaposto speciali per includere i dati del brano!{" "}
                <code>{"{name}"}</code> viene sostituito con il nome del brano; <code>{"{artist}"}</code> viene sostituito con il nome dell’artista o degli artisti; e <code>{"{album}"}</code> viene sostituito con il nome dell’album.
            </Paragraph>
        </>;
    },

    settings,

    start() {
        this.updatePresence();
        this.updateInterval = setInterval(() => { this.updatePresence(); }, settings.store.refreshInterval * 1000);
    },

    stop() {
        clearInterval(this.updateInterval);
        FluxDispatcher.dispatch({ type: "LOCAL_ACTIVITY_UPDATE", activity: null });
    },

    updatePresence() {
        this.getActivity().then(activity => { setActivity(activity); });
    },

    async getActivity(): Promise<Activity | null> {
        const trackData = await Native.fetchTrackData();
        if (!trackData) return null;

        const [largeImageAsset, smallImageAsset] = await Promise.all([
            getImageAsset(settings.store.largeImageType, trackData),
            getImageAsset(settings.store.smallImageType, trackData)
        ]);

        const assets: ActivityAssets = {};

        const isRadio = Number.isNaN(trackData.duration) && (trackData.playerPosition === 0);

        if (settings.store.largeImageType !== AssetImageType.Disabled) {
            assets.large_image = largeImageAsset;
            if (!isRadio) assets.large_text = customFormat(settings.store.largeTextString, trackData);
            assets.large_url = getLink(settings.store.largeImageLink, trackData);
        }

        if (settings.store.smallImageType !== AssetImageType.Disabled) {
            assets.small_image = smallImageAsset;
            if (!isRadio) assets.small_text = customFormat(settings.store.smallTextString, trackData);
            assets.small_url = getLink(settings.store.smallImageLink, trackData);
        }

        const buttons: ActivityButton[] = [];

        if (settings.store.enableButtons) {
            if (trackData.appleMusicLink)
                buttons.push({
                    label: "Ascolta su Apple Music",
                    url: trackData.appleMusicLink,
                });

            if (trackData.songLink)
                buttons.push({
                    label: "Visualizza su SongLink",
                    url: trackData.songLink,
                });
        }

        return {
            application_id: applicationId,

            name: customFormat(settings.store.nameString, trackData),
            details: customFormat(settings.store.detailsString, trackData),
            state: isRadio ? undefined : customFormat(settings.store.stateString, trackData),
            details_url: getLink(settings.store.detailsLink, trackData),
            state_url: getLink(settings.store.stateLink, trackData),

            timestamps: (trackData.playerPosition && trackData.duration && settings.store.enableTimestamps) ? {
                start: Date.now() - (trackData.playerPosition * 1000),
                end: Date.now() - (trackData.playerPosition * 1000) + (trackData.duration * 1000),
            } : undefined,

            assets,

            buttons: !isRadio && buttons.length ? buttons.map(v => v.label) : undefined,
            metadata: !isRadio && buttons.length ? { button_urls: buttons.map(v => v.url) } : undefined,

            type: settings.store.activityType,
            status_display_type: {
                "off": ActivityStatusDisplayType.NAME,
                "artist": ActivityStatusDisplayType.STATE,
                "track": ActivityStatusDisplayType.DETAILS
            }[settings.store.statusDisplayType],
            flags: ActivityFlags.INSTANCE,
        };
    }
});
