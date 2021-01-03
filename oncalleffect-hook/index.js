import {useState, useRef, useEffect} from 'react';

export default function useOnCallEffect(effect) {
    const val = useRef({
        unsubscribe: null,
        mounted: true,
    }).current;
    const [start, setStart] = useState(null);

    useEffect(() => {
        if (start === null) {
            return;
        }

        if (val.unsubscribe != null) {
            val.unsubscribe(true);
        }
        val.unsubscribe = effect();
    }, [start]);

    useEffect(() => {
        return () => {
            if (val.unsubscribe != null) {
                val.unsubscribe(false);
                val.unsubscribe = null;
            }
            val.mounted = false;
        };
    }, []);

    return function call() {
        if (val.mounted) {
            setStart(val => !val);
        } else {
            effect();
        }
    }
};
