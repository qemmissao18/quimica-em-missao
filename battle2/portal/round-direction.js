// Narrative cues are independent of questions, answer keys and scoring.
export const ROUND_DIRECTION=[
 ['A missão começa','Explore a instalação e observe as espécies iônicas.',0],
 ['Painel de identificação','Examine a transferência de elétrons na instalação lateral.',0],
 ['Investigue a amostra','Observe a amostra. A cor ilustrativa não identifica a substância.',1],
 ['Cristais em análise','Observe o cristal e compare-o às amostras laterais.',0],
 ['Detalhes da estrutura','Examine o retículo iônico e as proporções entre cargas.',3],
 ['Compare as evidências','Investigue os carbonatos. As informações da questão orientam a resposta.',4],
 ['Soluções em evidência','Examine o frasco: cor e brilho, sozinhos, não determinam a função.',0],
 ['Indicadores e pH','Investigue o indicador e suas condições de interpretação.',1],
 ['Substâncias no cotidiano','Explore as vidrarias e os produtos das bancadas.',3],
 ['Estabilize a análise','Observe o reator. Sua energia luminosa é um efeito fictício.',1],
 ['Estrutura e propriedades','Examine a equação de neutralização no monitor.',2],
 ['Quantidades e evidências','Compare as informações e proporções fornecidas pela questão.',2],
 ['Investigação avançada','Explore o núcleo e integre os conhecimentos das quatro funções.',0],
 ['Conecte as informações','Compare os modelos e suas limitações didáticas.',1],
 ['Último desafio','Conclua a questão. A premiação aguarda a classificação do servidor.',0]
];
export function directionFor(position){
 if(!Number.isInteger(position)||position<0||position>=15)return null;
 const [title,description,target]=ROUND_DIRECTION[position];
 return {position,environment:Math.floor(position/3),level:position<3?'Fácil':position<12?'Médio':'Difícil',title,description,target};
}
