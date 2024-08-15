var spinsLeft = 3; // Número máximo de giros permitidos
var isSpinning = false; // Controle para saber se a roleta está girando
var lastItem = null; // Rastreia o último item sorteado
var isButtonBlocked = false; // Controle para saber se o botão está bloqueado

// Probabilidades de cada item cair (em porcentagem)
var probabilities = {
    "#musica": 0,
    "#game": 0,
    "#desafio": 25,
    "#to": 0,
    "#exercicio": 0,
    "#surpresa": 40,
    "#piada": 0,
    "#KO": 34,
    "#karaoke": 0,
    "#extra": 1
};

// Mapeamento de hrefs para itens
var itemHrefMap = {
    "#musica": "#musica",
    "#game": "#game",
    "#desafio": "#desafio",
    "#to": "#to",
    "#exercicio": "#exercicio",
    "#surpresa": "#surpresa",
    "#piada": "#piada",
    "#KO": "#KO",
    "#karaoke": "#karaoke",
    "#extra": "#extra"
};

// Função para escolher um item com base nas probabilidades
function chooseItem() {
    var adjustedProbabilities = { ...probabilities };

    // Ajusta as probabilidades se o último item foi #KO
    if (lastItem === "#KO") {
        adjustedProbabilities["#extra"] = 0; // Remove a possibilidade de #extra
    }

    // Ajusta as probabilidades se o último item foi #extra
    if (lastItem === "#extra") {
        adjustedProbabilities["#KO"] = 0; // Remove a possibilidade de #KO
    }

    var random = Math.random() * 100; // Gera um número aleatório entre 0 e 100
    var cumulative = 0;
    for (var href in adjustedProbabilities) {
        cumulative += adjustedProbabilities[href];
        if (random < cumulative) {
            return href;
        }
    }
}

// Função para calcular o ângulo de rotação baseado no item escolhido
function calculateRotation(chosenItem) {
    var sectionCount = 10; // Número total de seções na roleta
    var anglePerItem = 360 / sectionCount;
    var itemIndex = Object.keys(itemHrefMap).indexOf(chosenItem);
    var itemAngle = itemIndex * anglePerItem;

    // Gira a roleta para garantir que o item caia na frente
    return itemAngle + (360 * 5); // Gira pelo menos 5 voltas completas
}

function spinWheel() {
    if (isSpinning || isButtonBlocked) return; // Impede múltiplos giros simultaneamente e verifica se o botão está bloqueado

    if (spinsLeft <= 0) {
        openModal('#extra');
        return;
    }

    var chosenItem = chooseItem(); // Escolhe um item com base nas probabilidades
    var rotation = calculateRotation(chosenItem); // Calcula a rotação necessária

    var duration = 5000; // Duração padrão de 5 segundos para todos os itens

    if (chosenItem === "#KO" || chosenItem === "#extra") {
        duration = 6000; // Duração mais longa para #KO e #extra
        rotation += 360 * 4; // Adiciona mais voltas para o giro rápido
    }

    isSpinning = true; // Marca como girando

    $(".skills-wheel .wheel").velocity({
        rotateZ: "-" + rotation + "deg" // Aplica a rotação
    }, {
        duration: duration, // Ajusta a duração conforme o item
        easing: "easeInOutQuad", // Suavização da rotação
        complete: function () {
            handleAfterSpinComplete(chosenItem);
        }
    });

    lastItem = chosenItem; // Atualiza o último item sorteado

    // Desativa o botão imediatamente após o início do giro
    $(".skills-wheel .btn").addClass('disabled');
}

function handleAfterSpinComplete(chosenItem) {
    console.log('Spin complete, item:', chosenItem);

    // Garantia de que spinsLeft não fique abaixo de zero
    if (spinsLeft < 0) spinsLeft = 0;

    if (chosenItem === "#KO" || chosenItem === "#extra") {
        // Adiciona um giro extra se o item anterior foi #KO e o item atual é #extra ou vice-versa
        if ((lastItem === "#KO" && chosenItem === "#extra") || (lastItem === "#extra" && chosenItem === "#KO")) {
            spinsLeft++; // Devolve o giro usado
        }

        // Não decrementa giros restantes se o item for #extra
        if (chosenItem !== "#extra") {
            spinsLeft--;
        }
    } else if (chosenItem === "#desafio" || chosenItem === "#surpresa") {
        // Bloqueia o botão e abre o modal
        isButtonBlocked = true;
        openModal(itemHrefMap[chosenItem], function () {
            isButtonBlocked = false; // Permite um novo giro após o fechamento do modal
            // Reativa o botão após o fechamento do modal
            $(".skills-wheel .btn").removeClass('disabled');
        });
        return; // Não desbloqueia o botão aqui, pois será feito no fechamento do modal
    }

    // Sempre remove a classe 'disabled' quando o giro é completado, exceto se for #desafio ou #surpresa
    if (chosenItem !== "#desafio" && chosenItem !== "#surpresa") {
        $(".skills-wheel .btn").removeClass('disabled');
    }
    isSpinning = false;

    // Bloqueia o botão imediatamente após o término do giro
    $(".skills-wheel .btn").addClass('disabled');
    isButtonBlocked = true;

    // Reativa o botão após 2 segundos
    setTimeout(function () {
        $(".skills-wheel .btn").removeClass('disabled');
        isButtonBlocked = false;
    }, 1000); // Reativa o botão após 2 segundos
}


function openModal(href, afterCloseCallback) {
    if (!href || $(href).length === 0) return; // Evita abrir modais com href inválido ou inexistente

    $.fancybox.close(); // Fecha qualquer modal aberto antes de abrir o próximo

    try {
        $.fancybox.open({
            src: href,
            type: 'inline',
            opts: {
                animationEffect: "zoom",
                maxWidth: "85%",
                afterClose: afterCloseCallback
            }
        });
    } catch (error) {
        console.error('Error opening modal:', error);
        // Garantir que o botão não fique bloqueado caso haja erro na abertura do modal
        isButtonBlocked = false;
        $(".skills-wheel .btn").removeClass('disabled');
    }
}

$(document).ready(function () {
    $(".skills-wheel .btn").on("click", function () {
        if (!$(this).hasClass('disabled') && !isButtonBlocked) { // Verifica se o botão está desativado e bloqueado
            console.log('Button clicked, spinning wheel...');
            spinWheel(); // Inicia o giro ao clicar no botão
        }
        return false;
    });

    // Event handler para redirecionamento manual
    $(".skills-wheel .btn-redirect").on("click", function () {
        handleRedirect();
        return false;
    });

    // Initialize fancybox
    $(".fancybox").fancybox({
        maxWidth: "85%"
    });
});
