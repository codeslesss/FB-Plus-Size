interface AsyncStateProps {
  error: string
  onRetry: () => void
}

function AsyncState({ error, onRetry }: AsyncStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-sm py-xl text-center bg-surface-container-low rounded-xl border border-outline-variant">
      <span className="material-symbols-outlined text-error text-[32px]">error</span>
      <p className="text-body-md font-body-md text-on-surface-variant">{error}</p>
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-2 px-4 h-10 rounded-lg border border-primary-container text-primary-container font-label-lg text-label-lg hover:bg-primary-container/10 transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">refresh</span>
        Tentar novamente
      </button>
    </div>
  )
}

export default AsyncState
