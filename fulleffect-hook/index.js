import {useRef, useEffect} from 'react';

export default function useFullEffect(effect, deps) {
    const val = useRef({
        unsubscribe: null,
        prev: deps,
        start: null,
    }).current;

    if (val.start === null) {
        val.start = true;
    } else if (deps === undefined) {
        val.start = !val.start;
    } else if (deps.length > 0) {
        for (let i = 0; i < deps.length; i++) {
            if (deps[i] !== val.prev[i]) {
                val.start = !val.start;
                break;
            }
        }
    }

    useEffect(() => {
        if (val.unsubscribe != null) {
            val.unsubscribe(true);
        }
        val.unsubscribe = effect();
        val.prev = deps;
    }, [val.start]);

    useEffect(() => {
        return () => {
            if (val.unsubscribe != null) {
                val.unsubscribe(false);
                val.unsubscribe = null;
            }
        };
    }, []);
};
