import { Loader2 } from "lucide-react"

interface LoadMoreProps {
    isLoadingMore?: boolean
    handleLoadMore: (...[]: any) => void
}

export const LoadMore = ({
    isLoadingMore,
    handleLoadMore
}: LoadMoreProps) => {
    return (
        <div className="mt-8 flex justify-center">
            {isLoadingMore ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            ) : (
            <button onClick={handleLoadMore} className="button button-primary">
                Load More
            </button>
            )}
        </div>
    )
}