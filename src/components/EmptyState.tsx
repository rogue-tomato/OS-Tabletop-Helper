type Props = {
  title: string;
  description?: string;
};

export function EmptyState({ title, description }: Props) {
  return (
    <div className="panel-soft text-center py-10 px-6">
      <p className="font-display text-ember-400 text-lg tracking-wide">{title}</p>
      {description ? (
        <p className="mt-2 text-bone/70 text-sm leading-relaxed">{description}</p>
      ) : null}
    </div>
  );
}
