// app/shared/components/ui/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  text?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "#28a745",
  text,
  fullPage = false,
}) => {
  const sizes = {
    sm: { width: "1.5rem", height: "1.5rem" },
    md: { width: "3rem", height: "3rem" },
    lg: { width: "5rem", height: "5rem" },
  };

  const spinner = (
    <div className="d-flex flex-column align-items-center">
      <div
        className="spinner-border"
        style={{
          ...sizes[size],
          color,
          borderWidth: size === "sm" ? "0.15em" : "0.25em",
        }}
        role="status"
      >
        <span className="visually-hidden">Chargement...</span>
      </div>
      {text && <span className="mt-3 text-muted">{text}</span>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};
