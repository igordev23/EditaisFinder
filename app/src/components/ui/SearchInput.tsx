interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onSearch?: () => void
  placeholder?: string
}

export default function SearchInput({ value, onChange, onSearch, placeholder = 'Buscar...' }: SearchInputProps) {
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && onSearch) onSearch()
  }
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full rounded border border-gray-300 pl-3 pr-10 py-2 text-sm bg-white focus:border-indigo-500 focus:ring-indigo-500"
      />
      <button
        type="button"
        onClick={onSearch}
        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-indigo-600 transition"
        title="Refinar busca"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </div>
  )
}
