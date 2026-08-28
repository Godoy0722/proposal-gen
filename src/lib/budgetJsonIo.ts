import type { BudgetData, BudgetHeader, BudgetClient } from '@/types/budget';

interface SerializableLogo {
  preview: string;
  fileName?: string;
  fileType?: string;
  lastModified?: number;
}

interface SerializableBudgetData extends Omit<BudgetData, 'logo'> {
  logo: SerializableLogo;
  version: string;
}

export function normalizeBudgetHeader(header?: Partial<BudgetHeader>): BudgetHeader {
  return {
    nomeEmpresa: header?.nomeEmpresa ?? '',
    cnpj: header?.cnpj ?? '',
    inscricaoEstadual: header?.inscricaoEstadual ?? '',
    enderecoCompleto: header?.enderecoCompleto ?? '',
    cidade: header?.cidade ?? '',
    estado: header?.estado ?? '',
    cep: header?.cep ?? '',
    telefoneContato: header?.telefoneContato ?? '',
    telefoneContatoSecundario: header?.telefoneContatoSecundario ?? '',
  };
}

export function normalizeBudgetClient(client?: Partial<BudgetClient>): BudgetClient {
  return {
    nomeCliente: client?.nomeCliente ?? '',
    veiculo: client?.veiculo ?? '',
  };
}

export const exportBudgetToJson = (data: BudgetData) => {
  const serializableData: SerializableBudgetData = {
    ...data,
    logo: {
      preview: data.logo.preview,
      fileName: data.logo.file?.name,
      fileType: data.logo.file?.type,
      lastModified: data.logo.file?.lastModified,
    },
    version: '1.0.0',
  };

  const jsonString = JSON.stringify(serializableData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `orcamento_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importBudgetFromJson = async (file: File): Promise<BudgetData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const parsed = JSON.parse(jsonString) as Partial<SerializableBudgetData>;

        let logoFile: File | null = null;
        if (parsed.logo?.preview && parsed.logo.fileName && parsed.logo.fileType) {
          try {
            const arr = parsed.logo.preview.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || parsed.logo.fileType;
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) u8arr[n] = bstr.charCodeAt(n);
            logoFile = new File([u8arr], parsed.logo.fileName, {
              type: mime,
              lastModified: parsed.logo.lastModified || Date.now(),
            });
          } catch {
            console.warn('Failed to reconstruct logo file from preview');
          }
        }

        const budgetData: BudgetData = {
          header: normalizeBudgetHeader(parsed.header),
          client: normalizeBudgetClient(parsed.client),
          items: parsed.items || [],
          desconto: parsed.desconto || 0,
          selectedTemplate: parsed.selectedTemplate || 1,
          logo: {
            preview: parsed.logo?.preview || '',
            file: logoFile,
          },
          finalized: parsed.finalized || false,
          finalizedDate: parsed.finalizedDate,
        };

        resolve(budgetData);
      } catch {
        reject(new Error('Falha ao ler o arquivo JSON. Verifique se o formato está correto.'));
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
    reader.readAsText(file);
  });
};
