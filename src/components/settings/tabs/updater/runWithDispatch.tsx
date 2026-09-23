/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { ErrorCard } from "@components/ErrorCard";
import { UpdateLogger } from "@utils/updater";
import { ConfirmModal,openModal, Parser } from "@webpack/common";

function getErrorMessage(e: any) {
    if (!e?.code || !e.cmd)
        return "Si è verificato un errore sconosciuto.\nRiprova oppure controlla la console per maggiori informazioni.";

    const { code, path, cmd, stderr } = e;

    if (code === "ENOENT")
        return `Comando \`${path}\` non trovato.\nInstallalo e riprova.`;

    const extra = stderr || `Codice \`${code}\`. Controlla la console per maggiori informazioni.`;

    return `Si è verificato un errore durante l’esecuzione di \`${cmd}\`:\n${extra}`;
}

export function runWithDispatch(dispatch: React.Dispatch<React.SetStateAction<boolean>>, action: () => any) {
    return async () => {
        dispatch(true);

        try {
            await action();
        } catch (e: any) {
            UpdateLogger.error(e);

            const err = getErrorMessage(e);

            openModal(props => (
                <ConfirmModal
                    {...props}
                    title="Ops!"
                    confirmText="OK"
                    variant="primary"
                >
                    <ErrorCard>
                        {err.split("\n").map((line, idx) =>
                            <div key={idx}>{Parser.parse(line)}</div>
                        )}
                    </ErrorCard>
                </ConfirmModal>
            ));
        } finally {
            dispatch(false);
        }
    };
}
