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
    const plano = localStorage.getItem('plano') || 'Básico';
    const usuario = localStorage.getItem('usuario') || 'Usuário';

    document.getElementById('app').innerHTML = `
      <div class="home-premium">
        <div class="top-bar">
          <img src="https://cdn-icons-png.flaticon.com/512/1048/1048316.png" class="car-icon" alt="Carro" />
          <h2>Solicitar Lavagem</h2>
        </div>
  
        <div class="user-info">
          <p>Bem-vindo, <strong>${usuario}</strong></p>
          <span class="plano-info">Plano: <b>${plano}</b></span>
        </div>
  
        <div class="btn-group">
          <button class="btn-blue" onclick="abrirAgendamento('Lava Rápido Premium')">Solicitar Lavagem</button>
          <button class="btn-yellow" onclick="verPedidos()">Acompanhar Pedido</button>
          <button class="btn-grey">Ver Recompensas</button>
        </div>
      </div>
  
      <div class="bottom-nav nav-modern">
        <div class="nav-item ativo">🏠</div>
        <div class="nav-item" onclick="abrirMapa()">📍</div>
        <div class="nav-item" onclick="fazerLogout()">🚪</div>
      </div>
    `;
}





async function carregarHomeEmpresa() {
    const { data, error } = await supabaseClient
        .from('agendamentos')
        .select('*')
        .order('data', { ascending: true });

    let lista = '<p>Nenhum agendamento encontrado.</p>';

    if (data && data.length > 0) {
        lista = data.map(item => `
        <div class="card card-empresa">
          <p><strong>Cliente:</strong> ${item.cliente}</p>
          <p><strong>Data:</strong> ${formatarDataHora(item.data, item.horario)}</p>
          <p><strong>Local:</strong> ${item.local}</p>
          <p><strong>Status:</strong> <span class="status">${item.status}</span></p>
          <div class="status-buttons">
            <button onclick="atualizarStatus('${item.id}', 'confirmado')">Confirmar</button>
            <button onclick="atualizarStatus('${item.id}', 'concluído')">Finalizar</button>
            <button onclick="atualizarStatus('${item.id}', 'cancelado')">Cancelar</button>
          </div>
        </div>
      `).join('');
    }

    document.getElementById('app').innerHTML = `
      <h2>Painel da Empresa</h2>
      ${lista}
      <button onclick="fazerLogout()">Sair</button>
    `;
}



function abrirMapa() {
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


async function confirmarAgendamento(local) {
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    const cliente = localStorage.getItem('usuario');

    if (!data || !horario) {
        alert('Preencha a data e o horário!');
        return;
    }

    const { error } = await supabaseClient
        .from('agendamentos')
        .insert([{ cliente, data, horario, local }]);

    if (error) {
        alert('Erro ao agendar: ' + error.message);
    } else {
        alert('Lavagem agendada com sucesso!');
        carregarHomeCliente();
    }
}


async function registrarCheckin() {
    const cliente = localStorage.getItem('usuario');
    const local = 'Lava Rápido Premium'; // Pode ser dinâmico futuramente

    const { error } = await supabaseClient
        .from('checkins')
        .insert([{ cliente, local }]);

    if (error) {
        alert('Erro ao fazer check-in: ' + error.message);
    } else {
        alert('Check-in realizado com sucesso!');
    }
}

function abrirAgendamento(nomeLavaRapido) {
    document.getElementById('app').innerHTML = `
      <h2>Agendar Lavagem</h2>
      <p>Local: <strong>${nomeLavaRapido}</strong></p>
      <label>Data:</label>
      <input type="date" id="data" />
      <label>Horário:</label>
      <input type="time" id="horario" />
      <button onclick="confirmarAgendamento('${nomeLavaRapido}')">Confirmar</button>
      <button onclick="carregarHomeCliente()">Voltar</button>
    `;
}

async function atualizarStatus(id, novoStatus) {
    const { error } = await supabaseClient
        .from('agendamentos')
        .update({ status: novoStatus })
        .eq('id', id);

    if (error) {
        alert('Erro ao atualizar status: ' + error.message);
    } else {
        alert('Status atualizado para: ' + novoStatus);
        carregarHomeEmpresa();
    }
}

function formatarDataHora(data, hora) {
    return `${data.split('-').reverse().join('/')} às ${hora}`;
}

function verPedidos() {
    alert('Em breve: tela de acompanhamento de pedidos!');
}


