/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Link } from "@components/Link";
import { settings } from "@plugins/decor/settings";
import { DecorationModalClasses, requireAvatarDecorationModal } from "@plugins/decor/ui";
import { RenderModalProps } from "@vencord/discord-types";
import { ConfirmModal, Forms, openModal } from "@webpack/common";

import { openCreateDecorationModal } from "./CreateDecorationModal";

function GuidelinesModal(props: RenderModalProps) {
    return (
        <ConfirmModal
            {...props}
            title="Attenzione"
            confirmText="Continua"
            variant="primary"
            onConfirm={() => {
                settings.store.agreedToGuidelines = true;
                props.onClose();
                openCreateDecorationModal();
            }}
        >
            <div className={DecorationModalClasses.modal}>
                <Forms.FormText>
                    Inviando una decorazione accetti <Link
                        href="https://github.com/decor-discord/.github/blob/main/GUIDELINES.md"
                    >
                        le linee guida
                    </Link> . Il mancato rispetto delle linee guida può comportare la sospensione della possibilità di creare altre decorazioni in futuro.
                </Forms.FormText>
            </div>
        </ConfirmModal>
    );
}

export const openGuidelinesModal = () =>
    requireAvatarDecorationModal().then(() => openModal(props => <GuidelinesModal {...props} />));
