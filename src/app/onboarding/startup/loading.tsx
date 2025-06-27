import LoadingOverlay from '@/components/ui/loading-overlay';

export default function StartupOnboardingLoading() {
  return (
    <LoadingOverlay
      isVisible={true}
      message="Setting up your startup profile..."
      submessage="Just a moment while we prepare your onboarding experience"
    />
  );
}
