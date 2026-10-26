# Denúncia Disfarçada

Aplicativo móvel desenvolvido com **Ionic React**, **Vite** e **Capacitor**, projetado com o objetivo de oferecer um canal de acolhimento e socorro para mulheres em situação de vulnerabilidade ou violência doméstica sob a fachada de uma calculadora convencional.

---

## 📌 Fluxo da Aplicação

1. **Calculadora (Fachada)**:
   - Funciona como uma calculadora padrão para operações aritméticas diárias (`+`, `−`, `×`, `÷`, porcentagem, inversão de sinal).
   - Ao digitar a combinação de segurança **`1 + 10 =`**, a calculadora abre **diretamente a tela de acolhimento: Canal Seguro de Atendimento / Canal da Mulher**.
   - Para acesso direto da equipe ao painel administrativo de ocorrências via calculadora, pode-se digitar **`9 × 99 =`**.

2. **Canal da Mulher (Canal Seguro de Atendimento)**:
   - Tela prioritária de apoio que se abre após a calculadora.
   - **Formulário de Denúncia**: Seleção do tipo de agressão e envio confidencial.
   - **Compartilhamento de Localização Exata**: Coleta a latitude e longitude exatas via GPS (`@capacitor/geolocation`) para facilitar o resgate ou envio de auxílio policial.
   - **Botão de Saída Rápida**: Redireciona a tela instantaneamente para o Google em caso de perigo imediato ou aproximação de terceiros.
   - **Atalho Ligue 180**: Botão direto para iniciar conversa sigilosa no WhatsApp oficial da Central de Atendimento à Mulher.
   - **Acesso ao Painel**: Opção discreta para alternar para o painel de atendimento da equipe ou retornar à calculadora.

3. **Painel de Denúncias Disfarçadas (Página a parte de atendimento)**:
   - Interface separada voltada para os operadores e equipes de apoio.
   - **Fila de Chamados**: Listagem dos chamados recentes com status visual (`Pendente`, `Em Atendimento`, `Concluído`).
   - **Visualização de Localização**: Link direto para abrir o endereço ou coordenadas no Google Maps.
   - **Gestão de Atendimento**: Botões para aceitar o chamado e concluí-lo.
   - **Abertura de Chamado Manual**: Formulário completo para registrar denúncias recebidas por outros canais.

---

## 🚀 Tecnologias Utilizadas

- **React 18** com **TypeScript**
- **Ionic React 8**
- **Vite** (Build tool e servidor de desenvolvimento ágil)
- **Capacitor 7**:
  - `@capacitor/geolocation` (Coleta de coordenadas de GPS no dispositivo)
  - `@capacitor/browser` (Abertura segura de links externos in-app)
- **CSS3 Moderno** com variáveis customizadas para estilização adaptável

---

## 💻 Como Executar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior recomendada)
- **npm** ou gerenciador de pacotes equivalente

### Instalação e Execução

```bash
# Clone ou acesse a pasta do projeto
cd ionic-denuncia-disfarcada

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível no navegador no endereço: [http://localhost:8100](http://localhost:8100) (ou na porta informada pelo Vite).

---

## 📱 Build e Execução Mobile (Android / iOS)

Para empacotar a aplicação em dispositivos móveis utilizando o Capacitor:

### Android
```bash
# Adicionar a plataforma Android (apenas na primeira vez)
npm run cap:add:android

# Compilar o código TypeScript e sincronizar os assets com o Android
npm run cap:sync

# Abrir o projeto no Android Studio para emulação ou build de APK
npx cap open android
```

### iOS
```bash
# Adicionar a plataforma iOS (apenas na primeira vez, no macOS)
npm run cap:add:ios

# Compilar e sincronizar os assets
npm run cap:sync

# Abrir o projeto no Xcode
npx cap open ios
```

---

## 📁 Estrutura de Arquivos

```text
src/
├── components/
│   ├── Button.tsx        # Componente de botão reutilizável com variantes visuais
│   └── Icon.tsx          # Ícones vetoriais SVG (escudo, setas, check, mensagem)
├── pages/
│   ├── Calculator.tsx    # Tela de calculadora funcional e interceptação das senhas
│   ├── PublicChannel.tsx # Canal Seguro da Mulher (emergência, GPS e Ligue 180)
│   └── Dashboard.tsx     # Painel separado de triagem e controle de chamados para equipe
├── theme/
│   └── variables.css     # Definições de cores e variáveis do Ionic
├── App.tsx               # Roteamento central e gerenciamento de estado global
├── data.ts               # Modelos de dados, constantes de desbloqueio e mocks
├── main.tsx              # Ponto de entrada e inicialização da aplicação
└── styles.css            # Folha de estilos completa do aplicativo
```

---

## 🔐 Configurações de Segurança e Customização

- **Sequência de Desbloqueio (Canal da Mulher)**: A constante `UNLOCK_SEQUENCE` em `src/data.ts` está configurada como `1+10` (seguida de `=`).
- **Sequência de Acesso (Painel da Equipe)**: A constante `DASHBOARD_SEQUENCE` em `src/data.ts` está configurada como `9×99` (seguida de `=`).
- **Persistência de Dados**: O projeto opera com estado em memória (`mock`). Para uso em produção, conecte as funções `onAddReport` e `onUpdateStatus` a um serviço backend ou banco de dados em nuvem.
