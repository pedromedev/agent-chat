import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { Users, Activity, CreditCard, DollarSign, LogOut } from 'lucide-react';

// Dados mocados para o dashboard
const mockStats = [
  {
    title: "Total de Usuários",
    value: "2,847",
    description: "+12% em relação ao mês passado",
    icon: Users,
    color: "text-blue-600"
  },
  {
    title: "Atividade",
    value: "1,234",
    description: "+8% em relação à semana passada",
    icon: Activity,
    color: "text-green-600"
  },
  {
    title: "Vendas",
    value: "R$ 54,231",
    description: "+15% em relação ao mês passado",
    icon: CreditCard,
    color: "text-purple-600"
  },
  {
    title: "Receita",
    value: "R$ 129,847",
    description: "+7% em relação ao último trimestre",
    icon: DollarSign,
    color: "text-orange-600"
  }
];

const recentActivities = [
  { id: 1, user: "João Silva", action: "Criou nova conta", time: "2 min atrás" },
  { id: 2, user: "Maria Santos", action: "Realizou compra", time: "5 min atrás" },
  { id: 3, user: "Pedro Costa", action: "Atualizou perfil", time: "10 min atrás" },
  { id: 4, user: "Ana Oliveira", action: "Cancelou assinatura", time: "15 min atrás" },
  { id: 5, user: "Carlos Lima", action: "Enviou feedback", time: "20 min atrás" }
];

export function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Dashboard BHVR
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="text-gray-500">Bem-vindo,</p>
                <p className="font-medium text-gray-900">{user?.name}</p>
              </div>
              
              {user?.avatar && (
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.avatar}
                  alt={user.name}
                />
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {mockStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>
                  Últimas ações dos usuários no sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {activity.user.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.user}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.action}
                        </p>
                      </div>
                      <div className="text-sm text-gray-400">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
                <CardDescription>
                  Informações sobre o desempenho da aplicação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">CPU</span>
                    <span className="text-sm text-green-600">23%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Memória</span>
                    <span className="text-sm text-blue-600">67%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Armazenamento</span>
                    <span className="text-sm text-orange-600">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Operacional
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 