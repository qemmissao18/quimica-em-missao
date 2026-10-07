# Química em Missão — instalação PWA

O mesmo site continua em https://qemmissao18.github.io/quimica-em-missao/.

## Arquivos

- `index.html`: adicionados metadados, manifest, CSS/JS PWA, botão após o bloco de apresentação e no menu, mensagens offline/atualização e diálogo acessível. Scripts e conteúdo originais preservados.
- `manifest.webmanifest`: nome, nome curto, identificador, escopo e início relativos, standalone e ícones.
- `pwa.js`: convite nativo após clique, ajuda por plataforma, avisos e registro/atualização do worker.
- `pwa.css`: estilos limitados aos novos elementos.
- `sw.js`: cache da estrutura local, rede primeiro, fallback offline e exclusão de versões antigas somente deste aplicativo.
- `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (180×180): ícone simplificado com a vidraria e a paleta roxa/amarela do site. Podem ser substituídos por uma arte definitiva mantendo nomes e dimensões.

## Instalação

Android/Chrome e computador/Chrome ou Edge: clicar em “Instalar Química em Missão” e confirmar a interface do navegador. A oferta nativa depende de o navegador considerar o site instalável e não instalado. Sem oferta, o botão mostra orientação, não baixa HTML.

iPhone/iPad: o botão apresenta instruções para abrir no Safari → Compartilhar → Adicionar à Tela de Início. Manter “Abrir como App da Web”, quando disponível. Não há disparo programático equivalente ao beforeinstallprompt nesses dispositivos.

O app instalado usa `display: standalone`; o navegador continua disponível para quem não instalar.

## Atualizações e offline

O HTML e os recursos locais usam rede primeiro, sem depender de alterar a URL pública. Se a rede falhar ou demorar mais de cinco segundos, o worker tenta o recurso salvo. Recursos essenciais são preparados no primeiro carregamento online. Fontes externas podem usar fallback offline.

Ao mudar arquivos da estrutura PWA, incrementar `VERSION` em `sw.js`. Uma nova versão do worker aguarda e oferece “Atualizar aplicativo”. Nenhuma partida é interrompida por recarga automática. Fechar todas as janelas antigas também permite a ativação normal do novo worker. Não é necessário reinstalar.

O worker só trata GET de arquivos locais explicitamente listados e a navegação da página inicial dentro do subdiretório. Nunca intercepta Supabase, autenticação, RPC, Realtime, vídeos ou outros domínios. Não armazena respostas do multiplayer.

O aviso offline explica as limitações. Criação/entrada na sala e links externos exibem orientação quando o dispositivo sinaliza ausência de internet. Conexões instáveis ainda podem gerar erros próprios do serviço. Se o site foi aberto offline, reconectar e recarregar para inicializar o Supabase.

## Validação

Foram comparados os scripts originais, que permanecem idênticos. Testes simulados cobrem botão nativo após clique, orientação iOS, ocultação standalone, mensagens offline, escopo em subdiretório, bypass de API/vídeos, atualização de conteúdo v1→v2, recuperação offline e ativação consentida do worker.

Checklist em aparelhos físicos (a simulação não substitui estes testes):
1. Abrir o endereço principal no Android, iPhone/iPad e computador; navegar em retrato/paisagem.
2. Instalar pelo botão ou instruções e abrir pelo ícone. Confirmar janela própria.
3. Abrir conteúdos, quizzes, Detetive, Neutralização e laboratório. Reproduzir vídeos com internet.
4. Criar sala, entrar em outro aparelho pelo código, iniciar partida, responder e verificar sincronização e ranking.
5. Após uma visita online, fechar o app, desligar a internet e abrir novamente. Conferir conteúdo salvo e avisos; reconectar e recarregar antes de testar multiplayer.
6. Publicar uma pequena alteração, reabrir online e verificar atualização. Se houver novo worker, terminar a atividade antes de usar “Atualizar aplicativo”.

Não foi criado APK/EXE nem modificado o backend do Supabase.
