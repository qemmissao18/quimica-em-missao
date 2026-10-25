# Batalha das Funções 2.0 — integração em revisão

Branch: `integracao-batalha-2`. Não mesclar nem publicar no site oficial sem aprovação expressa da proprietária.

Prévia privada: https://batalha2-previa-ana.anacarolinanacimento.chatgpt.site

## O que foi integrado

- A entrada da sala antiga no site encaminha para `battle2/index.html`; a implementação antiga e sua configuração de banco foram removidas do HTML principal.
- A demonstração individual abre em `battle2/teacher-demo.html`, sem sala nem outros jogadores. Ferramentas permitem percorrer cinco ambientes, sortear questões, desligar o cronômetro, simular falhas e conferir quatro premiações.
- Recursos tridimensionais originais preservados em `battle2/portal`. Câmera inicial ampliada, controles responsivos e painéis posicionados abaixo da altura real do HUD.
- Controles de áudio recolhem após cinco segundos de inatividade; holograma recolhe após quinze segundos e pode ser reaberto.
- SDK Supabase incluído localmente; compilação reproduzível com `npm ci` e `npm run build:client`.
- Multiplayer mantém alternativas estáveis durante sincronização e impede reativação indevida da dica. Inclui saída de sala.
- Premiação permite pular a animação e mostra o resultado mesmo sem WebGL. Retornar à prévia reabre as ferramentas de demonstração.

## Validação realizada (24–25/10/2026)

- Sintaxe dos 30 scripts externos e inline validada pelo Node.
- Banco: 160 questões; 200 sorteios validados com 15 questões únicas, 3 fáceis + 9 médias + 3 difíceis, três em cada ambiente. Todas as 160 foram alcançadas na amostra; sorteios variáveis.
- `tests/battle2-server.sql`: teste transacional com rollback validou anfitrião observador, anfitrião jogador e participante, mínimo de dois competidores, 15 rodadas, dica idempotente, proteção contra alteração de resposta, eliminação no 11º erro, ranking sem observador e nova partida. Não é migração; executar apenas em contexto de testes com privilégios adequados.
- Navegador: criação e saída de sala, bloqueio de início com um jogador, botão da demonstração, seleção dos cinco ambientes, sorteio e resposta de questão difícil, pontuação, fechamento do áudio, holograma recolhido, simulação de 11 erros e quatro resultados de premiação com retorno à demonstração.

## Limites e testes pendentes

A verificação completa de multiplayer em dois dispositivos não foi concluída. O teste anterior confirmou duas sessões entrando na sala, mas não concluiu a partida pela interface. O navegador remoto atual compartilha a sessão entre abas e não disponibiliza WebGL. Não considerar como aprovado o teste visual completo de câmera, efeitos 3D, animações e áudio em celular físico. Esses recursos foram preservados, não substituídos.

## Roteiro no celular

1. Abra a prévia na conta proprietária do ChatGPT e entre em Batalha 2.0. A prévia é privada; outras contas não têm acesso automaticamente.
2. Toque em **Explorar jogo — Modo demonstração**. Em **Ferramentas de demonstração**, desative o cronômetro para explorar e selecione os cinco ambientes.
3. Sorteie questões, responda, use dicas, abra e recolha hologramas; teste câmera, áudio, narração, tela cheia, reduzir movimentos/luzes/partículas. Confira em retrato e paisagem.
4. Simule 11 falhas e teste Ouro, Prata, Bronze e Participação. Volte à prévia e inicie novo sorteio.
5. Para multiplayer, use navegadores/perfis separados ou dois aparelhos. Abas do mesmo perfil compartilham a identidade do jogo. Anfitrião jogador + um participante formam o mínimo de dois. Anfitrião observador precisa de dois participantes adicionais.
6. Compare enunciado, tempo e contagem de respostas nos aparelhos; responda, avance rodadas, teste reconexão, eliminação e ranking. Use **Sair da sala** ao terminar.

A prévia usa o backend existente da Batalha 2.0. Demonstração e salas competitivas possuem fluxos separados. Nenhuma alteração de esquema, política de acesso ou liberação do banco foi feita nesta integração.
