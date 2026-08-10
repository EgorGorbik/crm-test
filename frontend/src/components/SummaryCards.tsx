type Card = {
  label: string
  value: string
  emphasize?: boolean
}

type Props = {
  cards: Card[]
}

export function SummaryCards({ cards }: Props) {
  return (
    <div className="cards">
      {cards.map((card) => (
        <div
          key={card.label}
          className={card.emphasize ? 'card emphasize' : 'card'}
        >
          <div className="card-label">{card.label}</div>
          <div className="card-value">{card.value}</div>
        </div>
      ))}
    </div>
  )
}
