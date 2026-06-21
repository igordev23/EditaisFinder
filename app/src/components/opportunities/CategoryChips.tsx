import type { Categoria } from '../../types/categorias'

interface CategoryChipsProps {
  categorias: Categoria[]
  selected: string[]
  onToggle: (id: string) => void
}

export default function CategoryChips({ categorias, selected, onToggle }: CategoryChipsProps) {
  if (categorias.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categorias.map((cat) => {
        const ativa = selected.includes(cat.id)
        return (
          <button
            key={cat.id}
            onClick={() => onToggle(cat.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              ativa
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            {cat.label}
          </button>
        )
      })}
    </div>
  )
}
