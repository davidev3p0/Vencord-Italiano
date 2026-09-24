/*
 * Vencord, a Discord client mod
 * Copyright (c) 2026 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { definePluginSettings } from "@api/Settings";
import definePlugin, { OptionType } from "@utils/types";
import type { Message } from "@vencord/discord-types";
import { ChannelStore, useEffect, useState } from "@webpack/common";

const ITALIAN_TEST_PHRASE = "Ciao! Questa è la voce selezionata per leggere i messaggi di Discord.";
const GOOGLE_ITALIAN_AUTO = "__google_italian_auto__";

let speechGeneration = 0;
let activeMessageKey: string | null = null;

function hasSpeechSynthesis(): boolean {
    return typeof window !== "undefined"
        && "speechSynthesis" in window
        && typeof SpeechSynthesisUtterance !== "undefined";
}

function cancelSpeech(): void {
    speechGeneration++;
    activeMessageKey = null;
    if (hasSpeechSynthesis()) window.speechSynthesis.cancel();
}

function getVoices(): SpeechSynthesisVoice[] {
    if (!hasSpeechSynthesis()) return [];
    return window.speechSynthesis.getVoices();
}

function scoreVoice(voice: SpeechSynthesisVoice): number {
    const name = voice.name.toLowerCase();
    const lang = voice.lang.toLowerCase();
    let score = 0;

    if (lang === "it-it") score += 100;
    else if (lang.startsWith("it")) score += 80;

    if (/google/.test(name)) score += 1000;
    if (/natural|neural|online|premium/.test(name)) score += 35;
    if (/microsoft|apple/.test(name)) score += 10;
    if (voice.default) score += 5;

    return score;
}

function pickVoice(): SpeechSynthesisVoice | undefined {
    const voices = getVoices();
    const configured = settings.store.voiceName.trim();

    if (configured && configured !== GOOGLE_ITALIAN_AUTO) {
        const exact = voices.find(v => v.name === configured);
        if (exact) return exact;
    }

    const italianVoices = voices.filter(v => v.lang.toLowerCase().startsWith("it"));
    const googleItalian = italianVoices
        .filter(v => /google/i.test(v.name))
        .sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];

    if (configured === GOOGLE_ITALIAN_AUTO && googleItalian) return googleItalian;

    return [...italianVoices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0]
        ?? [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a))[0];
}

function splitText(text: string, maxChunkLength = 260): string[] {
    const normalized = text.replace(/\s+/g, " ").trim();
    if (!normalized) return [];
    if (normalized.length <= maxChunkLength) return [normalized];

    const sentences = normalized.split(/(?<=[.!?;:])\s+/);
    const chunks: string[] = [];
    let current = "";

    const flush = () => {
        if (current.trim()) chunks.push(current.trim());
        current = "";
    };

    for (const sentence of sentences) {
        if (sentence.length > maxChunkLength) {
            flush();
            for (let i = 0; i < sentence.length; i += maxChunkLength)
                chunks.push(sentence.slice(i, i + maxChunkLength).trim());
            continue;
        }

        const candidate = current ? `${current} ${sentence}` : sentence;
        if (candidate.length > maxChunkLength) {
            flush();
            current = sentence;
        } else {
            current = candidate;
        }
    }

    flush();
    return chunks;
}

function cleanMessageText(content: string): string {
    let text = content ?? "";

    if (!settings.store.readCodeBlocks)
        text = text.replace(/```[\s\S]*?```/g, " codice ");
    else
        text = text.replace(/```(?:[\w+-]+)?\n?([\s\S]*?)```/g, "$1");

    text = text
        .replace(/`([^`]+)`/g, "$1")
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
        .replace(/<a?:([A-Za-z0-9_]+):\d+>/g, " $1 ")
        .replace(/<@!?(\d+)>/g, " menzione ")
        .replace(/<@&(\d+)>/g, " ruolo ")
        .replace(/<#(\d+)>/g, " canale ")
        .replace(/[*_~>|#]+/g, " ");

    if (settings.store.simplifyLinks)
        text = text.replace(/https?:\/\/\S+/gi, " link ");

    return text.replace(/\s+/g, " ").trim();
}

function buildSpokenText(message: Message): string {
    const content = cleanMessageText(message.content ?? "");
    if (!content) return "";

    if (!settings.store.readAuthor) return content;

    const author = message.author as any;
    const authorName = author?.globalName || author?.displayName || author?.username || "Utente";
    return `${authorName} dice: ${content}`;
}

function speakText(text: string, messageKey: string | null = null): void {
    if (!hasSpeechSynthesis()) return;

    const chunks = splitText(text);
    if (!chunks.length) return;

    cancelSpeech();
    const myGeneration = speechGeneration;
    activeMessageKey = messageKey;

    const voice = pickVoice();
    let index = 0;

    const speakNext = () => {
        if (myGeneration !== speechGeneration || index >= chunks.length) {
            if (myGeneration === speechGeneration) activeMessageKey = null;
            return;
        }

        const utterance = new SpeechSynthesisUtterance(chunks[index++]);
        utterance.lang = voice?.lang || "it-IT";
        utterance.voice = voice ?? null;
        utterance.rate = settings.store.rate;
        utterance.pitch = settings.store.pitch;
        utterance.volume = settings.store.volume;
        utterance.onend = speakNext;
        utterance.onerror = () => {
            if (myGeneration === speechGeneration) activeMessageKey = null;
        };

        window.speechSynthesis.speak(utterance);
    };

    speakNext();
}

function speakMessage(message: Message): void {
    const text = buildSpokenText(message);
    if (!text) return;

    const key = `${message.channel_id}:${message.id}`;
    if (activeMessageKey === key && hasSpeechSynthesis()
        && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
        cancelSpeech();
        return;
    }

    speakText(text, key);
}

function shouldIgnoreClick(event: MouseEvent): boolean {
    if (event.button !== 0) return true;

    const selection = window.getSelection()?.toString().trim();
    if (selection) return true;

    const target = event.target;
    if (target instanceof Element && target.closest(
        "a, button, input, textarea, select, option, [role='button'], [role='menuitem'], [contenteditable='true']"
    )) return true;

    return false;
}

function clickMatchesMode(event: MouseEvent): boolean {
    switch (settings.store.clickMode) {
        case "single": return !event.ctrlKey && !event.altKey && !event.metaKey;
        case "ctrl": return event.ctrlKey || event.metaKey;
        case "alt": return event.altKey;
        default: return false;
    }
}

function handleEscape(event: KeyboardEvent): void {
    if (settings.store.stopWithEscape && event.key === "Escape") cancelSpeech();
}

function SpeakerIcon({ width = 24, height = 24, className }: any) {
    return (
        <svg
            width={width}
            height={height}
            className={className}
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M3 9v6h4l5 4V5L7 9H3Zm11.5 3a3.5 3.5 0 0 0-1.5-2.87v5.74A3.5 3.5 0 0 0 14.5 12Zm-1.5-7.1v2.06a5.5 5.5 0 0 1 0 10.08v2.06A7.5 7.5 0 0 0 13 4.9Z" />
        </svg>
    );
}

function VoicePicker() {
    const { voiceName } = settings.use(["voiceName"]);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

    const refresh = () => setVoices(getVoices());

    useEffect(() => {
        if (!hasSpeechSynthesis()) return;
        refresh();
        window.speechSynthesis.addEventListener("voiceschanged", refresh);
        return () => window.speechSynthesis.removeEventListener("voiceschanged", refresh);
    }, []);

    const italian = [...voices]
        .filter(v => v.lang.toLowerCase().startsWith("it"))
        .sort((a, b) => scoreVoice(b) - scoreVoice(a));
    const googleItalian = italian.filter(v => /google/i.test(v.name));

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontWeight: 600 }}>Voce</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
                Per impostazione predefinita viene usata una voce Google italiana quando il client la rende disponibile.
                In caso contrario viene scelta automaticamente la migliore voce italiana presente sul dispositivo.
            </div>
            <select
                value={voiceName}
                onChange={e => settings.store.voiceName = e.currentTarget.value}
                style={{
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: 6,
                    color: "var(--text-normal)",
                    background: "var(--input-background)",
                    border: "1px solid var(--input-border)"
                }}
            >
                <option value={GOOGLE_ITALIAN_AUTO}>Google italiano — preferita</option>
                <option value="">Automatico — migliore voce italiana disponibile</option>
                {italian.map(v => (
                    <option key={`${v.name}-${v.lang}`} value={v.name}>{v.name} ({v.lang})</option>
                ))}
            </select>
            {voiceName === GOOGLE_ITALIAN_AUTO && googleItalian.length === 0 && (
                <div style={{ color: "var(--text-warning)", fontSize: 13 }}>
                    Nessuna voce Google italiana è esposta da Discord/Chromium su questo PC: verrà usata automaticamente la migliore voce italiana disponibile.
                </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
                <button
                    type="button"
                    onClick={() => speakText(ITALIAN_TEST_PHRASE)}
                    style={{ padding: "7px 10px", cursor: "pointer" }}
                >
                    ▶ Prova voce
                </button>
                <button
                    type="button"
                    onClick={refresh}
                    style={{ padding: "7px 10px", cursor: "pointer" }}
                >
                    ↻ Aggiorna voci
                </button>
            </div>
            {!hasSpeechSynthesis() && (
                <div style={{ color: "var(--status-danger)" }}>
                    La sintesi vocale non è disponibile in questo client.
                </div>
            )}
        </div>
    );
}

const settings = definePluginSettings({
    clickMode: {
        type: OptionType.SELECT,
        description: "Come avviare la lettura cliccando un messaggio",
        options: [
            { label: "Ctrl + clic sinistro sul messaggio (Cmd + clic su macOS)", value: "ctrl", default: true },
            { label: "Clic sinistro sul messaggio", value: "single" },
            { label: "Alt + clic sinistro sul messaggio", value: "alt" },
            { label: "Disattivato — usa il pulsante 🔊", value: "off" }
        ]
    },
    voiceName: {
        type: OptionType.STRING,
        description: "Nome interno della voce selezionata",
        default: GOOGLE_ITALIAN_AUTO,
        hidden: true
    },
    voicePicker: {
        type: OptionType.COMPONENT,
        component: VoicePicker
    },
    migratedGoogleVoice: {
        type: OptionType.BOOLEAN,
        description: "Migrazione interna alla voce Google italiana preferita",
        default: false,
        hidden: true
    },
    migratedCtrlClick: {
        type: OptionType.BOOLEAN,
        description: "Migrazione interna al Ctrl + clic sinistro",
        default: false,
        hidden: true
    },
    readAuthor: {
        type: OptionType.BOOLEAN,
        description: "Pronuncia anche il nome dell'autore prima del messaggio",
        default: false
    },
    simplifyLinks: {
        type: OptionType.BOOLEAN,
        description: "Sostituisce gli URL lunghi con la parola ‘link’",
        default: true
    },
    readCodeBlocks: {
        type: OptionType.BOOLEAN,
        description: "Legge il contenuto dei blocchi di codice invece di dire soltanto ‘codice’",
        default: false
    },
    stopWithEscape: {
        type: OptionType.BOOLEAN,
        description: "Premi ESC per interrompere immediatamente la lettura",
        default: true
    },
    rate: {
        type: OptionType.SLIDER,
        description: "Velocità della voce",
        markers: [0.65, 0.8, 1, 1.2, 1.4, 1.6],
        default: 1,
        stickToMarkers: false
    },
    pitch: {
        type: OptionType.SLIDER,
        description: "Tono della voce",
        markers: [0.7, 0.85, 1, 1.15, 1.3],
        default: 1,
        stickToMarkers: false
    },
    volume: {
        type: OptionType.SLIDER,
        description: "Volume della lettura",
        markers: [0.25, 0.5, 0.75, 1],
        default: 1,
        stickToMarkers: false
    }
});

export default definePlugin({
    name: "RealVoiceTTS",
    description: "Legge ad alta voce i messaggi Discord con la migliore voce italiana disponibile sul dispositivo.",
    authors: [{ name: "Davide", id: 0n }],
    tags: ["Accessibility", "Chat", "Voice"],
    settings,
    enabledByDefault: true,

    start() {
        if (!settings.store.migratedGoogleVoice) {
            settings.store.voiceName = GOOGLE_ITALIAN_AUTO;
            settings.store.migratedGoogleVoice = true;
        }

        if (!settings.store.migratedCtrlClick) {
            settings.store.clickMode = "ctrl";
            settings.store.migratedCtrlClick = true;
        }

        if (hasSpeechSynthesis()) window.speechSynthesis.getVoices();
        document.addEventListener("keydown", handleEscape);
    },

    stop() {
        document.removeEventListener("keydown", handleEscape);
        cancelSpeech();
    },

    onMessageClick(message, _channel, event) {
        if (shouldIgnoreClick(event) || !clickMatchesMode(event)) return;
        speakMessage(message);
    },

    messagePopoverButton: {
        icon: SpeakerIcon,
        render(message) {
            if (!message?.content?.trim()) return null;
            return {
                label: "Leggi ad alta voce",
                icon: SpeakerIcon,
                message,
                channel: ChannelStore.getChannel(message.channel_id),
                onClick: () => speakMessage(message)
            };
        }
    }
});
