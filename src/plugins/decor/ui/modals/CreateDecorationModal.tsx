/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import ErrorBoundary from "@components/ErrorBoundary";
import { Link } from "@components/Link";
import { GUILD_ID, INVITE_KEY, RAW_SKU_ID } from "@plugins/decor/lib/constants";
import { useCurrentUserDecorationsStore } from "@plugins/decor/lib/stores/CurrentUserDecorationsStore";
import { cl, DecorationModalClasses, requireAvatarDecorationModal, requireCreateStickerModal } from "@plugins/decor/ui";
import { AvatarDecorationModalPreview } from "@plugins/decor/ui/components";
import { openInviteModal } from "@utils/discord";
import { Margins } from "@utils/margins";
import { RenderModalProps } from "@vencord/discord-types";
import { filters, findComponentByCodeLazy, mapMangledModuleLazy } from "@webpack";
import { closeAllModals, FluxDispatcher, Forms, GuildStore, Modal, NavigationRouter, openModal, Text, TextInput, useEffect, useMemo, UserStore, useState } from "@webpack/common";

const FileUpload = findComponentByCodeLazy(".currentTarget.files", "lineClamp:1");

const { HelpMessage, HelpMessageTypes } = mapMangledModuleLazy('POSITIVE="positive', {
    HelpMessageTypes: filters.byProps("POSITIVE", "WARNING", "INFO"),
    HelpMessage: filters.byCode("messageType:")
});

function useObjectURL(object: Blob | MediaSource | null) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!object) return;

        const objectUrl = URL.createObjectURL(object);
        setUrl(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
            setUrl(null);
        };
    }, [object]);

    return url;
}

function CreateDecorationModal(props: RenderModalProps) {
    const [name, setName] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (error) setError(null);
    }, [file]);

    const { create: createDecoration } = useCurrentUserDecorationsStore();

    const fileUrl = useObjectURL(file);

    const decoration = useMemo(() => fileUrl ? { asset: fileUrl, skuId: RAW_SKU_ID } : null, [fileUrl]);

    return <Modal
        {...props}
        size="lg"
        title="Crea decorazione"
        actions={[
            {
                text: "Cancel",
                variant: "secondary",
                onClick: props.onClose
            },
            {
                text: "Submit for Review",
                variant: "primary",
                onClick: () => {
                    setSubmitting(true);
                    createDecoration({ alt: name, file: file! })
                        .then(props.onClose).catch(e => { setSubmitting(false); setError(e); });
                },
                disabled: !file || !name || submitting
            }
        ]}
    >
        <div className={cl("create-decoration-modal-content", DecorationModalClasses.modal)}>
            <ErrorBoundary>
                <HelpMessage messageType={HelpMessageTypes.WARNING}>
                    Assicurati che la decorazione non violi <Link
                        href="https://github.com/decor-discord/.github/blob/main/GUIDELINES.md"
                    >
                        le linee guida
                    </Link> prima di inviarla.
                </HelpMessage>
                <div className={cl("create-decoration-modal-form-preview-container")}>
                    <div className={cl("create-decoration-modal-form")}>
                        {error !== null && <Text color="text-danger" variant="text-xs/normal">{error.message}</Text>}
                        <section>
                            <Forms.FormTitle tag="h5">File</Forms.FormTitle>
                            <FileUpload
                                filename={file?.name}
                                placeholder="Scegli un file"
                                buttonText="Browse"
                                filters={[{ name: "Decoration file", extensions: ["png", "apng"] }]}
                                onFileSelect={setFile}
                            />
                            <Forms.FormText className={Margins.top8}>
                                Il file deve essere APNG o PNG.
                            </Forms.FormText>
                        </section>
                        <section>
                            <Forms.FormTitle tag="h5">Nome</Forms.FormTitle>
                            <TextInput
                                placeholder="Companion Cube"
                                value={name}
                                onChange={setName}
                            />
                            <Forms.FormText className={Margins.top8}>
                                Questo nome verrà usato per identificare la decorazione.
                            </Forms.FormText>
                        </section>
                    </div>
                    <div>
                        <AvatarDecorationModalPreview
                            avatarDecoration={decoration}
                            user={UserStore.getCurrentUser()}
                        />
                    </div>
                </div>
                <HelpMessage messageType={HelpMessageTypes.INFO} className={Margins.bottom8}>
                    Per ricevere aggiornamenti sulla revisione della decorazione, entra nel <Link
                        href={`https://discord.gg/${INVITE_KEY}`}
                        onClick={async e => {
                            e.preventDefault();
                            if (!GuildStore.getGuild(GUILD_ID)) {
                                const inviteAccepted = await openInviteModal(INVITE_KEY);
                                if (inviteAccepted) {
                                    closeAllModals();
                                    FluxDispatcher.dispatch({ type: "LAYER_POP_ALL" });
                                }
                            } else {
                                closeAllModals();
                                FluxDispatcher.dispatch({ type: "LAYER_POP_ALL" });
                                NavigationRouter.transitionToGuild(GUILD_ID);
                            }
                        }}
                    >
                        server Discord di Decor
                    </Link> e consenti i messaggi diretti.
                </HelpMessage>
            </ErrorBoundary>
        </div>
    </Modal>;
}

export const openCreateDecorationModal = () =>
    Promise.all([requireAvatarDecorationModal(), requireCreateStickerModal()])
        .then(() => openModal(props => <CreateDecorationModal {...props} />));
