import { LoginForm } from '../components/LoginForm';
import PVTLogo from '../assets/PVT-p.svg';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 ">
        {/* Logo e título */}
        <div className="text-center flex flex-row items-center justify-center ">
          <img
            src={PVTLogo}
            alt="BHVR Logo"
            className="h-24 w-24 mr-4"
          />
          <h2 className="text-3xl font-bold text-gray-900">
            RAG Demo
          </h2>
        </div>

        {/* Formulário de login */}
        <LoginForm />
      </div>
    </div>
  );
} 