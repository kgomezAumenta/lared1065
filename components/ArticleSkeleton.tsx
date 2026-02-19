export default function ArticleSkeleton() {
    return (
        <div className="flex-1 w-full max-w-[900px] mb-24 animate-pulse">
            {/* Category Pill Skeleton */}
            <div className="flex justify-start mb-4">
                <div className="h-8 w-24 bg-gray-200 rounded-[10px]"></div>
            </div>

            {/* Title Skeleton */}
            <div className="h-10 w-3/4 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 w-1/2 bg-gray-200 rounded mb-6"></div>

            {/* Meta Skeleton */}
            <div className="flex justify-between items-center w-full mb-6">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>

            {/* Featured Image Skeleton */}
            <div className="relative w-full aspect-video mb-8 bg-gray-200 rounded-[20px]"></div>

            {/* Content Skeleton */}
            <div className="space-y-4">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-4/5 bg-gray-200 rounded"></div>
            </div>
        </div>
    );
}
