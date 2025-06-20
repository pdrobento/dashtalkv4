import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Palette, X } from "lucide-react";
import { CreateStageData } from "../types/kanban";
import { useIsMobile } from "../hooks/use-mobile";

interface ModalCreateStageProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStage: (stageData: CreateStageData) => Promise<void>;
}

const PREDEFINED_COLORS = [
  "#10B981", // Green
  "#3B82F6", // Blue
  "#F59E0B", // Yellow
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#84CC16", // Lime
  "#EC4899", // Pink
  "#6B7280", // Gray
];

export const ModalCreateStage: React.FC<ModalCreateStageProps> = ({
  isOpen,
  onClose,
  onCreateStage,
}) => {
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(PREDEFINED_COLORS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Título é obrigatório");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await onCreateStage({
        title: title.trim(),
        color: selectedColor,
      });

      // Reset form
      setTitle("");
      setSelectedColor(PREDEFINED_COLORS[0]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar etapa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTitle("");
      setSelectedColor(PREDEFINED_COLORS[0]);
      setError(null);
      onClose();
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={`
        bg-[var(--zatten-bg-secondary)] border-[var(--zatten-border-primary)] 
        text-[var(--zatten-text-primary)] w-full max-h-[90vh] overflow-y-auto
        ${isMobile ? "max-w-[95vw] m-4 rounded-lg" : "sm:max-w-[425px]"}
      `}
      >
        <DialogHeader className={isMobile ? "relative pb-4" : ""}>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
              className="absolute right-0 top-0 h-6 w-6 p-0 hover:bg-[var(--zatten-bg-hover)]"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <DialogTitle
            className={`text-[var(--zatten-text-primary)] ${
              isMobile ? "text-lg pr-8" : ""
            }`}
          >
            Nova Etapa
          </DialogTitle>
          <DialogDescription
            className={`text-[var(--zatten-text-muted)] ${
              isMobile ? "text-sm" : ""
            }`}
          >
            Crie uma nova etapa para organizar seus contatos no Kanban.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className={`space-y-4 ${isMobile ? "px-1" : ""}`}
        >
          <div className="space-y-2">
            <Label
              htmlFor="title"
              className={`text-[var(--zatten-text-secondary)] ${
                isMobile ? "text-sm" : ""
              }`}
            >
              Título da Etapa
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Lead Qualificado"
              disabled={isLoading}
              className={`zatten-input ${isMobile ? "text-base" : ""}`}
              autoComplete="off"
            />
          </div>

          <div className="space-y-3">
            <Label
              className={`flex items-center space-x-2 text-[var(--zatten-text-secondary)] ${
                isMobile ? "text-sm" : ""
              }`}
            >
              <Palette className="h-4 w-4" />
              <span>Cor da Etapa</span>
            </Label>

            {/* Color grid - responsive layout */}
            <div
              className={`grid gap-2 ${
                isMobile ? "grid-cols-5" : "grid-cols-5"
              }`}
            >
              {PREDEFINED_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`
                    ${
                      isMobile ? "h-10 w-10" : "h-8 w-8"
                    } rounded-full border-2 transition-all 
                    hover:scale-105 active:scale-95
                    ${
                      selectedColor === color
                        ? "border-[var(--zatten-accent)] scale-110 ring-2 ring-[var(--zatten-accent)]/30"
                        : "border-[var(--zatten-border-secondary)] hover:border-[var(--zatten-border-primary)]"
                    }
                  `}
                  style={{ backgroundColor: color }}
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Color preview */}
            <div className="flex items-center space-x-2 mt-2">
              <div
                className="h-4 w-4 rounded-full border border-[var(--zatten-border-secondary)]"
                style={{ backgroundColor: selectedColor }}
              />
              <span
                className={`text-[var(--zatten-text-muted)] ${
                  isMobile ? "text-xs" : "text-sm"
                }`}
              >
                Cor selecionada: {selectedColor}
              </span>
            </div>
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="border-[var(--zatten-error)] bg-[var(--zatten-error)]/10"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription
                className={`text-[var(--zatten-error)] ${
                  isMobile ? "text-sm" : ""
                }`}
              >
                {error}
              </AlertDescription>
            </Alert>
          )}

          <DialogFooter
            className={`${
              isMobile
                ? "flex-col-reverse space-y-2 space-y-reverse space-x-0 pt-4"
                : ""
            }`}
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className={`
                border-[var(--zatten-border-secondary)] bg-[var(--zatten-bg-tertiary)] 
                text-[var(--zatten-text-secondary)] hover:bg-[var(--zatten-bg-hover)]
                ${isMobile ? "w-full" : ""}
              `}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !title.trim()}
              className={`
                bg-[var(--zatten-accent)] hover:bg-[var(--zatten-accent-hover)]
                ${isMobile ? "w-full" : ""}
              `}
            >
              {isLoading ? "Criando..." : "Criar Etapa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
