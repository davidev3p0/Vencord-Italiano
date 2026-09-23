/*
 * Vencord, a Discord client mod
 * Copyright (c) 2025 Vendicated and contributors
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import { FormSwitch } from "@components/FormSwitch";
import { Margins } from "@utils/margins";
import { Forms, Parser, TextInput, useEffect, useState } from "@webpack/common";

const RegexGuide = {
    "\\i": "Sequenza di escape regex speciale che corrisponde agli identificatori (nomi variabili, classi, ecc.)",
    "$$": "Inserisci un $",
    "$&": "Inserisci l’intera corrispondenza",
    "$`\u200b": "Inserisci la sottostringa precedente alla corrispondenza",
    "$'": "Inserisci la sottostringa successiva alla corrispondenza",
    "$n": "Inserisci l’n-esimo gruppo di cattura ($1, $2...)",
    "$self": "Inserisci l’istanza del plugin",
} as const;

export function ReplacementInput({ replacement, setReplacement, replacementError }) {
    const [isFunc, setIsFunc] = useState(false);
    const [error, setError] = useState<string>();

    function onChange(v: string) {
        setError(void 0);

        if (isFunc) {
            try {
                const func = (0, eval)(v);
                if (typeof func === "function")
                    setReplacement(() => func);

                else
                    setError("La sostituzione deve essere una funzione");
            } catch (e) {
                setReplacement(v);
                setError((e as Error).message);
            }
        } else {
            setReplacement(v);
        }
    }

    useEffect(() => {
        if (isFunc)
            onChange(replacement);
        else
            setError(void 0);
    }, [isFunc]);

    return (
        <>
            {/* FormTitle adds a class if className is not set, so we set it to an empty string to prevent that */}
            <Forms.FormTitle className="">Sostituzione</Forms.FormTitle>
            <TextInput
                value={replacement?.toString()}
                onChange={onChange}
                error={error ?? replacementError}
            />
            {!isFunc && (
                <div>
                    <Forms.FormTitle className={Margins.top8}>Promemoria</Forms.FormTitle>

                    {Object.entries(RegexGuide).map(([placeholder, desc]) => (
                        <Forms.FormText key={placeholder}>
                            {Parser.parse("`" + placeholder + "`")}: {desc}
                        </Forms.FormText>
                    ))}
                </div>
            )}

            <FormSwitch
                className={Margins.top16}
                value={isFunc}
                onChange={setIsFunc}
                title={"Tratta la sostituzione come funzione"}
                description='Se abilitato, "Sostituzione" verrà valutata come funzione'
                hideBorder
            />
        </>
    );
}
