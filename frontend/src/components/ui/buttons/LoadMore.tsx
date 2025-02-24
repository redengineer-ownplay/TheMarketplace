import { Loader2 } from 'lucide-react';

interface LoadMoreProps {
  isLoadingMore?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleLoadMore: (...[]: any) => void;
}

export const LoadMore = ({ isLoadingMore, handleLoadMore }: LoadMoreProps) => {
  return (
    <div className="mt-8 flex justify-center">
      {isLoadingMore ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      ) : (
        <button onClick={handleLoadMore} className="button button-primary">
          Load More
        </button>
      )}
    </div>
  );
};
