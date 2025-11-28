import { Outlet } from 'react-router-dom';
import Card from '../ui/Card.jsx';

const AuthLayout = () => (
  <div className="flex min-h-screen items-center justify-center bg-milk p-6">
    <Card className="w-full max-w-3xl">
      <Outlet />
    </Card>
  </div>
);

export default AuthLayout;
