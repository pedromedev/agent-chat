import React from 'react';
import { LoginForm } from '../components/LoginForm';
import beaver from '../assets/beaver.svg';

export function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo e título */}
        <div className="text-center">
          <img
            src={beaver}
            alt="BHVR Logo"
            className="mx-auto h-16 w-16 mb-4"
          />
          <h2 className="text-3xl font-bold text-gray-900">
            BHVR Template
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Bun + Hono + Vite + React
          </p>
        </div>

        {/* Formulário de login */}
        <LoginForm />
      </div>
    </div>
  );
} 