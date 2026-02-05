import { createFileRoute } from '@tanstack/react-router';
import Investments from '../features/investments/Investments';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const Route = createFileRoute('/investments')({
  component: () => (
    <ProtectedRoute>
      <Investments />
    </ProtectedRoute>
  ),
});
