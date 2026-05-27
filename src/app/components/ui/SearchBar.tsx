import { Search, X } from 'lucide-react';
import { useState } from 'react';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (value: string) => void;
  className?: string;
}

export default function SearchBar({
  placeholder = 'Buscar...',
  onSearch,
  className = '',
}: SearchBarProps) {
  const [value, setValue] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onSearch?.(newValue);
  };

  const handleClear = () => {
    setValue('');
    onSearch?.('');
  };

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-md transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
