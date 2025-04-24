// Supabase config
const SUPABASE_URL = 'https://fbdytxfxshbhebowpaur.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZHl0eGZ4c2hiaGVib3dwYXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NDY2MTgsImV4cCI6MjA2MTAyMjYxOH0.Lw8J1mGOi8PfYsCcLDW1zl3KRlu_Bexs_BmMACzS3ms';
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Tela inicial para clientes
function carregarLoginCliente() {
    document.getElementById('app').innerHTML = `
      <div class="auth-box">
        <h2>Login - Cliente</h2>
        <input type="text" id="email" placeholder="Nome de usuário" />
        <input type="password" id="senha" placeholder="Senha" />
        <button onclick="fazerLogin('cliente')">Entrar</button>
        <p class="auth-link">Não tem conta? <a href="#" onclick="carregarCadastroCliente()">Cadastre-se</a></p>
        <button onclick="carregarEscolhaInicial()">Voltar</button>
      </div>
    `;
}


// Tela de cadastro
function carregarCadastroCliente() {
    document.getElementById('app').innerHTML = `
      <div class="auth-box">
        <h2>Cadastro - Cliente</h2>
        <input type="text" id="email" placeholder="Nome de usuário" />
        <input type="password" id="senha" placeholder="Senha" />
        <button onclick="fazerCadastro('cliente')">Cadastrar</button>
        <button onclick="carregarLoginCliente()">Voltar</button>
      </div>
    `;
}


// Tela inicial para empresa
function carregarLoginEmpresa() {
    document.getElementById('app').innerHTML = `
      <div class="auth-box">
        <h2>Login - Lava Rápido</h2>
        <input type="text" id="email" placeholder="Nome da empresa" />
        <input type="password" id="senha" placeholder="Senha" />
        <button onclick="fazerLogin('empresa')">Entrar</button>
        <p class="auth-link">Não tem conta? <a href="#" onclick="carregarCadastroEmpresa()">Cadastre-se</a></p>
        <button onclick="carregarEscolhaInicial()">Voltar</button>
      </div>
    `;
}


// Cadastro da empresa
function carregarCadastroEmpresa() {
    document.getElementById('app').innerHTML = `
      <div class="auth-box">
        <h2>Cadastro - Lava Rápido</h2>
        <input type="text" id="email" placeholder="Nome da empresa" />
        <input type="password" id="senha" placeholder="Senha" />
        <button onclick="fazerCadastro('empresa')">Cadastrar</button>
        <button onclick="carregarLoginEmpresa()">Voltar</button>
      </div>
    `;
}


// Cadastro de usuário
async function fazerCadastro(tipo) {
    const nome = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    if (!nome || !senha) {
        alert('Preencha todos os campos!');
        return;
    }

    const { error } = await supabaseClient
        .from('usuarios')
        .insert([{ nome_usuario: nome, senha, tipo }]);

    if (error) {
        alert('Erro ao cadastrar: ' + error.message);
    } else {
        localStorage.setItem('logado', 'true');
        localStorage.setItem('tipo', tipo);
        localStorage.setItem('usuario', nome);
        tipo === 'cliente' ? carregarHomeCliente() : carregarHomeEmpresa();
    }
}

// Login de usuário
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
        ? carregarHomeCliente()
        : carregarHomeEmpresa();
}

// Tela inicial do cliente
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
          <button class="btn-yellow" onclick="verHistorico()">Acompanhar Pedido</button>
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

// Tela de agendamento
function abrirAgendamento(nomeLavaRapido) {
    document.getElementById('app').innerHTML = `
      <div class="auth-box">
        <h2>Agendar Lavagem</h2>
        <p><strong>${nomeLavaRapido}</strong></p>
        <input type="date" id="data" />
        <input type="time" id="horario" />
        <button onclick="confirmarAgendamento('${nomeLavaRapido}')">Confirmar</button>
        <button onclick="carregarHomeCliente()">Voltar</button>
      </div>
    `;
}

// Confirmação do agendamento
async function confirmarAgendamento(local) {
    const data = document.getElementById('data').value;
    const horario = document.getElementById('horario').value;
    const cliente = localStorage.getItem('usuario');

    if (!data || !horario) {
        alert('Preencha data e horário!');
        return;
    }

    const { error } = await supabaseClient
        .from('agendamentos')
        .insert([{ cliente, data, horario, local, status: 'pendente' }]);

    if (error) {
        alert('Erro ao agendar: ' + error.message);
    } else {
        alert('Lavagem agendada com sucesso!');
        carregarHomeCliente();
    }
}

// Tela da empresa com lista de agendamentos
async function carregarHomeEmpresa() {
    const { data, error } = await supabaseClient
        .from('agendamentos')
        .select('*')
        .order('data', { ascending: true });

    let lista = '<p>Nenhum agendamento encontrado.</p>';

    if (data && data.length > 0) {
        lista = data.map(item => `
        <div class="card-empresa">
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

// Atualização de status de agendamento
async function atualizarStatus(id, novoStatus) {
    const { error } = await supabaseClient
        .from('agendamentos')
        .update({ status: novoStatus })
        .eq('id', id);

    if (error) {
        alert('Erro ao atualizar status: ' + error.message);
    } else {
        alert(`Status atualizado para: ${novoStatus}`);
        carregarHomeEmpresa();
    }
}

// Formatar data/hora para exibição
function formatarDataHora(data, hora) {
    return `${data.split('-').reverse().join('/')} às ${hora}`;
}

// Ver pedidos (em breve)
function verPedidos() {
    alert('Em breve: acompanhamento de pedidos!');
}

// Abrir o Google Maps com lava rápidos por perto
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

// Logout
function fazerLogout() {
    localStorage.clear();
    carregarEscolhaInicial(); // ✅ Correto
}


// Redirecionamento automático se estiver logado
document.addEventListener('DOMContentLoaded', () => {
    const tipo = localStorage.getItem('tipo');
    const logado = localStorage.getItem('logado');

    if (!logado) {
        carregarEscolhaInicial();
    } else if (tipo === 'cliente') {
        carregarHomeCliente();
    } else if (tipo === 'empresa') {
        carregarHomeEmpresa();
    }
});


function carregarEscolhaInicial() {
    document.getElementById('app').innerHTML = `
      <div class="auth-box">
        <h2>Bem-vindo!</h2>
        <p>Como deseja acessar o app?</p>
        <button onclick="carregarLoginCliente()">Sou Cliente</button>
        <button onclick="carregarLoginEmpresa()">Sou Lava Rápido</button>
      </div>
    `;
}

async function verHistorico() {
    const cliente = localStorage.getItem('usuario');

    const { data, error } = await supabaseClient
        .from('agendamentos')
        .select('*')
        .eq('cliente', cliente)
        .order('data', { ascending: false });

    if (error) {
        alert('Erro ao buscar histórico: ' + error.message);
        return;
    }

    let html = '<h2>Meus Agendamentos</h2>';

    if (!data || data.length === 0) {
        html += `<p>Você ainda não fez nenhum agendamento.</p>`;
    } else {
        html += data.map(item => `
        <div class="card">
          <p><strong>Data:</strong> ${formatarDataHora(item.data, item.horario)}</p>
          <p><strong>Local:</strong> ${item.local}</p>
          <p><strong>Status:</strong> <span class="status">${item.status}</span></p>
        </div>
      `).join('');
    }

    html += `<button onclick="carregarHomeCliente()">Voltar</button>`;

    document.getElementById('app').innerHTML = html;
}

