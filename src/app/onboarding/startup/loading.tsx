export default function StartupOnboardingLoading() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      <p className="text-gray-600">Preparing startup onboarding...</p>
    </div>
  );
}
