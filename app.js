const SUPABASE_URL = 'https://fbdytxfxshbhebowpaur.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZHl0eGZ4c2hiaGVib3dwYXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NDY2MTgsImV4cCI6MjA2MTAyMjYxOH0.Lw8J1mGOi8PfYsCcLDW1zl3KRlu_Bexs_BmMACzS3ms'; // sua chave completa aqui

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const tipo = localStorage.getItem('tipo');
    const logado = localStorage.getItem('logado');

    if (!logado) {
        carregarEscolhaInicial();
    } else if (tipo === 'cliente') {
        if (!localStorage.getItem('plano')) {
            carregarPlanos();
        } else {
            carregarHomeCliente();
        }
    } else if (tipo === 'empresa') {
        carregarHomeEmpresa();
    }
});

function carregarEscolhaInicial() {
    document.getElementById('app').innerHTML = `
    <h2>Bem-vindo!</h2>
    <button onclick="carregarLoginCliente()">Sou Cliente</button>
    <button onclick="carregarLoginEmpresa()">Sou Lava Rápido</button>
  `;
}

function carregarLoginCliente() {
    document.getElementById('app').innerHTML = `
    <h2>Login - Cliente</h2>
    <input type="text" id="email" placeholder="Nome de usuário" />
    <input type="password" id="senha" placeholder="Senha" />
    <button onclick="fazerLogin('cliente')">Entrar</button>
    <p>Não tem conta? <a href="#" onclick="carregarCadastroCliente()">Cadastre-se</a></p>
  `;
}

function carregarLoginEmpresa() {
    document.getElementById('app').innerHTML = `
    <h2>Login - Lava Rápido</h2>
    <input type="text" id="email" placeholder="Nome da empresa" />
    <input type="password" id="senha" placeholder="Senha" />
    <button onclick="fazerLogin('empresa')">Entrar</button>
    <p>Não tem conta? <a href="#" onclick="carregarCadastroEmpresa()">Cadastre-se</a></p>
  `;
}

function carregarCadastroCliente() {
    document.getElementById('app').innerHTML = `
    <h2>Cadastro - Cliente</h2>
    <input type="text" id="email" placeholder="Nome de usuário" />
    <input type="password" id="senha" placeholder="Senha" />
    <button onclick="fazerCadastro('cliente')">Cadastrar</button>
  `;
}

function carregarCadastroEmpresa() {
    document.getElementById('app').innerHTML = `
    <h2>Cadastro - Lava Rápido</h2>
    <input type="text" id="email" placeholder="Nome da empresa" />
    <input type="password" id="senha" placeholder="Senha" />
    <button onclick="fazerCadastro('empresa')">Cadastrar</button>
  `;
}

async function fazerCadastro(tipo) {
    const nome = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    if (!nome || !senha) return alert('Preencha todos os campos!');

    const { data, error } = await supabaseClient
        .from('usuarios')
        .insert([{ nome_usuario: nome, senha, tipo }]);

    if (error) {
        alert('Erro ao cadastrar: ' + error.message);
    } else {
        localStorage.setItem('logado', 'true');
        localStorage.setItem('tipo', tipo);
        localStorage.setItem('usuario', nome);
        tipo === 'cliente' ? carregarPlanos() : carregarHomeEmpresa();
    }
}

async function fazerLogin(tipo) {
    const nome = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    const { data, error } = await supabaseClient
        .from('usuarios')
        .select('*')
        .eq('nome_usuario', nome)
        .eq('senha', senha)
        .eq('tipo', tipo)
        .single();

    if (error || !data) {
        alert('Usuário ou senha inválidos.');
        return;
    }

    localStorage.setItem('logado', 'true');
    localStorage.setItem('tipo', tipo);
    localStorage.setItem('usuario', nome);

    tipo === 'cliente'
        ? (!localStorage.getItem('plano') ? carregarPlanos() : carregarHomeCliente())
        : carregarHomeEmpresa();
}

function carregarPlanos() {
    document.getElementById('app').innerHTML = `
    <h2>Escolha seu plano</h2>
    <button onclick="escolherPlano('Básico')">Plano Básico - Grátis</button>
    <button onclick="escolherPlano('Comum')">Plano Comum - R$59/mês</button>
    <button onclick="escolherPlano('Luxo')">Plano Luxo - R$99/mês</button>
  `;
}

function escolherPlano(plano) {
    localStorage.setItem('plano', plano);
    carregarHomeCliente();
}

function carregarHomeCliente() {
    const plano = localStorage.getItem('plano');
    document.getElementById('app').innerHTML = `
      <h2>Olá, Cliente!</h2>
      <p>Seu plano: <strong>${plano}</strong></p>
      <button onclick="abrirTelaAgendamento()">Agendar Lavagem</button>
      <button onclick="buscarLavaRapido()">Encontrar Lava Rápido Perto</button>
      <button onclick="fazerLogout()">Sair</button>
    `;
}


async function carregarHomeEmpresa() {
    const { data, error } = await supabaseClient
        .from('agendamentos')
        .select('*')
        .order('data', { ascending: true });

    let lista = '<p>Sem agendamentos ainda.</p>';
    if (data && data.length > 0) {
        lista = '<ul>' + data.map(item =>
            `<li><strong>${item.cliente}</strong> - ${item.data} às ${item.horario} (${item.status})</li>`
        ).join('') + '</ul>';
    }

    document.getElementById('app').innerHTML = `
      <h2>Painel do Lava Rápido</h2>
      ${lista}
      <button onclick="fazerLogout()">Sair</button>
    `;
}


function buscarLavaRapido() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                const url = `https://www.google.com/maps/search/lava+rápido/@${lat},${lng},15z`;
                window.open(url, '_blank');
            },
            () => alert('Não foi possível obter a localização.')
        );
    } else {
        alert('Geolocalização não suportada.');
    }
}

function abrirTelaAgendamento() {
    document.getElementById('app').innerHTML = `
      <h2>Agendar Lavagem</h2>
      <label>Data:</label>
      <input type="date" id="data" />
      <label>Horário:</label>
      <input type="time" id="horario" />
      <button onclick="confirmarAgendamento()">Confirmar</button>
      <button onclick="carregarHomeCliente()">Voltar</button>
    `;
}


function fazerLogout() {
    localStorage.clear();
    carregarEscolhaInicial();
}

async function confirmarAgendamento() {
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    const cliente = localStorage.getItem('usuario');

    if (!data || !horario) {
        alert('Preencha data e horário!');
        return;
    }

    const { error } = await supabaseClient
        .from('agendamentos')
        .insert([{ cliente, data, horario }]);

    if (error) {
        alert('Erro ao agendar: ' + error.message);
    } else {
        alert('Lavagem agendada com sucesso!');
        carregarHomeCliente();
    }
}
