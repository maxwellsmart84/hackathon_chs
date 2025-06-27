import LoadingOverlay from '@/components/ui/loading-overlay';

export default function StakeholderOnboardingLoading() {
  return (
    <LoadingOverlay
      isVisible={true}
      message="Setting up your stakeholder profile..."
      submessage="Just a moment while we prepare your onboarding experience"
    />
  );
}
