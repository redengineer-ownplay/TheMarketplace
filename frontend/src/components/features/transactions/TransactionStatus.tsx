import { memo } from "react"

export const TransactionStatus = memo(function TransactionStatus({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return (
        <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full">
          Completed
        </span>
      )
    case 'pending':
      return (
        <span className="text-xs bg-warning/10 text-warning px-2 py-1 rounded-full">
          Pending
        </span>
      )
    default:
      return (
        <span className="text-xs bg-error/10 text-error px-2 py-1 rounded-full">
          Failed
        </span>
      )
  }
})