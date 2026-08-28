
import { ProposalData, Person, Service, Pricing, Logo } from '@/types/proposal';

interface SerializableLogo {
  preview: string;
  fileName?: string;
  fileType?: string;
  lastModified?: number;
}

interface SerializableProposalData extends Omit<ProposalData, 'logo'> {
  logo: SerializableLogo;
  version: string; // To handle future migrations if needed
}

export const exportProposalToJson = (data: ProposalData) => {
  const serializableData: SerializableProposalData = {
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
  link.download = `proposta_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importProposalFromJson = async (file: File): Promise<ProposalData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const parsedData = JSON.parse(jsonString) as SerializableProposalData;
        
        // Restore Logo File object if possible
        let logoFile: File | null = null;
        if (parsedData.logo.preview && parsedData.logo.fileName && parsedData.logo.fileType) {
          try {
            const arr = parsedData.logo.preview.split(',');
            const mime = arr[0].match(/:(.*?);/)?.[1] || parsedData.logo.fileType;
            const bstr = atob(arr[1]);
            let n = bstr.length;
            const u8arr = new Uint8Array(n);
            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }
            logoFile = new File([u8arr], parsedData.logo.fileName, { 
              type: mime,
              lastModified: parsedData.logo.lastModified || Date.now()
            });
          } catch (err) {
            console.warn('Failed to reconstruct File object from preview', err);
          }
        }

        const proposalData: ProposalData = {
          people: parsedData.people || [],
          service: parsedData.service || { description: '' },
          pricing: parsedData.pricing || { type: 'hourly', unitValue: 0, quantity: 0 },
          logo: {
            preview: parsedData.logo.preview || '',
            file: logoFile
          },
          selectedTemplate: parsedData.selectedTemplate || 1,
          finalized: parsedData.finalized || false,
          finalizedDate: parsedData.finalizedDate,
          signatureDate: parsedData.signatureDate,
        };

        resolve(proposalData);
      } catch (err) {
        reject(new Error('Falha ao ler o arquivo JSON. Verifique se o formato está correto.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo.'));
    };

    reader.readAsText(file);
  });
};
