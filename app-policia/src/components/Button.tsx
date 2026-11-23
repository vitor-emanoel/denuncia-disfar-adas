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
  className?: string;
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
  className = '',
}: Props) {
  return (
    <button
      className={`button button-${variant} ${className}`.trim()}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}
