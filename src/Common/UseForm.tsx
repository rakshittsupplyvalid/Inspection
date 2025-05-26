import { useState } from "react";

type State = {
    form: Record<string, any>;
    hidden: Record<string, any>;
    fielddata: Record<string, any>;
    disable: Record<string, any>;
    status: Record<string, any>;
    refs: Record<string, any>;
};

const defaultValue: State = {
    form: {},
    hidden: {},
    fielddata: {},
    disable: {},
    status: {},
    refs: {},
};

export default function useForm() {
    const [state, setState] = useState<State>(() => JSON.parse(JSON.stringify(defaultValue)));

    function updateState(data: Partial<State>) {
        setState(prev => {
            const newState = { ...prev };

            for (const key in data) {
                const value = data[key as keyof State];

                if (
                    ["string", "number", "boolean", "bigint", "function"].includes(typeof value) ||
                    value === null ||
                    value === undefined
                ) {
                    newState[key as keyof State] = value as any;
                } else if (Array.isArray(value)) {
                    newState[key as keyof State] = [
                        ...(prev[key as keyof State] as unknown as any[]) || [],
                        ...value,
                    ] as any;
                } else if (typeof value === "object") {
                    newState[key as keyof State] = {
                        ...(prev[key as keyof State] || {}),
                        ...value,
                    };
                } else {
                    newState[key as keyof State] = value as any;
                }
            }

            return newState;
        });
    }

    function updateForm(data: Record<string, any>) {
        setState(prev => ({
            ...prev,
            form: { ...prev.form, ...data },
        }));
    }

    function updateData(data: Record<string, any>) {
        setState(prev => ({
            ...prev,
            fielddata: { ...prev.fielddata, ...data },
        }));
    }

    function updateHidden(data: Record<string, any>) {
        setState(prev => ({
            ...prev,
            hidden: { ...prev.hidden, ...data },
        }));
    }

    function updateDisable(data: Record<string, any>) {
        setState(prev => ({
            ...prev,
            disable: { ...prev.disable, ...data },
        }));
    }

    function updateRef(data: Record<string, any>) {
        setState(prev => ({
            ...prev,
            refs: { ...prev.refs, ...data },
        }));
    }

    function upState(data: Partial<State> | null) {
        if (data === null) {
            setState(JSON.parse(JSON.stringify(defaultValue)));
            return;
        }

        setState(prev => {
            const result: State = { ...prev };

            for (const key in prev) {
                if (Object.prototype.hasOwnProperty.call(defaultValue, key)) {
                    result[key as keyof State] =
                        data[key as keyof State] === null
                            ? {}
                            : { ...prev[key as keyof State], ...data[key as keyof State] };
                } else {
                    result[key as keyof State] = data[key as keyof State] ?? prev[key as keyof State];
                }
            }

            for (const key in data) {
                if (!Object.prototype.hasOwnProperty.call(defaultValue, key)) {
                    result[key as keyof State] = JSON.parse(JSON.stringify(data[key as keyof State]));
                }
            }

            return result;
        });
    }

    return {
        state,
        updateForm,
        updateData,
        updateHidden,
        updateDisable,
        updateRef,
        updateState: upState,
    };
}
