import type { BudgetHeader, BudgetClient, BudgetItem } from '@/types/budget';
import type { Logo } from '@/types/proposal';
import { formatBRL } from '@/lib/format';
import { getDiscountAmount, getFinalTotal, getItemTotal, getSubtotal } from '@/lib/budgetCalculations';

interface TableProps {
  items: BudgetItem[];
  desconto: number;
}

type Variant = 'modern' | 'formal' | 'tech';

function partyBoxClass(variant: Variant) {
  if (variant === 'formal') return 'bg-slate-50 dark:bg-slate-800 p-2.5 rounded border border-slate-200 dark:border-slate-700';
  if (variant === 'tech') return 'bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded border border-slate-200 dark:border-slate-700';
  return 'p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-200 dark:border-slate-700';
}

export function BudgetTitleModern({ finalizedDate, logo }: { finalizedDate?: string; logo?: Logo }) {
  return (
    <div className="flex items-center justify-between gap-4">
      {logo?.preview ? (
        <img src={logo.preview} alt="Logo" className="h-12 object-contain shrink-0" />
      ) : (
        <div className="shrink-0" />
      )}
      <div className="flex items-baseline justify-end gap-4 flex-1">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Orçamento</h1>
        {finalizedDate && (
          <p className="text-xs text-slate-600 dark:text-slate-400 shrink-0">{finalizedDate}</p>
        )}
      </div>
    </div>
  );
}

export function BudgetTitleFormal({ finalizedDate, logo }: { finalizedDate?: string; logo?: Logo }) {
  return (
    <div className="flex items-center justify-between gap-4">
      {logo?.preview ? (
        <img src={logo.preview} alt="Logo" className="h-12 object-contain shrink-0" />
      ) : (
        <div className="w-12 shrink-0" />
      )}
      <div className="flex-1 text-center">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Orçamento</h1>
        {finalizedDate && (
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 uppercase tracking-wide">{finalizedDate}</p>
        )}
      </div>
      <div className="w-12 shrink-0" />
    </div>
  );
}

export function BudgetTitleTech({ finalizedDate, logo }: { finalizedDate?: string; logo?: Logo }) {
  return (
    <div className="flex items-center justify-between gap-4">
      {logo?.preview ? (
        <div className="bg-white dark:bg-slate-700 p-1.5 rounded shrink-0">
          <img src={logo.preview} alt="Logo" className="h-10 object-contain" />
        </div>
      ) : (
        <div className="shrink-0" />
      )}
      <div className="flex-1 text-center">
        <h1 className="text-xl font-bold tracking-tight text-white">Orçamento</h1>
        {finalizedDate && (
          <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wide">{finalizedDate}</p>
        )}
      </div>
      <div className="shrink-0" />
    </div>
  );
}

export function BudgetPartiesCompact({
  header,
  client,
  variant = 'modern',
}: {
  header: BudgetHeader;
  client: BudgetClient;
  variant?: Variant;
}) {
  const box = partyBoxClass(variant);
  const labelClass = 'text-[10px] uppercase tracking-wide font-semibold text-slate-500 dark:text-slate-400 mb-1';
  const textClass = 'text-xs text-slate-600 dark:text-slate-400 leading-snug';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 budget-parties">
      {client.nomeCliente.trim() && (
        <div className={box}>
          <p className={labelClass}>Cliente</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{client.nomeCliente}</p>
          {client.veiculo.trim() && (
            <p className={`${textClass} mt-1`}>
              <span className="font-medium text-slate-700 dark:text-slate-300">Veículo:</span> {client.veiculo}
            </p>
          )}
        </div>
      )}

      <div className={box}>
        <p className={labelClass}>Empresa</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">{header.nomeEmpresa || '—'}</p>
        <div className={`${textClass} mt-1 space-y-0.5`}>
          {header.cnpj && <p><span className="font-medium text-slate-700 dark:text-slate-300">CNPJ:</span> {header.cnpj}</p>}
          {header.inscricaoEstadual && (
            <p><span className="font-medium text-slate-700 dark:text-slate-300">IE:</span> {header.inscricaoEstadual}</p>
          )}
          {header.enderecoCompleto && <p>{header.enderecoCompleto}</p>}
          {(header.cidade || header.estado || header.cep) && (
            <p>
              {[header.cidade, header.estado].filter(Boolean).join(' - ')}
              {header.cep && ` · CEP ${header.cep}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function BudgetProductsTable({ items, desconto }: TableProps) {
  const subtotal = getSubtotal(items);
  const discountAmount = getDiscountAmount(subtotal, desconto);
  const finalTotal = getFinalTotal(items, desconto);

  const thClass = 'px-2 py-1.5 text-[10px] uppercase tracking-wide text-slate-600 dark:text-slate-400 font-semibold';
  const tdClass = 'px-2 py-1 text-xs text-slate-900 dark:text-white';

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">Produtos</p>
      <div className="border border-slate-200 dark:border-slate-700 rounded overflow-hidden">
        <table className="w-full budget-products-table">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className={`${thClass} text-left`}>Descrição</th>
              <th className={`${thClass} text-right w-24`}>Unit.</th>
              <th className={`${thClass} text-center w-12`}>Qtd</th>
              <th className={`${thClass} text-right w-24`}>Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id}>
                  <td className={`${tdClass} font-medium`}>{item.descricao}</td>
                  <td className={`${tdClass} text-right text-slate-600 dark:text-slate-400`}>R$ {formatBRL(item.valorUnitario)}</td>
                  <td className={`${tdClass} text-center font-semibold`}>{item.quantidade}</td>
                  <td className={`${tdClass} text-right font-semibold`}>R$ {formatBRL(getItemTotal(item))}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-2 py-4 text-center text-xs text-slate-400 italic">Nenhum produto adicionado</td>
              </tr>
            )}
          </tbody>
        </table>

        {items.length > 0 && (
          <div className="budget-totals bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex justify-between px-2 py-1.5">
              <span className="font-semibold text-slate-900 dark:text-white">Subtotal</span>
              <span className="font-semibold">R$ {formatBRL(subtotal)}</span>
            </div>
            {desconto > 0 && (
              <div className="flex justify-between px-2 py-1.5 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-600 dark:text-slate-400">Desconto ({desconto}%)</span>
                <span className="text-destructive font-semibold">- R$ {formatBRL(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between px-2 py-2 border-t border-slate-200 dark:border-slate-700">
              <span className="font-bold">Valor Final</span>
              <span className="font-bold text-sm">R$ {formatBRL(finalTotal)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
