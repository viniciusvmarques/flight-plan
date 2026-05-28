/**
 * Banco temático PC/IFR — questões autorais alinhadas ao programa de
 * navegação rádio / IFR (NDB, VOR, DME, ILS, cartas, espera, planejamento).
 * Não reproduz texto de obras de terceiros.
 */

import { q, topic } from "./exam-bank-core.js";

const REF_NAV = "Programa PC/IFR — navegação rádio e cartas";
const REF_REG = "RBAC 61/91, ICA 100-12 e MCA 100-11";
const REF_MET = "Meteorologia aeronáutica IFR";
const REF_PERF = "Manual de voo — performance e planejamento";
const REF_TEC = "Instrumentos e sistemas de voo IFR";

export const PC_IFR_SUBJECTS = [
  {
    key: "NAVIFR",
    label: "Navegação IFR",
    topics: [
      topic("NDB e ADF", REF_NAV, [
        q(
          "No ADF, qual é o ângulo medido do nariz da aeronave até a estação NDB?",
          "Rumo relativo (RB).",
          ["Rumo magnético da estação.", "Declinação magnética local.", "Curso verdadeiro sobre o solo."]
        ),
        q(
          "Para obter o rumo magnético da estação NDB a partir da indicação ADF, qual relação deve ser aplicada?",
          "RB combinado com o rumo magnético da aeronave (MB ≈ RB + MH).",
          ["Somar RB diretamente ao curso verdadeiro.", "Subtrair a declinação do RB sem considerar proa.", "Usar apenas a radial VOR mais próxima."]
        ),
        q(
          "Por que é necessário identificar a estação NDB em voo IFR antes de iniciar a navegação?",
          "Para confirmar o auxílio correto e evitar navegar para estação errada.",
          ["Para dispensar o uso de cartas de bordo.", "Para substituir o plano de voo IFR.", "Para eliminar a necessidade de comunicação com ATS."]
        ),
        q(
          "Em relação a qual referência o rumo relativo (RB) no ADF é medido?",
          "Nariz da aeronave.",
          ["Eixo da pista de pouso.", "Meridiano geográfico verdadeiro.", "Radial VOR publicada."]
        ),
        q(
          "Em navegação NDB com vento forte, o que tende a ocorrer se o piloto usar apenas homing?",
          "Aumento da distância percorrida por curvar continuamente em direção ao alvo.",
          ["Manutenção de trajetória reta com menor consumo.", "Eliminação da necessidade de correção de vento.", "Captura imediata do fixo sem overshoot."]
        ),
      ], "ADF trabalha com RB; vento exige tracking e identificação da estação."),
      topic("VOR e radiais", REF_NAV, [
        q(
          "O que representa uma radial VOR em relação à estação?",
          "Uma linha que sai da estação na direção magnética publicada.",
          ["Uma linha que converge para a estação a partir do mar.", "O rumo magnético da aeronave sobre o solo.", "A proa verdadeira corrigida para vento."]
        ),
        q(
          "Com OBS em 090° e indicação TO centralizada, em qual semiesfera e trajetória a aeronave se encontra?",
          "Semiesfera leste, afastando-se ao longo da radial 090°.",
          ["Semiesfera oeste, aproximando-se da estação.", "Semiesfera norte, interceptando radial 270°.", "Semiesfera sul, voando perpendicular à radial."]
        ),
        q(
          "Com CDI desviado à direita e flag TO, qual correção inicial de proa é indicada?",
          "Proa para a direita até centralizar o CDI.",
          ["Proa para a esquerda até centralizar o CDI.", "Manter proa atual sem correção.", "Aumentar altitude antes de corrigir curso."]
        ),
        q(
          "Qual é a finalidade de interceptar uma radial VOR com ângulo entre 30° e 45°?",
          "Facilitar captura suave da radial sem overshoot excessivo.",
          ["Eliminar a necessidade de monitorar o CDI.", "Garantir aproximação direta ao fixo final.", "Substituir a identificação da estação VOR."]
        ),
        q(
          "O que significa a flag FROM na indicação VOR?",
          "A aeronave está na semiesfera oposta àquela indicada pelo OBS para a mesma radial.",
          ["A estação VOR está fora de serviço.", "O piloto deve voar diretamente para a estação.", "A radial selecionada coincide com o rumo magnético."]
        ),
      ], "Radiais e OBS definem posição e correções em navegação VOR."),
      topic("DME e ILS", REF_NAV, [
        q(
          "O que a leitura DME representa, em geral, em relação ao transponder?",
          "Distância em linha reta (slant range) até o transponder.",
          ["Distância horizontal projetada no solo apenas.", "Tempo de voo até o fixo seguinte.", "Altitude acima do nível do mar."]
        ),
        q(
          "Em altitude baixa próxima à estação DME, o que pode ocorrer com a indicação?",
          "Indicar distância ligeiramente maior que a horizontal real.",
          ["Indicar distância menor que a horizontal real.", "Congelar na última leitura válida.", "Substituir automaticamente a indicação ILS."]
        ),
        q(
          "Qual referência lateral o localizer do ILS fornece ao piloto?",
          "Posição em relação ao eixo de pista.",
          ["Gradiente de descida no plano vertical.", "Distância até o ponto de aproximação perdida.", "Rumo magnético da estação NDB."]
        ),
        q(
          "Qual função exerce o glide path do ILS durante a aproximação?",
          "Orientar a descida no plano vertical publicado até o trecho final.",
          ["Fornecer referência de curso magnético enroute.", "Substituir a altitude mínima de segmento (MDA).", "Indicar velocidade indicada de aproximação."]
        ),
        q(
          "Qual é a função dos marcadores OM e MM em uma aproximação ILS?",
          "Confirmar posição no segmento final de aproximação.",
          ["Substituir a comunicação com o controle.", "Publicar restrições de velocidade em STAR.", "Indicar rumo relativo no ADF."]
        ),
      ], "DME e ILS são auxílios centrais em terminal e aproximação."),
      topic("Cartas IAC e segmentos", REF_NAV, [
        q(
          "No segmento inicial de aproximação, o que o piloto deve observar conforme a IAC?",
          "Altitudes mínimas, curso, distâncias e auxílios até o fixo final.",
          ["Apenas a visibilidade no aeródromo de destino.", "Somente a frequência de torre local.", "Exclusivamente o código transponder atribuído."]
        ),
        q(
          "O que indica o ponto de aproximação perdida (MAP) em um procedimento IFR?",
          "O ponto a partir do qual inicia-se a subida de arremetida se não houver continuidade visual.",
          ["O fixo onde a aeronave deve iniciar espera obrigatória.", "A posição em que o piloto pode reduzir para configuração de pouso.", "O limite máximo de velocidade em terminal."]
        ),
        q(
          "Contra o que a altitude mínima publicada em segmento de IAC protege?",
          "Obstáculos e terreno no trecho correspondente.",
          ["Apenas outras aeronaves em espera.", "Somente falhas de comunicação com ATS.", "Exclusivamente condições de gelo estrutural."]
        ),
        q(
          "Em aproximação não precisão, quais auxílios podem ser usados no controle de curso final conforme publicado?",
          "VOR, NDB, GNSS ou radial.",
          ["Somente ILS com glide path.", "Apenas mapa rodoviário de referência.", "Exclusivamente comunicação por rádio HF."]
        ),
        q(
          "Com o que o gradiente de aproximação perdida deve ser comparado antes do voo?",
          "Capacidade de subida da aeronave no peso e configuração atuais.",
          ["Velocidade máxima de cruzeiro publicada.", "Temperatura externa no destino apenas.", "Frequência ATIS do alternado."]
        ),
      ], "IAC segmenta o procedimento e define limites de continuidade."),
      topic("SID, STAR e enroute", REF_NAV, [
        q(
          "Qual é a principal finalidade de uma SID (Standard Instrument Departure)?",
          "Padronizar trajetórias de saída e reduzir carga de coordenação no terminal.",
          ["Substituir o plano de voo IFR.", "Eliminar restrições de altitude em TMA.", "Dispensar identificação de auxílios rádio."]
        ),
        q(
          "Como devem ser tratadas as restrições de altitude publicadas em uma STAR?",
          "Integradas ao plano de descida e à autorização ATS.",
          ["Ignoradas se o destino estiver com boa visibilidade.", "Cumpridas somente após contato visual com pista.", "Substituídas pela altitude de cruzeiro solicitada."]
        ),
        q(
          "O que a MEA garante em carta enroute IFR?",
          "Separação com obstáculos e, em geral, comunicação ATS na aerovia.",
          ["Apenas cobertura radar em todo o trecho.", "Visibilidade mínima para pouso visual.", "Eliminação de necessidade de alternado."]
        ),
        q(
          "Por que a MOCA pode ser menor que a MEA na mesma aerovia?",
          "Porque garante apenas proteção de obstáculo, não necessariamente comunicação.",
          ["Porque inclui margem extra de separação vertical.", "Porque substitui a altitude de transição.", "Porque aplica-se somente em voo VFR."]
        ),
        q(
          "O que pode ocorrer ao divergir de rota publicada sem autorização ATS?",
          "Conflito de tráfego e violação de espaço aéreo.",
          ["Melhoria automática da separação radar.", "Dispensa de cumprimento de restrições de nível.", "Redução garantida do consumo de combustível."]
        ),
      ], "Procedimentos publicados organizam terminal e rota IFR."),
      topic("Espera IFR", REF_NAV, [
        q(
          "Quando a entrada direta em espera é considerada adequada?",
          "Quando o ângulo de chegada ao fixo permite alinhar a perna de entrada.",
          ["Sempre que o combustível estiver acima da reserva mínima.", "Somente abaixo de FL100 sem autorização ATS.", "Apenas quando não houver vento lateral."]
        ),
        q(
          "Em espera abaixo de 14 000 ft, qual regra clássica de treino define o tempo de perna em linha reta?",
          "1 minuto com vento e 1,5 minuto contra o vento.",
          ["2 minutos em qualquer condição de vento.", "30 segundos independentemente do vento.", "3 minutos apenas na perna paralela."]
        ),
        q(
          "Até quando a altitude atribuída deve ser mantida durante espera IFR?",
          "Até nova autorização ou término da espera conforme procedimento.",
          ["Até obter contato visual com o solo.", "Somente durante a primeira volta.", "Até reduzir para configuração de aproximação."]
        ),
        q(
          "Por que espera prolongada impacta o planejamento de combustível?",
          "Porque consome autonomia sem progresso na rota.",
          ["Porque reduz automaticamente o consumo específico.", "Porque elimina a necessidade de alternado.", "Porque aumenta a velocidade solo na perna."]
        ),
        q(
          "O que vento forte na espera exige do piloto?",
          "Correções de tempo e rumo para manter proteção do fixo.",
          ["Abandono imediato do procedimento publicado.", "Redução de altitude abaixo do mínimo atribuído.", "Desligamento dos auxílios de navegação."]
        ),
      ], "Espera organiza fluxo e deve ser planejada no combustível."),
      topic("Triângulo de vento e planejamento", REF_NAV, [
        q(
          "O que o conhecimento do vento em rota IFR permite calcular com maior precisão?",
          "Proa verdadeira, GS e tempo de perna.",
          ["Somente a temperatura ISA no nível de voo.", "Apenas a frequência VOR da estação.", "Exclusivamente o código transponder."]
        ),
        q(
          "Se a GS é menor que a TAS em uma perna, o que isso indica, em geral?",
          "Componente de vento contra a aeronave.",
          ["Componente de vento de cauda.", "Erro de calibração do altímetro.", "Falha do sistema pitot-estático."]
        ),
        q(
          "Qual consequência operacional pode resultar de erro de vento no planejamento IFR?",
          "Chegada com combustível abaixo do previsto ou fora da janela operacional.",
          ["Eliminação da necessidade de alternado.", "Aumento garantido da autonomia.", "Dispensa de autorização ATS."]
        ),
        q(
          "No planejamento de descida IFR, o que deve ser considerado além da altitude a perder?",
          "Distância, GS e restrições de procedimento.",
          ["Somente a visibilidade prevista no METAR.", "Apenas a cor das luzes de pista.", "Exclusivamente a recenticidade IFR do piloto."]
        ),
        q(
          "O que o combustível de rota IFR deve incluir no cálculo de planejamento?",
          "Táxi, pernas, aproximação, alternado, reserva e contingências.",
          ["Somente combustível até o destino principal.", "Apenas reserva visual diurna.", "Exclusivamente o consumo de decolagem."]
        ),
      ], "Planejamento de navegação amarra vento, tempo e combustível."),
      topic("GNSS e RNAV", REF_NAV, [
        q(
          "O que perda de RAIM prevista no voo pode exigir do piloto?",
          "Rota alternativa, auxílio convencional ou adiamento.",
          ["Continuar IFR sem verificação adicional.", "Desligar transponder em cruzeiro.", "Voar abaixo de MDA sem referências visuais."]
        ),
        q(
          "O que significa waypoint fly-over em procedimento RNAV?",
          "A aeronave deve sobrevoar o ponto antes de iniciar curva para proteção de obstáculo.",
          ["A aeronave pode iniciar curva antes do waypoint.", "O waypoint substitui o fixo de aproximação perdida.", "O ponto dispensa restrições de altitude."]
        ),
        q(
          "Em aproximação RNAV, a que se refere MDA/DA publicado?",
          "Altitude mínima de decisão para continuidade ou arremetida.",
          ["Altitude máxima de cruzeiro enroute.", "Nível de voo atribuído pelo controle.", "Altitude de transição do aeródromo."]
        ),
        q(
          "Por que GNSS certificado para IFR difere de receptor portátil não certificado?",
          "Atende requisitos de integridade e instalação aprovados.",
          ["Possui maior autonomia de bateria.", "Substitui todos os auxílios convencionais sem restrição.", "Dispensa verificação de NOTAM."]
        ),
        q(
          "Antes de usar GNSS como auxílio primário IFR, o que deve ser verificado?",
          "RAIM, banco de procedimentos, NOTAM e compatibilidade da aeronave.",
          ["Somente a cor do display do receptor.", "Apenas a visibilidade no destino.", "Exclusivamente a frequência ATIS."]
        ),
      ], "GNSS exige integridade e procedimento publicado."),
      topic("Aproximação perdida e MSA", REF_NAV, [
        q(
          "Ao iniciar aproximação perdida, qual deve ser a prioridade imediata do piloto?",
          "Subida positiva e cumprimento do procedimento publicado.",
          ["Reduzir para configuração de pouso.", "Desligar auxílios de navegação.", "Aguardar nova autorização antes de subir."]
        ),
        q(
          "O que a MSA na carta de aproximação fornece ao piloto?",
          "Altitude mínima de segurança em setor ao redor do auxílio.",
          ["Velocidade máxima de aproximação.", "Frequência de emergência do aeródromo.", "Curso magnético da pista principal."]
        ),
        q(
          "Se o piloto atinge MDA sem requisitos visuais de continuidade, o que deve fazer?",
          "Executar arremetida conforme IAC ou instrução ATS.",
          ["Continuar descida até contato visual.", "Reduzir potência e pousar imediatamente.", "Entrar em espera abaixo de MDA."]
        ),
        q(
          "Por que comunicar aproximação perdida ao ATS?",
          "Para auxiliar separação de tráfego e sequenciamento.",
          ["Para cancelar automaticamente o plano IFR.", "Para obter dispensa de alternado.", "Para reduzir altitude sem autorização."]
        ),
        q(
          "Qual risco aumenta com subida tardia na aproximação perdida?",
          "Proximidade com obstáculos e terreno.",
          ["Perda de comunicação VHF.", "Congelamento do altímetro.", "Indicação falsa de vento de cauda."]
        ),
      ], "Arremetida protege contra obstáculo quando não há continuidade visual."),
      topic("Problemas de navegação — tempo e distância", REF_NAV, [
        q(
          "Como se obtém o tempo de perna em rota IFR?",
          "Distância dividida pela GS efetiva na perna.",
          ["TAS multiplicada pela declinação magnética.", "Consumo de combustível dividido pelo QNH.", "Proa magnética dividida pela distância DME."]
        ),
        q(
          "Com o que a autonomia restante após uma perna deve ser comparada?",
          "Combustível para alternado, espera e reserva.",
          ["Somente combustível de táxi no destino.", "Apenas tempo de voo diurno.", "Exclusivamente peso de decolagem máximo."]
        ),
        q(
          "O que a correção de vento antes da decolagem reduz em voo IFR?",
          "Surpresa de ETA e consumo na chegada.",
          ["Necessidade de plano de voo.", "Obrigação de usar alternado.", "Monitoramento de instrumentos."]
        ),
        q(
          "A diferença entre rumo magnético e curso verdadeiro relaciona-se principalmente a quê?",
          "Declinação magnética local.",
          ["Componente de vento de cauda.", "Erro de instalação do altímetro.", "Gradiente de aproximação perdida."]
        ),
        q(
          "No planejamento PC, para que serve o gráfico de subida do manual de voo?",
          "Verificar se obstáculos da saída são ultrapassados com margem.",
          ["Calcular visibilidade mínima de pouso.", "Determinar código transponder em emergência.", "Substituir cartas de aproximação IAC."]
        ),
      ], "Cálculos de tempo, distância e subida sustentam planejamento IFR."),
    ],
  },
  {
    key: "REGIFR",
    label: "Regulamentos IFR e Operações",
    topics: [
      topic("Autorização e responsabilidade", REF_REG, [
        q(
          "A autorização IFR do controle elimina a responsabilidade do comandante pela segurança do voo?",
          "Não; organiza tráfego, mas o comandante permanece responsável.",
          ["Sim, transfere integralmente a responsabilidade ao ATS.", "Sim, desde que o plano de voo esteja correto.", "Sim, quando a aeronave está em espaço controlado."]
        ),
        q(
          "Quando não for possível cumprir autorização IFR, o que o comandante deve fazer?",
          "Comunicar e solicitar alternativa compatível com a aeronave.",
          ["Continuar silenciosamente conforme última instrução.", "Cancelar IFR sem comunicação.", "Descer abaixo do mínimo publicado."]
        ),
        q(
          "O que o plano de voo IFR deve permitir identificar?",
          "Aeronave, rota, níveis, alternado e tempos.",
          ["Somente matrícula e tipo de motor.", "Apenas frequência de torre no destino.", "Exclusivamente peso de pouso estimado."]
        ),
        q(
          "Como o alternado IFR deve ser selecionado para cumprimento regulamentar?",
          "Operacionalmente utilizável, não apenas listado.",
          ["Qualquer aeródromo com pista pavimentada.", "Somente o aeródromo de origem.", "Apenas aeródromos com ILS categoria III."]
        ),
        q(
          "Em caso de perda de comunicação em IFR, o que o piloto deve aplicar?",
          "Procedimento de falha de comunicação e última autorização conhecida.",
          ["Cancelamento imediato do plano sem procedimento.", "Descida livre até contato visual.", "Entrada em espaço aéreo restrito."]
        ),
      ], "Regulamento IFR estrutura coordenação sem transferir responsabilidade."),
      topic("Mínimos e habilitação", REF_REG, [
        q(
          "Contra o que os mínimos de aproximação publicados protegem?",
          "Obstáculo até decisão de pouso ou arremetida.",
          ["Somente outras aeronaves em espera.", "Apenas falhas de motor em decolagem.", "Exclusivamente turbulência leve."]
        ),
        q(
          "Continuar abaixo do mínimo sem referência visual exigida é:",
          "Inaceitável e exige arremetida.",
          ["Permitido se o piloto estiver IFR recente.", "Aceitável com autorização verbal do controle.", "Recomendado para economizar combustível."]
        ),
        q(
          "O que a habilitação IFR pressupõe domínio pelo piloto?",
          "Procedimentos, meteorologia IFR, navegação e limites da aeronave.",
          ["Somente comunicação em inglês radiotelefonia.", "Apenas operação diurna VFR.", "Exclusivamente manutenção de motor."]
        ),
        q(
          "Qual é o objetivo da recenticidade em IFR?",
          "Manter competência em aproximação e procedimentos.",
          ["Substituir verificação médica aeronáutica.", "Eliminar necessidade de alternado.", "Dispensar briefing meteorológico."]
        ),
        q(
          "Em que se baseia a separação vertical em FIR controlada?",
          "Níveis atribuídos e altímetros corretamente ajustados.",
          ["Somente visibilidade no destino.", "Apenas tipo de aeronave.", "Exclusivamente horário local de pouso."]
        ),
      ], "Mínimos e habilitação amarram segurança em IMC."),
      topic("Plano e espaço aéreo", REF_REG, [
        q(
          "Como deve ser tratada alteração relevante de rota em IFR?",
          "Coordenada com ATS quando aplicável.",
          ["Executada imediatamente sem comunicação.", "Ignorada se o GPS indicar caminho mais curto.", "Substituída por plano VFR tacitamente."]
        ),
        q(
          "Em que condição devem estar documentos e cartas de bordo para voo IFR?",
          "Atualizados para a rota e procedimentos.",
          ["Válidos apenas para o ano anterior.", "Substituíveis por memória do piloto.", "Dispensados se houver GPS a bordo."]
        ),
        q(
          "Para que o NOTAM deve ser consultado no planejamento IFR?",
          "Restrições, auxílios fora e mudanças de procedimento.",
          ["Somente previsão de vento enroute.", "Apenas horário de funcionamento de restaurante.", "Exclusivamente tarifas de pouso."]
        ),
        q(
          "O que pode ocorrer ao entrar em TMA sem autorização?",
          "Conflito de separação.",
          ["Melhoria automática do sequenciamento.", "Dispensa de plano de voo.", "Redução de responsabilidade do comandante."]
        ),
        q(
          "Qual benefício a fraseologia padronizada proporciona na operação IFR?",
          "Reduz ambiguidade com o controle.",
          ["Elimina necessidade de readback.", "Substitui plano de voo.", "Dispensa uso de alternado."]
        ),
      ], "Coordenação ATS depende de plano e documentação corretos."),
      topic("Alternado e comunicação", REF_REG, [
        q(
          "Contra o que o combustível para alternado protege?",
          "Indisponibilidade do destino.",
          ["Somente falha de rádio VHF.", "Apenas vento de proa em cruzeiro.", "Exclusivamente gelo leve."]
        ),
        q(
          "O que a confirmação de nível autorizado evita?",
          "Erro de separação vertical.",
          ["Necessidade de alternado.", "Uso de cartas de aproximação.", "Briefing de tripulação."]
        ),
        q(
          "Como deve ser o relato de anormalidade ao ATS?",
          "Objetivo e oportuno.",
          ["Detalhado apenas após o pouso.", "Omitido se não houver emergência.", "Substituído por mensagem escrita posterior."]
        ),
        q(
          "Em operação remunerada PC, o que o piloto deve observar além dos procedimentos IFR?",
          "Limites da licença, habilitações e MANEX.",
          ["Somente preferência de passageiros.", "Apenas cor da aeronave.", "Exclusivamente horário comercial da empresa."]
        ),
        q(
          "Qual efeito o treinamento periódico IFR tende a produzir?",
          "Redução de erro em IMC e aproximação.",
          ["Dispensa de recenticidade.", "Eliminação de alternado.", "Autorização automática para voar abaixo de mínimos."]
        ),
      ], "Alternado e comunicação são pilares do IFR regulamentar."),
    ],
  },
  {
    key: "METIFR",
    label: "Meteorologia IFR",
    topics: [
      topic("Teto, visibilidade e neblina", REF_MET, [
        q(
          "Se o teto no destino está abaixo do mínimo publicado, o que o planejamento IFR deve prever?",
          "Alternado, espera ou arremetida planejada.",
          ["Continuidade visual garantida.", "Pouso sem alternado.", "Cancelamento automático do plano IFR."]
        ),
        q(
          "Como a neblina com visibilidade reduzida afeta a aproximação IFR?",
          "Limita continuidade visual na aproximação.",
          ["Melhora referência do glide path.", "Elimina necessidade de MDA.", "Aumenta teto automaticamente."]
        ),
        q(
          "O que BR indica em um METAR?",
          "Nevoeiro ou névoa com visibilidade reduzida.",
          ["Rajada de vento acima de 30 kt.", "Trovoada sem precipitação.", "Gelo moderado na pista."]
        ),
        q(
          "O que TEMPO descreve em uma TAF?",
          "Condição temporária dentro do período de validade.",
          ["Tendência permanente até o fim da validade.", "Somente condição inicial do aeródromo.", "Histórico de fenômenos ocorridos."]
        ),
        q(
          "O que um SIGMET de turbulência severa implica para o planejamento IFR?",
          "Replanejar rota ou nível para evitar a área.",
          ["Continuar na rota original sem alteração.", "Reduzir altitude abaixo de MSA.", "Desligar sistemas anti-gelo."]
        ),
      ], "Meteorologia define janela operacional IFR."),
      topic("Gelo, CB e vento", REF_MET, [
        q(
          "Como o gelo estrutural em rota IFR afeta a operação?",
          "Degrada performance e exige saída da condição ou anti-gelo.",
          ["Melhora sustentação em todas as fases.", "Elimina necessidade de alternado.", "Aumenta autonomia de combustível."]
        ),
        q(
          "Como cumulonimbus na rota deve ser tratado em voo IFR?",
          "Evitado ou contornado com margem ampla.",
          ["Penetrado pela rota mais curta.", "Ignorado se o radar não indicar precipitação.", "Atravessado abaixo de MDA."]
        ),
        q(
          "O que QNH incorreto pode causar na operação IFR?",
          "Erro de separação vertical e proximidade com terreno.",
          ["Melhoria da comunicação ATS.", "Aumento automático de visibilidade.", "Eliminação de necessidade de alternado."]
        ),
        q(
          "Como vento de cauda forte na aproximação tende a afetar o pouso?",
          "Aumenta velocidade sobre o solo e distância de pouso.",
          ["Reduz distância de pouso e GS.", "Elimina necessidade de arremetida.", "Melhora referência visual da pista."]
        ),
        q(
          "Se a temperatura em rota está abaixo de ISA, o que pode ocorrer com altitude verdadeira em nível de voo?",
          "Pode reduzir altitude verdadeira em relação ao nível indicado.",
          ["Aumenta altitude verdadeira automaticamente.", "Não altera separação vertical.", "Elimina risco de gelo estrutural."]
        ),
      ], "Ameaças meteorológicas exigem margem no planejamento."),
      topic("TAF e produtos", REF_MET, [
        q(
          "O que BECMG indica em uma TAF?",
          "Mudança gradual prevista no período.",
          ["Condição temporária de curta duração.", "Probabilidade de fenômeno isolado.", "Cancelamento da previsão anterior."]
        ),
        q(
          "O que PROB comunica em uma TAF?",
          "Probabilidade de fenômeno ou condição.",
          ["Certeza absoluta de ocorrência.", "Histórico de condições passadas.", "Restrição de pouso noturno."]
        ),
        q(
          "Sobre o que o AIRMET alerta?",
          "Fenômenos de intensidade moderada para rotas menores.",
          ["Somente furacões em oceano.", "Apenas condições VFR exclusivas.", "Exclusivamente gelo severo em CB."]
        ),
        q(
          "O que inversão de temperatura pode produzir na atmosfera baixa?",
          "Névoa ou camada de turbulência baixa.",
          ["Eliminação de neblina.", "Aumento garantido de teto.", "Dispensa de alternado IFR."]
        ),
        q(
          "O que uma frente fria pode trazer à rota IFR?",
          "Bandas de nuvens convectivas e mudança de vento.",
          ["Estabilidade prolongada sem precipitação.", "Eliminação de CB na região.", "Visibilidade ilimitada enroute."]
        ),
      ], "Produtos meteorológicos complementam decisão IFR."),
      topic("Altimetria operacional", REF_MET, [
        q(
          "Ao cruzar a altitude de transição, o que o piloto deve fazer com o altímetro?",
          "Ajustá-lo conforme procedimento local.",
          ["Manter QNH até FL410.", "Desligar correção de altitude.", "Usar QFE em todo o cruzeiro."]
        ),
        q(
          "Qual referência de pressão é usada para nível de voo (FL) em cruzeiro?",
          "1013,2 hPa.",
          ["QNH do aeródromo de partida.", "QFE da torre de controle.", "Pressão atmosférica ao nível do solo."]
        ),
        q(
          "Um METAR de superfície isolado substitui análise completa para decisão IFR?",
          "Não; deve ser complementado por TAF, SIGMET e cartas.",
          ["Sim, se a visibilidade estiver acima de 5 km.", "Sim, quando o teto estiver acima de 1 000 ft.", "Sim, em voos diurnos apenas."]
        ),
        q(
          "Onde turbulência em camada nubosa stratiforme pode ocorrer?",
          "Sem CB visível.",
          ["Somente dentro de cumulonimbus.", "Apenas abaixo de 500 ft AGL.", "Exclusivamente acima de FL450."]
        ),
        q(
          "Se a TAF indica redução rápida de teto, o que deve ser revisado antes da decolagem?",
          "Alternado e plano de contingência.",
          ["Somente cor da aeronave.", "Apenas peso de bagagem.", "Exclusivamente horário de pouso comercial."]
        ),
      ], "Altimetria e tendência orientam nível e alternado."),
    ],
  },
  {
    key: "PERFPC",
    label: "Performance e Planejamento PC",
    topics: [
      topic("Peso, pista e combustível", REF_PERF, [
        q(
          "Se o peso da aeronave está acima do máximo certificado, qual é a consequência regulamentar?",
          "A operação torna-se inválida e a performance degrada.",
          ["Permanece válida com autorização verbal.", "É aceitável se o alternado estiver próximo.", "Só afeta operação VFR."]
        ),
        q(
          "Como pista molhada tende a afetar a operação de pouso?",
          "Aumenta distância de pouso e risco de aquaplanagem.",
          ["Reduz distância de pouso.", "Elimina necessidade de reversor.", "Melhora frenagem independentemente de velocidade."]
        ),
        q(
          "O que a reserva de combustível IFR deve cobrir?",
          "Imprevistos de rota, espera e alternado.",
          ["Somente táxi no destino.", "Apenas voo visual de retorno.", "Exclusivamente manutenção programada."]
        ),
        q(
          "Se a performance calculada fica abaixo do exigido pelo procedimento, o que o comandante deve considerar?",
          "Reduzir peso, adiar voo ou alterar plano.",
          ["Executar decolagem com vento de cauda.", "Ignorar obstáculo da SID.", "Continuar por pressão comercial."]
        ),
        q(
          "A pressão comercial autoriza violar mínimos, peso ou procedimento publicado?",
          "Não.",
          ["Sim, com acordo da empresa.", "Sim, se o passageiro aceitar.", "Sim, em voos curtos regionais."]
        ),
      ], "Performance e combustível limitam decisão operacional PC."),
      topic("Decolagem e manual", REF_PERF, [
        q(
          "Como CG fora do envelope afeta a operação?",
          "Estabilidade e controle em todas as fases.",
          ["Somente consumo de combustível em cruzeiro.", "Apenas comunicação VHF.", "Exclusivamente leitura do altímetro."]
        ),
        q(
          "Como altitude-density elevada afeta performance?",
          "Reduz performance de motor e hélice ou turbina.",
          ["Aumenta empuxo disponível.", "Elimina efeito de vento de cauda.", "Melhora distância de decolagem."]
        ),
        q(
          "Extrapolar o manual de voo além dos limites publicados é aceitável na operação profissional?",
          "Não.",
          ["Sim, com experiência do comandante.", "Sim, se o alternado estiver seco.", "Sim, abaixo de 5 000 ft."]
        ),
        q(
          "Em decolagem IFR com obstáculo na saída, o que deve ser verificado no manual?",
          "Gradiente de subida e procedimento OEI.",
          ["Somente cor das marcas de pista.", "Apenas frequência ATIS.", "Exclusivamente peso de passageiros."]
        ),
        q(
          "O que a cultura de segurança em PC prioriza na tomada de decisão?",
          "Dados técnicos e limites sobre conveniência.",
          ["Horário comercial acima de tudo.", "Preferência de passageiros.", "Economia de combustível sem margem."]
        ),
      ], "Manual de voo e peso definem viabilidade da operação."),
      topic("Planejamento integrado PC", REF_PERF, [
        q(
          "O que o briefing de tripulação deve alinhar antes de voo IFR remunerado?",
          "Rota, combustível, mínimos e papéis.",
          ["Somente cardápio de bordo.", "Apenas horário de chegada comercial.", "Exclusivamente matrícula da aeronave."]
        ),
        q(
          "Por que incluir NOTAM no despacho de voo PC?",
          "Evitar surpresa com auxílio fora ou pista fechada.",
          ["Substituir plano de voo IFR.", "Eliminar necessidade de alternado.", "Dispensar briefing meteorológico."]
        ),
        q(
          "O que compõe margem operacional saudável em planejamento PC?",
          "Tempo, combustível e performance conservadores.",
          ["Somente velocidade máxima de cruzeiro.", "Apenas peso mínimo de decolagem.", "Exclusivamente autonomia teórica sem reserva."]
        ),
        q(
          "Diante de deterioração meteorológica, por que alternar cedo é recomendado?",
          "É decisão conservadora que preserva margens.",
          ["Elimina necessidade de comunicação ATS.", "Autoriza voar abaixo de mínimos.", "Dispensa combustível de reserva."]
        ),
        q(
          "Tanque cheio dispensa cálculo de autonomia para alternado e reserva?",
          "Não.",
          ["Sim, em voos abaixo de 100 NM.", "Sim, se o destino tiver ILS.", "Sim, para aeronaves monomotoras apenas."]
        ),
      ], "Planejamento PC integra tripulação, NOTAM e margens."),
    ],
  },
  {
    key: "TECIFR",
    label: "Conhecimentos Técnicos IFR",
    topics: [
      topic("Instrumentos e sistemas", REF_TEC, [
        q(
          "Em IMC, qual instrumento é primário para controle de atitude?",
          "Horizonte artificial, com scan de suporte.",
          ["Bússola de proa apenas.", "Velocímetro sem correção.", "Relógio de cronometragem."]
        ),
        q(
          "O que bloqueio estático pode fazer no altímetro?",
          "Congelar indicação na altitude do bloqueio.",
          ["Indicar sempre altitude zero.", "Aumentar leitura com ganho de velocidade.", "Substituir automaticamente o VSI."]
        ),
        q(
          "O que o RMI apresenta ao piloto?",
          "Rumo magnético da estação sem integrar proa automaticamente.",
          ["Velocidade verdadeira corrigida.", "Gradiente de glide path ILS.", "Temperatura externa estática."]
        ),
        q(
          "O que o modo C do transponder fornece ao controle radar?",
          "Altitude Mode C, quando disponível.",
          ["Somente identificação sem altitude.", "Curso magnético da aeronave.", "Consumo de combustível instantâneo."]
        ),
        q(
          "Em voo IFR com piloto automático, o que o comandante deve manter?",
          "Monitoramento ativo e prontidão para assumir manualmente.",
          ["Confiança total sem scan.", "Desligamento de todos os instrumentos de backup.", "Operação somente em VMC."]
        ),
      ], "Instrumentos e automação exigem scan e procedimentos de falha."),
      topic("Pitot, HSI e ergonomia", REF_TEC, [
        q(
          "Para que serve o aquecimento de pitot em voo IFR?",
          "Prevenir perda de indicação de velocidade por gelo.",
          ["Aumentar velocidade indicada em decolagem.", "Substituir verificação de NOTAM.", "Calibrar automaticamente o altímetro."]
        ),
        q(
          "O que o HSI integra no painel de navegação?",
          "Proa, curso selecionado e indicação VOR/NDB.",
          ["Somente temperatura de CHT.", "Apenas nível de combustível.", "Exclusivamente frequência COM2."]
        ),
        q(
          "O que o código 7700 no transponder indica?",
          "Emergência geral.",
          ["Perda de comunicação apenas.", "Voo VFR sem plano.", "Falha de GPS certificado."]
        ),
        q(
          "O que distingue GPS IFR certificado de receptor portátil comum?",
          "Atende requisitos de integridade da instalação aprovada.",
          ["Possui tela colorida maior.", "Funciona sem antena externa.", "Dispensa banco de procedimentos."]
        ),
        q(
          "Como iluminação adequada do painel contribui em voo noturno IFR?",
          "Reduz fadiga e erro de leitura.",
          ["Elimina necessidade de scan cruzado.", "Substitui horizonte artificial.", "Dispensa uso de lanterna de emergência."]
        ),
      ], "Sistemas de bordo devem estar operacionais e compreendidos."),
      topic("Falhas e TCAS", REF_TEC, [
        q(
          "Diante de falha parcial de instrumentos em IFR, o que o piloto deve executar?",
          "Procedimento de falha e uso de redundância.",
          ["Continuar sem checklist.", "Descer imediatamente abaixo de MDA.", "Desligar transponder em cruzeiro."]
        ),
        q(
          "Como uma resolução TCAS RA em cruzeiro deve ser tratada?",
          "Cumprida conforme treinamento, comunicando ATS.",
          ["Ignorada se o controle autorizar manter nível.", "Substituída por manobra improvisada.", "Adiada até pouso."]
        ),
        q(
          "Transponder inoperante pode exigir o quê?",
          "Não entrar em espaço onde o equipamento é obrigatório.",
          ["Voar IFR sem alternado.", "Desligar todos os auxílios de navegação.", "Operar abaixo de mínimos publicados."]
        ),
        q(
          "Como o VOR a bordo deve ser verificado?",
          "Conforme MANEX e tolerâncias publicadas.",
          ["Somente uma vez por ano sem registro.", "Apenas em voo visual diurno.", "Exclusivamente por passageiros."]
        ),
        q(
          "O que o checklist de falha pitot-estático inclui?",
          "Identificar fonte da falha e usar instrumentos remanescentes.",
          ["Desligar todos os sistemas elétricos.", "Voar apenas com mapa rodoviário.", "Ignorar indicações conflitantes."]
        ),
      ], "Falhas exigem procedimento; TCAS e transponder apoiam separação."),
    ],
  },
];
