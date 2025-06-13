# GetParked 🚗

## Sobre o Projeto

GetParked é um MVP (Minimum Viable Product) desenvolvido como parte do Projeto II, transformando um pitch numa aplicação funcional. O projeto visa resolver o problema de estacionamento em áreas urbanas, oferecendo uma plataforma que liga condutores a lugares disponíveis.

## Objetivo da Aplicação

A aplicação **GetParked** tem como objetivo ajudar condutores a encontrar, reservar e pagar por lugares de estacionamento de forma rápida, simples e segura. Através da geolocalização e de um mapa interativo, os utilizadores podem ver em tempo real os lugares disponíveis públicos (utilizador comum) ou privados (utilizador premium) num raio próximo ao selecionado.

A plataforma também permite que qualquer utilizador registe lugares disponíveis em espaço público, promovendo a partilha comunitária. Parques de estacionamento privados parceiros podem gerir os seus lugares através de um backoffice dedicado.

## Funcionalidades Principais

### Funcionalidades Base
- 🗺️ Mapa interativo com visualização de lugares num raio de 10km
- 🔍 Procura de lugares por geolocalização
- 💰 Sistema de pagamento integrado (cartão de débito/crédito)
- 📱 Interface responsiva com suporte computador/telemóvel
- 🔐 Autenticação e gestão de conta de utilizador
- 📍 Geolocalização em tempo real

### Tipos de Utilizador
#### Utilizador Gratuito
- Registo de 1 veículo por conta
- Acesso a lugares públicos
- Registo de lugares disponíveis
- Sistema de pontos de recompensa

#### Utilizador Premium
- Registo até 3 veículos por conta
- Acesso a lugares públicos e privados
- Registo de lugares disponíveis
- Sistema de pontos de recompensa avançado

#### Parceiros (Parques Privados)
- Acesso ao backoffice de gestão
- Gestão de horários de funcionamento
- Controlo de preçário
- Atualização de lugares disponíveis
- Gestão de localização

### Características Especiais
- ⏲️ Tempo limite de 5 minutos para lugares públicos
- 🎮 Sistema de gamificação com pontos de recompensa
- 💳 Integração com sistema de pagamento
- 🚗 Gestão de múltiplos veículos (Premium)

## Equipa

| Membro | Área | Responsabilidades |
|--------|------|------------------|
| Ricardo | Backend | • Integração com Supabase<br>• Criação do sistema de administração<br>• Sistema de autenticação |
| Leandro | Backend/Frontend | • Ligação entre UI e API<br>• Rotas Next.js<br>• Lógica de API<br>• Responsividade |
| Luka | Frontend | • UI/UX com foco em componentes<br>• Integração com dados |
| Miguel | Frontend | • Criação de ecrãs<br>• Colaboração no design interativo<br>• Testes |

## Tecnologias Utilizadas

- **Frontend:**
  - Next.js 14
  - React 18
  - Tailwind CSS
  - Leaflet (mapas)
  - Supabase (autenticação)

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js 20 ou superior
- Docker (opcional)

### Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
cd getParked
```

2. Execute o projeto:
```bash
make up
```

O servidor de desenvolvimento estará disponível em `http://localhost:3000`

## Estrutura do Projeto

```
getParked/
├── src/
│   ├── app/          # Páginas e rotas
│   ├── components/   # Componentes React
│   ├── hooks/        # Custom hooks
│   ├── providers/    # Provedores de contexto
│   └── types/        # Definições de tipos TypeScript
├── public/           # Ficheiros estáticos
└── ...
```

## Licença

Este projeto está sob a licença ISC.

---

Desenvolvido como parte do Projeto II
