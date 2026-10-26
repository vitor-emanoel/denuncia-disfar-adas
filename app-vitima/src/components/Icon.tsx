/**
 * Mapeamento dos vetores SVG utilizados nos ícones do aplicativo.
 */
const paths = {
  arrow: <path d="m15 18-6-6 6-6" />,
  check: <path d="m5 12 4 4L19 6" />,
  exit: (
    <>
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    </>
  ),
  message: <path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-5.1A8 8 0 1 1 21 15Z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
};

/**
 * Nomes disponíveis para os ícones.
 */
export type IconName = keyof typeof paths;

/**
 * Componente renderizador de ícones vetoriais.
 */
export default function Icon({ name }: { name: IconName }) {
  return (
    <svg aria-hidden="true" className="icon" fill="none" viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
}
