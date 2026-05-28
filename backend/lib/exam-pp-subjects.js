/**
 * Banco temático PP (VFR) — questões autorais em múltipla escolha completa.
 */

import { q, topic } from "./exam-bank-core.js";

const REF_NAV = "Programa PP — navegação visual e estimada";
const REF_REG = "RBAC 61/91 e ICA 100-12 — VFR";
const REF_MET = "Meteorologia aeronáutica VFR";
const REF_TEV = "Teoria de voo — sustentação e controle";
const REF_CTE = "Conhecimentos técnicos — aeronave leve";

export const PP_SUBJECTS = [
  {
    key: "NAV",
    label: "Navegação Aérea Visual",
    topics: [
      topic("Rumo, proa e vento cruzado", REF_NAV, [
        q(
          "Com vento da esquerda em cruzeiro, qual correção de proa é adequada para manter o rumo desejado?",
          "Proa à esquerda do rumo (WCA positivo).",
          ["Proa igual ao rumo, sem correção.", "Proa à direita do rumo.", "Manter proa no checkpoint e ignorar deriva."]
        ),
        q(
          "Por que a trajetória no solo pode divergir do rumo traçado na carta?",
          "O vento desvia a aeronave em relação à proa.",
          ["A bússola sempre indica proa verdadeira.", "O rumo magnético elimina deriva.", "A TAS é sempre igual à GS."]
        ),
        q(
          "Qual é o objetivo da correção de deriva (WCA)?",
          "Fazer a trajetória no solo coincidir com a rota planejada.",
          ["Aumentar a velocidade indicada no ar.", "Evitar comunicação com ATS.", "Substituir o uso de checkpoints."]
        ),
        q(
          "A proa aponta para o checkpoint, mas há vento lateral. O que tende a ocorrer?",
          "A aeronave passa ao lado do ponto previsto, exigindo nova correção.",
          ["O vento lateral não altera a posição no solo.", "O rumo magnético corrige deriva automaticamente.", "A GS fica igual à TAS em qualquer vento."]
        ),
        q(
          "Como se obtém o rumo magnético a partir do rumo verdadeiro?",
          "Aplicando a declinação magnética local com o sinal correto.",
          ["Somando sempre 10° independente da região.", "Usando apenas a proa em voo reto.", "Ignorando a carta e confiando só no GPS."]
        ),
      ], "Proa compensa vento; rumo é a direção da trajetória no mapa."),
      topic("Triângulo de vento e GS", REF_NAV, [
        q(
          "Conhecendo TAS e os componentes do vento, o que se calcula no triângulo de vento?",
          "Proa verdadeira e velocidade solo (GS).",
          ["Apenas o consumo de combustível.", "A declinação magnética da rota.", "A altitude de pressão QNE."]
        ),
        q(
          "Vento de cauda na perna de cruzeiro tende a:",
          "Aumentar a GS e reduzir o tempo até o próximo ponto.",
          ["Reduzir a GS e aumentar o tempo de voo.", "Não alterar ETA nem autonomia.", "Eliminar a necessidade de alternado."]
        ),
        q(
          "Vento de proa na perna de cruzeiro tende a:",
          "Reduzir a GS e aumentar o tempo até o próximo ponto.",
          ["Aumentar a GS e antecipar a chegada.", "Manter GS igual à TAS em qualquer condição.", "Dispensar recálculo de combustível."]
        ),
        q(
          "Erro de estimativa de vento no planejamento pode resultar em:",
          "Chegada com combustível abaixo do previsto.",
          ["Melhora automática da visibilidade no destino.", "Eliminação da necessidade de alternado.", "Aumento garantido da autonomia."]
        ),
        q(
          "A velocidade solo (GS) é medida em relação a:",
          "O solo.",
          ["O ar apenas.", "O nível de voo de cruzeiro.", "A estação VOR de referência."]
        ),
      ], "Triângulo de vento amarra tempo, combustível e navegação estimada."),
      topic("Tempo, distância e ETE", REF_NAV, [
        q(
          "Como se calcula o ETE de uma perna, em minutos?",
          "Distância da perna dividida pela GS, convertida para tempo.",
          ["Somando apenas o tempo de táxi.", "Multiplicando TAS por QNH.", "Usando somente a proa magnética."]
        ),
        q(
          "Por que recalcular o ETE em voo após mudança de vento?",
          "Para atualizar ETA e a decisão sobre alternado.",
          ["Para dispensar NOTAM.", "Para alterar o tipo de certificado.", "Para ignorar consumo horário."]
        ),
        q(
          "Distância medida na carta deve ser interpretada conforme:",
          "A escala e a unidade da carta (NM ou km).",
          ["Apenas a indicação do altímetro.", "A frequência da torre.", "O código transponder."]
        ),
        q(
          "O ETA de um voo considera, em geral:",
          "A soma dos ETEs das pernas mais táxi e margem operacional.",
          ["Somente a hora de decolagem.", "Apenas a visibilidade no destino.", "O peso máximo de decolagem apenas."]
        ),
        q(
          "A autonomia restante deve ser comparada com:",
          "Tempo até o destino, reserva e alternado.",
          ["Apenas a hora local de pouso.", "Somente a indicação do VSI.", "O número de passageiros a bordo."]
        ),
      ], "Tempo e distância são base da navegação estimada VFR."),
      topic("Cartas e checkpoints", REF_NAV, [
        q(
          "Qual característica torna um checkpoint eficiente em VFR?",
          "Ser visível, distinto e compatível com a altitude de cruzeiro.",
          ["Ser invisível para reduzir distração.", "Estar sempre dentro de nuvem.", "Substituir qualquer consulta meteorológica."]
        ),
        q(
          "No planejamento VFR, as cartas aeronáuticas servem principalmente para:",
          "Medir rumos, distâncias, espaço aéreo e obstáculos.",
          ["Substituir o pré-voo mecânico.", "Eliminar comunicação rádio.", "Autorizar voo IFR."]
        ),
        q(
          "Pilotagem entre checkpoints ajuda a:",
          "Reduzir erro acumulado de estimativa de vento.",
          ["Voar sem referência visual.", "Ignorar restrições de espaço aéreo.", "Dispensar plano de combustível."]
        ),
        q(
          "A linha traçada na carta representa, em geral:",
          "O rumo planejado, não necessariamente a proa em voo.",
          ["A proa instantânea com vento desconhecido.", "A altitude de pressão QNE.", "A frequência de emergência."]
        ),
        q(
          "Revisar espaço aéreo na carta antes do voo evita:",
          "Ingresso não autorizado em áreas controladas ou restritas.",
          ["Consulta de METAR.", "Uso de combustível.", "Verificação de documentos."]
        ),
      ], "Carta e checkpoints estruturam rota visual segura."),
      topic("Subida e descida no planejamento", REF_NAV, [
        q(
          "No planejamento, a etapa de subida deve estimar:",
          "Distância horizontal até o cruzeiro e combustível da subida.",
          ["Somente a cor da pista.", "Apenas a frequência ATIS.", "O peso do passageiro apenas."]
        ),
        q(
          "O top of descent pode ser estimado com:",
          "Altitude a perder, GS e razão de descida planejada.",
          ["Apenas a indicação do horizonte artificial.", "Somente o código squawk.", "A declinação magnética local."]
        ),
        q(
          "Razão de subida insuficiente para um obstáculo na rota exige:",
          "Alterar rota, peso ou ponto de início da subida.",
          ["Continuar sem replanejar.", "Voar IFR sem habilitação.", "Ignorar cartas e NOTAM."]
        ),
        q(
          "Descida muito tardia em VFR pode causar:",
          "Aproximação alta e circuito desorganizado.",
          ["Melhora automática da visibilidade.", "Eliminação de vento de superfície.", "Dispensa de combustível de reserva."]
        ),
        q(
          "A altitude de cruzeiro VFR deve considerar:",
          "Obstáculos, nuvem, vento e visibilidade.",
          ["Apenas a preferência estética do piloto.", "Somente a hora do briefing.", "O tipo de transponder apenas."]
        ),
      ], "Subida e descida integram planejamento VFR."),
      topic("Combustível e alternado VFR", REF_NAV, [
        q(
          "A reserva de combustível em VFR existe para:",
          "Imprevistos de vento, espera, desvio ou tráfego.",
          ["Substituir o alternado.", "Voar sem NOTAM.", "Eliminar pré-voo."]
        ),
        q(
          "Um alternado VFR adequado deve apresentar:",
          "Meteorologia aceitável e serviços compatíveis com a aeronave.",
          ["Apenas pista mais longa, sem considerar tempo.", "Somente tráfego intenso.", "Qualquer aeródromo sem consulta."]
        ),
        q(
          "O consumo horário usado no planejamento deve ser:",
          "Conservador em relação ao histórico da aeronave.",
          ["Sempre o menor valor já registrado.", "Igual ao consumo de outra aeronave.", "Ignorado se o voo for curto."]
        ),
        q(
          "Autonomia calculada menor que o tempo total planejado indica:",
          "Necessidade de reabastecer ou replanejar.",
          ["Que o vento está calmo.", "Que o alternado é opcional.", "Que o VOR está desligado."]
        ),
        q(
          "Combustível para retorno ou desvio deve ser previsto:",
          "Antes da decolagem, no planejamento.",
          ["Somente após o primeiro checkpoint.", "Apenas se a torre solicitar.", "Nunca em voo local."]
        ),
      ], "Combustível e alternado fecham margem da navegação visual."),
      topic("Bússola e orientação", REF_NAV, [
        q(
          "Erros de aceleração e viragem na bússola magnética ocorrem porque:",
          "O campo da aeronave combina com o campo magnético terrestre.",
          ["A bússola mede vento verdadeiro.", "O GPS desliga o magnetismo.", "A declinação é zero em todo o Brasil."]
        ),
        q(
          "Em voo reto andando, a bússola tende a:",
          "Indicar rumo magnético com menor erro de viragem.",
          ["Indicar sempre proa verdadeira.", "Substituir cartas.", "Eliminar deriva."]
        ),
        q(
          "Com declinação magnética leste, a relação correta é:",
          "Rumo magnético = rumo verdadeiro + declinação (com sinal da região).",
          ["Rumo verdadeiro = magnético + declinação sempre.", "MV = RV − declinação em qualquer lugar.", "Declinação não afeta planejamento."]
        ),
        q(
          "Confiar apenas na bússola, sem pilotagem visual, pode:",
          "Acumular erro, especialmente com vento desconhecido.",
          ["Eliminar necessidade de checkpoints.", "Substituir alternado.", "Autorizar voo em IMC."]
        ),
        q(
          "Orientação por relógio e sol em VFR é:",
          "Recurso de emergência, não substituto de planejamento.",
          ["Procedimento padrão em todo cruzeiro.", "Obrigatória em CTR.", "Igual a navegação por VOR."]
        ),
      ], "Bússola exige técnica; planejamento reduz improviso."),
      topic("VOR e auxílios em VFR", REF_NAV, [
        q(
          "Em VFR, o VOR pode auxiliar a:",
          "Confirmar posição quando o checkpoint visual é duvidoso.",
          ["Substituir referências visuais obrigatórias.", "Voar abaixo do mínimo VFR.", "Eliminar plano de combustível."]
        ),
        q(
          "Antes de usar um radial VOR, o piloto deve:",
          "Identificar a estação correta.",
          ["Ignorar identificação se o CDI centralizar.", "Desligar transponder.", "Voar apenas por estimativa."]
        ),
        q(
          "CDI centralizado com OBS no radial TO indica:",
          "Aeronave na semiesfera de afastamento da estação naquele radial.",
          ["Aeronave sempre sobre a estação.", "Falha certa do receptor.", "Autorização automática de IFR."]
        ),
        q(
          "GNSS portátil em VFR exige:",
          "Bateria, carta de backup e consciência das limitações.",
          ["Substituir habilitação do piloto.", "Voar sem alternado.", "Ignorar NOTAM."]
        ),
        q(
          "Auxílio rádio em VFR não elimina:",
          "A necessidade de manter referências visuais ao solo.",
          ["O uso de combustível.", "A comunicação em emergência.", "A inspeção pré-voo."]
        ),
      ], "Auxílios complementam; VFR mantém referência visual primária."),
      topic("NOTAM e documentação de rota", REF_NAV, [
        q(
          "NOTAM na preparação VFR informa sobre:",
          "Pistas fechadas, auxílios fora e restrições temporárias.",
          ["Apenas preços de combustível.", "Somente horário comercial.", "Substituição do METAR."]
        ),
        q(
          "ROTAER (ou equivalente) fornece:",
          "Dados de aeródromos, combustível e procedimentos locais.",
          ["Apenas código ICAO de aeronave.", "Somente fraseologia em inglês.", "Cartas IFR de alta altitude apenas."]
        ),
        q(
          "Plano de voo VFR, quando exigido, facilita:",
          "Busca e salvamento e coordenação ATS.",
          ["Voar sem rádio em CTR.", "Ignorar alternado.", "Eliminar reserva de combustível."]
        ),
        q(
          "Frequências do aeródromo devem ser anotadas:",
          "No planejamento, antes do táxi.",
          ["Somente após a decolagem.", "Apenas se houver passageiro.", "Nunca em voo de instrução."]
        ),
        q(
          "Cartas desatualizadas podem omitir:",
          "Novos obstáculos ou mudanças de espaço aéreo.",
          ["Apenas a cor da pista.", "Somente o vento de superfície.", "A necessidade de pré-voo."]
        ),
      ], "Documentação atualizada sustenta navegação visual segura."),
      topic("Circuito e navegação local", REF_NAV, [
        q(
          "No circuito de tráfego, a referência visual de vento ajuda a:",
          "Antecipar deriva na base e na final.",
          ["Eliminar comunicação com torre.", "Voar sem combustível de reserva.", "Substituir NOTAM."]
        ),
        q(
          "A entrada no circuito deve respeitar:",
          "Altitude e procedimento publicados do aeródromo.",
          ["Qualquer altitude abaixo de 500 ft AGL em qualquer lugar.", "Somente a preferência do instrutor.", "Procedimento IFR de aproximação."]
        ),
        q(
          "Navegação local após decolagem exige:",
          "Mapa mental da área e limites de treinamento.",
          ["Voar sem consultar vento.", "Ignorar tráfego no circuito.", "Desligar rádio obrigatoriamente."]
        ),
        q(
          "Ao perder um checkpoint em área conhecida, o piloto deve:",
          "Parar, identificar posição e não prosseguir incerto.",
          ["Acelerar para compensar erro.", "Voar IFR sem habilitação.", "Ignorar alternado."]
        ),
        q(
          "Retorno ao aeródromo de origem no planejamento inclui:",
          "Combustível e meteorologia para a volta.",
          ["Somente a hora de almoço da tripulação.", "Apenas código transponder.", "Dispensa de NOTAM."]
        ),
      ], "Circuito e área local são extensão da navegação estimada."),
    ],
  },
  {
    key: "REG",
    label: "Regulamentos de Tráfego Aéreo",
    topics: [
      topic("Responsabilidade VFR", REF_REG, [
        q("Em VFR, quem decide continuar ou abortar o voo?", "O piloto em comando, com base em condições e regulamento.", ["O passageiro, por maioria.", "A torre, em todos os trechos.", "O fabricante da aeronave."]),
        q("Com condição abaixo do mínimo VFR, o que o piloto deve fazer?", "Não prosseguir ou alternar conforme o planejamento.", ["Continuar se o GPS indicar rota.", "Reduzir documentos de bordo.", "Desligar transponder."]),
        q("O que a preparação pré-voo regulamentar inclui?", "Documentos, meteorologia, NOTAM e condição da aeronave.", ["Somente combustível.", "Apenas fraseologia em inglês.", "Ignorar peso e balanceamento."]),
        q("A presença de passageiro transfere a responsabilidade do piloto em comando?", "Não — a responsabilidade permanece com o comandante.", ["Sim, o passageiro decide a rota.", "Sim, em voo de instrução.", "Sim, se houver mais de um adulto a bordo."]),
        q("Informação recebida de ATS autoriza violar regras de voo visual?", "Não — ATS informa, mas não autoriza violar VFR.", ["Sim, sempre que a torre orientar.", "Sim, em aeródromo controlado.", "Sim, com transponder ligado."]),
      ], "VFR mantém responsabilidade no comandante."),
      topic("Espaço aéreo VFR", REF_REG, [
        q("O que a entrada em CTR/TMA em VFR pode exigir?", "Autorização, comunicação e transponder conforme publicado.", ["Apenas voo silencioso.", "Somente plano IFR.", "Nenhuma comunicação."]),
        q("O que implica espaço aéreo condicionado?", "Requisitos específicos de comunicação ou equipamento.", ["Liberdade total sem rádio.", "Proibição de VFR.", "Dispensa de NOTAM."]),
        q("O que o planejamento de rota VFR deve evitar?", "Áreas proibidas e restritas sem permissão.", ["Consulta de METAR.", "Uso de cartas.", "Cálculo de combustível."]),
        q("Como o tráfego em aeródromo controlado deve ser conduzido?", "Seguindo instruções ATS e circuito publicado.", ["Apenas pela preferência do piloto.", "Por procedimento IFR obrigatório.", "Com fraseologia informal apenas."]),
        q("Por que manter o transponder ligado onde é exigido?", "Para melhorar a vigilância ATS.", ["Para substituir comunicação.", "Para eliminar alternado.", "Para autorizar voo sem visibilidade."]),
      ], "Espaço aéreo define coordenação do VFR."),
      topic("Comunicações VFR", REF_REG, [
        q("O que a fraseologia padronizada reduz na operação?", "Ambiguidade com torre e controle de aproximação.", ["Consumo de combustível.", "Necessidade de NOTAM.", "Uso de cartas."]),
        q("Se o piloto não compreender uma instrução, o que deve fazer?", "Solicitar repetição ou esclarecimento.", ["Executar qualquer manobra imediata.", "Desligar o rádio.", "Alterar squawk aleatoriamente."]),
        q("O que a chamada inicial em frequência deve incluir?", "Identificação da aeronave e posição ou intenção.", ["Somente o nome do piloto.", "Apenas altitude de cruzeiro.", "Código de cores da aeronave."]),
        q("Como deve ser a comunicação em emergência?", "Com fraseologia e prioridade adequadas.", ["Com código secreto obrigatório.", "Em silêncio rádio total.", "Apenas com fraseologia informal."]),
        q("O que a falha de rádio em VFR exige do piloto?", "Procedimento publicado e consciência de tráfego.", ["Continuar em CTR sem coordenação.", "Voar IFR sem habilitação.", "Ignorar o circuito."]),
      ], "Comunicação clara apoia separação em VFR."),
      topic("Documentos e inspeção", REF_REG, [
        q("Como devem estar os documentos de bordo?", "Válidos e compatíveis com a operação.", ["Apenas no celular do passageiro.", "Opcionais em voo local.", "Substituídos por METAR."]),
        q("De quem é a responsabilidade pela inspeção pré-voo?", "Do piloto, antes de cada voo.", ["Somente da oficina, em todo voo.", "Do passageiro.", "Da torre."]),
        q("Como devem ser portadas caderneta e habilitação?", "Conforme exigência regulamentar.", ["Deixadas em casa em voo solo.", "Substituídas por plano de voo.", "Opcionais com instrutor."]),
        q("O que a manutenção em dia afeta na operação?", "Segurança e legalidade do voo.", ["Somente estética da aeronave.", "Apenas consumo de café.", "Nada em VFR local."]),
        q("Peso e balanceamento fazem parte de quê no voo?", "Da preparação regulamentar do voo.", ["Apenas de voos comerciais.", "Somente de IFR.", "De opcional em aeronave leve."]),
      ], "Documentação e inspeção precedem decolagem VFR."),
    ],
  },
  {
    key: "MET",
    label: "Meteorologia Aeronáutica",
    topics: [
      topic("METAR e decisão VFR", REF_MET, [
        q("O que o METAR representa?", "Observação no aeródromo em horário específico.", ["Previsão para 24 h.", "Boletim sinótico mundial.", "Plano de voo obrigatório."]),
        q("No METAR, como o vento é informado?", "Direção de onde sopra e velocidade.", ["Direção para onde sopra apenas.", "Componente de proa apenas.", "Rajada sem direção."]),
        q("O que a visibilidade reduzida no METAR exige do piloto VFR?", "Reavaliar a continuidade em VFR.", ["Continuar se o GPS estiver ligado.", "Ignorar alternado.", "Voar IFR sem habilitação."]),
        q("O que CAVOK indica, em geral?", "Ausência de nuvens significativas e boa visibilidade (conforme definição local).", ["Tempestade iminente.", "Pista fechada.", "Ventos calmos obrigatórios."]),
        q("Com o que o METAR isolado deve ser comparado?", "TAF e tendência sinótica.", ["Somente NOTAM de pista.", "Apenas peso de decolagem.", "Código transponder."]),
      ], "METAR é ponto de partida da decisão visual."),
      topic("TAF e planejamento", REF_MET, [
        q("O que a TAF fornece?", "Previsão para o aeródromo no período de validade.", ["Observação instantânea.", "Dados de manutenção.", "Plano de massa e balanceamento."]),
        q("O que o grupo TEMPO na TAF indica?", "Condição temporária esperada no período.", ["Mudança permanente imediata.", "Fim da validade da TAF.", "Somente vento calmo."]),
        q("O que o grupo BECMG na TAF sugere?", "Mudança gradual no período indicado.", ["Condição estável para sempre.", "Cancelamento do voo.", "Apenas neblina sem visibilidade."]),
        q("Para que a TAF do destino apoia a decisão?", "Alternado e horário de partida.", ["Cor do esquema de marcação.", "Tipo de óleo do motor.", "Frequência de música na cabine."]),
        q("Previsão pior que o METAR atual exige o quê?", "Margem de combustível e plano B.", ["Ignorar alternado.", "Voar sem NOTAM.", "Eliminar reserva."]),
      ], "TAF complementa METAR no planejamento VFR."),
      topic("Nuvens e visibilidade VFR", REF_MET, [
        q("O que o teto baixo em camada convectiva pode causar em VFR?", "Ocultar referências visuais ao solo.", ["Melhorar referências visuais.", "Eliminar necessidade de alternado.", "Autorizar voo sem horizonte."]),
        q("O que o VFR exige, entre outros requisitos?", "Referências visuais ao solo e separação de nuvens conforme regra.", ["Voar apenas por instrumentos.", "Ignorar visibilidade.", "Dispensar combustível."]),
        q("Névoa matinal pode dissipar com aquecimento. O que isso implica no planejamento?", "Exige cautela no planejamento e na decisão de partida.", ["Garante CAVOK o dia todo.", "Elimina alternado.", "Autoriza voo em IMC."]),
        q("Como a cumulonimbus na rota VFR deve ser tratada?", "Desviada com ampla margem.", ["Penetrada para economizar tempo.", "Ignorada se o METAR for bom.", "Usada como checkpoint."]),
        q("Relatório de turbulência leve ainda exige o quê da tripulação?", "Cintos de segurança e velocidade adequada.", ["Remover cintos.", "Voar sem planejamento.", "Ignorar briefing."]),
      ], "Nuvens e visibilidade limitam ou permitem VFR."),
      topic("QNH e vento de superfície", REF_MET, [
        q("Com QNH ajustado no solo, o que o altímetro indica?", "Altitude em relação ao nível médio do mar no aeródromo.", ["Velocidade verdadeira.", "Direção do vento aloft.", "Consumo horário."]),
        q("O que o QNH incorreto pode causar?", "Erro de separação com terreno ou tráfego.", ["Melhora de visibilidade.", "Eliminação de vento cruzado.", "Aumento de autonomia."]),
        q("O que o vento de superfície no METAR afeta?", "Decolagem, pouso e circuito.", ["Somente cruzeiro em FL350.", "Apenas documentos.", "Nada em VFR."]),
        q("O que a rajada na pista aumenta?", "O componente variável de vento cruzado.", ["A visibilidade obrigatoriamente.", "A TAS em cruzeiro.", "O peso máximo de pouso estrutural."]),
        q("Para que serve o cartão de vento em superfície?", "Antecipar componente na cabeceira em uso.", ["Substituir NOTAM.", "Eliminar alternado.", "Voar sem rádio em CTR."]),
      ], "Altimetria e vento de superfície fecham briefing VFR."),
    ],
  },
  {
    key: "TEV",
    label: "Teoria de Voo",
    topics: [
      topic("Sustentação e estol", REF_TEV, [
        q("De quê a sustentação depende principalmente?", "Velocidade, densidade, área e ângulo de ataque.", ["Somente cor da aeronave.", "Apenas QNH.", "Código transponder."]),
        q("Quando ocorre o estol?", "Quando o ângulo de ataque crítico é excedido.", ["Quando a velocidade indicada é muito alta.", "Quando o tanque está cheio.", "Quando há vento de cauda apenas."]),
        q("O que a recuperação inicial de estol exige?", "Reduzir ângulo de ataque e aplicar potência conforme procedimento.", ["Puxar mais o manche.", "Desligar motor.", "Ignorar procedimento."]),
        q("O que o fator de carga em curva nivelada aumenta?", "A velocidade de estol.", ["A visibilidade.", "A autonomia sempre.", "A declinação magnética."]),
        q("O que a contaminação de asa (gelo ou sujeira) prejudica?", "Sustentação e aumenta velocidade de estol.", ["Somente rádio.", "Apenas GPS.", "Nada em VFR."]),
      ], "Sustentação e estol são base da segurança em manobra."),
      topic("Estabilidade e controles", REF_TEV, [
        q("O que o profundor controla principalmente?", "Arfagem em torno do eixo lateral.", ["Rolamento.", "Guinada.", "Pressão do pitot."]),
        q("O que os ailerons controlam?", "Rolamento.", ["Arfagem.", "Guinada.", "Combustível."]),
        q("O que o leme controla?", "Guinada.", ["Rolamento.", "Arfagem.", "Altitude de pressão."]),
        q("CG à frente do limite traseiro tende a causar o quê?", "Aumento da estabilidade longitudinal.", ["Aeronave incontrolável em pitch.", "Eliminação da necessidade de trim.", "Redução do peso máximo."]),
        q("Para que serve o trim em cruzeiro?", "Aliviar forças no profundor.", ["Reduzir consumo de NOTAM.", "Eliminar alternado.", "Substituir cartas."]),
      ], "Eixos e superfícies explicam comportamento da aeronave."),
      topic("Performance básica", REF_TEV, [
        q("A velocidade de melhor razão de subida (Vy) relaciona-se a quê?", "Máximo ganho de altitude por tempo.", ["Máximo ganho de altitude por distância.", "Mínima distância de pouso.", "Máximo vento cruzado."]),
        q("A velocidade de melhor ângulo de subida (Vx) relaciona-se a quê?", "Máximo ganho de altitude por distância horizontal.", ["Máximo ganho por tempo apenas.", "Mínima TAS em cruzeiro.", "Máxima autonomia sempre."]),
        q("O que o peso maior tende a aumentar?", "Velocidade de decolagem e pouso.", ["Redução da distância de pista sempre.", "Eliminação de vento cruzado.", "Dispensa de cálculo de CG."]),
        q("O que a altitude-densidade alta reduz?", "Performance do motor e da hélice.", ["Peso máximo estrutural.", "Necessidade de oxigênio em todo voo.", "Consumo de combustível sempre."]),
        q("O que o vento de cauda no pouso aumenta?", "Velocidade sobre o solo e distância de pista.", ["Margem contra obstáculos.", "Eficiência de frenagem.", "Visibilidade na final."]),
      ], "Performance liga teoria ao planejamento de pista."),
      topic("Carga e envelope", REF_TEV, [
        q("O que o CG fora do envelope compromete?", "Controle e recuperação de manobras.", ["Somente cor do painel.", "Apenas METAR.", "Frequência ATIS."]),
        q("Peso acima do máximo estrutural é válido para operação?", "Não — é inválido para a operação.", ["Sim, em VFR local.", "Sim, se o trim estiver ajustado.", "Sim, em treino."]),
        q("O que a carga solta na cabine pode causar?", "Deslocamento do CG em manobra.", ["Melhora de estabilidade.", "Substituição dos cintos.", "Eliminação do estol."]),
        q("Por que o tanque cheio deve constar no cálculo de peso e balanceamento?", "Porque altera o CG em relação ao tanque vazio.", ["Porque pode ser ignorado em aeronave leve.", "Porque substitui NOTAM.", "Porque dispensa alternado."]),
        q("Por que existe limite de bagagem no compartimento traseiro?", "Para manter o CG dentro do envelope aprovado.", ["Para aumentar velocidade de estol.", "Para voar sem documentos.", "Para eliminar pré-voo."]),
      ], "Peso e CG integram teoria e regulamento."),
    ],
  },
  {
    key: "CTE",
    label: "Conhecimentos Técnicos",
    topics: [
      topic("Motor e combustível", REF_CTE, [
        q("O que o ciclo Otto de quatro tempos inclui?", "Admissão, compressão, combustão/expansão e escape.", ["Apenas admissão e escape.", "Compressão contínua sem válvulas.", "Combustão externa."]),
        q("O que a drenagem de combustível no pré-voo detecta?", "Água ou sedimentos no tanque.", ["Apenas cor do óleo.", "Declinação magnética.", "Vento aloft."]),
        q("O que a mistura pobre em altitude pode causar?", "Perda de potência ou funcionamento irregular.", ["Aumento garantido de potência.", "Eliminação de gelo no carburador.", "Melhora de visibilidade."]),
        q("O que a temperatura do óleo fora da faixa verde exige?", "Investigar antes de voo prolongado.", ["Decolar imediatamente.", "Ignorar em voo local.", "Desligar alternador."]),
        q("Como o gelo no carburador pode ser mitigado?", "Com aquecimento de carburador conforme manual da aeronave.", ["Fechando a borboleta totalmente.", "Voando sem combustível.", "Ignorando indicação de temperatura."]),
      ], "Motor e combustível exigem verificação no pré-voo."),
      topic("Sistema elétrico", REF_CTE, [
        q("O que o alternador mantém em operação?", "Carga da bateria e alimentação dos consumidores.", ["Somente partida do motor.", "Pressão pitot-estática.", "Combustível no tanque."]),
        q("O que a falha de alternador em voo exige?", "Reduzir consumo elétrico e planejar pouso.", ["Continuar voo longo sem rádio.", "Ignorar amperímetro.", "Voar IFR sem habilitação."]),
        q("Para que a bateria serve se o alternador falhar?", "Partida e energia temporária.", ["Substituir planejamento de rota.", "Eliminar transponder.", "Voar sem combustível."]),
        q("O que um disjuntor aberto indica?", "Circuito protegido desligado.", ["Falha certa do motor.", "Vento de cauda obrigatório.", "METAR inválido."]),
        q("De que dependem rádio e transponder?", "De sistema elétrico saudável.", ["Somente de vento de superfície.", "Apenas de NOTAM.", "De carta VFR apenas."]),
      ], "Elétrico sustenta comunicação e instrumentos."),
      topic("Instrumentos básicos", REF_CTE, [
        q("Quais pressões o velocímetro utiliza?", "Dinâmica e estática do sistema pitot-estático.", ["Somente hidráulicas do trem.", "Apenas do tanque.", "Do alternador."]),
        q("O que um altímetro sem QNH correto indica?", "Altitude errada em relação ao terreno.", ["Velocidade verdadeira.", "Direção do vento.", "Consumo horário exato."]),
        q("O que o VSI mostra?", "Razão de subida ou descida.", ["Rumo magnético.", "Código squawk.", "Peso de decolagem."]),
        q("Em que situações o horizonte artificial auxilia em VFR?", "Em nuvens temporárias ou treinamento de instrumentos.", ["Para substituir referência visual obrigatória.", "Para voar em IMC sem habilitação.", "Para eliminar alternado."]),
        q("O que o bloqueio do pitot pode afetar?", "Indicação de velocidade.", ["Somente combustível.", "Apenas transponder.", "NOTAM."]),
      ], "Instrumentos devem ser entendidos mesmo em VFR."),
      topic("Pré-voo e manutenção", REF_CTE, [
        q("O que a inspeção visual da hélice busca?", "Trincas, amassados e fixação correta.", ["Apenas pintura.", "Somente GPS.", "Declinação."]),
        q("Por que controles livres e no sentido correto são críticos?", "Porque são item essencial de segurança no pré-voo.", ["Porque são opcionais em aeronave leve.", "Porque são responsabilidade da torre.", "Porque são substituídos por METAR."]),
        q("Como o nível de combustível verificado visualmente deve ser usado?", "Cruzado com o planejamento de consumo.", ["Ignorado se o voo for curto.", "Substituído por TAF.", "Medido só após pouso."]),
        q("Para que serve a documentação de manutenção em dia?", "Identificar limitações e diretivas de aeronavegabilidade.", ["Voar acima do peso máximo.", "Eliminar NOTAM.", "Voar sem habilitação."]),
        q("O que um pneu com desgaste irregular sugere?", "Problema de alinhamento ou pressão.", ["Vento de cauda favorável.", "METAR CAVOK.", "Alternado desnecessário."]),
      ], "Pré-voo técnico fecha preparação do PP."),
    ],
  },
];
