interface CardContainerProps {
  children: React.ReactNode;
  additionalStyle?: string;
}
export function CardContainer({ children, additionalStyle }: CardContainerProps) {
  const baseStyle = 'grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4 sm:gap-8';
  return (
    <div
      className={`${baseStyle} ${additionalStyle}`}
    >
      {children}
    </div>
  );
}
