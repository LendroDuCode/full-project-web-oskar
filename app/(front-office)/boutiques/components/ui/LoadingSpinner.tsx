// app/components/ui/LoadingSpinner.tsx
export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm text-gray-500">Chargement...</span>
        </div>
      </div>
    </div>
  );
}
