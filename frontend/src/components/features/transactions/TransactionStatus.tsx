import { memo } from 'react';

export const TransactionStatus = memo(function TransactionStatus({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return (
        <span className="rounded-full bg-success/10 px-2 py-1 text-xs text-success">Completed</span>
      );
    case 'pending':
      return (
        <span className="rounded-full bg-warning/10 px-2 py-1 text-xs text-warning">Pending</span>
      );
    default:
      return <span className="rounded-full bg-error/10 px-2 py-1 text-xs text-error">Failed</span>;
  }
});
