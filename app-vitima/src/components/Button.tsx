import type { ReactNode } from 'react';

/**
 * Propriedades customizadas do botão reutilizável.
 */
interface Props {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'whatsapp';
  disabled?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
}

/**
 * Componente de botão padronizado da interface.
 */
export default function Button({
  children,
  variant = 'secondary',
  disabled = false,
  type = 'button',
  onClick,
}: Props) {
  return (
    <button
      className={`button button-${variant}`}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}
