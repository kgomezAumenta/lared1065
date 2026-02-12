
declare namespace JSX {
    interface IntrinsicElements {
        'td-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
            id?: string;
            type?: string;
            highlightcolor?: string;
            primarycolor?: string;
            secondarycolor?: string;
            station?: string;
            onappready?: string;
            class?: string;
        };
    }
}

interface Window {
    appReady: (object: any) => void;
    switchStation: (station: string) => void;
    widgetPlayer: any;
}
