// 1. DADOS
let transacoes = [];

// NOVA LISTA DE ÍCONES (Usando Boxicons - Estilo Outline)
const categoriasConfig = {
    'transporte': { nome: 'Transporte', icone: 'bx bx-car' },
    'saude': { nome: 'Saúde', icone: 'bx bx-pulse' },
    'mercado': { nome: 'Mercado', icone: 'bx bx-cart' },
    'fastfood': { nome: 'Fast Food', icone: 'bx bx-coffee' },
    'assinaturas': { nome: 'Assinaturas', icone: 'bx bx-play-circle' },
    'moradia': { nome: 'Moradia', icone: 'bx bx-home-alt' },
    'vestuario': { nome: 'Vestuário', icone: 'bx bx-shopping-bag' },
    'casa': { nome: 'Casa', icone: 'bx bx-chair' },
    'beleza': { nome: 'Beleza', icone: 'bx bx-star' },
    'educacao': { nome: 'Educação', icone: 'bx bx-book-open' },
    'outros': { nome: 'Outros', icone: 'bx bx-dots-horizontal-rounded' }
};

// 2. FUNÇÃO PRINCIPAL
function atualizarDashboard() {
    let totalEntradas = 0;
    let totalSaidas = 0;

    transacoes.forEach(transacao => {
        if (transacao.tipo === 'entrada') {
            totalEntradas += transacao.valor;
        } else {
            totalSaidas += transacao.valor;
        }
    });

    const saldo = totalEntradas - totalSaidas;

    document.getElementById('valor-gasto').innerText = totalSaidas.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('valor-saldo').innerText = saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    verificarSaudeFinanceira(totalEntradas, totalSaidas);
    atualizarPainelCategorias(totalEntradas);
    atualizarExtrato();
}

// 3. NAVEGAÇÃO ENTRE TELAS
function abrirPainel() {
    document.getElementById('tela-categorias').style.display = 'block';
}

function fecharPainel() {
    document.getElementById('tela-categorias').style.display = 'none';
}

// 4. LÓGICA DO ALERTA
function verificarSaudeFinanceira(entradas, saidas) {
    const elementoTexto = document.getElementById('texto-situacao');
    const elementoCaixa = document.getElementById('status-box');
    
    if (entradas === 0) {
        elementoTexto.innerText = "Calculando...";
        elementoCaixa.style.backgroundColor = "#413c96";
        return;
    }

    const percentualGasto = (saidas / entradas) * 100;

    elementoCaixa.style.backgroundColor = ""; 
    elementoCaixa.style.border = "";

    if (percentualGasto >= 85) {
        elementoTexto.innerText = "CRÍTICA ⚠️ (" + percentualGasto.toFixed(0) + "%)";
        elementoCaixa.style.backgroundColor = "#ff4757"; 
        elementoCaixa.style.border = "2px solid white";
    } else if (percentualGasto >= 50) {
        elementoTexto.innerText = "Moderada (" + percentualGasto.toFixed(0) + "%)";
        elementoCaixa.style.backgroundColor = "#ffa502"; 
    } else {
        elementoTexto.innerText = "Ótima (" + percentualGasto.toFixed(0) + "%)";
        elementoCaixa.style.backgroundColor = "#413c96"; 
    }
}

// 5. MODAL
const modal = document.getElementById('modal-transacao');

function abrirModal(tipoPreSelecionado = 'saida') {
    modal.style.display = 'flex';
    const radio = document.querySelector(`input[value="${tipoPreSelecionado}"]`);
    if(radio) radio.checked = true;
    verificarTipoTransacao();
    document.getElementById('input-descricao').focus();
}

function fecharModal() {
    modal.style.display = 'none';
    document.getElementById('input-descricao').value = '';
    document.getElementById('input-valor').value = '';
}

function verificarTipoTransacao() {
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    const campoCategoria = document.getElementById('input-categoria').closest('.input-group');
    if (tipo === 'entrada') {
        campoCategoria.style.display = 'none';
    } else {
        campoCategoria.style.display = 'block';
    }
}

function salvarTransacao(event) {
    event.preventDefault();
    const descricao = document.getElementById('input-descricao').value;
    const valor = parseFloat(document.getElementById('input-valor').value);
    const tipo = document.querySelector('input[name="tipo"]:checked').value;
    const categoria = document.getElementById('input-categoria').value;

    if (descricao && valor) {
        transacoes.push({
            id: Date.now(),
            descricao: descricao,
            valor: valor,
            tipo: tipo,
            categoria: categoria
        });
        atualizarDashboard();
        fecharModal();
    }
}

// 6. PAINEL DE CATEGORIAS
function atualizarPainelCategorias(totalEntradas) {
    const container = document.getElementById('lista-categorias-conteudo');
    container.innerHTML = ''; 

    let gastosPorCategoria = {};
    Object.keys(categoriasConfig).forEach(key => gastosPorCategoria[key] = 0);

    transacoes.forEach(t => {
        if (t.tipo === 'saida') {
            const cat = categoriasConfig[t.categoria] ? t.categoria : 'outros';
            gastosPorCategoria[cat] += t.valor;
        }
    });

    Object.keys(gastosPorCategoria).forEach(catKey => {
        const valorGasto = gastosPorCategoria[catKey];
        if(valorGasto > 0) {
            const config = categoriasConfig[catKey];
            let porcentagem = totalEntradas > 0 ? (valorGasto / totalEntradas) * 100 : 0;
            let larguraBarra = porcentagem > 100 ? 100 : porcentagem;

            const html = `
                <div class="categoria-item">
                    <div class="cat-info">
                        <span><i class="${config.icone}"></i> ${config.nome}</span>
                        <span>
                            ${valorGasto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                            <small style="opacity:0.7">(${porcentagem.toFixed(1)}%)</small>
                        </span>
                    </div>
                    <div class="barra-fundo">
                        <div class="barra-progresso" style="width: ${larguraBarra}%"></div>
                    </div>
                </div>
            `;
            container.innerHTML += html;
        }
    });
}

// 7. EXTRATO
function atualizarExtrato() {
    const lista = document.getElementById('lista-transacoes');
    lista.innerHTML = '';

    if (transacoes.length === 0) {
        lista.innerHTML = '<p style="text-align:center; opacity:0.5; font-size:0.9rem; margin-top:20px;">Nenhuma movimentação ainda.</p>';
        return;
    }

    const transacoesInvertidas = transacoes.slice().reverse();

    transacoesInvertidas.forEach(item => {
        const data = new Date(item.id);
        const dataFormatada = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        
        const classeTipo = item.tipo === 'entrada' ? 'entrada' : 'saida';
        const simbolo = item.tipo === 'entrada' ? '+' : '-';
        
        let nomeCategoriaExibicao = 'Geral';
        let iconeExibicao = '';

        // Lógica simples para definir ícone
        if (item.tipo === 'entrada') {
            nomeCategoriaExibicao = 'Entrada';
            iconeExibicao = '<i class="bx bx-down-arrow-circle"></i>'; // Ícone de entrada
        } else if (item.categoria && categoriasConfig[item.categoria]) {
            nomeCategoriaExibicao = categoriasConfig[item.categoria].nome;
            iconeExibicao = `<i class="${categoriasConfig[item.categoria].icone}"></i>`;
        }

        const html = `
            <div class="transacao-item ${classeTipo}">
                <div class="transacao-info">
                    <h4>${item.descricao}</h4>
                    <span>${dataFormatada} • ${iconeExibicao} ${nomeCategoriaExibicao}</span>
                </div>
                <div style="display:flex; align-items:center;">
                    <span class="transacao-valor">
                        ${simbolo} R$ ${item.valor.toFixed(2)}
                    </span>
                    <button class="btn-delete" onclick="removerTransacao(${item.id})">×</button>
                </div>
            </div>
        `;
        lista.innerHTML += html;
    });
}

atualizarDashboard();