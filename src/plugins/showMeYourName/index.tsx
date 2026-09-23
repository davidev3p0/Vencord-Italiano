/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 rini
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import "./styles.css";

import { definePluginSettings } from "@api/Settings";
import ErrorBoundary from "@components/ErrorBoundary";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { Channel, Message, User } from "@vencord/discord-types";
import { RelationshipStore, StreamerModeStore } from "@webpack/common";

interface UsernameProps {
    author: { nick: string; authorId: string; };
    channel: Channel;
    message: Message;
    withMentionPrefix?: boolean;
    isRepliedMessage: boolean;
    userOverride?: User;
}

const settings = definePluginSettings({
    mode: {
        type: OptionType.SELECT,
        description: "Modalità di visualizzazione di nomi utente e soprannomi",
        options: [
            { label: "Prima nome utente, poi soprannome", value: "user-nick", default: true },
            { label: "Prima soprannome, poi nome utente", value: "nick-user" },
            { label: "Solo nome utente", value: "user" },
        ],
    },
    friendNicknames: {
        type: OptionType.SELECT,
        description: "Come dare priorità ai soprannomi degli amici rispetto a quelli del server",
        options: [
            { label: "Mostra i soprannomi degli amici solo nei messaggi diretti", value: "dms", default: true },
            { label: "Preferisci i soprannomi degli amici a quelli del server", value: "always" },
            { label: "Preferisci i soprannomi del server a quelli degli amici", value: "fallback" }
        ]
    },
    displayNames: {
        type: OptionType.BOOLEAN,
        description: "Usa i nomi visualizzati al posto dei nomi utente",
        default: false
    },
    inReplies: {
        type: OptionType.BOOLEAN,
        default: false,
        description: "Applica la funzione anche alle anteprime delle risposte",
    },
});

export default definePlugin({
    name: "ShowMeYourName",
    description: "Mostra i nomi utente accanto ai soprannomi oppure non mostrare affatto i soprannomi",
    tags: ["Appearance", "Customisation"],
    authors: [Devs.Rini, Devs.TheKodeToad, Devs.rae],
    patches: [
        {
            find: '="SYSTEM_TAG"',
            replacement: {
                // The field is named "userName", but as this is unusual casing, the regex also matches username, in case they change it
                match: /(?<=onContextMenu:\i,children:)\i\?(?=.{0,100}?user[Nn]ame:)/,
                replace: "$self.renderUsername(arguments[0]),_oldChildren:$&"
            }
        },
    ],
    settings,

    renderUsername: ErrorBoundary.wrap(({ author, channel, message, isRepliedMessage, withMentionPrefix, userOverride }: UsernameProps) => {
        try {
            const { mode, friendNicknames, displayNames, inReplies } = settings.store;

            const user = userOverride ?? message.author;
            let username = StreamerModeStore.enabled
                ? user.username[0] + "…"
                : user.username;

            if (displayNames)
                username = user.globalName || username;

            let { nick } = author;

            const friendNickname = RelationshipStore.getNickname(author.authorId);

            if (friendNickname) {
                const shouldUseFriendNickname =
                    friendNicknames === "always" ||
                    (friendNicknames === "dms" && channel.isPrivate()) ||
                    (friendNicknames === "fallback" && !nick);

                if (shouldUseFriendNickname)
                    nick = friendNickname;
            }

            const prefix = withMentionPrefix ? "@" : "";

            if (isRepliedMessage && !inReplies || username.toLowerCase() === nick.toLowerCase())
                return <>{prefix}{nick}</>;

            if (mode === "user-nick")
                return <>{prefix}{username} <span className="vc-smyn-suffix">{nick}</span></>;

            if (mode === "nick-user")
                return <>{prefix}{nick} <span className="vc-smyn-suffix">{username}</span></>;

            return <>{prefix}{username}</>;
        } catch {
            return <>{author?.nick}</>;
        }
    }, { noop: true }),
});
