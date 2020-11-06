import {useRef, useEffect} from "react";

export const useMounted = () => {
    const mounted = useRef(true);

    useEffect(() => {
        return () => {
            mounted.current = false;
        };
    }, []);

    return mounted;
};
