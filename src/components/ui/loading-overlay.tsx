import { Heart, Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  submessage?: string;
}

export default function LoadingOverlay({
  isVisible,
  message = 'Loading...',
  submessage,
}: LoadingOverlayProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
        <div className="mb-6 flex items-center justify-center space-x-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-600">
            <Heart className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">Innovation Engine</span>
        </div>

        <div className="space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-green-600" />
          <div>
            <p className="text-lg font-medium text-gray-900">{message}</p>
            {submessage && <p className="mt-2 text-sm text-gray-500">{submessage}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
