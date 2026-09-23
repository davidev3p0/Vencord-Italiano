/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { Divider } from "@components/Divider";
import { ErrorCard } from "@components/ErrorCard";
import { Link } from "@components/Link";
import { CspBlockedUrls, useCspErrors } from "@utils/cspViolations";
import { Margins } from "@utils/margins";
import { classes } from "@utils/misc";
import { relaunch } from "@utils/native";
import { useForceUpdater } from "@utils/react";
import { Button, ConfirmModal, Forms, openModal } from "@webpack/common";

export function CspErrorCard() {
    if (IS_WEB) return null;

    const errors = useCspErrors();
    const forceUpdate = useForceUpdater();

    if (!errors.length) return null;

    const isImgurHtmlDomain = (url: string) => url.startsWith("https://imgur.com/");

    const allowUrl = async (url: string) => {
        const { origin: baseUrl, host } = new URL(url);

        const result = await VencordNative.csp.requestAddOverride(baseUrl, ["connect-src", "img-src", "style-src", "font-src"], "Vencord Themes");
        if (result !== "ok") return;

        CspBlockedUrls.forEach(url => {
            if (new URL(url).host === host) {
                CspBlockedUrls.delete(url);
            }
        });

        forceUpdate();

        openModal(props => (
            <ConfirmModal
                {...props}
                title="Riavvio necessario"
                subtitle="È necessario riavviare per applicare questa modifica"
                confirmText="Riavvia ora"
                cancelText="Più tardi!"
                variant="primary"
                onConfirm={relaunch}
            />
        ));
    };

    const hasImgurHtmlDomain = errors.some(isImgurHtmlDomain);

    return (
        <ErrorCard>
            <Forms.FormTitle tag="h5">Risorse bloccate</Forms.FormTitle>
            <Forms.FormText>Alcune immagini, stili o font sono stati bloccati perché provengono da domini non consentiti.</Forms.FormText>
            <Forms.FormText>È fortemente consigliato spostarli su GitHub o Imgur. Puoi anche consentire i domini se ti fidi completamente.</Forms.FormText>
            <Forms.FormText>
                Dopo aver consentito un dominio, devi chiudere completamente (dall’area di notifica / Gestione attività) e riavviare {IS_DISCORD_DESKTOP ? "Discord" : "Vesktop"} per applicare la modifica.
            </Forms.FormText>

            <Forms.FormTitle tag="h5" className={classes(Margins.top16, Margins.bottom8)}>URL bloccati</Forms.FormTitle>
            <div className="vc-settings-csp-list">
                {errors.map((url, i) => (
                    <div key={url}>
                        {i !== 0 && <Divider className={Margins.bottom8} />}
                        <div className="vc-settings-csp-row">
                            <Link href={url}>{url}</Link>
                            <Button color={Button.Colors.PRIMARY} onClick={() => allowUrl(url)} disabled={isImgurHtmlDomain(url)}>
                                Consenti
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {hasImgurHtmlDomain && (
                <>
                    <Divider className={classes(Margins.top8, Margins.bottom16)} />
                    <Forms.FormText>
                        I link Imgur devono essere link diretti nel formato <code>https://i.imgur.com/...</code>
                    </Forms.FormText>
                    <Forms.FormText>Per ottenere un link diretto, fai clic destro sull’immagine e seleziona "Copia indirizzo immagine".</Forms.FormText>
                </>
            )}
        </ErrorCard>
    );
}
