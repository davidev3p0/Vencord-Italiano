/*
 * Vencord, a Discord client mod
 * Copyright (c) 2023 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { CopyIcon, DeleteIcon } from "@components/Icons";
import { Decoration } from "@plugins/decor/lib/api";
import { useCurrentUserDecorationsStore } from "@plugins/decor/lib/stores/CurrentUserDecorationsStore";
import { cl } from "@plugins/decor/ui";
import { copyToClipboard } from "@utils/clipboard";
import { ConfirmModal,ContextMenuApi, Menu, openModal, UserStore } from "@webpack/common";

export default function DecorationContextMenu({ decoration }: { decoration: Decoration; }) {
    const { delete: deleteDecoration } = useCurrentUserDecorationsStore();

    return <Menu.Menu
        navId={cl("decoration-context-menu")}
        onClose={ContextMenuApi.closeContextMenu}
        aria-label="Opzioni decorazione"
    >
        <Menu.MenuItem
            id={cl("decoration-context-menu-copy-hash")}
            label="Copia hash decorazione"
            icon={CopyIcon}
            leadingAccessory={{ type: "icon", icon: CopyIcon }}
            action={() => copyToClipboard(decoration.hash)}
        />
        {decoration.authorId === UserStore.getCurrentUser().id &&
            <Menu.MenuItem
                id={cl("decoration-context-menu-delete")}
                label="Elimina decorazione"
                color="danger"
                icon={DeleteIcon}
                leadingAccessory={{ type: "icon", icon: DeleteIcon }}
                action={() => openModal(props => (
                    <ConfirmModal
                        {...props}
                        title="Elimina decorazione"
                        subtitle={`Are you sure you want to delete ${decoration.alt}?`}
                        confirmText="Elimina"
                        cancelText="Annulla"
                        onConfirm={() => {
                            deleteDecoration(decoration);
                        }}
                    />
                ))}
            />
        }
    </Menu.Menu>;
}
