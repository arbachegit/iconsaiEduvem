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
  defaultBackground: 'factory',
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
  defaultBackground: 'factory',
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
   Defaults genericos para as NRs restantes
   (estruturalmente similares — slider EPI progressivo, stats coerentes)
   ═══════════════════════════════════════════════════════════ */

/** Config reusavel pra NRs que nao tem template especifico.
 *  Varia textos mas mantem visual/mechanic identicos. */
function genericConfig(opts: {
  nrCode: string
  topic: string               // 'Transporte e movimentacao', 'Trabalho rural', etc
  criticalStat: string        // 'quedas de carga', 'exposicao a agrotoxicos', etc
  keyCite: string             // 'NR-11, item 11.3.1'
}): WorkerLabConfig {
  return {
    sliderLabel: 'Conformidade com a norma',
    sliderTicks: ['Descumprimento', 'EPI básico', '+Procedimento', 'Conforme'],
    defaultBackground: 'scaffold',
    levels: [
      {
        label: 'Descumprimento',
        worker: { mood: 0, risks: { headImpact: true, bodyImpact: true, handCuts: true } },
        stats: { riskGrade: 'Crítico', fatalRisk: 78, compliance: 0, fineEstimate: 4200, lifeExpectancy: 55 },
        tutor: {
          headline: `Trabalhar fora da ${opts.nrCode} é colecionar risco.`,
          detail: `${opts.topic} exige procedimentos específicos. Sem eles, ${opts.criticalStat} viram estatística [${opts.keyCite}].`,
          warning: 'Fiscal acha → embargo imediato + multa.',
        },
      },
      {
        label: 'EPI básico',
        worker: { mood: 0.4, helmet: true, boots: true, gloves: true, risks: { bodyImpact: true } },
        stats: { riskGrade: 'Alto', fatalRisk: 45, compliance: 30, fineEstimate: 2400, lifeExpectancy: 63 },
        tutor: {
          headline: 'EPI no corpo, mas falta o procedimento.',
          detail: `A ${opts.nrCode} exige MUITO mais que EPI. Treinamento, capacitação, planejamento da tarefa, supervisão [${opts.keyCite}].`,
        },
      },
      {
        label: '+ Procedimento documentado',
        worker: { mood: 0.75, helmet: true, boots: true, gloves: true, goggles: true },
        stats: { riskGrade: 'Médio', fatalRisk: 15, compliance: 70, fineEstimate: 800, lifeExpectancy: 72 },
        tutor: {
          headline: 'Procedimento escrito + treinamento + supervisão.',
          detail: `Com procedimento documentado e capacitação, o acidente vira exceção, não rotina [${opts.keyCite}].`,
        },
      },
      {
        label: 'Conforme a norma',
        worker: { mood: 1, helmet: true, boots: true, gloves: true, goggles: true, earProtection: true },
        stats: { riskGrade: 'Baixo', fatalRisk: 3, compliance: 100, fineEstimate: 0, lifeExpectancy: 77 },
        tutor: {
          headline: 'Totalmente conforme.',
          detail: `Empresa cumpre todos os requisitos da ${opts.nrCode}. Auditor acha? Elogia e vai embora.`,
        },
      },
    ],
  }
}

/* Configs geradas por template genérico pras demais NRs */
export const CFG_NR01 = genericConfig({ nrCode: 'NR-01', topic: 'Gerenciamento de riscos ocupacionais (PGR)', criticalStat: 'riscos não identificados', keyCite: 'NR-1, item 1.5.3' })
export const CFG_NR03 = genericConfig({ nrCode: 'NR-03', topic: 'Embargo e interdição', criticalStat: 'reincidências', keyCite: 'NR-3, item 3.2' })
export const CFG_NR04 = genericConfig({ nrCode: 'NR-04', topic: 'SESMT (Serviços Especializados)', criticalStat: 'acidentes por falta de assistência técnica', keyCite: 'NR-4, item 4.4' })
export const CFG_NR05 = genericConfig({ nrCode: 'NR-05', topic: 'CIPA (Comissão Interna)', criticalStat: 'acidentes que a CIPA detectaria antes', keyCite: 'NR-5, item 5.4' })
export const CFG_NR07 = genericConfig({ nrCode: 'NR-07', topic: 'PCMSO (Programa de Controle Médico)', criticalStat: 'doenças ocupacionais não rastreadas', keyCite: 'NR-7, item 7.4' })
export const CFG_NR08 = genericConfig({ nrCode: 'NR-08', topic: 'Edificações (circulação e acabamento)', criticalStat: 'quedas em escadas e piso', keyCite: 'NR-8, item 8.3' })
export const CFG_NR09 = genericConfig({ nrCode: 'NR-09', topic: 'Exposição a agentes (físicos/químicos/biológicos)', criticalStat: 'exposição crônica não medida', keyCite: 'NR-9, item 9.3' })
export const CFG_NR11 = genericConfig({ nrCode: 'NR-11', topic: 'Transporte e movimentação de materiais', criticalStat: 'quedas de carga e esmagamento', keyCite: 'NR-11, item 11.1.5' })
export const CFG_NR13 = genericConfig({ nrCode: 'NR-13', topic: 'Caldeiras e vasos de pressão', criticalStat: 'explosões por falha de inspeção', keyCite: 'NR-13, item 13.4' })
export const CFG_NR14 = genericConfig({ nrCode: 'NR-14', topic: 'Fornos', criticalStat: 'queimaduras graves', keyCite: 'NR-14, item 14.1' })
export const CFG_NR16 = genericConfig({ nrCode: 'NR-16', topic: 'Atividades e operações perigosas', criticalStat: 'acidentes com inflamáveis/explosivos/energia', keyCite: 'NR-16, item 16.2' })
export const CFG_NR19 = genericConfig({ nrCode: 'NR-19', topic: 'Explosivos', criticalStat: 'explosões acidentais', keyCite: 'NR-19, item 19.2' })
export const CFG_NR20 = genericConfig({ nrCode: 'NR-20', topic: 'Inflamáveis e combustíveis', criticalStat: 'incêndios em áreas de armazenamento', keyCite: 'NR-20, item 20.3' })
export const CFG_NR21 = genericConfig({ nrCode: 'NR-21', topic: 'Trabalho a céu aberto', criticalStat: 'insolação, desidratação, raios', keyCite: 'NR-21, item 21.2' })
export const CFG_NR22 = genericConfig({ nrCode: 'NR-22', topic: 'Mineração (subterrânea e céu aberto)', criticalStat: 'desabamentos e exposição a poeira', keyCite: 'NR-22, item 22.5' })
export const CFG_NR23 = genericConfig({ nrCode: 'NR-23', topic: 'Proteção contra incêndios', criticalStat: 'mortes por fumaça em saídas não sinalizadas', keyCite: 'NR-23, item 23.2' })
export const CFG_NR24 = genericConfig({ nrCode: 'NR-24', topic: 'Condições sanitárias e de conforto', criticalStat: 'doenças por instalações precárias', keyCite: 'NR-24, item 24.1' })
export const CFG_NR25 = genericConfig({ nrCode: 'NR-25', topic: 'Resíduos industriais', criticalStat: 'contaminação química e biológica', keyCite: 'NR-25, item 25.2' })
export const CFG_NR26 = genericConfig({ nrCode: 'NR-26', topic: 'Sinalização de segurança', criticalStat: 'acidentes por falta de avisos visuais', keyCite: 'NR-26, item 26.1' })
export const CFG_NR28 = genericConfig({ nrCode: 'NR-28', topic: 'Fiscalização e penalidades', criticalStat: 'multas e embargos', keyCite: 'NR-28, item 28.2' })
export const CFG_NR29 = genericConfig({ nrCode: 'NR-29', topic: 'Trabalho portuário', criticalStat: 'acidentes com contêineres e guindastes', keyCite: 'NR-29, item 29.1.4' })
export const CFG_NR30 = genericConfig({ nrCode: 'NR-30', topic: 'Trabalho aquaviário', criticalStat: 'quedas ao mar e asfixia em porão', keyCite: 'NR-30, item 30.3' })
export const CFG_NR31 = genericConfig({ nrCode: 'NR-31', topic: 'Trabalho rural', criticalStat: 'intoxicação por agrotóxico', keyCite: 'NR-31, item 31.8' })
export const CFG_NR32 = genericConfig({ nrCode: 'NR-32', topic: 'Serviços de saúde', criticalStat: 'contaminação biológica e perfurocortantes', keyCite: 'NR-32, item 32.2' })
export const CFG_NR34 = genericConfig({ nrCode: 'NR-34', topic: 'Construção e reparação naval', criticalStat: 'trabalho a quente em espaço confinado', keyCite: 'NR-34, item 34.11' })
export const CFG_NR36 = genericConfig({ nrCode: 'NR-36', topic: 'Abate e processamento de carnes', criticalStat: 'LER/DORT e cortes de faca', keyCite: 'NR-36, item 36.4' })
export const CFG_NR37 = genericConfig({ nrCode: 'NR-37', topic: 'Plataformas de petróleo', criticalStat: 'explosões e vazamentos em alto-mar', keyCite: 'NR-37, item 37.5' })
export const CFG_NR38 = genericConfig({ nrCode: 'NR-38', topic: 'Limpeza urbana e resíduos sólidos', criticalStat: 'cortes, doenças por contato com lixo', keyCite: 'NR-38, item 38.3' })
