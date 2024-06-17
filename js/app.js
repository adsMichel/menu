$(document).ready(function () {
    cardapio.eventos.init();
})

var cardapio = {};

var MEU_CARRINHO = [];
var MEU_ENDERECO = null;

var VALOR_CARRINHO = 0;
var VALOR_ENTREGA = 5;

var CELULAR_EMPRESA = '5561998860874';

cardapio.eventos = {
    init: () => {
        cardapio.metodos.obterItensCardapio();
        cardapio.metodos.carregarBotaoReserva();
        cardapio.metodos.carregarBotaoLigar();
    }
}

cardapio.metodos = {
    // obter a lista de itens do cardapio
    obterItensCardapio: (categoria = 'burgers', vermais = false) => {
        var filtro = MENU[categoria];
        console.log(filtro);

        if(!vermais) {
            $("#itemsCardapio").html('') //limpa a lista de produtos
            $('#btnVerMais').removeClass('hidden');
        }


        $.each(filtro, (i, e) => {
            let temp = cardapio.templates.item.replace(/\${img}/g, e.img)
            .replace(/\${nome}/g, e.name)
            .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
            .replace(/\${id}/g, e.id);//regex filtrar coisas dentro de texto

            //botao vermais foi clicado (12 itens)
            if (vermais && i >= 8 && i < 12) {
                $("#itemsCardapio").append(temp)
            }
            
            //paginacao inicial
            if (!vermais && i < 8) {
                $("#itemsCardapio").append(temp)
            }

        })

        // remove o ativo
        $('.container-menu a').removeClass('active');

        //adiciona classe para o menu atual
        $('#menu-' + categoria).addClass('active');
    },
    //clique no botao vermais
    verMais: () => {
        var ativo = $(".container-menu a.active").attr('id').split('menu-')[1]; //menu-burgers
        cardapio.metodos.obterItensCardapio(ativo, true);

        $('#btnVerMais').addClass('hidden');
    },

    // diminuir a quantidade de itens no cardapio
    diminuirQuantidade: (id) => {
        let qntdAtual = parseInt($("#qntd-" + id).text());

        if(qntdAtual > 0) {
            $("#qntd-" + id).text(qntdAtual - 1)
        }
    },

    // aumentar a quantidade de itens no cardapio
    aumentarQuantidade: (id) => {
        let qntdAtual = parseInt($("#qntd-" + id).text());

        $("#qntd-" + id).text(qntdAtual + 1)
    },

    adicionarAoCarrinho: (id) => {
        let qntdAtual = parseInt($("#qntd-" + id).text());

        if(qntdAtual > 0) {
            // obter a categoria ativa
            var categoria = $(".container-menu a.active").attr('id').split('menu-')[1];

            //obter a lista de itens
            let filtro = MENU[categoria];

            //obter o item
            let item = $.grep(filtro, (e, i) => {return e.id == id});

            if (item.length > 0) {
                // validar se ja existe o item no carrinho
                let existe = $.grep(MEU_CARRINHO, (elem, index) => {return elem.id == id});

                // caso ja exista o item, so altera a quantidade
                if (existe.length > 0) {
                    let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
                    MEU_CARRINHO[objIndex].qntd = MEU_CARRINHO[objIndex].qntd + qntdAtual;
                }else {
                    item[0].qntd = qntdAtual;
                    MEU_CARRINHO.push(item[0]);
                }
                
                cardapio.metodos.mensagem('Item adicionado ao carrinho', 'green');
                $("#qntd-" + id).text(0);

                cardapio.metodos.atualizarBadgeTotal();

            }
        }
    },

    // atualizar badge
    atualizarBadgeTotal: () => {
        var total = 0;

        $.each(MEU_CARRINHO, (i, e) => {
            total += e.qntd
        })

        if (total > 0) {
            $(".botao-carrinho").removeClass('hidden');
            $(".container-total-carrinho").removeClass('hidden');
        } else {
            $(".botao-carrinho").addClass('hidden');
            $(".container-total-carrinho").addClass('hidden')
        }

        $(".badge-total-carrinho").html(total);

    },

    // abrir a modal do carrinho
    abrirCarrinho: (abrir) => {
        if (abrir) {
            $("#modalCarrinho").removeClass('hidden');
            cardapio.metodos.carregarCarrinho();
        } else {
            $("#modalCarrinho").addClass('hidden');
        }
    },

    // altera os textos e exibe botoes das etapas

    carregarEtapa: (etapa) => {
        if (etapa == 1) {
            $("#lblTituloEtapa").text('Seu Carrinho:');
            $("#itensCarrinho").removeClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            
            $("#btnEtapaPedido").removeClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").addClass('hidden');
        }

        if (etapa == 2) {
            $("#lblTituloEtapa").text('Endereço de entrega:');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").removeClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
            
            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").removeClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }

        if (etapa == 3) {
            $("#lblTituloEtapa").text('Resumo do pedido:');
            $("#itensCarrinho").addClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").removeClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
            $(".etapa3").addClass('active');
            
            $("#btnEtapaPedido").addClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").removeClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }
    },

    // voltar etapa
    voltarEtapa: () => {
        let etapa = $(".etapa.active").length;
        cardapio.metodos.carregarEtapa(etapa - 1)
    },

    // carrega a lista de itens do carrinho
    carregarCarrinho: () => {

        cardapio.metodos.carregarEtapa(1);

        if (MEU_CARRINHO.length > 0) {

            $("#itensCarrinho").html('');

            $.each(MEU_CARRINHO, (i, e) => {
                let temp = cardapio.templates.itemCarrinho.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${id}/g, e.id) //regex filtrar coisas dentro de texto
                .replace(/\${qntd}/g, e.qntd) //regex filtrar coisas dentro de texto

                $("#itensCarrinho").append(temp);

                // ultimo item do carrinho

                if ((i + 1) == MEU_CARRINHO.length){

                    cardapio.metodos.carregarValores();
                }
            })
        }
        else {
            $("#itensCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu carrinho está vazio.</p>');
            cardapio.metodos.carregarValores();
        }

    },

    diminuirQuantidadeCarrinho: (id) => {
        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
        
        if(qntdAtual > 1) {
            $("#qntd-carrinho-" + id).text(qntdAtual - 1);
            cardapio.metodos.atualizarCarrinho(id, qntdAtual - 1);
        }
        else {
            cardapio.metodos.removerItemCarrinho(id);
        }
    },
    
    aumentarQuantidadeCarrinho: (id) => {
        let qntdAtual = parseInt($("#qntd-carrinho-" + id).text());
        
        $("#qntd-carrinho-" + id).text(qntdAtual + 1);
        cardapio.metodos.atualizarCarrinho(id, qntdAtual + 1);

    },

    // remove itens do carrinho
    removerItemCarrinho: (id) => {
        MEU_CARRINHO = $.grep(MEU_CARRINHO, (e, i) => {return e.id != id});
        cardapio.metodos.carregarCarrinho();
        cardapio.metodos.atualizarBadgeTotal();
    },

    // atualiza o carrinho com a qntd atual
    atualizarCarrinho: (id, qntd) => {
        let objIndex = MEU_CARRINHO.findIndex((obj => obj.id == id));
        MEU_CARRINHO[objIndex].qntd = qntd;

        cardapio.metodos.atualizarBadgeTotal();

        // atualiza os valores totais do carrinho
        cardapio.metodos.carregarValores();

    },

    // carrega os valores de subtotal, entrega e total

    carregarValores: () => {
        VALOR_CARRINHO = 0;

        $("#lblSubTotal").text('R$ 0,00');
        $("#lblValorEntrega").text('+ R$ 0,00');
        $("#lblValorTotal").text('R$ 0,00');
        
        $.each(MEU_CARRINHO, (i, e) => {
            
            VALOR_CARRINHO += parseFloat(e.price * e.qntd);
            
            if ((i + 1) == MEU_CARRINHO.length) {
                
                $("#lblSubTotal").text(`R$ ${VALOR_CARRINHO.toFixed(2).replace('.', ',')}`);
                $("#lblValorEntrega").text(`+ R$ ${VALOR_ENTREGA.toFixed(2).replace('.', ',')}`);
                $("#lblValorTotal").text(`R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}`);
                
            }
        })
    },

    // valida se existe algum pedido
    carregarEndereco: () => {

        if (MEU_CARRINHO.length <= 0) {
            cardapio.metodos.mensagem('Seu carrinho está vazio.')
            return;
        }

        cardapio.metodos.carregarEtapa(2);
    },

    // validacao pedido antes da etapa 3
    resumoPedido: () => {
        let cep = $("#txtCep").val().trim().replace(/\D/g, ''); // trocar para telefone
        let endereco = $("#txtEndereco").val().trim();

        if (cep != "") {

            console.log("Deu certo");
            
        } else {
            cardapio.metodos.mensagem("Digite seu telefone, por favor.");
            $("#txtCep").focus();
        }

        if (cep.length <= 0) {
            cardapio.metodos.mensagem('Informe o CEP, por favor.');
            $("#txtCep").focus();
            return;
        }

        if (endereco.length <= 0) {
            cardapio.metodos.mensagem('Informe o endereço, por favor.');
            $("#txtEndereco").focus();
            return;
        }

        MEU_ENDERECO = {
            cep: cep,
            endereco: endereco
        }

        cardapio.metodos.carregarEtapa(3);
        cardapio.metodos.carregarResumo();

    },

    // carrega a etapa de resumo do pedido
    carregarResumo: () => {

        $("#listaItensResumo").html("");

        $.each(MEU_CARRINHO, (i, e) => {

            let temp = cardapio.templates.itemResumo.replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${qntd}/g, e.qntd) //regex filtrar coisas dentro de texto

            $("#listaItensResumo").append(temp);

        })

        $("#resumoEndereco").html(`${MEU_ENDERECO.cep}`);
        $("#cidadeEndereco").html(`${MEU_ENDERECO.endereco}`);

        cardapio.metodos.finalizarPedido();

    },

    // atualiza o link do botão do Whatsapp
    finalizarPedido: () => {
        if (MEU_CARRINHO.length > 0 && MEU_ENDERECO != null) {

            var texto = "Olá gostaria de fazer um pedido:";
            texto += `\n*Itens do pedido:*\n\n\${itens}`;
            texto += `\n*Endereço de entrega:*`;
            texto += `\n${MEU_ENDERECO.cep}, ${MEU_ENDERECO.endereco}`;
            texto += `\n\n*Total (com entrega): R$ ${(VALOR_CARRINHO + VALOR_ENTREGA).toFixed(2).replace('.', ',')}*`;

            var itens = ""

            $.each(MEU_CARRINHO, (i, e) => {
                itens += `*${e.qntd}x* ${e.name} ....... R$ ${e.price.toFixed(2).replace('.', ',')}\n`;

                if ((i + 1) == MEU_CARRINHO.length) {

                    texto = texto.replace(/\${itens}/g, itens);

                    // converte a url

                    let encode = encodeURI(texto);
                    let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;
                    
                    $("#btnEtapaResumo").attr('href', URL);
                    
                }
            })
        }
    },
    
    carregarBotaoReserva: () => {
        
        var texto = "Olá! Gostaria de fazer uma *reserva*.";
        
        let encode = encodeURI(texto);
        let URL = `https://wa.me/${CELULAR_EMPRESA}?text=${encode}`;

        $("#btnReserva").attr('href', URL);
    },

    carregarBotaoLigar: () => {
        
        $("#btnLigar").attr('href', `tel:${CELULAR_EMPRESA}`);

    },

    // metodo que abre os depoimentos
    abrirDepoimento: (depoimento) => {

        $("#depoimento-1").addClass('hidden');
        $("#depoimento-2").addClass('hidden');
        $("#depoimento-3").addClass('hidden');
        
        $("#btnDepoimentos-1").removeClass('active');
        $("#btnDepoimentos-2").removeClass('active');
        $("#btnDepoimentos-3").removeClass('active');
        
        $("#depoimento-" + depoimento).removeClass('hidden');
        $("#btnDepoimentos-" + depoimento).addClass('active');

    },

    mensagem: (texto, cor = 'red', tempo = 2000) => {
        
        let id = Math.floor(Date.now() * Math.random()).toString();
        let msg = `<div class="animated fadeInDown toast ${cor}" id="msg-${id}">${texto}</div>`;
        
        $("#container-mensagens").append(msg);

        setTimeout(() => {
            $("#msg-" + id).removeClass('fadeinDown');
            $("#msg-" + id).addClass('fadeOutUp');
            setTimeout(() => {
                $("#msg-" + id).remove();
            }, 800);
        }, tempo)
    }
}

cardapio.templates = {
    item: `
        <div class="col-12 col-lg-3 col-md-3 col-sm-6 mb-5 animated fadeInUp">
            <div class="card card-item" id="\${id}">
                <div class="img-produto">
                    <img src="\${img}" />
                </div>
                <p class="title-produto text-center mt-4">
                    <b>\${nome}</b>
                </p>
                <p class="price-produto text-center">
                    <b>R$ \${preco}</b>
                </p>
                <div class="add-carrinho">
                    <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                    <span class="add-numero-itens" id="qntd-\${id}">0</span>
                    <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                    <span class="btn btn-add" onclick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fas fa-shopping-bag"></i></span>
                </div>
            </div>
        </div>
    `,

    itemCarrinho: `
        <div class="col-12 item-carrinho">
            <div class="img-produto">
                <img src="\${img}" />
            </div>
            <div class="dados-produto">
                <p class="title-produto"><b>\${nome}</b></p>
                <p class="price-produto"><b>R$ \${preco}</b></p>
            </div>
            <div class="add-carrinho">
                <span class="btn-menos" onclick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                <span class="add-numero-itens" id="qntd-carrinho-\${id}">\${qntd}</span>
                <span class="btn-mais" onclick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-remove no-mobile" onclick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
            </div>
        </div>
    `,

    itemResumo: `
    <div class="col-12 item-carrinho resumo">
        <div class="img-produto-resumo">
            <img src="\${img}">
        </div>
        <div class="dados-produto">
            <p class="title-produto-resumo">
                <b>\${nome}</b>
            </p>
            <p class="price-produto-resumo">
                <b>R$ \${preco}</b>
            </p>
        </div>
        <p class="quantidade-produto-resumo">
            x <b>\${qntd}</b>
        </p>
    </div>
`
}