import { useEffect, useState } from 'react';
export function useMeasureHeight(ref) {
    const [pristine, setPristine] = useState(true);
    const [height, setHeight] = useState(0);
    useEffect(()=>{
        const el = ref.current;
        if (!el) {
            return;
        }
        const observer = new ResizeObserver(()=>{
            const { height: h } = el.getBoundingClientRect();
            setHeight((prevHeight)=>{
                if (prevHeight !== 0) {
                    setPristine(false);
                }
                return h;
            });
        });
        observer.observe(el);
        return ()=>{
            observer.disconnect();
            setPristine(true);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return [
        height,
        pristine
    ];
}

//# sourceMappingURL=use-measure-height.js.map