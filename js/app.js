$(document).ready(function () {
    cardapio.eventos.init();
})

var cardapio = {};

var MEU_CARRINHO = [];

cardapio.eventos = {
    init: () => {
        cardapio.metodos.obterItensCardapio();
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

    // diminuir a quantidade de itens no cardapio
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

                $("#qntd-" + id).text(0);

            }
        }
    }
}

cardapio.templates = {
    item: `
        <div class="col-3 mb-3">
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
    `
}