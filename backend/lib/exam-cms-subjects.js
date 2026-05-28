/**
 * Banco temático CMS (Comissário de Voo) — questões autorais em múltipla escolha completa.
 * Alinhado ao programa ANAC para comissário: regulamentação, emergência, primeiros socorros,
 * segurança/AVSEC e conhecimentos gerais de aviação.
 */

import { q, topic } from "./exam-bank-core.js";

export const CMS_SUBJECTS = [
  {
    key: "REGCMS",
    label: "Regulamentação do Comissário",
    topics: [
      topic(
        "Funções e responsabilidades",
        "RBAC 63/121/135",
        [
          q(
            "Qual é a principal responsabilidade do comissário de voo durante a operação?",
            "Garantir a segurança dos passageiros, o cumprimento dos procedimentos de cabine e o apoio à operação.",
            [
              "Controlar tecnicamente os motores e sistemas de propulsão da aeronave.",
              "Definir o plano de voo e a rota ATS junto ao órgão de controle.",
              "Comandar a navegação por instrumentos na cabine de comando.",
            ]
          ),
          q(
            "Em situação normal de voo, o comissário deve priorizar qual aspecto da operação?",
            "A segurança operacional de cabine, a orientação dos passageiros e a vigilância preventiva.",
            [
              "A maximização do faturamento de serviços de bordo em todas as fases.",
              "A substituição das decisões da cabine de comando em anormalidades.",
              "A inspeção externa da estrutura da aeronave antes de cada serviço.",
            ]
          ),
          q(
            "A atuação do comissário em cabine está relacionada principalmente a quê?",
            "Segurança de cabine, prevenção de incidentes, orientação e resposta a emergências.",
            [
              "Manutenção programada dos sistemas hidráulicos da aeronave.",
              "Elaboração do briefing meteorológico de rota para o piloto em comando.",
              "Calibração dos instrumentos de navegação da cabine de comando.",
            ]
          ),
          q(
            "O que inclui a função do comissário na tripulação de cabine, segundo a regulamentação aplicável?",
            "Executar procedimentos de segurança, comunicar anormalidades e coordenar ações com a cabine de comando.",
            [
              "Autorizar sozinho alterações de peso e balanceamento da aeronave.",
              "Substituir o piloto em comando em qualquer fase crítica de voo.",
              "Dispensar o cumprimento de checklists aprovados pelo operador.",
            ]
          ),
          q(
            "O que implica a atuação do comissário na interface entre passageiros e operação?",
            "Traduzir procedimentos de segurança em conduta de cabine e apoio à decisão operacional.",
            [
              "Assumir exclusivamente a responsabilidade pela navegação da aeronave.",
              "Ignorar comunicações da cabine de comando em situações de rotina.",
              "Priorizar conforto comercial acima de qualquer procedimento de segurança.",
            ]
          ),
        ],
        "O comissário atua na segurança de cabine, prevenção, orientação e resposta a emergências."
      ),
      topic(
        "Briefing e coordenação",
        "Procedimentos de cabine",
        [
          q(
            "Para que serve o briefing de tripulação de cabine antes do voo?",
            "Alinhar procedimentos, funções, ameaças, equipamentos e ações em caso de anormalidade.",
            [
              "Substituir integralmente o treinamento obrigatório do comissário.",
              "Definir a rota meteorológica e o plano de combustível da aeronave.",
              "Eliminar a necessidade de checklists e verificações de cabine.",
            ]
          ),
          q(
            "Como deve ser a comunicação entre a tripulação de cabine e a cabine de comando?",
            "Objetiva, oportuna e adequada ao nível de risco da informação transmitida.",
            [
              "Reservada apenas ao final do voo, para não interromper o serviço.",
              "Substituída por mensagens informais entre passageiros.",
              "Dispensada quando o voo for de curta duração.",
            ]
          ),
          q(
            "Como devem ser repassadas informações críticas de segurança identificadas em cabine?",
            "Imediatamente à cabine de comando e registradas conforme procedimento do operador.",
            [
              "Somente após o desembarque de todos os passageiros.",
              "Apenas se houver solicitação expressa de um passageiro.",
              "Nunca, para evitar alarme desnecessário na cabine de comando.",
            ]
          ),
          q(
            "No briefing pré-voo, a distribuição de posições e saídas de emergência visa:",
            "Garantir cobertura das áreas de cabine e resposta coordenada em evacuação.",
            [
              "Definir quem realizará a manutenção dos motores em voo.",
              "Substituir o plano de voo apresentado pelo despacho.",
              "Permitir que um único comissário concentre todas as funções sem apoio.",
            ]
          ),
          q(
            "Um briefing eficiente de cabine reduz principalmente:",
            "Ruído operacional, dúvidas de função e tempo de resposta em situações anormais.",
            [
              "A necessidade de treinamento periódico em emergência.",
              "O consumo de combustível da aeronave.",
              "A obrigatoriedade de comunicação com passageiros em fases críticas.",
            ]
          ),
        ],
        "Briefing eficiente reduz ruído operacional e melhora resposta coordenada."
      ),
      topic(
        "Embarque e passageiros especiais",
        "Atendimento e segurança no embarque",
        [
          q(
            "Durante o embarque, a atenção a passageiros com necessidades especiais visa:",
            "Garantir segurança, acessibilidade, evacuação e cumprimento dos requisitos operacionais.",
            [
              "Aumentar a velocidade de cruzeiro da aeronave.",
              "Substituir a inspeção pré-voo externa da aeronave.",
              "Permitir bloqueio de corredores em voos de curta duração.",
            ]
          ),
          q(
            "A acomodação de bagagem de mão no embarque deve considerar:",
            "Peso, dimensões, obstrução de corredores e acesso às saídas de emergência.",
            [
              "Apenas a cor e o fabricante da mala do passageiro.",
              "Somente a preferência de assento para o serviço de bordo.",
              "A possibilidade de armazenar itens nas saídas de emergência se couberem.",
            ]
          ),
          q(
            "O passageiro designado para assento em saída de emergência deve:",
            "Atender aos critérios operacionais, compreender a função e aceitar a responsabilidade.",
            [
              "Ser obrigatoriamente o passageiro mais idoso do voo.",
              "Receber bagagem extra sem limite de peso no assento.",
              "Permanecer de pé durante decolagem e pouso.",
            ]
          ),
          q(
            "No embarque, a verificação de documentação e condição do passageiro contribui para:",
            "Identificar riscos à segurança do voo e à evacuação antes da decolagem.",
            [
              "Definir a altitude de cruzeiro da aeronave.",
              "Substituir o briefing com a cabine de comando.",
              "Eliminar a necessidade de cinto de segurança em fases críticas.",
            ]
          ),
          q(
            "Embarque seguro e organizado evita principalmente:",
            "Obstruções de corredor, riscos em evacuação e falhas de atendimento em emergência.",
            [
              "A consulta de NOTAM e condições meteorológicas.",
              "O uso de oxigênio suplementar em despressurização.",
              "A comunicação com órgãos de busca e salvamento.",
            ]
          ),
        ],
        "Embarque seguro evita obstruções, riscos em evacuação e problemas de atendimento."
      ),
      topic(
        "Disciplina operacional",
        "Conduta profissional de cabine",
        [
          q(
            "A disciplina operacional do comissário de voo inclui:",
            "Cumprir normas, reportar anormalidades e manter postura compatível com a segurança de voo.",
            [
              "Dispensar comunicação com a tripulação em situações rotineiras.",
              "Permitir improvisação em todos os procedimentos de cabine.",
              "Eliminar a responsabilidade individual por desvios de procedimento.",
            ]
          ),
          q(
            "Procedimentos padronizados de cabine são importantes porque:",
            "Reduzem variabilidade humana e sustentam respostas previsíveis em emergência.",
            [
              "Substituem a necessidade de treinamento em primeiros socorros.",
              "Permitem ignorar instruções da cabine de comando em voo longo.",
              "Eliminam a obrigatoriedade de briefing pré-voo.",
            ]
          ),
          q(
            "Desvio de procedimento sem justificativa operacional pode:",
            "Aumentar risco à segurança e expor passageiros, tripulação e operador.",
            [
              "Melhorar automaticamente o tempo de evacuação.",
              "Dispensar registro de ocorrência em qualquer caso.",
              "Autorizar alteração unilateral da configuração da aeronave.",
            ]
          ),
          q(
            "A conduta profissional do comissário perante passageiros e tripulação deve refletir:",
            "Autoridade técnica de cabine, cortesia e foco na segurança operacional.",
            [
              "Confronto imediato com qualquer dúvida de passageiro em voo.",
              "Sigilo absoluto sobre qualquer anormalidade, sem comunicação interna.",
              "Prioridade exclusiva de vendas a bordo em todas as fases de voo.",
            ]
          ),
          q(
            "Reportar anormalidades e near misses em cabine contribui para:",
            "Aprimorar procedimentos, treinamento e cultura de segurança do operador.",
            [
              "Substituir investigações de acidentes pela ANAC.",
              "Eliminar a necessidade de auditorias de cabine.",
              "Dispensar o cumprimento de regulamentos de artigos perigosos.",
            ]
          ),
        ],
        "Padronização e disciplina sustentam segurança e qualidade operacional."
      ),
    ],
  },
  {
    key: "EMGCMS",
    label: "Emergência e Sobrevivência",
    topics: [
      topic(
        "Evacuação",
        "Procedimentos de evacuação",
        [
          q(
            "Em uma evacuação de emergência, o comando vocal do comissário deve ser:",
            "Claro, firme e voltado à saída segura e rápida dos passageiros.",
            [
              "Longo e explicativo, detalhando causas técnicas para cada passageiro.",
              "Dado somente após todos recolherem pertences pessoais.",
              "Substituído por silêncio total para evitar qualquer reação dos passageiros.",
            ]
          ),
          q(
            "Antes de abrir uma saída de emergência em evacuação, deve-se verificar:",
            "Se a área externa está livre de fogo, obstáculos ou risco imediato.",
            [
              "Se todos os passageiros já despacharam bagagem de mão.",
              "Se a cabine de comando autorizou serviço de bordo completo.",
              "Se o voo ainda possui mais de duas horas até o destino.",
            ]
          ),
          q(
            "Durante a evacuação, as bagagens de mão devem ser:",
            "Abandonadas para não obstruir corredores e saídas.",
            [
              "Carregadas por todos os passageiros para proteger documentos.",
              "Empilhadas junto às saídas para formar barreira contra fumaça.",
              "Distribuídas aos comissários para contagem após a evacuação.",
            ]
          ),
          q(
            "O fluxo de passageiros em evacuação deve ser orientado para:",
            "Utilizar saídas designadas, manter ordem e evitar retorno à cabine.",
            [
              "Buscar pertences antes de deixar o assento.",
              "Aguardar em fila única no galley sem comando.",
              "Abrir simultaneamente todas as portas sem avaliação externa.",
            ]
          ),
          q(
            "Após comando de evacuação, o comissário na saída deve:",
            "Auxiliar passagem, verificar cabine vazia conforme função e reportar à tripulação.",
            [
              "Retornar imediatamente para servir bebidas aos passageiros lentos.",
              "Fechar a saída se a fila estiver longa, para reorganizar fila.",
              "Dispensar verificação final de passageiros na própria área.",
            ]
          ),
        ],
        "Evacuação exige comandos curtos, avaliação externa e fluxo sem obstruções."
      ),
      topic(
        "Fogo e fumaça",
        "Combate a fogo em cabine",
        [
          q(
            "Ao identificar fumaça na cabine, a primeira atitude do comissário é:",
            "Comunicar a tripulação, localizar a fonte e aplicar o procedimento de combate a fogo.",
            [
              "Abrir imediatamente todas as portas da aeronave em voo.",
              "Aguardar o pouso sem informar ninguém para evitar pânico.",
              "Cobrir a fonte com material inflamável disponível na cabine.",
            ]
          ),
          q(
            "O combate a fogo a bordo exige:",
            "Uso correto de extintores, proteção das vias respiratórias e monitoramento da reignição.",
            [
              "Desligar todos os sistemas elétricos da aeronave pelo comissário.",
              "Ventilar abrindo portas em qualquer altitude sem avaliação.",
              "Aguardar sempre a chegada de bombeiros antes de qualquer ação.",
            ]
          ),
          q(
            "Após extinguir fogo em equipamento de cabine, deve-se:",
            "Monitorar reignição, afastar fonte de calor e informar a cabine de comando.",
            [
              "Reenergizar imediatamente o equipamento para testar funcionamento.",
              "Descartar o extintor usado pela janela em voo.",
              "Encerrar comunicação com a tripulação se não houver chamas visíveis.",
            ]
          ),
          q(
            "Fumaça proveniente de compartimento de bagagem ou galley exige:",
            "Isolamento da área, combate conforme treinamento e preparo para possível evacuação.",
            [
              "Continuar serviço de bordo para acalmar passageiros.",
              "Spray aromático para mascarar odor sem investigar causa.",
              "Abrir compartimentos pressurizados para ventilar com ar externo em cruzeiro.",
            ]
          ),
          q(
            "Em incêndio de origem elétrica em cabine, o procedimento adequado inclui:",
            "Cortar energia da fonte se possível, usar extintor adequado e evitar reinício prematuro.",
            [
              "Jogar água diretamente em painéis energizados sem desligar circuito.",
              "Ventilar com oxigênio suplementar de máscaras de passageiros.",
              "Ignorar se o cheiro desaparecer por alguns segundos.",
            ]
          ),
        ],
        "Fogo em cabine exige ação rápida, comunicação e monitoramento."
      ),
      topic(
        "Sobrevivência",
        "Sobrevivência no mar e selva",
        [
          q(
            "Em sobrevivência no mar após abandono da aeronave, a prioridade inicial inclui:",
            "Reunir sobreviventes, ativar coletes, reduzir hipotermia e sinalizar posição.",
            [
              "Separar todos para nadar em direções diferentes em busca de terra.",
              "Consumir imediatamente todos os suprimentos de água e alimento.",
              "Abandonar balsa e equipamentos de sinalização para nadar mais rápido.",
            ]
          ),
          q(
            "Após pouso forçado em área remota, o grupo deve:",
            "Organizar liderança, abrigo, inventário de recursos e plano de sinalização.",
            [
              "Dispersar individualmente nas primeiras horas sem comunicação.",
              "Queimar toda a borda da aeronave imediatamente para aquecer.",
              "Ignorar feridos leves e focar apenas em buscar celular sem bateria.",
            ]
          ),
          q(
            "O uso de equipamentos de sinalização em sobrevivência serve para:",
            "Facilitar localização por aeronaves, embarcações ou equipes de busca.",
            [
              "Substituir a necessidade de água potável na primeira noite.",
              "Aumentar a autonomia de combustível da aeronave original.",
              "Eliminar a obrigatoriedade de manter grupo unido.",
            ]
          ),
          q(
            "Em ambiente de selva após acidente, a prioridade de abrigo visa:",
            "Proteger contra exposição, animais e perda de calor corporal.",
            [
              "Construir abrigo apenas após percorrer dez quilômetros sem mapa.",
              "Dormir sempre ao ar livre para facilitar visão do céu.",
              "Dispensar água se houver frutas desconhecidas disponíveis.",
            ]
          ),
          q(
            "A gestão de água e alimento em sobrevivência prolongada deve:",
            "Racionar recursos, priorizar água potável e evitar esforço desnecessário.",
            [
              "Consumir tudo no primeiro dia para ganhar força.",
              "Depender apenas de alimentos não identificados da vegetação.",
              "Ignorar sinais de desidratação se o clima estiver ameno.",
            ]
          ),
        ],
        "Sobrevivência depende de organização, abrigo, sinalização, água e liderança."
      ),
      topic(
        "Despressurização",
        "Emergências de altitude e oxigênio",
        [
          q(
            "Em despressurização rápida, a prioridade imediata do comissário é:",
            "Garantir uso de oxigênio, cumprir procedimentos e orientar passageiros.",
            [
              "Servir refeições para manter calma sem máscaras.",
              "Aguardar autorização individual de cada passageiro antes de agir.",
              "Desligar comunicação com a cabine de comando até o pouso.",
            ]
          ),
          q(
            "As máscaras de oxigênio de passageiros em cabine devem ser usadas:",
            "Assim que caírem, puxando firmemente e ajustando antes de auxiliar outros.",
            [
              "Somente após a aeronave atingir altitude zero.",
              "Apenas por passageiros com histórico de asma.",
              "Nunca, pois reduzem a audição dos anúncios.",
            ]
          ),
          q(
            "Sinais de hipóxia em passageiros ou tripulantes exigem:",
            "Oxigênio imediato, descida conforme procedimento e avaliação médica posterior.",
            [
              "Oferta de bebidas alcoólicas para relaxamento.",
              "Manter todos em pé para estimular circulação sem máscara.",
              "Adiar comunicação com a cabine de comando até o cruzeiro.",
            ]
          ),
          q(
            "Após despressurização, a aeronave normalmente:",
            "Inicia descida de emergência para altitude onde a respiração é sustentável sem máscara.",
            [
              "Mantém altitude de cruzeiro até o destino programado sem alteração.",
              "Aumenta altitude para reduzir turbulência.",
              "Desliga todos os sistemas de pressurização permanentemente em voo.",
            ]
          ),
          q(
            "A orientação de passageiros em despressurização deve enfatizar:",
            "Colocar máscara primeiro, cinto afivelado e aguardar comandos da tripulação.",
            [
              "Recolher bagagens de mão antes de qualquer outra ação.",
              "Abrir portas para equalizar pressão manualmente.",
              "Remover máscaras se assustarem, para ouvir melhor anúncios longos.",
            ]
          ),
        ],
        "Oxigênio e orientação rápida são essenciais em perda de pressurização."
      ),
    ],
  },
  {
    key: "SBVCMS",
    label: "Primeiros Socorros",
    topics: [
      topic(
        "Avaliação inicial",
        "Primeiros socorros - avaliação primária",
        [
          q(
            "Diante de passageiro inconsciente, a avaliação inicial deve verificar:",
            "Segurança da cena, responsividade, respiração e necessidade de acionar apoio.",
            [
              "Preferência alimentar e bebida consumida no embarque apenas.",
              "Somente o número do assento e destino final do passageiro.",
              "A cor e o peso da bagagem despachada do passageiro.",
            ]
          ),
          q(
            "A abordagem de primeiros socorros a bordo deve priorizar:",
            "Estabilização imediata, proteção da vítima e comunicação objetiva com a tripulação.",
            [
              "Diagnóstico definitivo de doença crônica sem apoio médico.",
              "Movimentação imediata para o galley sem avaliar consciência.",
              "Administração de medicamentos prescritos a terceiros sem autorização.",
            ]
          ),
          q(
            "Antes de prestar atendimento, o comissário deve observar:",
            "Riscos à cena, número de vítimas, mecanismo provável e recursos disponíveis.",
            [
              "Apenas se há fila para o banheiro da cabine.",
              "Somente a nacionalidade do passageiro.",
              "Exclusivamente a classe tarifária do bilhete.",
            ]
          ),
          q(
            "Se o passageiro responde mas respira com dificuldade, o próximo passo inclui:",
            "Posicionar adequadamente, monitorar e solicitar apoio médico conforme procedimento.",
            [
              "Oferecer refeição completa para elevar glicemia sem avaliação.",
              "Deixá-lo sozinho no lavabo sem comunicação à tripulação.",
              "Aplicar torniquete em membro superior sem sangramento.",
            ]
          ),
          q(
            "A avaliação primária organiza o atendimento porque:",
            "Identifica ameaças imediatas à vida e define prioridades de intervenção.",
            [
              "Substitui a necessidade de treinamento em RCP.",
              "Elimina registro de ocorrência médica em voo.",
              "Dispensa comunicação com profissional de saúde em solo.",
            ]
          ),
        ],
        "Avaliação primária organiza atendimento e identifica risco imediato à vida."
      ),
      topic(
        "RCP e DEA",
        "Suporte básico de vida",
        [
          q(
            "Em suspeita de parada cardiorrespiratória a bordo, a ação adequada é:",
            "Acionar ajuda, iniciar RCP conforme treinamento e utilizar DEA quando disponível.",
            [
              "Aguardar obrigatoriamente a chegada ao destino sem compressões.",
              "Oferecer líquidos por via oral ao passageiro inconsciente.",
              "Movimentar o passageiro para assento de janela sem avaliar respiração.",
            ]
          ),
          q(
            "O DEA (desfibrilador externo automático) a bordo deve ser utilizado:",
            "O mais cedo possível, seguindo instruções de voz do aparelho e segurança da cena.",
            [
              "Somente por médico presente entre passageiros, nunca pela tripulação.",
              "Apenas após trinta minutos de compressões ininterruptas.",
              "Em qualquer passageiro consciente com náusea leve.",
            ]
          ),
          q(
            "Compressões torácicas eficazes em RCP devem buscar:",
            "Profundidade e frequência adequadas, permitindo retorno completo do tórax.",
            [
              "Compressões superficiais e lentas para evitar lesão.",
              "Pausas prolongadas sem alternância de socorristas.",
              "Interrupção imediata ao primeiro suspiro da vítima, sem reavaliar.",
            ]
          ),
          q(
            "Durante RCP a bordo, a coordenação entre comissários deve incluir:",
            "Alternância de compressões, manejo do DEA e comunicação com a cabine de comando.",
            [
              "Filmar o atendimento para redes sociais antes de ajudar.",
              "Dispensar oxigênio e DEA se o voo for noturno.",
              "Transferir a vítima para o compartimento de bagagem para privacidade.",
            ]
          ),
          q(
            "A RCP precoce associada ao DEA aumenta principalmente:",
            "A chance de sobrevivência até atendimento médico definitivo em solo.",
            [
              "A velocidade de cruzeiro da aeronave.",
              "A autonomia de combustível da aeronave.",
              "A pressurização cabine em altitude elevada.",
            ]
          ),
        ],
        "RCP precoce e DEA aumentam chance de sobrevivência."
      ),
      topic(
        "Mal súbito em voo",
        "Emergências clínicas em cabine",
        [
          q(
            "Em caso de mal súbito, a coleta de informações deve incluir:",
            "Sintomas, início, antecedentes, medicações, sinais observados e evolução.",
            [
              "Apenas destino final e programa de entretenimento usado.",
              "Somente preferência de assento e idioma do passageiro.",
              "Exclusivamente a companhia aérea da passagem de retorno.",
            ]
          ),
          q(
            "Passageiro com dor torácica intensa deve ser tratado como:",
            "Possível emergência cardíaca até prova em contrário, com monitoramento e apoio.",
            [
              "Simples indigestão, sem comunicação à tripulação.",
              "Caso de desconforto por altitude, dispensando oxigênio.",
              "Situação que exige apenas água gelada e nenhum registro.",
            ]
          ),
          q(
            "A comunicação de emergência médica à cabine de comando deve conter:",
            "Idade aparente, sintomas, sinais vitais se aferidos, tratamento iniciado e necessidades.",
            [
              "Rumores de outros passageiros sobre a dieta da vítima apenas.",
              "Opinião pessoal sobre culpa do evento sem dados clínicos.",
              "Histórico completo de voos da vítima nos últimos dez anos.",
            ]
          ),
          q(
            "Em convulsão de passageiro, a conduta inicial adequada inclui:",
            "Proteger contra impacto, não restringir movimentos violentos e cronometrar o episódio.",
            [
              "Introduzir objeto na boca para evitar mordida de língua.",
              "Segurar fortemente braços e pernas contra o assento.",
              "Dar água imediatamente assim que o movimento diminuir.",
            ]
          ),
          q(
            "Informações objetivas sobre mal súbito ajudam a operação porque:",
            "Permitem decisão sobre desvio, apoio médico em solo e priorização de recursos.",
            [
              "Substituem a necessidade de primeiros socorros a bordo.",
              "Eliminam registro de ocorrência após o pouso.",
              "Garantem diagnóstico definitivo pela tripulação de cabine.",
            ]
          ),
        ],
        "Informações objetivas ajudam decisão operacional e eventual apoio médico."
      ),
      topic(
        "Ferimentos e sangramentos",
        "Hemorragias e curativos",
        [
          q(
            "Em sangramento externo significativo, a medida inicial costuma ser:",
            "Pressão direta com gaze limpa, elevação se possível e acionamento de apoio.",
            [
              "Remover sempre objetos profundamente encravados no ferimento.",
              "Lavar com bebida quente para acelerar coagulação.",
              "Ignorar o sangramento se o passageiro estiver sentado e calmo.",
            ]
          ),
          q(
            "O uso de luvas no atendimento a feridos serve para:",
            "Reduzir risco de transmissão de agentes infecciosos entre vítima e socorrista.",
            [
              "Aumentar a temperatura da ferida para cicatrização imediata.",
              "Substituir a necessidade de pressão direta no sangramento.",
              "Identificar automaticamente o tipo sanguíneo do passageiro.",
            ]
          ),
          q(
            "Ferimento com objeto encravado deve ser tratado por:",
            "Estabilizar o objeto, controlar sangramento ao redor e não remover sem aval médica.",
            [
              "Retirar o objeto imediatamente para facilitar curativo.",
              "Empurrar o objeto mais profundamente para tamponar vaso.",
              "Aplicar torniquete no pescoço em qualquer sangramento leve.",
            ]
          ),
          q(
            "Em amputação parcial de dedo com sangramento, além da pressão direta:",
            "Proteger o segmento amputado conforme treinamento e comunicar urgência médica.",
            [
              "Descartar o segmento se não houver gelo a bordo.",
              "Imergir a mão em bebida alcoólica para desinfecção.",
              "Atrasar comunicação até o serviço de bordo terminar.",
            ]
          ),
          q(
            "Controle de sangramento e biossegurança em cabine reduzem:",
            "Risco à vítima, à tripulação e à continuidade segura do atendimento.",
            [
              "A necessidade de qualquer comunicação com a cabine de comando.",
              "O uso de equipamento de proteção individual em todos os voos.",
              "A obrigatoriedade de treinamento periódico em primeiros socorros.",
            ]
          ),
        ],
        "Controle de sangramento e biossegurança reduzem risco ao passageiro e à tripulação."
      ),
    ],
  },
  {
    key: "SEGCMS",
    label: "Segurança e AVSEC",
    topics: [
      topic(
        "Interferência ilícita",
        "AVSEC",
        [
          q(
            "Conduta suspeita em cabine deve ser tratada com:",
            "Discrição, comunicação adequada e cumprimento dos procedimentos de segurança.",
            [
              "Divulgação pública imediata no sistema de áudio para todos os passageiros.",
              "Confronto físico direto sem avaliação de risco ou apoio.",
              "Ignorância se o voo estiver a menos de trinta minutos do destino.",
            ]
          ),
          q(
            "Em ameaça à segurança da aeronave, o comissário deve:",
            "Informar a cabine de comando, seguir plano de segurança e evitar escalada desnecessária.",
            [
              "Negociar sozinho a entrega da aeronave a ameaçadores sem comunicar.",
              "Abrir a porta da cabine de comando para acalmar o agressor.",
              "Dispensar registro da ocorrência após o pouso normal.",
            ]
          ),
          q(
            "Os procedimentos AVSEC buscam principalmente:",
            "Prevenir atos de interferência ilícita e proteger aeronave, tripulação e passageiros.",
            [
              "Aumentar a receita de serviços premium a bordo.",
              "Substituir inspeções de manutenção da aeronave.",
              "Eliminar comunicação com autoridades em solo.",
            ]
          ),
          q(
            "Objeto suspeito abandonado em cabine exige:",
            "Isolar área, evitar manuseio e acionar procedimento de segurança do operador.",
            [
              "Abrir imediatamente para identificar proprietário.",
              "Mover para compartimento de bagagem sem informar ninguém.",
              "Descartar pela saída de serviço em voo para eliminar risco.",
            ]
          ),
          q(
            "A prevenção de interferência ilícita inclui:",
            "Vigilância em embarque e cabine, controle de acesso e coordenação com segurança em solo.",
            [
              "Permitir visita livre à cabine de comando durante o cruzeiro.",
              "Dispensar identificação de tripulação em áreas restritas.",
              "Ignorar itens não declarados se o passageiro for frequente.",
            ]
          ),
        ],
        "AVSEC exige prevenção, comunicação discreta e resposta coordenada."
      ),
      topic(
        "Artigos perigosos",
        "Transporte aéreo de artigos perigosos",
        [
          q(
            "Artigos perigosos em bagagem de mão representam risco porque:",
            "Podem causar fogo, vazamento, explosão, intoxicação ou outro evento grave a bordo.",
            [
              "Aumentam a autonomia de combustível da aeronave.",
              "Melhoram o balanceamento longitudinal da cabine.",
              "Substituem equipamentos de emergência obrigatórios.",
            ]
          ),
          q(
            "Ao suspeitar de item proibido ou não declarado, o comissário deve:",
            "Seguir procedimento do operador, comunicar e evitar manuseio arriscado.",
            [
              "Guardar o item no galley sem informar a tripulação.",
              "Permitir uso se o passageiro insistir com veemência.",
              "Descartar baterias de lítio em lixo comum sem isolamento.",
            ]
          ),
          q(
            "As regras de transporte de artigos perigosos servem para:",
            "Reduzir riscos de incêndio e exposição química em voo pressurizado.",
            [
              "Facilitar comércio de produtos inflamáveis sem restrição.",
              "Eliminar inspeção de segurança no embarque.",
              "Permitir qualquer quantidade de aerossóis em bagagem de mão.",
            ]
          ),
          q(
            "Baterias de lítio danificadas ou aquecendo em cabine exigem:",
            "Procedimento específico de isolamento, combate a fogo e comunicação imediata.",
            [
              "Carregamento imediato em tomada de passageiro para descarregar.",
              "Armazenamento junto a oxigênio suplementar para resfriar.",
              "Ignorar se o passageiro afirmar que é nova.",
            ]
          ),
          q(
            "Substâncias inflamáveis não autorizadas descobertas antes da decolagem devem:",
            "Ser retiradas da aeronave conforme regulamento e procedimento do operador.",
            [
              "Ser redistribuídas entre passageiros para diluir risco.",
              "Permanecer a bordo se embaladas em saco plástico comum.",
              "Ser misturadas com gelo seco para estabilização.",
            ]
          ),
        ],
        "Controle de artigos perigosos reduz riscos de eventos graves a bordo."
      ),
      topic(
        "Passageiro indisciplinado",
        "Gerenciamento de passageiro disruptivo",
        [
          q(
            "Passageiro indisciplinado deve ser gerenciado com:",
            "Técnicas graduais, comunicação com a tripulação e preservação da segurança.",
            [
              "Exposição pública e humilhação para dissuadir outros.",
              "Improviso sem comunicação com cabine de comando ou solo.",
              "Liberação de acesso à cabine de comando para negociação.",
            ]
          ),
          q(
            "O registro de ocorrência envolvendo passageiro disruptivo é importante para:",
            "Documentar fatos, apoiar medidas legais e aprimorar prevenção do operador.",
            [
              "Substituir qualquer investigação posterior.",
              "Eliminar necessidade de testemunhas.",
              "Dispensar comunicação com autoridade em solo.",
            ]
          ),
          q(
            "Medidas de contenção de passageiro agressivo devem ser consideradas:",
            "Somente quando graduação verbal falhou e há risco iminente, conforme treinamento e lei.",
            [
              "Como primeira resposta em qualquer reclamação de assento.",
              "Sem comunicação com a cabine de comando.",
              "Por qualquer passageiro voluntário sem orientação.",
            ]
          ),
          q(
            "Álcool ou substâncias que alterem comportamento em voo exigem:",
            "Monitoramento, limitação de serviço e intervenção graduada se houver risco.",
            [
              "Servir mais bebidas para acalmar o passageiro.",
              "Ignorar agressividade se o voo estiver cheio.",
              "Permitir acesso à cabine de comando para socializar.",
            ]
          ),
          q(
            "O gerenciamento graduado de passageiro disruptivo reduz:",
            "Escalada de violência e risco a terceiros na cabine.",
            [
              "A necessidade de qualquer briefing pré-voo.",
              "O cumprimento de procedimentos de decolagem e pouso.",
              "A obrigatoriedade de cinto de segurança em turbulência.",
            ]
          ),
        ],
        "Gerenciamento graduado reduz escalada e protege passageiros e tripulação."
      ),
      topic(
        "Cabine segura",
        "Procedimentos críticos de decolagem e pouso",
        [
          q(
            "Cabine preparada para decolagem e pouso significa:",
            "Passageiros com cinto, assentos na posição de segurança, bagagens stowadas e saídas desobstruídas.",
            [
              "Serviço de bordo completo até o toque na pista.",
              "Circulação livre no corredor para conforto.",
              "Portas de emergência entreabertas para ventilação.",
            ]
          ),
          q(
            "Durante fases críticas de voo, o comissário deve priorizar:",
            "Vigilância da cabine, posição segura e prontidão para comando de emergência.",
            [
              "Venda de duty free em todo o corredor.",
              "Entrevistas longas com passageiros sobre destino de férias.",
              "Reposição de toalhas no lavabo com passageiros em pé.",
            ]
          ),
          q(
            "A verificação de cabine antes do pouso busca:",
            "Confirmar cintos, assentos, monitores, mesas e compartimentos em condição segura.",
            [
              "Apenas a contagem de refeições não servidas.",
              "Somente a limpeza estética dos assentos.",
              "A abertura de portas para equalizar pressão.",
            ]
          ),
          q(
            "Monitores de entretenimento e mesas de refeição em fase crítica devem estar:",
            "Recolhidos e travados conforme procedimento do operador.",
            [
              "Totalmente estendidos para ocupar o passageiro.",
              "Removidos do assento e no corredor.",
              "Ignorados se o voo for doméstico curto.",
            ]
          ),
          q(
            "Fases críticas exigem tripulação de cabine sentada porque:",
            "Reduz risco de lesão em turbulência ou frenagem e mantém prontidão para evacuação.",
            [
              "Permite que todos os comissários durmam durante a descida.",
              "Elimina necessidade de comunicação com passageiros.",
              "Substitui o briefing de emergência antes do voo.",
            ]
          ),
        ],
        "Fases críticas exigem cabine segura e tripulação focada em emergência potencial."
      ),
    ],
  },
  {
    key: "AERCMS",
    label: "Conhecimentos Gerais de Aviação",
    topics: [
      topic(
        "Partes da aeronave",
        "Conhecimentos gerais de aeronaves",
        [
          q(
            "A fuselagem de uma aeronave tem como função principal:",
            "Acomodar tripulação, passageiros e carga, integrando estrutura e sistemas.",
            [
              "Gerar combustível durante o voo de cruzeiro.",
              "Substituir o sistema de comunicação rádio da tripulação.",
              "Controlar exclusivamente condições meteorológicas externas.",
            ]
          ),
          q(
            "As superfícies de comando de uma aeronave são usadas para:",
            "Controlar atitude e trajetória em voo, mediante deflexão adequada.",
            [
              "Armazenar bagagem de mão dos passageiros.",
              "Medir a pressão cabine em tempo real.",
              "Emitir anúncios de segurança aos passageiros.",
            ]
          ),
          q(
            "Portas e saídas de emergência devem ser conhecidas pelo comissário para:",
            "Orientar passageiros, verificar bloqueios e conduzir evacuação com segurança.",
            [
              "Calibrar altímetros da cabine de comando.",
              "Definir o plano de voo IFR da tripulação técnica.",
              "Substituir treinamento em primeiros socorros.",
            ]
          ),
          q(
            "As asas de uma aeronave contribuem principalmente para:",
            "Gerar sustentação aerodinâmica necessária ao voo.",
            [
              "Aumentar a pressão interna da cabine de passageiros.",
              "Armazenar oxigênio de máscaras de emergência.",
              "Reduzir o ruído dos motores na cabine de comando.",
            ]
          ),
          q(
            "O trem de pouso da aeronave relaciona-se à operação de cabine porque:",
            "Sua posição afeta procedimentos de decolagem, pouso e evacuação em emergência.",
            [
              "Define o cardápio de serviço de bordo em voo longo.",
              "Substitui a verificação de cintos de segurança.",
              "Elimina a necessidade de briefing de saídas de emergência.",
            ]
          ),
        ],
        "Conhecer a aeronave ajuda o comissário a orientar passageiros e atuar em emergência."
      ),
      topic(
        "Fases de voo",
        "Operação básica de voo",
        [
          q(
            "Decolagem e pouso são fases críticas porque:",
            "Exigem maior atenção, configuração segura de cabine e resposta rápida a anormalidades.",
            [
              "Permitem serviço de bordo com prioridade absoluta sobre segurança.",
              "Exigem saídas de emergência destravadas durante todo o rolamento.",
              "Dispensam cinto de segurança se a pista for longa.",
            ]
          ),
          q(
            "Durante o cruzeiro, a cabine deve permanecer monitorada para:",
            "Detectar anormalidades, necessidades médicas e cumprimento de procedimentos.",
            [
              "Permitir que passageiros fumem em lavabos sem vigilância.",
              "Manter todas as portas abertas para circulação de ar externo.",
              "Ignorar turbulência leve sem anúncio ou cinto.",
            ]
          ),
          q(
            "Em turbulência moderada ou severa, o procedimento de cabine deve priorizar:",
            "Suspender serviço, afivelar cintos e comunicar passageiros conforme instrução.",
            [
              "Continuar serviço de carrinho no corredor para normalidade.",
              "Liberar passageiros para fila de banheiro sem cinto.",
              "Abrir compartimentos superiores para reduzir peso da aeronave.",
            ]
          ),
          q(
            "A aproximação para pouso implica para a tripulação de cabine:",
            "Verificação final de cabine, comunicação de prontidão e posição segura.",
            [
              "Início de desembarque antes do toque na pista.",
              "Abertura de portas para equalizar pressão com solo.",
              "Dispensa de cinto até a aeronave entrar no pátio de estacionamento.",
            ]
          ),
          q(
            "Fases de voo têm procedimentos específicos de cabine porque:",
            "O risco operacional e a capacidade de resposta variam em cada etapa.",
            [
              "O consumo de combustível é idêntico em todas as fases.",
              "A pressurização cabine é irrelevante para comissários.",
              "Emergências médicas só ocorrem em cruzeiro.",
            ]
          ),
        ],
        "Fases de voo têm riscos e procedimentos específicos para a cabine."
      ),
      topic(
        "Meteorologia para cabine",
        "Noções de meteorologia aplicada à cabine",
        [
          q(
            "Turbulência prevista deve ser considerada pela cabine para:",
            "Planejar serviço, circulação, segurança dos passageiros e comunicação adequada.",
            [
              "Alterar a rota da aeronave sem participação da cabine de comando.",
              "Substituir inspeção de equipamentos de emergência.",
              "Garantir que não haverá nenhuma emergência médica a bordo.",
            ]
          ),
          q(
            "Condições meteorológicas adversas no destino podem afetar:",
            "Conforto, atrasos, alternado e procedimentos de pouso com maior atenção.",
            [
              "Apenas a cor da pintura externa da aeronave.",
              "Somente o tipo de certificado do comissário.",
              "Exclusivamente a frequência de entretenimento a bordo.",
            ]
          ),
          q(
            "A orientação de cintos de segurança em turbulência visa:",
            "Reduzir lesões por movimentação violenta de passageiros e objetos soltos.",
            [
              "Aumentar a velocidade da aeronave em relação ao solo.",
              "Substituir a fixação de bagagens nos compartimentos superiores.",
              "Eliminar a necessidade de anúncios de cabine.",
            ]
          ),
          q(
            "Formação de gelo reportada em rota pode implicar para a cabine:",
            "Maior atenção a anormalidades comunicadas pela cabine de comando e possível desvio.",
            [
              "Serviço de bebidas quentes obrigatório em todo o voo.",
              "Abertura de saídas para reduzir peso da aeronave.",
              "Dispensa de verificação de cabine em fases críticas.",
            ]
          ),
          q(
            "O comissário utiliza informações meteorológicas principalmente para:",
            "Preparar a cabine, prevenir lesões e alinhar expectativas de serviço e segurança.",
            [
              "Calcular combustível da aeronave sem apoio técnico.",
              "Emitir NOTAM oficiais ao órgão de controle.",
              "Substituir o briefing de tripulação de cabine.",
            ]
          ),
        ],
        "Comissários usam meteorologia para preparar a cabine e prevenir lesões."
      ),
      topic(
        "Comunicação a bordo",
        "Comunicação operacional e atendimento",
        [
          q(
            "Os anúncios de segurança a bordo devem ser:",
            "Claros, objetivos, calmos e adequados ao procedimento e à fase de voo.",
            [
              "Ambíguos para evitar que passageiros compreendam demais.",
              "Longos e excessivamente técnicos em todas as fases, inclusive emergência.",
              "Baseados exclusivamente em rumores entre passageiros.",
            ]
          ),
          q(
            "A comunicação com passageiros em situação anormal deve buscar:",
            "Informar o necessário, reduzir pânico e reforçar cumprimento de instruções.",
            [
              "Detalhar especulações sobre causas sem confirmação da tripulação.",
              "Minimizar qualquer instrução para não alarmar, mesmo em evacuação.",
              "Prometer horário exato de pouso sem dados da cabine de comando.",
            ]
          ),
          q(
            "A informação repassada à cabine de comando deve ser:",
            "Objetiva, verificável e limitada aos fatos observados ou relatados com consistência.",
            [
              "Exclusivamente opinião pessoal do comissário sobre culpados.",
              "Transmitida somente após resolução completa do evento em solo.",
              "Substituída por mensagens de passageiros nas redes sociais.",
            ]
          ),
          q(
            "Comunicação bilíngue em voos internacionais contribui para:",
            "Maior compreensão de instruções de segurança e emergência pelos passageiros.",
            [
              "Eliminar a necessidade de demonstração de cinto e máscara.",
              "Substituir procedimentos escritos do manual de operações.",
              "Dispensar briefing pré-voo da tripulação de cabine.",
            ]
          ),
          q(
            "Comunicação clara em cabine reduz principalmente:",
            "Pânico, desobediência a procedimentos e atraso em respostas coordenadas.",
            [
              "O consumo de combustível em cruzeiro.",
              "A necessidade de treinamento em sobrevivência no mar.",
              "A pressão diferencial da cabine em altitude.",
            ]
          ),
        ],
        "Comunicação clara reduz pânico, melhora cumprimento de instruções e apoia a operação."
      ),
    ],
  },
];
