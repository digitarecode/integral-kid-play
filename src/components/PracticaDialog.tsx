import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Practica } from '@/types/matriz';
import { modulosConfig } from '@/data/matrizData';

interface PracticaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  practica?: Practica | null;
  onSave: (practica: Omit<Practica, 'id'> & { id?: string }) => void;
  currentModule?: string;
}

export const PracticaDialog = ({ open, onOpenChange, practica, onSave, currentModule }: PracticaDialogProps) => {
  const [formData, setFormData] = useState<{
    titulo: string;
    descripcion: string;
    duracion: number;
    nivel: 'facil' | 'intermedio' | 'avanzado';
    modulo: string;
    icono: string;
  }>({
    titulo: '',
    descripcion: '',
    duracion: 15,
    nivel: 'facil',
    modulo: 'cuerpo',
    icono: '🎯'
  });

  useEffect(() => {
    if (practica) {
      setFormData({
        titulo: practica.titulo,
        descripcion: practica.descripcion,
        duracion: practica.duracion,
        nivel: practica.nivel,
        modulo: practica.modulo,
        icono: practica.icono || '🎯'
      });
    } else {
      setFormData({
        titulo: '',
        descripcion: '',
        duracion: 15,
        nivel: 'facil',
        modulo: currentModule || 'cuerpo',
        icono: '🎯'
      });
    }
  }, [practica, open, currentModule]);

  const handleSave = () => {
    if (formData.titulo.trim() && formData.descripcion.trim()) {
      onSave({
        ...formData,
        ...(practica ? { id: practica.id } : {})
      });
      onOpenChange(false);
    }
  };

  const iconos = [
    '🎯', '💪', '🧠', '✨', '🌙', '⚖️', '💖', '😊', '👫', '🏋️', 
    '🏃', '🌬️', '🧘', '🍎', '🔍', '📚', '✏️', '🧩', '💡', '🧘‍♀️', 
    '🤔', '🙏', '💝', '🌳', '🎭', '💭', '🪞', '🎪', '🚲', '🛼', 
    '⚽', '🏀', '⚾', '🎮', '🛏️', '🧸', '🏔️', '🐶', '🐱', '🌈', 
    '🦋', '🌸', '🍎', '🥕'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {practica ? 'Editar Práctica' : 'Nueva Práctica'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
              placeholder="Nombre de la práctica..."
            />
          </div>
          
          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="¿Qué hace esta práctica?..."
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duracion">Duración (minutos)</Label>
              <Input
                id="duracion"
                type="number"
                min="1"
                max="120"
                value={formData.duracion}
                onChange={(e) => setFormData(prev => ({ ...prev, duracion: parseInt(e.target.value) || 15 }))}
              />
            </div>
            
            <div>
              <Label htmlFor="nivel">Nivel</Label>
              <Select value={formData.nivel} onValueChange={(value: 'facil' | 'intermedio' | 'avanzado') => setFormData(prev => ({ ...prev, nivel: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facil">Fácil</SelectItem>
                  <SelectItem value="intermedio">Intermedio</SelectItem>
                  <SelectItem value="avanzado">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="modulo">Módulo</Label>
            <Select value={formData.modulo} onValueChange={(value) => setFormData(prev => ({ ...prev, modulo: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modulosConfig.map(modulo => (
                  <SelectItem key={modulo.id} value={modulo.id}>
                    {modulo.icono} {modulo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="icono">Icono</Label>
            <div className="grid grid-cols-10 gap-2 mt-2">
              {iconos.map(icono => (
                <Button
                  key={icono}
                  type="button"
                  variant={formData.icono === icono ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setFormData(prev => ({ ...prev, icono }))}
                >
                  {icono}
                </Button>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            {practica ? 'Guardar' : 'Crear'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};