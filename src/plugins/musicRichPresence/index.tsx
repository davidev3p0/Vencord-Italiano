/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2022 Sofia Lima
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

import { definePluginSettings, migratePluginSetting, migratePluginSettings } from "@api/Settings";
import { LinkButton } from "@components/Button";
import { Card } from "@components/Card";
import { Heading } from "@components/Heading";
import { Margins } from "@components/margins";
import { Paragraph } from "@components/Paragraph";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { Activity, ActivityAssets, ActivityButton } from "@vencord/discord-types";
import { ActivityFlags, ActivityStatusDisplayType, ActivityType } from "@vencord/discord-types/enums";
import { ApplicationAssetUtils, AuthenticationStore, FluxDispatcher, PresenceStore } from "@webpack/common";

import { LastFMScrobbler } from "./lastfm";
import { invalidateListenBrainzCache, ListenBrainzScrobbler } from "./listenbrainz";

export interface TrackData {
    name: string;
    album: string;
    artist: string;
    trackURL?: string;
    artistURL?: string;
    albumURL?: string;
    imageURL?: string;
    serviceName?: string;
}

export interface ScrobblerBackend {
    name: string,
    id: string,

    fetchTrackData(): Promise<TrackData | null>;
    getUserURL(username: string): string;
}

const enum NameFormat {
    StatusName = "status-name",
    ArtistFirst = "artist-first",
    SongFirst = "song-first",
    ArtistOnly = "artist",
    SongOnly = "song",
    AlbumName = "album",
    ServiceName = "service-name"
}

const DISCORD_APP_ID = "1108588077900898414";
const LASTFM_PLACEHOLDER_IMAGE_HASH = "2a96cbd8b46e442fc41c2b86b821562f";

async function getApplicationAsset(key: string): Promise<string> {
    return (await ApplicationAssetUtils.fetchAssetIds(DISCORD_APP_ID, [key]))[0];
}

function setActivity(activity: Activity | null) {
    FluxDispatcher.dispatch({
        type: "LOCAL_ACTIVITY_UPDATE",
        activity,
        socketId: "LastFM",
    });
}

export const settings = definePluginSettings({
    scrobblerBackend: {
        description: "Servizio di scrobbling da utilizzare.",
        type: OptionType.SELECT,
        options: [
            {
                "label": "Last.FM",
                "value": "lastfm",
                "default": true
            },
            {
                "label": "ListenBrainz",
                "value": "listenbrainz"
            },
            {
                "label": "ListenBrainz Compatible (self-hosted)",
                "value": "listenbrainz-compatible"
            }
        ] as const
    },
    instanceBaseURL: {
        description: "URL di base della tua istanza ListenBrainz.",
        type: OptionType.STRING,
        placeholder: "https://example.org",
        onChange: invalidateListenBrainzCache
    },
    instanceAPIBaseUrl: {
        description: "URL di base dell'API ListenBrainz.",
        type: OptionType.STRING,
        placeholder: "https://api.example.org",
        onChange: invalidateListenBrainzCache
    },
    apiKey: {
        displayName: "Chiave API",
        description: "Chiave API Last.fm. Non è obbligatoria, ma è fortemente consigliata per evitare limiti di richieste con la chiave condivisa",
        type: OptionType.STRING,
    },
    username: {
        description: "Nome utente",
        type: OptionType.STRING,
    },
    shareUsername: {
        description: "Mostra il collegamento al profilo del servizio di scrobbling",
        type: OptionType.BOOLEAN,
        default: false,
    },
    clickableLinks: {
        description: "Rendi cliccabili i nomi di brano, artista e album",
        type: OptionType.BOOLEAN,
        default: true,
    },
    hideWithSpotify: {
        description: "Nascondi la presenza se Spotify è in esecuzione",
        type: OptionType.BOOLEAN,
        default: true,
    },
    hideWithActivity: {
        description: "Nascondi la presenza se hai già un'altra attività",
        type: OptionType.BOOLEAN,
        default: false,
    },
    statusName: {
        description: "Testo di stato personalizzato. Puoi usare le seguenti variabili: {artist} | {album} | {title}",
        type: OptionType.STRING,
        default: "some music",
    },
    statusDisplayType: {
        description: "Mostra il nome del brano/artista nell'elenco membri",
        type: OptionType.SELECT,
        options: [
            {
                label: "Non mostrare (mostra un messaggio di ascolto generico)",
                value: "off"
            },
            {
                label: "Mostra il nome dell'artista",
                value: "artist",
                default: true
            },
            {
                label: "Mostra il nome del brano",
                value: "track"
            }
        ]
    },
    nameFormat: {
        description: "Mostra il nome del brano e dell'artista nel nome dello stato",
        type: OptionType.SELECT,
        options: [
            {
                label: "Usa un nome di stato personalizzato",
                value: NameFormat.StatusName,
                default: true
            },
            {
                label: "Usa il nome del servizio musicale (in alternativa usa il testo di stato personalizzato)",
                value: NameFormat.ServiceName
            },
            {
                label: "Usa il formato 'artista - brano'",
                value: NameFormat.ArtistFirst
            },
            {
                label: "Usa il formato 'brano - artista'",
                value: NameFormat.SongFirst
            },
            {
                label: "Usa solo il nome dell'artista",
                value: NameFormat.ArtistOnly
            },
            {
                label: "Usa solo il nome del brano",
                value: NameFormat.SongOnly
            },
            {
                label: "Usa il nome dell'album (se il brano non ha un album usa il testo di stato personalizzato)",
                value: NameFormat.AlbumName
            }
        ],
    },
    useListeningStatus: {
        description: 'Mostra lo stato "In ascolto" invece di "In riproduzione"',
        type: OptionType.BOOLEAN,
        default: false,
    },
    missingArt: {
        description: "Quando mancano l'album o la copertina",
        type: OptionType.SELECT,
        options: [
            {
                label: "Usa il logo grande del servizio di scrobbling",
                value: "logo",
                default: true
            },
            {
                label: "Usa un segnaposto generico",
                value: "placeholder"
            }
        ],
    },
    showLogo: {
        displayName: "Mostra logo del servizio di scrobbling",
        description: "Mostra il logo del servizio di scrobbling accanto alla copertina dell'album",
        type: OptionType.BOOLEAN,
        default: true,
    },
    showAlbumCover: {
        description: "Mostra la copertina dell'album. Disabilitando l'opzione verrà mostrato un segnaposto. Utile se la musica ha copertine inappropriate",
        type: OptionType.BOOLEAN,
        default: true,
    }
}, {
    apiKey: { hidden() { return this.store.scrobblerBackend !== "lastfm"; } },
    instanceBaseURL: { hidden() { return this.store.scrobblerBackend !== "listenbrainz-compatible"; } },
    instanceAPIBaseUrl: { hidden() { return this.store.scrobblerBackend !== "listenbrainz-compatible"; } },
});

migratePluginSettings("MusicRichPresence", "LastFMRichPresence");
migratePluginSetting("MusicRichPresence", "showLastFmLogo", "showLogo");
export default definePlugin({
    name: "MusicRichPresence",
    description: "Rich Presence per Last.FM/ListenBrainz",
    tags: ["Activity", "Media"],
    searchTerms: ["lastfm", "LastFMRichPresence"],
    authors: [Devs.Rini, Devs.Ven, Devs.angelcube, Devs.RuiNtD, Devs.blahajZip, Devs.archeruwu],

    settings,

    settingsAboutComponent() {
        if (settings.store.scrobblerBackend !== "lastfm")
            return null;

        return (
            <Card>
                <Heading tag="h2">Last.FM</Heading>
                <Heading tag="h5">Come creare una chiave API</Heading>
                <Paragraph>Imposta <strong>Nome applicazione</strong> e <strong>Descrizione applicazione</strong> con qualsiasi valore e lascia vuoto il resto.</Paragraph>
                <LinkButton size="small" href="https://www.last.fm/api/account/create" className={Margins.top8}>Crea chiave API</LinkButton>
            </Card>
        );
    },

    start() {
        this.updatePresence();
        this.updateInterval = setInterval(() => { this.updatePresence(); }, 16000);
    },

    stop() {
        clearInterval(this.updateInterval);
    },

    async updatePresence() {
        const { username, scrobblerBackend, instanceAPIBaseUrl, instanceBaseURL } = settings.store;

        if (!username) return;
        if (scrobblerBackend === "listenbrainz-compatible" && (!instanceAPIBaseUrl || !instanceBaseURL)) return;

        setActivity(await this.getActivity());
    },

    getLargeImage(track: TrackData): string | undefined {
        if (settings.store.showAlbumCover && track.imageURL && !track.imageURL.includes(LASTFM_PLACEHOLDER_IMAGE_HASH))
            return track.imageURL;

        if (settings.store.missingArt === "placeholder")
            return "placeholder";
    },

    async getActivity(): Promise<Activity | null> {

        if (settings.store.hideWithActivity) {
            if (PresenceStore.getActivities(AuthenticationStore.getId()).some(a => a.application_id !== DISCORD_APP_ID && a.type !== ActivityType.CUSTOM_STATUS)) {
                return null;
            }
        }

        if (settings.store.hideWithSpotify) {
            if (PresenceStore.getActivities(AuthenticationStore.getId()).some(a => a.type === ActivityType.LISTENING && a.application_id !== DISCORD_APP_ID)) {
                // there is already music status because of Spotify or richerCider (probably more)
                return null;
            }
        }

        const scrobbler = settings.store.scrobblerBackend === "lastfm" ? LastFMScrobbler : ListenBrainzScrobbler;

        const trackData = await scrobbler.fetchTrackData();
        if (!trackData) return null;

        const largeImage = this.getLargeImage(trackData);
        const assets: ActivityAssets = largeImage ?
            {
                large_image: await getApplicationAsset(largeImage),
                large_text: trackData.album || undefined,
                ...(settings.store.showLogo && {
                    small_image: await getApplicationAsset(`${scrobbler.id}-small`),
                    small_text: scrobbler.id
                }),
            } : {
                large_image: await getApplicationAsset(`${scrobbler.id}-large`),
                large_text: trackData.album || undefined,
            };

        const buttons: ActivityButton[] = [];

        if (settings.store.shareUsername) {
            buttons.push({
                label: `${scrobbler.name} Profile`,
                url: scrobbler.getUserURL(settings.store.username!)
            });
        }

        const statusName = (() => {
            switch (settings.store.nameFormat) {
                case NameFormat.ArtistFirst:
                    return trackData.artist + " - " + trackData.name;
                case NameFormat.SongFirst:
                    return trackData.name + " - " + trackData.artist;
                case NameFormat.ArtistOnly:
                    return trackData.artist;
                case NameFormat.SongOnly:
                    return trackData.name;
                case NameFormat.AlbumName:
                    return trackData.album || settings.store.statusName
                        .replaceAll("{artist}", trackData.artist || "")
                        .replaceAll("{album}", trackData.album || "")
                        .replaceAll("{title}", trackData.name || "");
                case NameFormat.ServiceName:
                    return trackData.serviceName || settings.store.statusName
                        .replaceAll("{artist}", trackData.artist || "")
                        .replaceAll("{album}", trackData.album || "")
                        .replaceAll("{title}", trackData.name || "");
                default:
                    return settings.store.statusName
                        .replaceAll("{artist}", trackData.artist || "")
                        .replaceAll("{album}", trackData.album || "")
                        .replaceAll("{title}", trackData.name || "");
            }
        })();

        const activity: Activity = {
            application_id: DISCORD_APP_ID,
            name: statusName,

            details: trackData.name,
            state: trackData.artist,
            status_display_type: {
                "off": ActivityStatusDisplayType.NAME,
                "artist": ActivityStatusDisplayType.STATE,
                "track": ActivityStatusDisplayType.DETAILS
            }[settings.store.statusDisplayType],

            assets,

            buttons: buttons.length ? buttons.map(v => v.label) : undefined,
            metadata: {
                button_urls: buttons.map(v => v.url),
            },

            type: settings.store.useListeningStatus ? ActivityType.LISTENING : ActivityType.PLAYING,
            flags: ActivityFlags.INSTANCE,
        };

        if (settings.store.clickableLinks) {
            activity.details_url = trackData.trackURL;
            activity.state_url = trackData.artistURL;

            if (trackData.album) {
                activity.assets!.large_url = trackData.albumURL;
            }
        }

        return activity;
    }
});
