var spinsLeft = 3; // Número máximo de giros permitidos
var maxSpins = 3;  // Número máximo de giros permitidos para reinício
var isSpinning = false; // Controle para saber se a roleta está girando

// Probabilidades de cada item cair (em porcentagem)
var probabilities = {
    "#musica": 0,
    "#game": 0,
    "#desafio": 25,
    "#to": 0,
    "#exercicio": 0,
    "#surpresa": 25,
    "#piada": 0,
    "#KO": 25,
    "#karaoke": 0,
    "#extra": 25
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
    var random = Math.random() * 100; // Gera um número aleatório entre 0 e 100
    var cumulative = 0;
    for (var href in probabilities) {
        cumulative += probabilities[href];
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
    if (isSpinning) return; // Impede múltiplos giros simultaneamente

    if (spinsLeft <= 0) {
        openModal('#extra');
        return;
    }

    var chosenItem = chooseItem(); // Escolhe um item com base nas probabilidades
    var rotation = calculateRotation(chosenItem); // Calcula a rotação necessária

    var duration = 5000; // Duração padrão de 5 segundos para todos os itens

    if (chosenItem === "#KO" || chosenItem === "#extra") {
        duration = 3000; // Duração mais curta para #KO e #extra
        rotation += 360 * 2; // Adiciona mais voltas para o giro rápido
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
}

function handleAfterSpinComplete(chosenItem) {
    if (chosenItem === "#desafio" || chosenItem === "#surpresa") {
        $(".skills-wheel .btn").addClass('disabled'); // Bloqueia o botão
    }

    var targetHref = itemHrefMap[chosenItem];
    openModal(targetHref, function () {
        handleAfterModalClose(chosenItem);
    });
}

function openModal(href, afterCloseCallback) {
    if (!href || $(href).length === 0) return; // Evita abrir modais com href inválido ou inexistente

    $.fancybox.close(); // Fecha qualquer modal aberto antes de abrir o próximo
    $.fancybox.open({
        src: href,
        type: 'inline',
        opts: {
            animationEffect: "zoom",
            maxWidth: "85%",
            afterClose: afterCloseCallback
        }
    });
}

function handleAfterModalClose(chosenItem) {
    if (chosenItem === "#desafio") {
        openModal('#modal-premio', function () {
            isSpinning = false; // Permite um novo giro
        });
    } else if (chosenItem === "#surpresa") {
        spinsLeft = maxSpins; // Reseta o contador de giros
        isSpinning = false; // Permite um novo giro
    } else if (chosenItem === "#KO" || chosenItem === "#extra") {
        spinsLeft++; // Devolve o giro usado
        isSpinning = false; // Permite um novo giro
    } else {
        $(".skills-wheel .btn").removeClass('disabled'); // Reativa o botão para outros casos
        isSpinning = false; // Permite um novo giro
    }
}

$(document).ready(function () {
    $(".skills-wheel .btn").on("click", function () {
        if (!$(this).hasClass('disabled')) { // Verifica se o botão está desativado
            spinWheel(); // Inicia o giro ao clicar no botão
        }
        return false;
    });

    // Initialize fancybox
    $(".fancybox").fancybox({
        maxWidth: "85%"
    });
});


