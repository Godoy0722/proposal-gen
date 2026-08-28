import Link from 'next/link';

interface ModuleNavProps {
  active: 'proposta' | 'orcamento';
}

export function ModuleNav({ active }: ModuleNavProps) {
  return (
    <nav className="flex gap-1 p-1 bg-muted rounded-lg">
      <Link
        href="/"
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          active === 'proposta'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Proposta
      </Link>
      <Link
        href="/orcamento"
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          active === 'orcamento'
            ? 'bg-background text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Orçamento
      </Link>
    </nav>
  );
}
