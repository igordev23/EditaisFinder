interface FilterBarProps {
  tipo: string
  onTipoChange: (tipo: string) => void
}

const TIPOS = [
  { value: '', label: 'Todos' },
  { value: 'estagio', label: 'Estágio' },
  { value: 'bolsa', label: 'Bolsa' },
  { value: 'monitoria', label: 'Monitoria' },
  { value: 'emprego', label: 'Emprego' },
  { value: 'edital', label: 'Edital' },
]

export default function FilterBar({ tipo, onTipoChange }: FilterBarProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      <select
        value={tipo}
        onChange={(e) => onTipoChange(e.target.value)}
        className="rounded border border-gray-300 px-3 py-2 text-sm bg-white focus:border-indigo-500 focus:ring-indigo-500"
      >
        {TIPOS.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>
    </div>
  )
}
