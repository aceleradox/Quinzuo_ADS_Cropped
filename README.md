markdown
# 🌐 Quinzuo AdsCropped CDN

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Size](https://img.shields.io/badge/size-~7kb-success.svg)

Uma biblioteca JavaScript leve e modular para criação de **estratégias de monetização e anúncios (Smartlinks)**. 

A CDN do **Quinzuo AdsCropped** foi desenhada para ser importada via `<script>` e utilizada com uma sintaxe fluente (chaining), permitindo que você crie mecânicas de anúncio customizadas em segundos, com controle total sobre *cooldown*, limites de sessão e popups.

---

## 🚀 Como Importar

Você pode importar a CDN diretamente via **jsDelivr** (direto deste repositório):

```html
<!-- Cole isso antes do fechamento da tag <body> -->
<script src="https://cdn.jsdelivr.net/gh/aceleradox/Quinzuo_ADS_Cropped@main/quinzuo-adscropped.js"></script>
⚡ Início Rápido (Quick Start)
A biblioteca expõe uma API global chamada qz (ou Quinzuo). Toda a configuração base é compartilhada entre os módulos.

html
<script>
  // 1. Configuração Global (Smartlink, Cooldown e Limites)
  qz.config({
    smartlink: 'https://ad.magnect.link/SEU_ID',
    cooldown: 30,         // 30 segundos de espera entre um anúncio e outro
    maxPerSession: 5,     // Abre no máximo 5 vezes por sessão
    popup: true,          // Usa window.open (pode ser bloqueado pelo navegador)
    debug: true           // Mostra logs no console
  });

  // 2. Escolha a sua Estratégia
  // Exemplo: Ativa um overlay invisível na tela após 2 segundos. Qualquer clique abre o anúncio.
  qz.magnect.link('https://ad.magnect.link/SEU_ID').after(2);
</script>
````
🧩 Módulos Principais
A CDN conta com 3 módulos baseados no seu Smartlink:

1. ad.magnect.link() (Overlay Full-Screen)
Cria um overlay invisível que captura o clique do usuário. Ideal para forçar o clique em qualquer área da página.

javascript
qz.magnect.link('SEU_LINK').after(3); // Libera o overlay após 3 segundos
2. ad.embed.link() (Overlay em Iframe/Video)
Coloca um "bloqueio" em cima de iframes (ex: vídeos do YouTube). O usuário só assiste clicando no anúncio.

javascript
````
qz.embed.link('SEU_LINK').after(3).onIframe('iframe');
3. ad.fuction.link() (Função Customizada)
Para mecânicas próprias. Você define a regra (ex: só abre na 3ª tentativa).
````
javascript
````
let tentativas = 0;
qz.fuction
  .link('SEU_LINK', (ctx) => (++tentativas >= 3)) // Só abre se retornar true
  .click('.meu-botao');
⛓️ Estratégias Rápidas (Chain Builder)
Você também pode criar cadeias de eventos (qz.chain) para gatilhos específicos:
````
javascript

````
// Abre o anúncio quando o usuário rolar 60% da página
qz.chain('scroll').link('SEU_LINK').scroll(60);

// Abre quando o usuário tentar sair da página (Exit-Intent)
qz.chain('exit').link('SEU_LINK').exit();

// Abre quando o usuário mudar de aba (ocultar a janela)
qz.chain('hidden').link('SEU_LINK').hidden();

// Abre após X segundos de inatividade do usuário
qz.chain('idle').link('SEU_LINK').idle(10);
⚙️ API Reference
Método	Descrição
qz.config({ ... })	Define as configurações globais (smartlink, cooldown, maxPerSession, popup, debug).
qz.open(url)	Força a abertura de um anúncio (respeitando o cooldown).
qz.reset()	Reseta o contador de aberturas da sessão.
qz.on('open', fn)	Hook disparado quando um anúncio é aberto com sucesso.
qz.on('blocked', fn)	Hook disparado quando um anúncio é bloqueado por cooldown/limite.
qz.on('popupblocked', fn)	Hook disparado se o navegador bloquear o popup.
Configurações Disponíveis (qz.config)
smartlink (string): O seu link padrão de anúncio.

cooldown (number): Tempo em segundos entre aberturas de anúncios (default: 30).

maxPerSession (number): Máximo de aberturas por sessão (default: 5).

popup (boolean): Se true, usa window.open. Se false, tenta usar <a>.click() para contornar bloqueadores (default: true).

debug (boolean): Exibe logs no console para depuração (default: false).
````
🎯 Gerador Automático (Web UI)
Este repositório também inclui uma ferramenta web completa (index.html) que gera páginas de mecânica de anúncio prontas, como:

🎰 Games Bets

🎫 Scratch Cards

🎡 Roletas da Sorte

🧠 Jogos da Memória

⏳ Countdown Lockers

E muito mais!

Basta abrir o index.html no navegador, configurar o Smartlink e baixar o HTML pronto.

📜 Licença
Distribuído sob a licença MIT. Sinta-se livre para usar, modificar e monetizar!

Desenvolvido por aceleradox 🚀
