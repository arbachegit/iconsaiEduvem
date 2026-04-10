/**
 * nr-sim-configs — configuracao de laboratorio por NR.
 *
 * Template unico (WorkerLab) parametrizado via config. Cada NR tem seu
 * proprio conjunto de 4 niveis descrevendo a progressao do trabalhador
 * ganhando EPIs e o risco caindo.
 *
 * Campos por nivel:
 *   - label: nome do nivel
 *   - worker: estado visual do trabalhador (mood, equipamentos, riscos)
 *   - stats: grau de risco, risco fatal %, conformidade %, multa R$,
 *            expectativa de vida (anos)
 *   - tutor: headline + detail + opcional warning + opcional suggestion
 *            em 1a pessoa canonica BR
 */
import type { WorkerLabConfig } from '@/components/simulations/WorkerLab'

/* ═══════════════════════════════════════════════════════════
   NR-06 — EPI
   ═══════════════════════════════════════════════════════════ */
export const CFG_NR06: WorkerLabConfig = {
  sliderLabel: 'Nível de EPI',
  sliderTicks: ['Nenhum', 'Capacete', '+Luvas', 'Completo'],
  defaultBackground: 'scaffold',
  levels: [
    {
      label: 'Nenhum EPI',
      worker: { mood: 0, risks: { headImpact: true, handCuts: true, fallRisk: true } },
      stats: { riskGrade: 'Crítico', fatalRisk: 87, compliance: 0, fineEstimate: 4025, lifeExpectancy: 52 },
      tutor: {
        headline: 'Assim o acidente é questão de tempo.',
        detail: 'Trabalhador exposto a queda, impacto na cabeça, corte nas mãos. Em construção civil, 38% dos acidentes fatais envolvem queda de altura sem proteção [NR-6, item 6.3.1].',
        warning: 'Multa média por trabalhador sem EPI: R$ 4.025 (FAP NR-28). Por trabalhador. Se tiver 20 na obra, faça a conta.',
        suggestion: 'Arrasta o slider pra nível 1 e veja o que muda só colocando o capacete.',
      },
    },
    {
      label: 'Capacete',
      worker: { mood: 0.35, helmet: true, risks: { handCuts: true, fallRisk: true } },
      stats: { riskGrade: 'Alto', fatalRisk: 52, compliance: 25, fineEstimate: 2800, lifeExpectancy: 61 },
      tutor: {
        headline: 'Cabeça protegida, mas as mãos continuam expostas.',
        detail: 'Capacete corta ~40% do risco de lesão fatal em queda de pequena altura. Mas 38% dos acidentes envolvem as mãos — cortes, queimaduras, esmagamento [NR-6, item 6.3].',
        suggestion: 'Coloca a luva também. Luva é barata e evita metade dos acidentes do setor.',
      },
    },
    {
      label: 'Capacete + luvas',
      worker: { mood: 0.6, helmet: true, gloves: true, boots: true, risks: { fallRisk: true } },
      stats: { riskGrade: 'Médio', fatalRisk: 28, compliance: 55, fineEstimate: 1200, lifeExpectancy: 68 },
      tutor: {
        headline: 'Tá melhorando. Falta a parte crítica.',
        detail: 'Capacete + luva + bota cobrem impactos comuns, mas não resolvem trabalho em altura. Subiu em andaime sem cinto? Queda livre [NR-6, item 6.3] + [NR-35, item 35.5].',
        warning: 'Construção civil tem 52% dos acidentes fatais em trabalho em altura. Cinto não é opcional.',
        suggestion: 'Puxa pra nível 3 e vê o cinturão paraquedista entrar.',
      },
    },
    {
      label: 'EPI completo',
      worker: { mood: 1, helmet: true, gloves: true, boots: true, harness: true },
      stats: { riskGrade: 'Baixo', fatalRisk: 6, compliance: 100, fineEstimate: 0, lifeExpectancy: 76 },
      tutor: {
        headline: 'Agora sim. É isso que o auditor quer ver.',
        detail: 'Trabalhador autorizado, documentado, com capacete + luvas + botas + cinturão paraquedista + trava-quedas. Conformidade total com [NR-6, item 6.3.1] e [NR-35, item 35.4.1.1].',
        suggestion: 'Mesmo com EPI completo, a empresa ainda precisa de Análise de Risco e Permissão de Trabalho. EPI é a última linha de defesa.',
      },
    },
  ],
}

/* ═══════════════════════════════════════════════════════════
   NR-35 — Trabalho em Altura
   ═══════════════════════════════════════════════════════════ */
export const CFG_NR35: WorkerLabConfig = {
  sliderLabel: 'Sistema antiqueda',
  sliderTicks: ['Nada', 'Cinto simples', '+Trava-queda', 'Completo + AR'],
  defaultBackground: 'scaffold',
  levels: [
    {
      label: 'Nenhuma proteção',
      worker: { mood: 0, helmet: true, boots: true, risks: { fallRisk: true } },
      stats: { riskGrade: 'Crítico', fatalRisk: 92, compliance: 0, fineEstimate: 6700, lifeExpectancy: 48 },
      tutor: {
        headline: 'Trabalho em altura sem sistema antiqueda é roleta russa.',
        detail: 'Queda de 2m já pode ser fatal. De 5m, 70% dos acidentes resultam em morte ou invalidez permanente [NR-35, item 35.5.1].',
        warning: 'NR-35 é a NR com maior índice de embargo. Fiscal acha trabalhador sem cinto em altura → obra para na hora.',
      },
    },
    {
      label: 'Cinturão de segurança',
      worker: { mood: 0.4, helmet: true, boots: true, harness: true, risks: { fallRisk: true } },
      stats: { riskGrade: 'Alto', fatalRisk: 58, compliance: 30, fineEstimate: 3200, lifeExpectancy: 58 },
      tutor: {
        headline: 'Cinto sem ancoragem é decoração.',
        detail: 'O cinturão precisa estar conectado a um ponto de ancoragem que suporte a queda [NR-35, item 35.5.2]. Sem isso, o trabalhador ainda cai — só morre com cinto no corpo.',
        suggestion: 'Precisa de trava-queda + linha de vida ou ponto de ancoragem certificado.',
      },
    },
    {
      label: '+ Trava-queda',
      worker: { mood: 0.7, helmet: true, boots: true, harness: true, gloves: true },
      stats: { riskGrade: 'Médio', fatalRisk: 22, compliance: 70, fineEstimate: 1200, lifeExpectancy: 70 },
      tutor: {
        headline: 'Agora o sistema trabalha a seu favor.',
        detail: 'Com trava-queda conectado a ponto de ancoragem, uma queda de 2m fica contida em centímetros. A força do impacto cai drasticamente [NR-35, item 35.5].',
        suggestion: 'Falta a Análise de Risco e a Permissão de Trabalho documentadas pra completar conformidade.',
      },
    },
    {
      label: 'Completo + AR + PT',
      worker: { mood: 1, helmet: true, boots: true, harness: true, gloves: true, goggles: true },
      stats: { riskGrade: 'Baixo', fatalRisk: 4, compliance: 100, fineEstimate: 0, lifeExpectancy: 78 },
      tutor: {
        headline: 'É assim que se trabalha em altura.',
        detail: 'Sistema antiqueda completo, Análise de Risco documentada, Permissão de Trabalho assinada, trabalhador capacitado [NR-35, item 35.3.1, alínea b]. Auditor sorri e vai embora.',
      },
    },
  ],
}

/* ═══════════════════════════════════════════════════════════
   NR-10 — Eletricidade
   ═══════════════════════════════════════════════════════════ */
export const CFG_NR10: WorkerLabConfig = {
  sliderLabel: 'Nível de proteção elétrica',
  sliderTicks: ['Energizado', 'Desligado', '+EPI diel.', 'Bloqueado'],
  defaultBackground: 'electrical',
  levels: [
    {
      label: 'Circuito energizado',
      worker: { mood: 0, risks: { shock: true, headImpact: true } },
      stats: { riskGrade: 'Crítico', fatalRisk: 95, compliance: 0, fineEstimate: 5200, lifeExpectancy: 45 },
      tutor: {
        headline: 'Mexer em circuito vivo sem proteção mata em segundos.',
        detail: 'Choque elétrico de 220V em contato direto com a pele causa fibrilação cardíaca em menos de 1 segundo. 74% dos acidentes elétricos fatais no Brasil ocorrem por não-desenergização [NR-10, item 10.5].',
        warning: 'NR-10 exige desenergização como PRIMEIRA medida. Trabalhar energizado só em casos excepcionais, com análise de risco específica.',
      },
    },
    {
      label: 'Circuito desligado',
      worker: { mood: 0.4, helmet: true, boots: true, risks: { shock: true } },
      stats: { riskGrade: 'Alto', fatalRisk: 48, compliance: 35, fineEstimate: 2800, lifeExpectancy: 60 },
      tutor: {
        headline: 'Desligar não é o mesmo que desenergizar.',
        detail: 'Desligar um disjuntor não garante zero tensão — pode haver corrente residual, alimentação alternativa, ou alguém religar enquanto você trabalha [NR-10, item 10.5.1].',
        suggestion: 'Precisa bloquear o disjuntor (lockout/tagout) e medir tensão zero antes de encostar.',
      },
    },
    {
      label: '+ EPI dielétrico',
      worker: { mood: 0.75, helmet: true, boots: true, gloves: true, goggles: true, risks: {} },
      stats: { riskGrade: 'Médio', fatalRisk: 18, compliance: 70, fineEstimate: 900, lifeExpectancy: 71 },
      tutor: {
        headline: 'Luvas e calçados dielétricos são seu escudo final.',
        detail: 'Luva isolante classe adequada à tensão + capacete classe B + calçado de segurança dielétrico. Essa combinação reduz o risco fatal em ~80% [NR-10, item 10.2.9.1].',
        suggestion: 'Ainda falta o procedimento formal de bloqueio (lockout/tagout).',
      },
    },
    {
      label: 'Bloqueado + sinalizado',
      worker: { mood: 1, helmet: true, boots: true, gloves: true, goggles: true },
      stats: { riskGrade: 'Baixo', fatalRisk: 3, compliance: 100, fineEstimate: 0, lifeExpectancy: 77 },
      tutor: {
        headline: 'Sequência completa: desligou, bloqueou, sinalizou, mediu, aterrou.',
        detail: 'Os 5 passos do SEP: Seccionamento → Bloqueio → Testagem → Aterragem → Sinalização. Assim o circuito só volta quando VOCÊ religar [NR-10, item 10.5.2].',
      },
    },
  ],
}

/* ═══════════════════════════════════════════════════════════
   NR-12 — Máquinas e Equipamentos
   ═══════════════════════════════════════════════════════════ */
export const CFG_NR12: WorkerLabConfig = {
  sliderLabel: 'Proteção da máquina',
  sliderTicks: ['Sem proteção', 'Guarda fixa', '+Sensor', 'Completa'],
  defaultBackground: 'factory',
  levels: [
    {
      label: 'Máquina exposta',
      worker: { mood: 0, risks: { handCuts: true, bodyImpact: true } },
      stats: { riskGrade: 'Crítico', fatalRisk: 71, compliance: 0, fineEstimate: 4800, lifeExpectancy: 54 },
      tutor: {
        headline: 'Prensa sem proteção leva dedo, mão, braço.',
        detail: 'Máquinas sem guardas de segurança são responsáveis por 42% dos acidentes com amputação no Brasil [NR-12, item 12.38].',
        warning: 'Operador alcançou a zona de perigo? Acidente certo. É física, não azar.',
      },
    },
    {
      label: 'Guarda fixa',
      worker: { mood: 0.4, helmet: true, gloves: true, goggles: true, risks: { bodyImpact: true } },
      stats: { riskGrade: 'Alto', fatalRisk: 38, compliance: 30, fineEstimate: 2400, lifeExpectancy: 63 },
      tutor: {
        headline: 'Guarda fixa impede contato acidental, mas não basta.',
        detail: 'Guarda fixa protege durante operação normal. Mas manutenção? Limpeza? O operador ainda pode ser exposto em tarefas não-rotineiras [NR-12, item 12.42].',
        suggestion: 'Adiciona sensor de presença que para a máquina se alguém entrar na zona.',
      },
    },
    {
      label: '+ Sensor de segurança',
      worker: { mood: 0.75, helmet: true, gloves: true, goggles: true, boots: true, earProtection: true },
      stats: { riskGrade: 'Médio', fatalRisk: 14, compliance: 75, fineEstimate: 800, lifeExpectancy: 72 },
      tutor: {
        headline: 'Cortina óptica + intertravamento + parada de emergência acessível.',
        detail: 'Sensor corta energia em milissegundos quando alguém entra na zona. Combina com guarda fixa pra camadas de proteção [NR-12, item 12.44].',
      },
    },
    {
      label: 'Proteção completa',
      worker: { mood: 1, helmet: true, gloves: true, goggles: true, boots: true, earProtection: true, apron: true },
      stats: { riskGrade: 'Baixo', fatalRisk: 4, compliance: 100, fineEstimate: 0, lifeExpectancy: 77 },
      tutor: {
        headline: 'Máquina segura, operador treinado, manutenção documentada.',
        detail: 'Proteção mecânica + eletrônica + procedimento de bloqueio durante manutenção + capacitação do operador [NR-12, item 12.135]. É o pacote completo.',
      },
    },
  ],
}

/* ═══════════════════════════════════════════════════════════
   NR-17 — Ergonomia
   ═══════════════════════════════════════════════════════════ */
export const CFG_NR17: WorkerLabConfig = {
  sliderLabel: 'Adequação ergonômica',
  sliderTicks: ['Nenhuma', 'Básica', 'Média', 'Completa'],
  defaultBackground: 'office',
  levels: [
    {
      label: 'Posto inadequado',
      worker: { mood: 0, risks: { bodyImpact: true } },
      stats: { riskGrade: 'Alto', fatalRisk: 12, compliance: 0, fineEstimate: 2800, lifeExpectancy: 64 },
      tutor: {
        headline: 'LER/DORT não mata na hora, mata devagar.',
        detail: 'Postura errada, mesa alta, cadeira sem regulagem, repetição sem pausa. 68% dos afastamentos por doença ocupacional no Brasil são LER/DORT [NR-17, item 17.3].',
        warning: 'Escritório também entra na NR. Não precisa chão de fábrica pra ter acidente.',
      },
    },
    {
      label: 'Cadeira + mesa ajustáveis',
      worker: { mood: 0.4, boots: true },
      stats: { riskGrade: 'Médio', fatalRisk: 7, compliance: 35, fineEstimate: 1400, lifeExpectancy: 70 },
      tutor: {
        headline: 'Equipamento bom só funciona com ajuste certo.',
        detail: 'Cadeira com regulagem de altura, encosto lombar, apoio pros braços. Mesa na altura do cotovelo [NR-17, item 17.3.3].',
        suggestion: 'Falta iluminação adequada e pausas programadas.',
      },
    },
    {
      label: '+ Iluminação + pausas',
      worker: { mood: 0.7, boots: true, goggles: true },
      stats: { riskGrade: 'Baixo', fatalRisk: 3, compliance: 70, fineEstimate: 500, lifeExpectancy: 74 },
      tutor: {
        headline: 'Iluminação 500 lux + pausa a cada 50 minutos.',
        detail: 'Luz insuficiente força postura pra frente, fadiga visual, dor de cabeça. Pausas curtas a cada 50 min cortam a fadiga muscular [NR-17, item 17.6].',
      },
    },
    {
      label: 'Análise ergonômica completa',
      worker: { mood: 1, boots: true, goggles: true },
      stats: { riskGrade: 'Baixo', fatalRisk: 1, compliance: 100, fineEstimate: 0, lifeExpectancy: 78 },
      tutor: {
        headline: 'Análise Ergonômica Preliminar + Avaliação + Ajustes.',
        detail: 'A empresa fez a AEP, identificou riscos, ajustou posto por posto, documentou. É o processo completo exigido pela NR-17 atualizada [NR-17, item 17.2.2].',
      },
    },
  ],
}

/* ═══════════════════════════════════════════════════════════
   NR-15 — Insalubridade (quimica/ruido/calor)
   ═══════════════════════════════════════════════════════════ */
export const CFG_NR15: WorkerLabConfig = {
  sliderLabel: 'Proteção contra agentes',
  sliderTicks: ['Nenhuma', 'Máscara', '+Abafador', 'Completa'],
  defaultBackground: 'factory',
  levels: [
    {
      label: 'Exposição direta',
      worker: { mood: 0, risks: { chemical: true, noise: true, breathing: true } },
      stats: { riskGrade: 'Crítico', fatalRisk: 35, compliance: 0, fineEstimate: 4500, lifeExpectancy: 58 },
      tutor: {
        headline: 'Solvente + ruído acima de 85dB + sem proteção = doença ocupacional garantida.',
        detail: 'NR-15 define limites de tolerância. Acima disso, é insalubridade [NR-15, anexo 1]. Pulmão, ouvido, pele — tudo sofre.',
        warning: 'Insalubridade gera adicional de 10/20/40% no salário — mas a empresa quer ELIMINAR o risco, não pagar mais.',
      },
    },
    {
      label: 'Máscara respiratória',
      worker: { mood: 0.4, mask: true, risks: { noise: true, chemical: true } },
      stats: { riskGrade: 'Alto', fatalRisk: 22, compliance: 35, fineEstimate: 2600, lifeExpectancy: 65 },
      tutor: {
        headline: 'Pulmão protegido, ouvido ainda exposto.',
        detail: 'Máscara com filtro adequado ao agente químico (P2, P3, vapor orgânico). Mas ruído contínuo destrói a audição [NR-15, anexo 11].',
        suggestion: 'Abafador tipo concha é a próxima camada.',
      },
    },
    {
      label: '+ Protetor auricular',
      worker: { mood: 0.75, mask: true, earProtection: true, goggles: true, gloves: true },
      stats: { riskGrade: 'Médio', fatalRisk: 10, compliance: 70, fineEstimate: 900, lifeExpectancy: 72 },
      tutor: {
        headline: 'EPI respiratório + auditivo + visual cobrem as 3 frentes.',
        detail: 'Mas EPI é a ÚLTIMA linha. A NR-15 exige primeiro eliminação ou redução do agente na fonte [NR-15, item 15.4].',
      },
    },
    {
      label: 'Eliminação + EPI completo',
      worker: { mood: 1, mask: true, earProtection: true, goggles: true, gloves: true, boots: true, apron: true },
      stats: { riskGrade: 'Baixo', fatalRisk: 2, compliance: 100, fineEstimate: 0, lifeExpectancy: 77 },
      tutor: {
        headline: 'Exaustão na fonte + enclausuramento + EPI como backup.',
        detail: 'A empresa trocou o solvente por versão menos tóxica, instalou exaustão local, enclausurou a máquina barulhenta, e o EPI é só a última camada [NR-15, item 15.4.1]. Assim insalubridade cai pra zero.',
      },
    },
  ],
}

/* ═══════════════════════════════════════════════════════════
   NR-33 — Espaços Confinados
   ═══════════════════════════════════════════════════════════ */
export const CFG_NR33: WorkerLabConfig = {
  sliderLabel: 'Procedimento de entrada',
  sliderTicks: ['Sem medir', 'Monitor de gás', '+Ventilação', 'PT + vigia'],
  defaultBackground: 'confined',
  levels: [
    {
      label: 'Entrada cega',
      worker: { mood: 0, risks: { breathing: true, chemical: true } },
      stats: { riskGrade: 'Crítico', fatalRisk: 89, compliance: 0, fineEstimate: 5600, lifeExpectancy: 42 },
      tutor: {
        headline: 'Espaço confinado sem medição de atmosfera é caixão em pé.',
        detail: '60% das mortes em espaço confinado são por deficiência de oxigênio — trabalhador desmaia em 15 segundos e morre em 4 minutos. Mais grave: o colega que entra pra resgatar também morre [NR-33, item 33.3.2].',
        warning: 'Nunca entre em tanque, silo, poço, galeria sem medir O2, gases tóxicos e inflamáveis antes.',
      },
    },
    {
      label: 'Monitor de gás',
      worker: { mood: 0.4, helmet: true, boots: true, risks: { breathing: true } },
      stats: { riskGrade: 'Alto', fatalRisk: 52, compliance: 35, fineEstimate: 3000, lifeExpectancy: 58 },
      tutor: {
        headline: 'Mediu antes, mas e durante?',
        detail: 'Medição pontual não basta — a atmosfera pode mudar enquanto você trabalha. Precisa monitoramento contínuo e ventilação forçada [NR-33, item 33.3.4].',
      },
    },
    {
      label: '+ Ventilação forçada',
      worker: { mood: 0.75, helmet: true, boots: true, gloves: true, mask: true },
      stats: { riskGrade: 'Médio', fatalRisk: 18, compliance: 75, fineEstimate: 1000, lifeExpectancy: 70 },
      tutor: {
        headline: 'Ar renovado + monitor contínuo + EPI respiratório.',
        detail: 'Ventilação forçada garante atmosfera respirável durante todo o trabalho. EPI com ar mandado é backup [NR-33, item 33.3.5].',
        suggestion: 'Falta Permissão de Trabalho + vigia externo + plano de resgate.',
      },
    },
    {
      label: 'PT + vigia + resgate',
      worker: { mood: 1, helmet: true, boots: true, gloves: true, mask: true, harness: true },
      stats: { riskGrade: 'Baixo', fatalRisk: 5, compliance: 100, fineEstimate: 0, lifeExpectancy: 77 },
      tutor: {
        headline: 'Sistema completo: PT assinada, vigia treinado, resgate montado.',
        detail: 'Permissão de Trabalho com assinaturas, vigia externo em comunicação constante, equipe de resgate dimensionada e treinada [NR-33, item 33.3.6]. Esse é o protocolo que salva vidas.',
      },
    },
  ],
}

/* ═══════════════════════════════════════════════════════════
   NR-18 — Construção Civil
   ═══════════════════════════════════════════════════════════ */
export const CFG_NR18: WorkerLabConfig = {
  sliderLabel: 'Conformidade da obra',
  sliderTicks: ['Caótica', 'EPI básico', '+Andaime OK', 'PCMAT + AR'],
  defaultBackground: 'scaffold',
  levels: [
    {
      label: 'Obra sem padrão',
      worker: { mood: 0, risks: { headImpact: true, fallRisk: true, handCuts: true } },
      stats: { riskGrade: 'Crítico', fatalRisk: 84, compliance: 0, fineEstimate: 5800, lifeExpectancy: 50 },
      tutor: {
        headline: 'Construção civil é o setor mais letal do Brasil.',
        detail: '37% das mortes no trabalho são em obras. E a maioria é previsível: queda, impacto, eletrocussão [NR-18, item 18.3].',
        warning: 'Obra sem PCMAT é obra embargada. Fiscal entrou, obra parou.',
      },
    },
    {
      label: 'EPI básico',
      worker: { mood: 0.35, helmet: true, boots: true, gloves: true, risks: { fallRisk: true } },
      stats: { riskGrade: 'Alto', fatalRisk: 52, compliance: 30, fineEstimate: 3200, lifeExpectancy: 60 },
      tutor: {
        headline: 'EPI no corpo mas a obra continua improvisada.',
        detail: 'Andaime sem guarda-corpo, escoramento precário, abertura no piso sem proteção. NR-18 é quase 200 itens — EPI é só 10% deles [NR-18, item 18.7].',
      },
    },
    {
      label: '+ Andaimes e protecões',
      worker: { mood: 0.7, helmet: true, boots: true, gloves: true, harness: true, goggles: true },
      stats: { riskGrade: 'Médio', fatalRisk: 18, compliance: 70, fineEstimate: 900, lifeExpectancy: 71 },
      tutor: {
        headline: 'Andaimes com guarda-corpo, aberturas fechadas, escadas padronizadas.',
        detail: 'Proteção perimetral, bandeja salva-vidas, sinalização, iluminação [NR-18, item 18.12]. A obra começa a parecer profissional.',
      },
    },
    {
      label: 'PCMAT + AR + PT',
      worker: { mood: 1, helmet: true, boots: true, gloves: true, harness: true, goggles: true },
      stats: { riskGrade: 'Baixo', fatalRisk: 5, compliance: 100, fineEstimate: 0, lifeExpectancy: 77 },
      tutor: {
        headline: 'Obra 100% conforme NR-18.',
        detail: 'PCMAT (Programa de Condições e Meio Ambiente de Trabalho) elaborado, Análise de Risco por tarefa, Permissão de Trabalho para atividades críticas, treinamentos em dia [NR-18, item 18.4]. Auditor aprova e vai embora.',
      },
    },
  ],
}

/* ═══════════════════════════════════════════════════════════
   5 TEMPLATES VISUAIS TEMATICOS
   Cada um gera worker com equipamentos, riscos e background
   DIFERENTES. A NR mapeia pro template que faz sentido visual.
   ═══════════════════════════════════════════════════════════ */

interface GenericOpts {
  nrCode: string
  topic: string
  criticalStat: string
  keyCite: string
}

/** CONSTRUCAO/INDUSTRIAL PESADO — capacete, luvas, botas, cinto. Riscos: queda, impacto. */
function genericHeavy(o: GenericOpts): WorkerLabConfig {
  return {
    sliderLabel: 'Conformidade com a norma',
    sliderTicks: ['Desprotegido', 'Capacete + bota', '+Cinto', 'Conforme'],
    defaultBackground: 'scaffold',
    levels: [
      { label: 'Desprotegido', worker: { mood: 0, risks: { headImpact: true, fallRisk: true, handCuts: true } },
        stats: { riskGrade: 'Crítico', fatalRisk: 82, compliance: 0, fineEstimate: 4800, lifeExpectancy: 52 },
        tutor: { headline: `${o.nrCode} ignorada é convite pro pior.`, detail: `${o.topic}: ${o.criticalStat} sem controle [${o.keyCite}].`, warning: 'Embargo imediato + multa pesada.' } },
      { label: 'Capacete + bota', worker: { mood: 0.35, helmet: true, boots: true, risks: { fallRisk: true, handCuts: true } },
        stats: { riskGrade: 'Alto', fatalRisk: 52, compliance: 30, fineEstimate: 2600, lifeExpectancy: 61 },
        tutor: { headline: 'Cabeça e pés ok, mãos e queda ainda expostos.', detail: `Capacete + bota protegem mas faltam luvas e sistema antiqueda [${o.keyCite}].` } },
      { label: '+Luvas +Cinto', worker: { mood: 0.7, helmet: true, boots: true, gloves: true, harness: true },
        stats: { riskGrade: 'Médio', fatalRisk: 18, compliance: 70, fineEstimate: 800, lifeExpectancy: 71 },
        tutor: { headline: 'Quase lá — falta procedimento formal.', detail: `Equipamento no corpo + procedimento documentado [${o.keyCite}].`, suggestion: 'Puxa pro 3 e fecha com AR + PT.' } },
      { label: 'Conforme', worker: { mood: 1, helmet: true, boots: true, gloves: true, harness: true, goggles: true },
        stats: { riskGrade: 'Baixo', fatalRisk: 4, compliance: 100, fineEstimate: 0, lifeExpectancy: 77 },
        tutor: { headline: 'Totalmente conforme.', detail: `EPI + procedimento + treinamento + AR. ${o.nrCode} cumprida.` } },
    ],
  }
}

/** QUIMICO/BIOLOGICO — mascara, oculos, luvas, avental. Riscos: quimico, respiracao. */
function genericChemical(o: GenericOpts): WorkerLabConfig {
  return {
    sliderLabel: 'Proteção contra agentes',
    sliderTicks: ['Exposto', 'Máscara', '+Óculos +Luva', 'Completa'],
    defaultBackground: 'factory',
    levels: [
      { label: 'Exposição direta', worker: { mood: 0, risks: { chemical: true, breathing: true, handCuts: true } },
        stats: { riskGrade: 'Crítico', fatalRisk: 65, compliance: 0, fineEstimate: 4500, lifeExpectancy: 54 },
        tutor: { headline: `Sem proteção, ${o.criticalStat} é inevitável.`, detail: `${o.topic} exige barreira contra agentes [${o.keyCite}].`, warning: 'Doença ocupacional + afastamento + multa.' } },
      { label: 'Máscara respiratória', worker: { mood: 0.35, mask: true, boots: true, risks: { chemical: true, handCuts: true } },
        stats: { riskGrade: 'Alto', fatalRisk: 38, compliance: 30, fineEstimate: 2600, lifeExpectancy: 63 },
        tutor: { headline: 'Pulmão ok, mas pele e olhos ainda absorvem.', detail: `Máscara cobre inalação mas contato dérmico e ocular continua [${o.keyCite}].` } },
      { label: '+Óculos +Luvas', worker: { mood: 0.7, mask: true, goggles: true, gloves: true, boots: true, risks: {} },
        stats: { riskGrade: 'Médio', fatalRisk: 12, compliance: 70, fineEstimate: 800, lifeExpectancy: 72 },
        tutor: { headline: '3 barreiras ativas: respiração, visão, tato.', detail: `Falta o avental e o procedimento formal [${o.keyCite}].` } },
      { label: 'Proteção completa', worker: { mood: 1, mask: true, goggles: true, gloves: true, boots: true, apron: true },
        stats: { riskGrade: 'Baixo', fatalRisk: 3, compliance: 100, fineEstimate: 0, lifeExpectancy: 77 },
        tutor: { headline: 'Paramentação completa + procedimento.', detail: `${o.nrCode} cumprida com eliminação na fonte + EPI como backup.` } },
    ],
  }
}

/** MAQUINAS/INDUSTRIAL — protetor auricular, oculos, luvas, factory bg. Riscos: ruido, impacto. */
function genericMachine(o: GenericOpts): WorkerLabConfig {
  return {
    sliderLabel: 'Proteção da máquina + operador',
    sliderTicks: ['Sem guarda', 'Guarda fixa', '+EPI operador', 'Conforme'],
    defaultBackground: 'factory',
    levels: [
      { label: 'Máquina sem guarda', worker: { mood: 0, risks: { bodyImpact: true, noise: true, handCuts: true } },
        stats: { riskGrade: 'Crítico', fatalRisk: 71, compliance: 0, fineEstimate: 4800, lifeExpectancy: 54 },
        tutor: { headline: `Máquina exposta + sem EPI = amputação esperando acontecer.`, detail: `${o.topic}: ${o.criticalStat} [${o.keyCite}].`, warning: 'Embargo + multa + ação penal se tiver acidente.' } },
      { label: 'Guarda fixa instalada', worker: { mood: 0.35, helmet: true, boots: true, risks: { noise: true, bodyImpact: true } },
        stats: { riskGrade: 'Alto', fatalRisk: 40, compliance: 30, fineEstimate: 2400, lifeExpectancy: 62 },
        tutor: { headline: 'Guarda mecânica ok, mas o operador tá exposto ao ruído.', detail: `Faltam protetor auricular e óculos [${o.keyCite}].` } },
      { label: '+EPI do operador', worker: { mood: 0.7, helmet: true, boots: true, gloves: true, earProtection: true, goggles: true },
        stats: { riskGrade: 'Médio', fatalRisk: 14, compliance: 70, fineEstimate: 800, lifeExpectancy: 72 },
        tutor: { headline: 'Guarda + abafador + óculos + luvas.', detail: `Quase lá. Falta procedimento de manutenção e bloqueio (lockout) [${o.keyCite}].` } },
      { label: 'Conforme', worker: { mood: 1, helmet: true, boots: true, gloves: true, earProtection: true, goggles: true, apron: true },
        stats: { riskGrade: 'Baixo', fatalRisk: 4, compliance: 100, fineEstimate: 0, lifeExpectancy: 77 },
        tutor: { headline: 'Proteção mecânica + eletrônica + EPI + lockout.', detail: `${o.nrCode} cumprida integralmente.` } },
    ],
  }
}

/** ESCRITORIO/ADMINISTRATIVO — poucos EPIs, foco em postura e conformidade documental. */
/** ESCRITORIO/ADMINISTRATIVO — SEM EPIs fisicos. Foco: ergonomia, iluminacao, pausas, exames. */
function genericOffice(o: GenericOpts): WorkerLabConfig {
  return {
    sliderLabel: 'Adequação ergonômica',
    sliderTicks: ['Irregular', 'Básico', 'Documentado', 'Conforme'],
    defaultBackground: 'office',
    items: [
      {
        id: 'ergonomicChair', label: 'Cadeira',
        fullName: 'Cadeira ergonômica com regulagem de altura e apoio lombar',
        description: 'Previne dor lombar e hérnia de disco — obrigatória pela NR-17.',
        normRef: 'NR-17, item 17.3.3',
        risksRemoved: ['bodyImpact'],
        riskReduction: 3, complianceWeight: 20, lifeYearsAdded: 2, fineReduction: 600,
        tutorAdded: 'Cadeira certa corta 60% das queixas de lombalgia no escritório.',
        tutorRemoved: 'Sem cadeira ergonômica, a coluna paga a conta em 2 anos.',
      },
      {
        id: 'monitorStand', label: 'Monitor',
        fullName: 'Suporte de monitor na altura dos olhos',
        description: 'Evita dor cervical e fadiga visual. Tela deve ficar a 50-75cm dos olhos.',
        normRef: 'NR-17, item 17.3.5',
        riskReduction: 2, complianceWeight: 15, lifeYearsAdded: 1, fineReduction: 400,
        tutorAdded: 'Monitor na altura certa = pescoço reto. Evita cirurgia cervical.',
        tutorRemoved: 'Monitor baixo = cabeça inclinada 8h/dia. Dor cervical crônica em 6 meses.',
      },
      {
        id: 'lighting', label: 'Iluminação',
        fullName: 'Iluminação adequada — mínimo 500 lux na mesa',
        description: 'Luz insuficiente causa fadiga visual, miopia progressiva e cefaleia.',
        normRef: 'NR-17, item 17.5.3',
        riskReduction: 2, complianceWeight: 15, lifeYearsAdded: 1, fineReduction: 400,
        tutorAdded: 'Com 500 lux a fadiga visual cai pela metade e a produtividade sobe 15%.',
        tutorRemoved: 'Sem iluminação adequada, o olho força demais. Miopia e cefaleia garantidos.',
      },
      {
        id: 'breaks', label: 'Pausas',
        fullName: 'Pausas programadas de 10 min a cada 50 min',
        description: 'Reduz LER/DORT (Lesão por Esforço Repetitivo), fadiga mental e risco cardiovascular.',
        normRef: 'NR-17, item 17.6.3',
        riskReduction: 2, complianceWeight: 20, lifeYearsAdded: 3, fineReduction: 500,
        tutorAdded: 'Pausa de 10 min a cada 50 min corta LER/DORT em 40%. E melhora concentração.',
        tutorRemoved: 'Sem pausa, o punho inflama, o ombro trava, a produtividade despenca depois das 14h.',
      },
      {
        id: 'periodicExam', label: 'Exame',
        fullName: 'Exame médico periódico — PCMSO (NR-7)',
        description: `PCMSO = Programa de Controle Médico de Saúde Ocupacional. Detecta LER, problemas visuais e estresse ANTES de virarem afastamento. ${o.keyCite ? '[' + o.keyCite + ']' : ''}`,
        normRef: 'NR-7, item 7.4.1 — NR-7 é o PCMSO, obrigatório pra TODA empresa com empregados CLT.',
        riskReduction: 2, complianceWeight: 20, lifeYearsAdded: 4, fineReduction: 700,
        tutorAdded: 'Exame periódico pega o problema quando ainda é reversível. Sem ele, só descobre na invalidez.',
        tutorRemoved: 'Sem PCMSO, o funcionário descobre a LER quando já não consegue digitar.',
      },
      {
        id: 'wristSupport', label: 'Apoio de pulso',
        fullName: 'Apoio de pulso ergonômico para teclado e mouse',
        description: 'Previne Síndrome do Túnel do Carpo e tendinite. Custo: R$ 30. Cirurgia: R$ 15 mil.',
        normRef: 'NR-17, item 17.3',
        risksRemoved: ['handCuts'],
        riskReduction: 1, complianceWeight: 10, lifeYearsAdded: 1, fineReduction: 300,
        tutorAdded: 'R$ 30 de apoio de pulso evita R$ 15 mil de cirurgia + 3 meses de afastamento.',
        tutorRemoved: 'Sem apoio, o pulso flexiona 15° a mais que o ideal. Em 2 anos vira tendinite.',
      },
    ],
    baseStats: { riskFatal: 12, compliance: 0, fineEstimate: 2800, lifeExpectancy: 65 },
    baseRisks: { bodyImpact: true, handCuts: true },
    tutorEmpty: `${o.nrCode} não é só chão de fábrica. Escritório sem ergonomia gera LER, miopia, depressão por prazo, burnout — e a empresa paga a conta. ${o.criticalStat} [${o.keyCite}].`,
    tutorFull: 'Ambiente ergonômico completo: cadeira, monitor, luz, pausas, exame periódico, apoio de pulso. Não é luxo — é o mínimo da NR-17. E o funcionário produz mais, adoece menos, fica mais tempo.',
  }
}

/** INCENDIO/EMERGENCIA — mascara + fumaca + extintor. Riscos: heatExposure, breathing. */
function genericFire(o: GenericOpts): WorkerLabConfig {
  return {
    sliderLabel: 'Preparo contra incêndio',
    sliderTicks: ['Sem preparo', 'Extintor', '+Rota de fuga', 'Brigada ativa'],
    defaultBackground: 'fire',
    levels: [
      { label: 'Sem preparo', worker: { mood: 0, risks: { heatExposure: true, breathing: true, bodyImpact: true } },
        stats: { riskGrade: 'Crítico', fatalRisk: 74, compliance: 0, fineEstimate: 4200, lifeExpectancy: 52 },
        tutor: { headline: `Fogo se alastra em segundos — e ${o.criticalStat}.`, detail: `${o.topic}: sem saída sinalizada e sem extintor, a probabilidade de morte por inalação de fumaça é 3x maior [${o.keyCite}].`, warning: 'A maioria morre de fumaça, não de queimadura.' } },
      { label: 'Extintor disponível', worker: { mood: 0.35, boots: true, helmet: true, risks: { heatExposure: true, breathing: true } },
        stats: { riskGrade: 'Alto', fatalRisk: 45, compliance: 30, fineEstimate: 2600, lifeExpectancy: 62 },
        tutor: { headline: 'Tem extintor, mas sabe usar? E a saída?', detail: `Extintor sem treinamento e sem sinalização de rota de fuga é decoração [${o.keyCite}].` } },
      { label: '+Rota sinalizada', worker: { mood: 0.7, boots: true, helmet: true, mask: true, risks: {} },
        stats: { riskGrade: 'Médio', fatalRisk: 16, compliance: 70, fineEstimate: 800, lifeExpectancy: 72 },
        tutor: { headline: 'Rotas sinalizadas + iluminação de emergência + extintor.', detail: `Simulação de evacuação a cada 6 meses [${o.keyCite}].`, suggestion: 'Falta a brigada treinada e o plano de emergência escrito.' } },
      { label: 'Brigada ativa', worker: { mood: 1, boots: true, helmet: true, mask: true, gloves: true },
        stats: { riskGrade: 'Baixo', fatalRisk: 4, compliance: 100, fineEstimate: 0, lifeExpectancy: 77 },
        tutor: { headline: 'Brigada treinada + plano de emergência + simulado semestral.', detail: `${o.nrCode} cumprida. Tempo de evacuação dentro do limite.` } },
    ],
  }
}

/** SAUDE/HOSPITALAR — mascara, luva esteril, face shield, avental descartavel. Riscos: biological. */
function genericHealth(o: GenericOpts): WorkerLabConfig {
  return {
    sliderLabel: 'Paramentação hospitalar',
    sliderTicks: ['Sem barreira', 'Luvas', '+Máscara +Óculos', 'Completa'],
    defaultBackground: 'hospital',
    levels: [
      { label: 'Sem barreira biológica', worker: { mood: 0, risks: { chemical: true, handCuts: true, breathing: true }, backgroundHint: 'office' },
        stats: { riskGrade: 'Crítico', fatalRisk: 38, compliance: 0, fineEstimate: 3800, lifeExpectancy: 58 },
        tutor: { headline: `Sangue, agulha, fluido — sem barreira é roleta.`, detail: `${o.topic}: ${o.criticalStat} [${o.keyCite}]. Risco de hepatite B, C e HIV por perfurocortante.`, warning: '1 em cada 300 acidentes com agulha contaminada transmite HIV.' } },
      { label: 'Luvas de procedimento', worker: { mood: 0.35, gloves: true, boots: true, risks: { breathing: true, chemical: true }, backgroundHint: 'office' },
        stats: { riskGrade: 'Alto', fatalRisk: 22, compliance: 30, fineEstimate: 2200, lifeExpectancy: 65 },
        tutor: { headline: 'Mãos protegidas, rosto exposto.', detail: `Luvas cortam contato dérmico mas sem máscara e óculos a mucosa é porta de entrada [${o.keyCite}].` } },
      { label: '+Máscara +Óculos', worker: { mood: 0.7, gloves: true, boots: true, mask: true, goggles: true, backgroundHint: 'office' },
        stats: { riskGrade: 'Médio', fatalRisk: 9, compliance: 70, fineEstimate: 800, lifeExpectancy: 73 },
        tutor: { headline: 'Barreira respiratória + ocular + luvas.', detail: `Falta o avental impermeável pra respingos e o descartável pós-procedimento [${o.keyCite}].` } },
      { label: 'Paramentação completa', worker: { mood: 1, gloves: true, boots: true, mask: true, goggles: true, apron: true, backgroundHint: 'office' },
        stats: { riskGrade: 'Baixo', fatalRisk: 2, compliance: 100, fineEstimate: 0, lifeExpectancy: 78 },
        tutor: { headline: 'Luvas + máscara + óculos + avental + descarte correto.', detail: `${o.nrCode} cumprida. Protocolo de exposição acidental documentado.` } },
    ],
  }
}

/** RUIDO/CALOR — protetor auricular progressivo + tempo de exposicao. Riscos: noise, heatExposure. */
function genericNoise(o: GenericOpts): WorkerLabConfig {
  return {
    sliderLabel: 'Proteção contra ruído e calor',
    sliderTicks: ['Exposto', 'Plug de ouvido', '+Abafador', 'Eliminação'],
    defaultBackground: 'noise',
    levels: [
      { label: 'Exposição direta', worker: { mood: 0, risks: { noise: true, heatExposure: true }, backgroundHint: 'factory' },
        stats: { riskGrade: 'Crítico', fatalRisk: 22, compliance: 0, fineEstimate: 3600, lifeExpectancy: 58 },
        tutor: { headline: `85dB por 8h mata a audição em 5 anos.`, detail: `${o.topic}: ${o.criticalStat}. PAIR (Perda Auditiva Induzida por Ruído) é irreversível [${o.keyCite}].`, warning: 'Trabalhador só percebe a surdez quando já perdeu 50%. Aí não volta.' } },
      { label: 'Plug de ouvido', worker: { mood: 0.35, earProtection: true, boots: true, risks: { noise: true, heatExposure: true }, backgroundHint: 'factory' },
        stats: { riskGrade: 'Alto', fatalRisk: 15, compliance: 30, fineEstimate: 2000, lifeExpectancy: 65 },
        tutor: { headline: 'Plug atenua ~15dB. Pra ruído acima de 100dB não basta.', detail: `Plug de inserção tipo espuma. Mas se o ruído é de impacto, precisa abafador tipo concha [${o.keyCite}].` } },
      { label: '+Abafador tipo concha', worker: { mood: 0.7, earProtection: true, helmet: true, boots: true, goggles: true, risks: {}, backgroundHint: 'factory' },
        stats: { riskGrade: 'Médio', fatalRisk: 6, compliance: 70, fineEstimate: 600, lifeExpectancy: 73 },
        tutor: { headline: 'Abafador atenua ~25dB. Combinado com plug chega a ~35dB.', detail: `Ruído controlado no receptor. Mas o ideal é reduzir na fonte [${o.keyCite}].` } },
      { label: 'Eliminação na fonte', worker: { mood: 1, earProtection: true, helmet: true, boots: true, goggles: true, gloves: true, backgroundHint: 'factory' },
        stats: { riskGrade: 'Baixo', fatalRisk: 2, compliance: 100, fineEstimate: 0, lifeExpectancy: 77 },
        tutor: { headline: 'Enclausuramento da fonte + abafador como backup.', detail: `${o.nrCode} cumprida. Audiometria periódica em dia. Zero PAIR.` } },
    ],
  }
}

/** MARITIMO/PORTUARIO — colete salva-vidas, cordas, escada embarque. Riscos: fallRisk, breathing. */
function genericMaritime(o: GenericOpts): WorkerLabConfig {
  return {
    sliderLabel: 'Proteção aquaviária',
    sliderTicks: ['Desprotegido', 'Colete', '+Linha de vida', 'Conforme'],
    defaultBackground: 'maritime',
    levels: [
      { label: 'Desprotegido', worker: { mood: 0, risks: { fallRisk: true, bodyImpact: true, breathing: true } },
        stats: { riskGrade: 'Crítico', fatalRisk: 78, compliance: 0, fineEstimate: 4800, lifeExpectancy: 52 },
        tutor: { headline: `Queda no mar sem colete = minutos pra afogar.`, detail: `${o.topic}: ${o.criticalStat}. Hipotermia chega em 15 minutos mesmo em águas tropicais [${o.keyCite}].`, warning: 'Operações de resgate marítimo levam em média 12 minutos. Sem colete, o trabalhador não sobrevive.' } },
      { label: 'Colete salva-vidas', worker: { mood: 0.35, helmet: true, boots: true, risks: { fallRisk: true, bodyImpact: true } },
        stats: { riskGrade: 'Alto', fatalRisk: 42, compliance: 30, fineEstimate: 2800, lifeExpectancy: 62 },
        tutor: { headline: 'Colete mantém flutuando, mas falta evitar a queda.', detail: `O colete salva depois. A linha de vida impede antes [${o.keyCite}].` } },
      { label: '+Linha de vida', worker: { mood: 0.7, helmet: true, boots: true, gloves: true, harness: true },
        stats: { riskGrade: 'Médio', fatalRisk: 15, compliance: 70, fineEstimate: 900, lifeExpectancy: 72 },
        tutor: { headline: 'Colete + cinto + linha de vida + guarda-corpo.', detail: `Sistema combinado. Falta procedimento formal e sinalização [${o.keyCite}].` } },
      { label: 'Conforme', worker: { mood: 1, helmet: true, boots: true, gloves: true, harness: true, goggles: true },
        stats: { riskGrade: 'Baixo', fatalRisk: 4, compliance: 100, fineEstimate: 0, lifeExpectancy: 77 },
        tutor: { headline: 'Colete + cinto + linha de vida + procedimento + treinamento.', detail: `${o.nrCode} cumprida. Equipe de resgate posicionada.` } },
    ],
  }
}

/** CONFORMIDADE/GESTAO — clipboard, documentos, PGR. Foco administrativo mas impacto real. */
function genericCompliance(o: GenericOpts): WorkerLabConfig {
  return {
    sliderLabel: 'Maturidade da gestão de SST',
    sliderTicks: ['Inexistente', 'Reativo', 'Estruturado', 'Proativo'],
    defaultBackground: 'office',
    levels: [
      { label: 'Gestão inexistente', worker: { mood: 0, risks: { bodyImpact: true }, backgroundHint: 'office' },
        stats: { riskGrade: 'Crítico', fatalRisk: 45, compliance: 0, fineEstimate: 4200, lifeExpectancy: 58 },
        tutor: { headline: `Sem gestão de SST, o acidente é questão de quando — não se.`, detail: `${o.topic}: ${o.criticalStat}. A ${o.nrCode} existe pra forçar estrutura mínima [${o.keyCite}].`, warning: 'Empresa sem PGR é empresa que vai ser embargada na primeira visita.' } },
      { label: 'Reativo (pós-acidente)', worker: { mood: 0.35, boots: true, backgroundHint: 'office' },
        stats: { riskGrade: 'Alto', fatalRisk: 28, compliance: 30, fineEstimate: 2400, lifeExpectancy: 65 },
        tutor: { headline: 'Só age depois que acontece. Sempre tarde demais.', detail: `Documentação básica pós-incidente. Sem prevenção real [${o.keyCite}].` } },
      { label: 'Estruturado', worker: { mood: 0.7, boots: true, goggles: true, backgroundHint: 'office' },
        stats: { riskGrade: 'Médio', fatalRisk: 10, compliance: 70, fineEstimate: 600, lifeExpectancy: 74 },
        tutor: { headline: 'PGR documentado + treinamentos + inspeções periódicas.', detail: `Sistema funcionando com evidências. Falta melhoria contínua [${o.keyCite}].` } },
      { label: 'Proativo', worker: { mood: 1, boots: true, backgroundHint: 'office' },
        stats: { riskGrade: 'Baixo', fatalRisk: 2, compliance: 100, fineEstimate: 0, lifeExpectancy: 78 },
        tutor: { headline: 'Prevenção real. Melhoria contínua. Zero acidentes como meta.', detail: `${o.nrCode} cumprida — a gestão de SST é parte da cultura, não obrigação.` } },
    ],
  }
}

/** CAMPO/OUTDOOR — chapeu, bota, protetor solar. Riscos: calor, picada, queda. */
function genericOutdoor(o: GenericOpts): WorkerLabConfig {
  return {
    sliderLabel: 'Proteção para trabalho externo',
    sliderTicks: ['Exposto', 'Chapéu + bota', '+Luvas +Hidrat.', 'Conforme'],
    defaultBackground: 'outdoor',
    levels: [
      { label: 'Exposição total', worker: { mood: 0, risks: { heatExposure: true, handCuts: true }, backgroundHint: 'outdoor' },
        stats: { riskGrade: 'Crítico', fatalRisk: 42, compliance: 0, fineEstimate: 3200, lifeExpectancy: 58 },
        tutor: { headline: `Sol + ${o.criticalStat} sem proteção derruba qualquer um.`, detail: `${o.topic} exige sombra, hidratação e EPI específico [${o.keyCite}].`, warning: 'Insolação mata. Desidratação derruba produtividade antes de derrubar a pessoa.' } },
      { label: 'Chapéu + bota', worker: { mood: 0.35, helmet: true, boots: true, risks: { heatExposure: true }, backgroundHint: 'outdoor' },
        stats: { riskGrade: 'Alto', fatalRisk: 28, compliance: 30, fineEstimate: 1800, lifeExpectancy: 65 },
        tutor: { headline: 'Cabeça coberta mas pele e mãos ainda expostas.', detail: `Faltam luvas, protetor solar, água disponível [${o.keyCite}].` } },
      { label: '+Luvas +Hidratação', worker: { mood: 0.7, helmet: true, boots: true, gloves: true, backgroundHint: 'outdoor' },
        stats: { riskGrade: 'Médio', fatalRisk: 10, compliance: 70, fineEstimate: 600, lifeExpectancy: 73 },
        tutor: { headline: 'Proteção física + hidratação + sombra.', detail: `Pausas em área coberta a cada hora [${o.keyCite}].` } },
      { label: 'Conforme', worker: { mood: 1, helmet: true, boots: true, gloves: true, goggles: true, backgroundHint: 'outdoor' },
        stats: { riskGrade: 'Baixo', fatalRisk: 3, compliance: 100, fineEstimate: 0, lifeExpectancy: 77 },
        tutor: { headline: 'Proteção solar + EPI + pausas + hidratação + sombra.', detail: `${o.nrCode} cumprida. Trabalhador protegido do sol ao calçado.` } },
    ],
  }
}

/* ═══════════════════════════════════════════════════════════
   MAPEAMENTO NR → TEMPLATE VISUAL
   Cada NR mapeia pro template que faz sentido pro CONTEXTO
   visual da norma, nao uma generic identica.
   ═══════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════
   MAPEAMENTO NR → TEMPLATE VISUAL (10 templates, maxima diversidade)
   Nenhum template usado por mais de 4 NRs.
   ═══════════════════════════════════════════════════════════ */

// GESTAO/COMPLIANCE (office, clipboard, PGR) — foco documental
export const CFG_NR01 = genericCompliance({ nrCode: 'NR-01', topic: 'Gerenciamento de riscos ocupacionais (PGR)', criticalStat: 'riscos não identificados viram acidente previsível', keyCite: 'NR-1, item 1.5.3' })
export const CFG_NR03 = genericCompliance({ nrCode: 'NR-03', topic: 'Embargo e interdição', criticalStat: 'reincidências levam a embargo imediato', keyCite: 'NR-3, item 3.2' })
export const CFG_NR28 = genericCompliance({ nrCode: 'NR-28', topic: 'Fiscalização e penalidades', criticalStat: 'multas cumulativas podem fechar a empresa', keyCite: 'NR-28, item 28.2' })

// ESCRITORIO/ERGONOMIA (office, cadeira, postura, LER)
export const CFG_NR04 = genericOffice({ nrCode: 'NR-04', topic: 'SESMT (Serviços Especializados)', criticalStat: 'acidentes por falta de assistência técnica de SST', keyCite: 'NR-4, item 4.4' })
export const CFG_NR05 = genericOffice({ nrCode: 'NR-05', topic: 'CIPA (Comissão Interna)', criticalStat: 'acidentes que inspeção interna detectaria antes', keyCite: 'NR-5, item 5.4' })
export const CFG_NR24 = genericOffice({ nrCode: 'NR-24', topic: 'Condições sanitárias e de conforto', criticalStat: 'doenças por banheiro precário e água não potável', keyCite: 'NR-24, item 24.1' })
export const CFG_NR26 = genericOffice({ nrCode: 'NR-26', topic: 'Sinalização de segurança', criticalStat: 'colisões e quedas por falta de sinalização visual', keyCite: 'NR-26, item 26.1' })

// SAUDE/HOSPITALAR (hospital, paramentacao, biologico)
export const CFG_NR07 = genericHealth({ nrCode: 'NR-07', topic: 'PCMSO (Programa de Controle Médico)', criticalStat: 'doenças ocupacionais diagnosticadas tarde demais', keyCite: 'NR-7, item 7.4' })
export const CFG_NR32 = genericHealth({ nrCode: 'NR-32', topic: 'Serviços de saúde', criticalStat: 'contaminação biológica por perfurocortante', keyCite: 'NR-32, item 32.2' })

// QUIMICO (factory, mascara, oculos, avental, gotas)
export const CFG_NR09 = genericChemical({ nrCode: 'NR-09', topic: 'Exposição a agentes', criticalStat: 'exposição crônica não medida', keyCite: 'NR-9, item 9.3' })
export const CFG_NR16 = genericChemical({ nrCode: 'NR-16', topic: 'Periculosidade', criticalStat: 'contato com inflamáveis/explosivos/radiação', keyCite: 'NR-16, item 16.2' })
export const CFG_NR25 = genericChemical({ nrCode: 'NR-25', topic: 'Resíduos industriais', criticalStat: 'contaminação química e biológica', keyCite: 'NR-25, item 25.2' })
export const CFG_NR38 = genericChemical({ nrCode: 'NR-38', topic: 'Limpeza urbana', criticalStat: 'contato com agentes biológicos no lixo', keyCite: 'NR-38, item 38.3' })

// INCENDIO/EMERGENCIA (smoke, extintor, rota de fuga)
export const CFG_NR19 = genericFire({ nrCode: 'NR-19', topic: 'Explosivos', criticalStat: 'detonação acidental em manuseio/transporte', keyCite: 'NR-19, item 19.2' })
export const CFG_NR20 = genericFire({ nrCode: 'NR-20', topic: 'Inflamáveis e combustíveis', criticalStat: 'incêndio em área de armazenamento', keyCite: 'NR-20, item 20.3' })
export const CFG_NR23 = genericFire({ nrCode: 'NR-23', topic: 'Proteção contra incêndios', criticalStat: 'mortes por inalação de fumaça', keyCite: 'NR-23, item 23.2' })

// CONSTRUCAO PESADA (scaffold, capacete, cinto, luvas)
export const CFG_NR08 = genericHeavy({ nrCode: 'NR-08', topic: 'Edificações', criticalStat: 'quedas em escadas e piso irregular', keyCite: 'NR-8, item 8.3' })
export const CFG_NR11 = genericHeavy({ nrCode: 'NR-11', topic: 'Movimentação de materiais', criticalStat: 'queda de carga e esmagamento', keyCite: 'NR-11, item 11.1.5' })
export const CFG_NR22 = genericHeavy({ nrCode: 'NR-22', topic: 'Mineração', criticalStat: 'desabamento e inalação de poeira', keyCite: 'NR-22, item 22.5' })
export const CFG_NR34 = genericHeavy({ nrCode: 'NR-34', topic: 'Construção naval', criticalStat: 'trabalho a quente em espaço confinado', keyCite: 'NR-34, item 34.11' })

// RUIDO/CALOR (factory, abafador, protetor auricular, dB)
export const CFG_NR13 = genericNoise({ nrCode: 'NR-13', topic: 'Caldeiras e vasos de pressão', criticalStat: 'explosões por falha de inspeção + ruído contínuo', keyCite: 'NR-13, item 13.4' })
export const CFG_NR14 = genericNoise({ nrCode: 'NR-14', topic: 'Fornos industriais', criticalStat: 'queimadura + perda auditiva por calor/ruído', keyCite: 'NR-14, item 14.1' })

// MAQUINAS (factory, guarda, sensor, lockout)
export const CFG_NR36 = genericMachine({ nrCode: 'NR-36', topic: 'Frigoríficos', criticalStat: 'LER/DORT + cortes de faca industrial', keyCite: 'NR-36, item 36.4' })

// MARITIMO/PORTUARIO (colete, linha de vida, agua)
export const CFG_NR29 = genericMaritime({ nrCode: 'NR-29', topic: 'Trabalho portuário', criticalStat: 'queda de contêiner + afogamento', keyCite: 'NR-29, item 29.1.4' })
export const CFG_NR30 = genericMaritime({ nrCode: 'NR-30', topic: 'Trabalho aquaviário', criticalStat: 'queda ao mar + asfixia em porão', keyCite: 'NR-30, item 30.3' })
export const CFG_NR37 = genericMaritime({ nrCode: 'NR-37', topic: 'Plataformas de petróleo', criticalStat: 'explosão + queda ao mar em alto-mar', keyCite: 'NR-37, item 37.5' })

// CAMPO/OUTDOOR (sol, chapeu, hidratacao, agrotoxicos)
export const CFG_NR21 = genericOutdoor({ nrCode: 'NR-21', topic: 'Trabalho a céu aberto', criticalStat: 'insolação + desidratação + descarga atmosférica', keyCite: 'NR-21, item 21.2' })
export const CFG_NR31 = genericOutdoor({ nrCode: 'NR-31', topic: 'Trabalho rural', criticalStat: 'intoxicação por agrotóxico + acidente com máquina', keyCite: 'NR-31, item 31.8' })
