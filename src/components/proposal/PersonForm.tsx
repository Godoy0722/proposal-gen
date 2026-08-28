'use client';

import { Person, PersonType } from '@/types/proposal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PersonFormProps {
  people: Person[];
  onPeopleChange: (people: Person[]) => void;
}

export function PersonForm({ people, onPeopleChange }: PersonFormProps) {
  const [newPerson, setNewPerson] = useState<Partial<Person>>({
    type: 'CONTRATADA',
    nomeCompleto: '',
    cpfCnpj: '',
    email: '',
  });

  const addPerson = () => {
    if (!newPerson.nomeCompleto || !newPerson.cpfCnpj || !newPerson.email) {
      return;
    }

    const person: Person = {
      id: Date.now().toString(),
      type: newPerson.type || 'CONTRATADA',
      nomeCompleto: newPerson.nomeCompleto,
      cpfCnpj: newPerson.cpfCnpj,
      email: newPerson.email,
    };

    onPeopleChange([...people, person]);

    setNewPerson({
      type: 'CONTRATADA',
      nomeCompleto: '',
      cpfCnpj: '',
      email: '',
    });
  };

  const removePerson = (id: string) => {
    onPeopleChange(people.filter(p => p.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Pessoas</CardTitle>
        <CardDescription>
          Adicione contratantes e contratados à proposta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
          <div className="space-y-2">
            <Label>Tipo</Label>
            <RadioGroup
              value={newPerson.type}
              onValueChange={(value: PersonType) =>
                setNewPerson({ ...newPerson, type: value })
              }
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CONTRATANTE" id="contratante" />
                <Label htmlFor="contratante" className="cursor-pointer">
                  Contratante
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="CONTRATADA" id="contratada" />
                <Label htmlFor="contratada" className="cursor-pointer">
                  Contratada
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nomeCompleto">Nome Completo *</Label>
            <Input
              id="nomeCompleto"
              value={newPerson.nomeCompleto}
              onChange={(e) =>
                setNewPerson({ ...newPerson, nomeCompleto: e.target.value })
              }
              placeholder="Nome completo da pessoa ou empresa"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpfCnpj">CPF/CNPJ *</Label>
            <Input
              id="cpfCnpj"
              value={newPerson.cpfCnpj}
              onChange={(e) =>
                setNewPerson({ ...newPerson, cpfCnpj: e.target.value })
              }
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              type="email"
              value={newPerson.email}
              onChange={(e) =>
                setNewPerson({ ...newPerson, email: e.target.value })
              }
              placeholder="email@exemplo.com"
            />
          </div>

          <Button onClick={addPerson} className="w-full" size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Pessoa
          </Button>
        </div>

        {people.length > 0 && (
          <div className="space-y-3">
            <Label className="text-base font-semibold">Pessoas Cadastradas</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {people.map((person) => (
                <div
                  key={person.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          person.type === 'CONTRATANTE'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                        }`}
                      >
                        {person.type.toLowerCase()}
                      </span>
                    </div>
                    <p className="font-medium text-sm">{person.nomeCompleto}</p>
                    <p className="text-xs text-muted-foreground">{person.cpfCnpj}</p>
                    <p className="text-xs text-muted-foreground">{person.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePerson(person.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
