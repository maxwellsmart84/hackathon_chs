import { Heart } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="space-y-6 text-center">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center space-x-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-green-600">
            <Heart className="h-7 w-7 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">Innovation Engine</span>
        </div>

        {/* Loading Animation */}
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-green-600"></div>

        {/* Loading Text */}
        <p className="text-lg text-gray-600">Loading MUSC Innovation Engine...</p>
        <p className="text-sm text-gray-500">Connecting MedTech Innovation with Excellence</p>
      </div>
    </div>
  );
}
