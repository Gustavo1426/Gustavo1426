export interface Tecnica {
  nome: string;
  categoria: "execucao" | "intensificacao" | "amplitude";
  descricao: string;
  instrucao: string;
  nivel_dificuldade: "iniciante" | "intermediario" | "avancado";
  tags: string[];
}

export const TECNICAS_MUSCULACAO: Tecnica[] = [
  {
    "nome": "Repetição tradicional",
    "categoria": "execucao",
    "descricao": "Forma clássica de executar o exercício com movimento contínuo.",
    "instrucao": "Realize o movimento de subida e descida de forma fluida, respeitando a amplitude completa do exercício, sem pausas.",
    "nivel_dificuldade": "iniciante",
    "tags": ["hipertrofia", "forca", "iniciante", "basico"]
  },
  {
    "nome": "Tempo controlado",
    "categoria": "execucao",
    "descricao": "Controle da velocidade de cada fase da repetição em segundos.",
    "instrucao": "Defina um tempo para cada fase (ex: 2s concêntrica, 1s pausa, 3s excêntrica) e execute cronometrando cada parte.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "tensao_mecanica", "controle_motor"]
  },
  {
    "nome": "Cadência controlada",
    "categoria": "execucao",
    "descricao": "Ritmo fixo e constante durante toda a série.",
    "instrucao": "Mantenha uma cadência igual em todas as repetições (ex: 3-1-3), evitando acelerar ou roubar o movimento.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "controle_motor", "tecnico"]
  },
  {
    "nome": "Excêntrica lenta",
    "categoria": "execucao",
    "descricao": "Fase negativa (descida) executada de forma mais lenta que a subida.",
    "instrucao": "Desça o peso em 3 a 5 segundos, controlando totalmente o movimento, e suba em tempo normal.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "dano_muscular", "tensao_mecanica"]
  },
  {
    "nome": "Excêntrica acentuada",
    "categoria": "execucao",
    "descricao": "Ênfase máxima na fase negativa com alta carga.",
    "instrucao": "Use uma carga acima do normal e desça de forma bem controlada (4-6s), gerando grande dano muscular.",
    "nivel_dificuldade": "avancado",
    "tags": ["hipertrofia", "dano_muscular", "forca", "avancado"]
  },
  {
    "nome": "Concêntrica explosiva",
    "categoria": "execucao",
    "descricao": "Fase positiva (subida) realizada de forma rápida e potente.",
    "instrucao": "Empurre ou puxe o peso o mais rápido possível, mantendo o controle, para recrutar fibras rápidas.",
    "nivel_dificuldade": "intermediario",
    "tags": ["forca", "explosao", "potencia", "fibra_tipo_2"]
  },
  {
    "nome": "Pausa isométrica",
    "categoria": "execucao",
    "descricao": "Parada em um point específico do movimento por alguns segundos.",
    "instrucao": "No meio da repetição, pare e segure o peso por 2 a 5 segundos antes de continuar o movimento.",
    "nivel_dificuldade": "intermediario",
    "tags": ["forca", "isometria", "controle_motor", "pontos_fracos"]
  },
  {
    "nome": "Pico de contração",
    "categoria": "execucao",
    "descricao": "Contração máxima do músculo no topo do movimento.",
    "instrucao": "Ao chegar no ponto mais alto, contraia fortemente o músculo por 1 a 2 segundos antes de descer.",
    "nivel_dificuldade": "iniciante",
    "tags": ["hipertrofia", "consciencia_muscular", "pump"]
  },
  {
    "nome": "Repetição contínua",
    "categoria": "execucao",
    "descricao": "Movimento sem pausas entre as repetições.",
    "instrucao": "Não pare no topo nem embaixo; mantenha o músculo em tensão constante durante toda a série.",
    "nivel_dificuldade": "iniciante",
    "tags": ["hipertrofia", "tensao_continua", "pump", "metabolico"]
  },
  {
    "nome": "Dead Stop",
    "categoria": "execucao",
    "descricao": "Parada total entre repetições, eliminando o impulso elástico.",
    "instrucao": "Apoie completamente o peso a cada repetição e reinicie o movimento do zero, sem rebote.",
    "nivel_dificuldade": "intermediario",
    "tags": ["forca", "potencia", "pontos_fracos", "arranque"]
  },
  {
    "nome": "Repetição parcial",
    "categoria": "execucao",
    "descricao": "Repetição executada apenas em parte da amplitude.",
    "instrucao": "Realize o movimento apenas em uma porção (metade, quarto ou terço), permitindo usar mais carga.",
    "nivel_dificuldade": "intermediario",
    "tags": ["forca", "pontos_fracos", "sobrecarga"]
  },
  {
    "nome": "Repetição completa",
    "categoria": "execucao",
    "descricao": "Movimento em toda a amplitude possível.",
    "instrucao": "Vá do alongamento máximo até a contração máxima do músculo em cada repetição.",
    "nivel_dificuldade": "iniciante",
    "tags": ["hipertrofia", "amplitude", "basico"]
  },
  {
    "nome": "Repetição 1¼",
    "categoria": "execucao",
    "descricao": "Uma repetição completa com uma subida extra de ¼ do caminho.",
    "instrucao": "Desça, suba até ¼ do movimento, desça novamente e suba completo. Isso conta como 1 repetição.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "tempo_sob_tensao", "pump"]
  },
  {
    "nome": "Repetição 1½",
    "categoria": "execucao",
    "descricao": "Uma repetição completa com uma subida extra de metade do caminho.",
    "instrucao": "Desça, suba até a metade, desce de novo e suba completo. Isso conta como 1 repetição.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "tempo_sob_tensao", "pump"]
  },
  {
    "nome": "Repetição unilateral alternada",
    "categoria": "execucao",
    "descricao": "Alternância entre os lados a cada repetição.",
    "instrucao": "Faça uma repetição com o lado direito, a próxima com o esquerdo, alternando continuamente.",
    "nivel_dificuldade": "iniciante",
    "tags": ["equilibrio", "core", "unilateral", "coordenacao"]
  },
  {
    "nome": "Repetição unilateral contínua",
    "categoria": "execucao",
    "descricao": "Todas as repetições de um lado antes de passar para o outro.",
    "instrucao": "Complete todas as repetições com o lado direito e depois faça o mesmo número com o esquerdo.",
    "nivel_dificuldade": "iniciante",
    "tags": ["unilateral", "equilibrio", "simetria"]
  },
  {
    "nome": "Isometria no alongamento",
    "categoria": "execucao",
    "descricao": "Parada com o músculo em posição de máximo alongamento.",
    "instrucao": "Segure o peso na posição mais baixa (músculo alongado) por 2 a 5 segundos.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "flexibilidade", "tensao_mecanica", "dano_muscular"]
  },
  {
    "nome": "Isometria na contração",
    "categoria": "execucao",
    "descricao": "Parada com o músculo em posição de contração máxima.",
    "instrucao": "Segure o peso no topo do movimento, contraindo fortemente o músculo por 2 a 5 segundos.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "consciencia_muscular", "pump"]
  },
  {
    "nome": "Tempo sob tensão prolongado",
    "categoria": "execucao",
    "descricao": "Aumento do tempo total do músculo sob carga.",
    "instrucao": "Execute séries longas (40 a 70 segundos) com cadência controlada, priorizando o tempo total.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "tensao_mecanica", "resistencia", "sarcoplasma"]
  },
  {
    "nome": "Repetições compensatórias",
    "categoria": "execucao",
    "descricao": "Repetições parciais extras após a falha concêntrica.",
    "instrucao": "Após não conseguir mais subir o peso, continue fazendo pequenas repetições parciais para esgotar o músculo.",
    "nivel_dificuldade": "avancado",
    "tags": ["hipertrofia", "falha", "intensidade", "avancado"]
  },

  {
    "nome": "Rest-pause",
    "categoria": "intensificacao",
    "descricao": "Pausa curta de 10-20 segundos para continuar a série após a falha.",
    "instrucao": "Vá até a falha, descanse 10-20s e faça mais algumas repetições com a mesma carga. Repita 2-3 vezes.",
    "nivel_dificuldade": "avancado",
    "tags": ["hipertrofia", "intensidade", "falha", "forca", "avancado"]
  },
  {
    "nome": "Drop set",
    "categoria": "intensificacao",
    "descricao": "Redução da carga sem descanso ao chegar na falha.",
    "instrucao": "Ao falhar, reduza 20-30% da carga e continue imediatamente até nova falha.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "estresse_metabolico", "pump", "intensidade"]
  },
  {
    "nome": "Double drop set",
    "categoria": "intensificacao",
    "descricao": "Duas reduções de carga consecutivas sem descanso.",
    "instrucao": "Falha → reduz carga → continua → falha → reduz carga novamente → continua até falhar.",
    "nivel_dificuldade": "avancado",
    "tags": ["hipertrofia", "estresse_metabolico", "pump", "avancado"]
  },
  {
    "nome": "Triple drop set",
    "categoria": "intensificacao",
    "descricao": "Três reduções de carga consecutivas sem descanso.",
    "instrucao": "Repita o drop set 3 vezes seguidas, reduzindo a carga a cada falha até esgotar totalmente o músculo.",
    "nivel_dificuldade": "avancado",
    "tags": ["hipertrofia", "estresse_metabolico", "pump", "avancado"]
  },
  {
    "nome": "Mechanical drop set",
    "categoria": "intensificacao",
    "descricao": "Troca de exercício (não de carga) ao chegar na falha.",
    "instrucao": "Ao falhar em um exercício, mude imediatamente para uma variação mais fácil do mesmo grupo, mantendo a carga.",
    "nivel_dificuldade": "avancado",
    "tags": ["hipertrofia", "intensidade", "avancado", "pontos_fracos"]
  },
  {
    "nome": "Cluster set",
    "categoria": "intensificacao",
    "descricao": "Mini-pausas de 10-15s entre repetições dentro da série.",
    "instrucao": "Faça 1 repetição, descanse 10-15s, repita. Monte clusters de 4-6 repetições com essas mini-pausas.",
    "nivel_dificuldade": "avancado",
    "tags": ["forca", "potencia", "carga_alta", "avancado"]
  },
  {
    "nome": "Myo-reps",
    "categoria": "intensificacao",
    "descricao": "Série de ativação seguida de mini-séries curtas.",
    "instrucao": "Faça 12-20 reps na ativação (perto da falha), descanse 5-10s e faça 3-5 reps por 4-5 mini-séries.",
    "nivel_dificuldade": "avancado",
    "tags": ["hipertrofia", "eficiencia", "estresse_metabolico", "avancado"]
  },
  {
    "nome": "FST-7",
    "categoria": "intensificacao",
    "descricao": "7 séries finais de bombeamento com descanso curto.",
    "instrucao": "Após o treino normal, faça 7 séries de 8-12 reps com apenas 30s de descanso para bombear o músculo.",
    "nivel_dificuldade": "avancado",
    "tags": ["hipertrofia", "pump", "fascia", "avancado"]
  },
  {
    "nome": "Giant set",
    "categoria": "intensificacao",
    "descricao": "Sequência de 4 ou mais exercícios sem descanso.",
    "instrucao": "Escolha 4-6 exercícios do mesmo grupo muscular e faça um após o outro, sem pausa entre eles.",
    "nivel_dificuldade": "avancado",
    "tags": ["hipertrofia", "metabolico", "pump", "avancado"]
  },
  {
    "nome": "Bi-set",
    "categoria": "intensificacao",
    "descricao": "Dois exercícios executados em sequência sem descanso.",
    "instrucao": "Faça o exercício A e emende imediatamente no exercício B, descansando só após completar os dois.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "intensidade", "pump", "metabolico"]
  },
  {
    "nome": "Tri-set",
    "categoria": "intensificacao",
    "descricao": "Três exercícios executados em sequência sem descanso.",
    "instrucao": "Faça 3 exercícios seguidos do mesmo grupo muscular sem descanso entre eles.",
    "nivel_dificuldade": "avancado",
    "tags": ["hipertrofia", "intensidade", "pump", "metabolico", "avancado"]
  },
  {
    "nome": "Pré-exaustão",
    "categoria": "intensificacao",
    "descricao": "Exercício isolador executado antes do composto.",
    "instrucao": "Faça primeiro um exercício isolador (ex: cadeira extensora) e emende no composto (agachamento).",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "pontos_fracos", "isolamento"]
  },
  {
    "nome": "Pós-exaustão",
    "categoria": "intensificacao",
    "descricao": "Exercício isolador executado após o composto.",
    "instrucao": "Faça o composto primeiro (ex: supino) e finalize com o isolador (ex: crucifixo) até a falha.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "pump", "finalizacao"]
  },
  {
    "nome": "Falha mecânica",
    "categoria": "intensificacao",
    "descricao": "Ponto em que não é mais possível mover o peso.",
    "instrucao": "Execute a série até o músculo não conseguir mais completar a repetição, mesmo com esforço máximo.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "intensidade", "falha", "limite"]
  },
  {
    "nome": "Falha concêntrica",
    "categoria": "intensificacao",
    "descricao": "Incapacidade de completar a fase de subida do movimento.",
    "instrucao": "Continue a série até não conseguir mais subir o peso, mesmo mantendo o controle na descida.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "falha", "intensidade"]
  },
  {
    "nome": "Repetições forçadas",
    "categoria": "intensificacao",
    "descricao": "Ajuda de um parceiro para continuar após a falha.",
    "instrucao": "Ao falhar, peça ajuda ao parceiro para completar mais 2-4 repetições com a mesma carga.",
    "nivel_dificuldade": "avancado",
    "tags": ["hipertrofia", "forca", "intensidade", "parceiro", "avancado"]
  },
  {
    "nome": "Repetições negativas",
    "categoria": "intensificacao",
    "descricao": "Ênfase apenas na fase excêntrica (descida) do movimento.",
    "instrucao": "Use uma carga acima do normal; o parceiro ajuda a subir e você desce sozinho de forma bem controlada (4-6s).",
    "nivel_dificuldade": "avancado",
    "tags": ["forca", "dano_muscular", "reabilitacao", "avancado"]
  },
  {
    "nome": "Cheat reps",
    "categoria": "intensificacao",
    "descricao": "Uso de impulso corporal para continuar após a falha.",
    "instrucao": "Após a falha, use leve impulso do corpo para completar mais algumas repetições, mantendo o controle.",
    "nivel_dificuldade": "avancado",
    "tags": ["hipertrofia", "forca", "intensidade", "avancado"]
  },
  {
    "nome": "Oclusão (BFR)",
    "categoria": "intensificacao",
    "descricao": "Treino com restrição parcial do fluxo sanguíneo.",
    "instrucao": "Use uma faixa elástica na parte proximal do membro e faça séries de 15-30 reps com carga leve (20-30% 1RM).",
    "nivel_dificuldade": "avancado",
    "tags": ["hipertrofia", "reabilitacao", "carga_leve", "metabolico", "avancado"]
  },
  {
    "nome": "Widowmaker",
    "categoria": "intensificacao",
    "descricao": "Série brutal de 20 agachamentos pesados.",
    "instrucao": "Faça 20 agachamentos com uma carga que normalmente faria para 10, respirando apenas entre reps. Técnica clássica e intensa.",
    "nivel_dificuldade": "avancado",
    "tags": ["forca", "resistencia", "mental", "pernas", "avancado"]
  },

  {
    "nome": "Amplitude completa",
    "categoria": "amplitude",
    "descricao": "Movimento executado em toda a amplitude possível.",
    "instrucao": "Vá do alongamento máximo até a contração máxima em cada repetição, sem encurtar o movimento.",
    "nivel_dificuldade": "iniciante",
    "tags": ["hipertrofia", "amplitude", "basico", "mobilidade"]
  },
  {
    "nome": "Amplitude parcial",
    "categoria": "amplitude",
    "descricao": "Movimento executado apenas em parte da amplitude.",
    "instrucao": "Trabalhe em uma porção específica do exercício, permitindo usar cargas maiores ou focar em pontos fracos.",
    "nivel_dificuldade": "intermediario",
    "tags": ["forca", "pontos_fracos", "sobrecarga"]
  },
  {
    "nome": "Amplitude parcial inicial",
    "categoria": "amplitude",
    "descricao": "Foco na primeira parte do movimento (início da subida).",
    "instrucao": "Execute apenas o começo da fase concêntrica, onde o músculo está mais alongado.",
    "nivel_dificuldade": "intermediario",
    "tags": ["forca", "pontos_fracos", "alongamento"]
  },
  {
    "nome": "Amplitude parcial média",
    "categoria": "amplitude",
    "descricao": "Foco na parte central do movimento.",
    "instrucao": "Trabalhe apenas na porção do meio do exercício, onde a tensão costuma ser maior.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "tensao_mecanica", "pontos_fracos"]
  },
  {
    "nome": "Amplitude parcial final",
    "categoria": "amplitude",
    "descricao": "Foco na parte final do movimento (perto da contração máxima).",
    "instrucao": "Execute apenas o final da fase concêntrica, próximo à contração máxima do músculo.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "pico_contração", "pump"]
  },
  {
    "nome": "Alongamento carregado",
    "categoria": "amplitude",
    "descricao": "Músculo mantido sob carga em posição de alongamento profundo.",
    "instrucao": "Segure o peso na posição de máximo alongamento por 10-30s, gerando hipertrofia por estiramento.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "flexibilidade", "dano_muscular", "tensao_mecanica"]
  },
  {
    "nome": "Alongamento isométrico",
    "categoria": "amplitude",
    "descricao": "Parada estática na posição de máximo alongamento.",
    "instrucao": "Segure o peso na posição mais alongada do movimento por 2 a 5 segundos, sem oscilar.",
    "nivel_dificuldade": "intermediario",
    "tags": ["flexibilidade", "isometria", "mobilidade", "hipertrofia"]
  },
  {
    "nome": "ROM aumentado",
    "categoria": "amplitude",
    "descricao": "Amplitude de movimento maior que o padrão.",
    "instrucao": "Use artifícios (ex: anilhas sob as mãos no supino, déficit no agachamento) para aumentar a amplitude além do normal.",
    "nivel_dificuldade": "avancado",
    "tags": ["hipertrofia", "alongamento", "mobilidade", "avancado"]
  },
  {
    "nome": "ROM reduzido",
    "categoria": "amplitude",
    "descricao": "Amplitude de movimento menor que o padrão.",
    "instrucao": "Reduza intencionalmente a amplitude para usar mais carga ou focar em uma porção específica.",
    "nivel_dificuldade": "intermediario",
    "tags": ["forca", "pontos_fracos", "sobrecarga"]
  },
  {
    "nome": "Tensão contínua em amplitude reduzida",
    "categoria": "amplitude",
    "descricao": "Tensão constante sem pausas, em movimento curto.",
    "instrucao": "Mantenha o músculo tenso sem parar, trabalhando apenas em uma porção pequena da amplitude.",
    "nivel_dificuldade": "intermediario",
    "tags": ["hipertrofia", "pump", "tensao_continua", "metabolico"]
  }
];
