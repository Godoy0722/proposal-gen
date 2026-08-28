'use client';

import { Logo } from '@/types/proposal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useRef } from 'react';

interface LogoUploadProps {
  logo: Logo;
  onLogoChange: (logo: Logo) => void;
}

export function LogoUpload({ logo, onLogoChange }: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      alert('Por favor, selecione uma imagem nos formatos PNG, JPG ou SVG');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onLogoChange({
        file: file,
        preview: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    onLogoChange({
      file: null,
      preview: '',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo da Empresa</CardTitle>
        <CardDescription>
          Faça upload do logo da empresa contratada
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml"
          onChange={handleFileChange}
          className="hidden"
        />

        {logo.preview ? (
          <div className="space-y-4">
            <div className="relative border-2 border-dashed rounded-lg p-8 bg-muted/50">
              <img
                src={logo.preview}
                alt="Logo preview"
                className="max-h-48 mx-auto object-contain"
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={handleRemoveLogo}
                className="absolute top-2 right-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-center text-muted-foreground">
              {logo.file?.name}
            </p>
          </div>
        ) : (
          <div
            onClick={handleUploadClick}
            className="border-2 border-dashed rounded-lg p-12 cursor-pointer hover:bg-muted/50 transition-colors"
          >
            <div className="flex flex-col items-center justify-center space-y-4 text-muted-foreground">
              <div className="p-4 bg-muted rounded-full">
                <Upload className="h-8 w-8" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium">
                  Clique para fazer upload do logo
                </p>
                <p className="text-sm">
                  Formatos aceitos: PNG, JPG, SVG
                </p>
                <p className="text-xs">
                  Tamanho máximo recomendado: 500x500px
                </p>
              </div>
            </div>
          </div>
        )}

        {!logo.preview && (
          <Button onClick={handleUploadClick} className="w-full" variant="outline">
            <ImageIcon className="mr-2 h-4 w-4" />
            Selecionar Imagem
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
