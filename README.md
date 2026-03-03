# 🦁 Rugido App

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)

## 📖 Introdução ao Projeto

Gerir um ginásio, estúdio de treino ou dojo não precisa de ser uma dor de cabeça. O **Rugido App** nasceu para simplificar a vida de quem ensina, de quem treina e de quem administra. 

Trata-se de uma aplicação móvel completa e centralizada que conecta a gestão financeira, a prescrição de treinos e o acompanhamento de alunos num só lugar, com uma interface ágil e intuitiva.

---

## ✨ Funcionalidades e Perfis de Acesso

A aplicação possui um sistema inteligente de controlo de acessos (Role-Based Access Control). O sistema reconhece quem faz o login e adapta toda a experiência através de **3 perfis principais**:

### 👑 Administração (`/admin`)
O centro de comando do espaço:
- **Controlo Total:** Cadastro e gestão de alunos e professores.
- **Saúde Financeira:** Acompanhamento de pagamentos, mensalidades e assinaturas ativas.
- **Biblioteca Base:** Criação e organização da base de dados global de exercícios.
- **Métricas:** Controlo de frequência (check-ins) para saber quem está a treinar.

### 🏋️ Professores (`/teacher`)
Foco total no treino e nos alunos:
- **Acompanhamento:** Visão detalhada do progresso dos alunos atribuídos a si.
- **Prescrição Ágil:** Montagem de planos de treino personalizados utilizando a biblioteca de exercícios da plataforma.

### 🏃‍♂️ Alunos (`/student`)
O companheiro de treino digital:
- **Treino do Dia:** O aluno abre a app e sabe exatamente qual é o seu treino de hoje, sem papéis.
- **Frequência:** Histórico de check-ins para acompanhar a própria consistência.
- **Transparência:** Consulta rápida do estado da sua mensalidade (paga/pendente).

---

## 🚀 O Motor da App (Tecnologias)

Este projeto foi construído com as melhores e mais modernas ferramentas do ecossistema mobile:

- **Frontend Mobile:** [React Native](https://reactnative.dev/) com o ecossistema [Expo](https://expo.dev/).
- **Navegação:** [Expo Router](https://docs.expo.dev/router/introduction/) (arquitetura baseada em ficheiros, facilitando a separação das rotas por perfil).
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/) garantindo tipagem segura e menos *bugs*.
- **Backend & Base de Dados:** [Supabase](https://supabase.com/) como BaaS para autenticação segura e persistência de dados.
- **Gestão de Estado:** Solução customizada (`/store/auth.store.ts`) para manter a sessão do utilizador fluida.

---

## 📁 Estrutura do Código

A nossa organização de pastas foi pensada para ser escalável e fácil de entender:

```text
rugido-app/
├── app/               # O coração da navegação (Expo Router)
│   ├── admin/         # 👑 Ecrãs e rotas da Administração
│   ├── teacher/       # 🏋️ Ecrãs e rotas dos Professores
│   ├── student/       # 🏃‍♂️ Ecrãs e rotas dos Alunos
│   └── auth/          # 🔐 Ecrãs de Login e Autenticação
├── components/        # Componentes visuais reutilizáveis (UI)
├── constants/         # Identidade visual (Cores, Temas) e constantes
├── hooks/             # Lógica partilhada (Custom hooks)
├── services/          # Comunicação com o backend (Supabase API)
└── store/             # Gestão do estado global
