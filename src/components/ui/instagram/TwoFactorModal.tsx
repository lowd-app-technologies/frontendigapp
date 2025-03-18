import type React from "react";
import { motion } from "framer-motion";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
  twoFactorCode: string;
  setTwoFactorCode: React.Dispatch<React.SetStateAction<string>>;
}

const TwoFactorModal: React.FC<TwoFactorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  twoFactorCode,
  setTwoFactorCode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-lg font-bold mb-4">Autenticação de Dois Fatores</h2>
        <p className="text-sm mb-4">
          Digite o código de dois fatores enviado ao seu dispositivo.
        </p>
        <Input
          type="text"
          value={twoFactorCode}
          onChange={(e) => setTwoFactorCode(e.target.value)}
          placeholder="Código de dois fatores"
          className="mb-4"
        />
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} variant="default">
            Cancelar
          </Button>
          <Button onClick={() => onSubmit(twoFactorCode)} variant="solid">
            Enviar Código
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default TwoFactorModal;