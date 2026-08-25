interface PlaceholderProps {
  title: string
}

function Placeholder({ title }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-2">
      <h1 className="text-headline-lg font-headline-lg text-on-surface">{title}</h1>
      <p className="text-body-md font-body-md text-on-surface-variant">Em construção.</p>
    </div>
  )
}

export default Placeholder
