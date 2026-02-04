import React from 'react';

interface AdvertisingBannerProps {
    className?: string; // Allow custom classes for positioning/margins
}

const AdvertisingBanner: React.FC<AdvertisingBannerProps> = ({ className }) => {
    // If className is provided, use it (plus the base background).
    // If not, use the default centered layout.
    const containerClasses = className
        ? `w-full bg-[#E40000] ${className}`
        : `w-full bg-[#E40000] py-8 flex items-center justify-center`;

    return (
        <div className={containerClasses}>
            <div className="flex flex-col gap-2">
                <h2 className="text-white text-3xl font-bold uppercase tracking-widest text-center">
                    Anuncio 1
                </h2>
                {/* Optional description text often found in the design */}
                {className && className.includes("items-start") && (
                    <p className="text-white text-lg font-normal text-left">
                        Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
                    </p>
                )}
            </div>
        </div>
    );
};

export default AdvertisingBanner;
