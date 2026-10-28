const listaDeProdutos = [];

let indiceEdicao = null;

class Produto {
    #preco;
    #quantidade;

    constructor(nome, preco, quantidade) {
        if (!nome || nome.trim() === "") {
            throw new Error("O nome do produto não pode estar vazio.");
        }
        if (!Number.isFinite(preco) || preco <= 0) {
            throw new Error("O preço do produto deve ser maior que zero (R$ 0.00).");
        }
        if (!Number.isInteger(quantidade) || quantidade <= 0) {
            throw new Error("A quantidade de itens deve ser um número inteiro maior que zero.");
        }

        this.nome = nome.trim();
        this.#preco = preco;
        this.#quantidade = quantidade;
    }

    get preco() {
        return this.#preco;
    }

    get quantidade() {
        return this.#quantidade;
    }

    get subtotal() {
        return this.#preco * this.#quantidade;
    }
}

const form = document.getElementById("produto-form");
const tabelaCorpo = document.querySelector("#tabela-produtos tbody");
const botaoSubmit = form.querySelector("button[type='submit']");
const inputNome = document.getElementById("nome");
const inputPreco = document.getElementById("preco");
const inputQuantidade = document.getElementById("quantidade");

function escaparHTML(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
}

const formatarMoeda = (valor) =>
    valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function atualizarTotalEstoque() {
    const valorTotal = listaDeProdutos.reduce(
        (acumulador, produto) => acumulador + produto.subtotal,
        0
    );

    document.getElementById("total-estoque").innerText = formatarMoeda(valorTotal);
}

function renderizarTabela() {
    tabelaCorpo.innerHTML = "";

    if (listaDeProdutos.length === 0) {
        tabelaCorpo.innerHTML = `
            <tr>
                <td colspan="5" class="vazio">
                    Nenhum produto cadastrado. Preencha o formulário acima para adicionar o primeiro.
                </td>
            </tr>
        `;
        atualizarTotalEstoque();
        return;
    }

    listaDeProdutos.forEach((produto, index) => {
        const linha = document.createElement("tr");

        if (index === indiceEdicao) {
            linha.classList.add("em-edicao");
        }

        linha.innerHTML = `
            <td>${escaparHTML(produto.nome)}</td>
            <td>${formatarMoeda(produto.preco)}</td>
            <td>${produto.quantidade}</td>
            <td>${formatarMoeda(produto.subtotal)}</td>
            <td>
                <button class="btn-editar" onclick="prepararEdicao(${index})">Editar</button>
                <button class="btn-remover" onclick="removerProduto(${index})">Remover</button>
            </td>
        `;

        tabelaCorpo.appendChild(linha);
    });

    atualizarTotalEstoque();
}

function resetarEstado() {
    indiceEdicao = null;
    botaoSubmit.textContent = "Adicionar Produto";
    form.classList.remove("editando");
    form.reset();
}

function prepararEdicao(index) {
    const produto = listaDeProdutos[index];

    inputNome.value = produto.nome;
    inputPreco.value = produto.preco;
    inputQuantidade.value = produto.quantidade;

    indiceEdicao = index;
    botaoSubmit.textContent = "Salvar Alterações";
    form.classList.add("editando");
    renderizarTabela();
    inputNome.focus();
}

function removerProduto(index) {
    listaDeProdutos.splice(index, 1);

    if (indiceEdicao !== null) {
        if (indiceEdicao === index) {
            resetarEstado();
        } else if (indiceEdicao > index) {
            indiceEdicao--;
        }
    }

    renderizarTabela();
}

document.getElementById("limpar-tabela").addEventListener("click", () => {
    listaDeProdutos.length = 0;
    resetarEstado();
    renderizarTabela();
});

form.addEventListener("submit", (event) => {
    event.preventDefault();

    const nome = inputNome.value.trim();
    const preco = parseFloat(inputPreco.value);
    const quantidade = parseInt(inputQuantidade.value, 10);

    if (nome === "") {
        alert("O nome do produto não pode estar vazio.");
        return;
    }
    if (isNaN(preco) || preco <= 0) {
        alert("O preço deve ser um número maior que zero.");
        return;
    }
    if (isNaN(quantidade) || quantidade <= 0) {
        alert("A quantidade deve ser um número maior que zero.");
        return;
    }

    try {
        const novoProduto = new Produto(nome, preco, quantidade);

        if (indiceEdicao === null) {
            listaDeProdutos.push(novoProduto);
        } else {
            listaDeProdutos[indiceEdicao] = novoProduto;
        }

        resetarEstado();
        renderizarTabela();

    } catch (error) {
        alert(error.message);
    }
});

renderizarTabela();