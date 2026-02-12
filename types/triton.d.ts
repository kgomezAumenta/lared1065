import React from 'react';

// Global types for Window and Legacy JSX
declare global {
    interface Window {
        appReady: (object: any) => void;
        switchStation: (station: string) => void;
        widgetPlayer: any;
    }

    namespace JSX {
        interface IntrinsicElements {
            'td-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                id?: string;
                type?: string;
                highlightcolor?: string;
                primarycolor?: string;
                secondarycolor?: string;
                station?: string;
                onappready?: string;
                defaultcoverart?: string;
                class?: string;
            };
        }
    }
}

// Augmentation for React 18+ / jsx-runtime
declare module 'react' {
    namespace JSX {
        interface IntrinsicElements {
            'td-player': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
                id?: string;
                type?: string;
                highlightcolor?: string;
                primarycolor?: string;
                secondarycolor?: string;
                station?: string;
                onappready?: string;
                defaultcoverart?: string;
                class?: string;
            };
        }
    }
}
