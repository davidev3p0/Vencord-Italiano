/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./settings.css";

import { isPluginEnabled } from "@api/PluginManager";
import { Divider } from "@components/Divider";
import { Heading } from "@components/Heading";
import { resolveError } from "@components/settings/tabs/plugins/components/Common";
import { debounce } from "@shared/debounce";
import { classNameFactory } from "@utils/css";
import { ActivityType } from "@vencord/discord-types/enums";
import { Select, Text, TextInput, useState } from "@webpack/common";

import CustomRPCPlugin, { setRpc, settings, TimestampMode } from ".";

const cl = classNameFactory("vc-customRPC-settings-");

type SettingsKey = keyof typeof settings.store;

interface TextOption<T> {
    settingsKey: SettingsKey;
    label: string;
    disabled?: boolean;
    transform?: (value: string) => T;
    isValid?: (value: T) => true | string;
}

interface SelectOption<T> {
    settingsKey: SettingsKey;
    label: string;
    disabled?: boolean;
    options: { label: string; value: T; default?: boolean; }[];
}

const makeValidator = (maxLength: number, isRequired = false) => (value: string) => {
    if (isRequired && !value) return "This field is required.";
    if (value.length > maxLength) return `Must be not longer than ${maxLength} characters.`;
    return true;
};

const maxLength128 = makeValidator(128);

function isAppIdValid(value: string) {
    if (!/^\d{16,21}$/.test(value)) return "Must be a valid Discord ID.";
    return true;
}

const updateRPC = debounce(() => {
    setRpc(true);
    if (isPluginEnabled(CustomRPCPlugin.name)) setRpc();
});

function isStreamLinkDisabled() {
    return settings.store.type !== ActivityType.STREAMING;
}

function isStreamLinkValid(value: string) {
    if (!isStreamLinkDisabled() && !/https?:\/\/(www\.)?(twitch\.tv|youtube\.com)\/\w+/.test(value)) return "Streaming link must be a valid URL.";
    if (value && value.length > 512) return "Streaming link must be not longer than 512 characters.";
    return true;
}

function parseNumber(value: string) {
    return value ? parseInt(value, 10) : 0;
}

function isNumberValid(value: number) {
    if (isNaN(value)) return "Must be a number.";
    if (value < 0) return "Must be a positive number.";
    return true;
}

function isUrlValid(value: string) {
    if (value && !/^https?:\/\/.+/.test(value)) return "Must be a valid URL.";
    return true;
}

function isImageKeyValid(value: string) {
    if (/https?:\/\/(cdn|media)\.discordapp\.(com|net)\//.test(value)) return "Don't use a Discord link. Use an Imgur image link instead.";
    if (/https?:\/\/(?!i\.)?imgur\.com\//.test(value)) return "Imgur link must be a direct link to the image (e.g. https://i.imgur.com/...). Right click the image and click 'Copy image address'";
    if (/https?:\/\/(?!media\.)?tenor\.com\//.test(value)) return "Tenor link must be a direct link to the image (e.g. https://media.tenor.com/...). Right click the GIF and click 'Copy image address'";
    return true;
}

function PairSetting<T>(props: { data: [TextOption<T>, TextOption<T>]; }) {
    const [left, right] = props.data;

    return (
        <div className={cl("pair")}>
            <SingleSetting {...left} />
            <SingleSetting {...right} />
        </div>
    );
}

function SingleSetting<T>({ settingsKey, label, disabled, isValid, transform }: TextOption<T>) {
    const [state, setState] = useState(settings.store[settingsKey] ?? "");
    const [error, setError] = useState<string | null>(null);

    function handleChange(newValue: any) {
        if (transform) newValue = transform(newValue);

        const valid = isValid?.(newValue) ?? true;

        setState(newValue);
        setError(resolveError(valid));

        if (valid === true) {
            settings.store[settingsKey] = newValue;
            updateRPC();
        }
    }

    return (
        <div className={cl("single", { disabled })}>
            <Heading tag="h5">{label}</Heading>
            <TextInput
                type="text"
                placeholder={"Enter a value"}
                value={state}
                onChange={handleChange}
                disabled={disabled}
            />
            {error && <Text className={cl("error")} variant="text-sm/normal">{error}</Text>}
        </div>
    );
}

function SelectSetting<T>({ settingsKey, label, options, disabled }: SelectOption<T>) {
    return (
        <div className={cl("single", { disabled })}>
            <Heading tag="h5">{label}</Heading>
            <Select
                placeholder={"Select an option"}
                options={options}
                maxVisibleItems={5}
                closeOnSelect={true}
                select={v => {
                    settings.store[settingsKey] = v;
                    updateRPC();
                }}
                isSelected={v => v === settings.store[settingsKey]}
                serialize={v => String(v)}
                isDisabled={disabled}
            />
        </div>
    );
}

export function RPCSettings() {
    const s = settings.use();

    return (
        <div className={cl("root")}>
            <SelectSetting
                settingsKey="type"
                label="Tipo attività"
                options={[
                    {
                        label: "In gioco",
                        value: ActivityType.PLAYING,
                        default: true
                    },
                    {
                        label: "In streaming",
                        value: ActivityType.STREAMING
                    },
                    {
                        label: "In ascolto",
                        value: ActivityType.LISTENING
                    },
                    {
                        label: "Guardando",
                        value: ActivityType.WATCHING
                    },
                    {
                        label: "In competizione",
                        value: ActivityType.COMPETING
                    }
                ]}
            />

            <PairSetting data={[
                { settingsKey: "appID", label: "ID applicazione", isValid: isAppIdValid },
                { settingsKey: "appName", label: "Nome applicazione", isValid: makeValidator(128, true) },
            ]} />

            <PairSetting data={[
                { settingsKey: "details", label: "Dettaglio (riga 1)", isValid: maxLength128 },
                { settingsKey: "detailsURL", label: "URL dettaglio", isValid: isUrlValid },
            ]} />

            <PairSetting data={[
                { settingsKey: "state", label: "Stato (riga 2)", isValid: maxLength128 },
                { settingsKey: "stateURL", label: "URL stato", isValid: isUrlValid },
            ]} />

            <SingleSetting
                settingsKey="streamLink"
                label="Link streaming (Twitch o YouTube, solo se il tipo di attività è Streaming)"
                disabled={s.type !== ActivityType.STREAMING}
                isValid={isStreamLinkValid}
            />

            <PairSetting data={[
                {
                    settingsKey: "partySize",
                    label: "Dimensione gruppo",
                    transform: parseNumber,
                    isValid: isNumberValid,
                    disabled: s.type !== ActivityType.PLAYING,
                },
                {
                    settingsKey: "partyMaxSize",
                    label: "Dimensione massima gruppo",
                    transform: parseNumber,
                    isValid: isNumberValid,
                    disabled: s.type !== ActivityType.PLAYING,
                },
            ]} />

            <Divider />

            <PairSetting data={[
                { settingsKey: "imageBig", label: "URL/chiave immagine grande", isValid: isImageKeyValid },
                { settingsKey: "imageBigTooltip", label: "Testo immagine grande", isValid: maxLength128 },
            ]} />
            <SingleSetting settingsKey="imageBigURL" label="URL cliccabile immagine grande" isValid={isUrlValid} />

            <PairSetting data={[
                { settingsKey: "imageSmall", label: "URL/chiave immagine piccola", isValid: isImageKeyValid },
                { settingsKey: "imageSmallTooltip", label: "Testo immagine piccola", isValid: maxLength128 },
            ]} />
            <SingleSetting settingsKey="imageSmallURL" label="URL cliccabile immagine piccola" isValid={isUrlValid} />

            <Divider />

            <PairSetting data={[
                { settingsKey: "buttonOneText", label: "Testo pulsante 1", isValid: makeValidator(31) },
                { settingsKey: "buttonOneURL", label: "URL pulsante 1", isValid: isUrlValid },
            ]} />
            <PairSetting data={[
                { settingsKey: "buttonTwoText", label: "Testo pulsante 2", isValid: makeValidator(31) },
                { settingsKey: "buttonTwoURL", label: "URL pulsante 2", isValid: isUrlValid },
            ]} />

            <Divider />

            <SelectSetting
                settingsKey="timestampMode"
                label="Modalità timestamp"
                options={[
                    {
                        label: "Nessuno",
                        value: TimestampMode.NONE,
                        default: true
                    },
                    {
                        label: "Dall'apertura di Discord",
                        value: TimestampMode.NOW
                    },
                    {
                        label: "Uguale all'ora corrente (non si reimposta dopo 24 ore)",
                        value: TimestampMode.TIME
                    },
                    {
                        label: "Personalizzato",
                        value: TimestampMode.CUSTOM
                    }
                ]}
            />

            <PairSetting data={[
                {
                    settingsKey: "startTime",
                    label: "Timestamp iniziale (in millisecondi)",
                    transform: parseNumber,
                    isValid: isNumberValid,
                    disabled: s.timestampMode !== TimestampMode.CUSTOM,
                },
                {
                    settingsKey: "endTime",
                    label: "Timestamp finale (in millisecondi)",
                    transform: parseNumber,
                    isValid: isNumberValid,
                    disabled: s.timestampMode !== TimestampMode.CUSTOM,
                },
            ]} />
        </div>
    );
}
