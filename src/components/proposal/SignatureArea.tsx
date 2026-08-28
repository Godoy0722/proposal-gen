'use client';

interface SignatureAreaProps {
  signatureDate?: string;
}

export function SignatureArea({ signatureDate }: SignatureAreaProps) {
  return (
    <div className="space-y-6 signature-area">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Assinaturas
      </h2>

      {signatureDate && (
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Data da proposta:
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {signatureDate}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contratante Signature */}
        <div className="space-y-4">
          <h3 className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
            Contratante
          </h3>
          <div className="space-y-2">
            <div className="border-b-2 border-gray-400 dark:border-gray-600 pb-1 pt-16">
              <p className="text-sm text-gray-500 dark:text-gray-500 italic text-center">
                Espaço para assinatura
              </p>
            </div>
            <div className="border-b border-gray-300 dark:border-gray-600 pb-1 pt-8">
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                Nome completo
              </p>
            </div>
          </div>
        </div>

        {/* Contratada Signature */}
        <div className="space-y-4">
          <h3 className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 font-semibold">
            Contratada
          </h3>
          <div className="space-y-2">
            <div className="border-b-2 border-gray-400 dark:border-gray-600 pb-1 pt-16">
              <p className="text-sm text-gray-500 dark:text-gray-500 italic text-center">
                Espaço para assinatura
              </p>
            </div>
            <div className="border-b border-gray-300 dark:border-gray-600 pb-1 pt-8">
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                Nome completo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
