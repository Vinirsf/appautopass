const SUPABASE_URL = 'https://fbdytxfxshbhebowpaur.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZiZHl0eGZ4c2hiaGVib3dwYXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NDY2MTgsImV4cCI6MjA2MTAyMjYxOH0.Lw8J1mGOi8PfYsCcLDW1zl3KRlu_Bexs_BmMACzS3ms';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();

  // Esconde o splash screen depois de 1,5 segundos
  setTimeout(() => {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.style.display = 'none';
  }, 1500);

  if (session?.user) {
    const user = session.user;
    localStorage.setItem('logado', 'true');
    localStorage.setItem('usuario', user.email);
    localStorage.setItem('usuario_id', user.id);
    localStorage.setItem('tipo', 'cliente');
    carregarHomeCliente();
  } else {
    carregarEscolhaInicial();
  }
});

// Tela inicial de escolha
function carregarEscolhaInicial() {
  document.getElementById('app').innerHTML = `
    <div class="login-container">
      <div class="login-box">
        <img src="images/logo-autopass.png" class="logo-login" alt="Autopass Logo" />
        <h2>Bem-vindo ao Autopass</h2>
        <button onclick="carregarLoginCliente()">Entrar</button>
        <button onclick="carregarCadastroCliente()">Criar Conta</button>
      </div>
    </div>
  `;
}

// Tela Home Cliente
function carregarHomeCliente() {
  document.getElementById('app').innerHTML = `
    <div class="home-container">
      <div class="home-header">
        <img src="images/logo-autopass.png" alt="Autopass" class="logo-autopass" />
        <h2 class="home-title">Escolha seu serviço</h2>
      </div>

      <div class="areas-servico">
        <div class="area animated" onclick="abrirAreaServico('lava_rapido')">
          <img src="icons/lava-rapido.png" alt="Lava Rápido" />
          <p>Lava Rápido</p>
        </div>

        <div class="area animated" onclick="abrirAreaServico('mecanica')">
          <img src="icons/mecanica.png" alt="Mecânica" />
          <p>Mecânica</p>
        </div>

        <div class="area animated" onclick="abrirAreaServico('guincho')">
          <img src="icons/guincho.png" alt="Guincho" />
          <p>Guincho</p>
        </div>

        <div class="area animated" onclick="abrirAreaServico('borracharia')">
          <img src="icons/borracharia.png" alt="Borracharia" />
          <p>Borracharia</p>
        </div>
      </div>

      ${menuInferior()}
    </div>
  `;
}

// Menu Inferior
function menuInferior() {
  return `
    <div class="bottom-nav nav-modern">
      <div class="nav-item" onclick="carregarHomeCliente()">
        <div>🏠</div>
        <small>Início</small>
      </div>
      <div class="nav-item" onclick="carregarParceiros()">
        <div>📋</div>
        <small>Serviços</small>
      </div>
      <div class="nav-item" onclick="abrirMinhaConta()">
        <div>👤</div>
        <small>Conta</small>
      </div>
      <div class="nav-item" onclick="abrirConfiguracoesCliente()">
        <div>⚙️</div>
        <small>Config.</small>
      </div>
    </div>
  `;
}

// Funções de Login e Cadastro
function carregarLoginCliente() {
  document.getElementById('app').innerHTML = `
    <div class="login-container">
      <div class="login-box">
        <img src="images/logo-autopass.png" class="logo-login" alt="Autopass Logo" />
        <h2>Login Cliente</h2>
        <input type="text" id="email" placeholder="E-mail" />
        <input type="password" id="senha" placeholder="Senha" />
        <button onclick="fazerLogin('cliente')">Entrar</button>
        <p class="auth-link">Não tem conta? <a href="#" onclick="carregarCadastroCliente()">Cadastre-se</a></p>
        <button class="btn-voltar" onclick="carregarEscolhaInicial()">Voltar</button>
      </div>
    </div>
  `;
}

function carregarCadastroCliente() {
  document.getElementById('app').innerHTML = `
    <div class="login-container">
      <div class="login-box">
        <img src="images/logo-autopass.png" class="logo-login" alt="Autopass Logo" />
        <h2>Cadastro Cliente</h2>
        <input type="text" id="email" placeholder="E-mail" />
        <input type="password" id="senha" placeholder="Senha" />
        <button onclick="fazerCadastro('cliente')">Cadastrar</button>
        <button class="btn-voltar" onclick="carregarEscolhaInicial()">Voltar</button>
      </div>
    </div>
  `;
}

// Simulação de Login/Cadastro
async function fazerLogin(tipo) {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  const { data, error } = await supabaseClient
    .from('usuarios')
    .select('*')
    .eq('nome_usuario', email)
    .eq('senha', senha)
    .eq('tipo', tipo)
    .single();

  if (error || !data) {
    alert('Usuário ou senha inválidos.');
    return;
  }

  localStorage.setItem('logado', 'true');
  localStorage.setItem('usuario', email);
  localStorage.setItem('usuario_id', data.id);
  localStorage.setItem('tipo', tipo);

  carregarHomeCliente();
}

async function fazerCadastro(tipo) {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  const { error } = await supabaseClient
    .from('usuarios')
    .insert([{ nome_usuario: email, senha, tipo }]);

  if (error) {
    alert('Erro ao cadastrar.');
  } else {
    alert('Cadastro realizado!');
    carregarLoginCliente();
  }
}

// Abrir áreas (exemplo)
function abrirAreaServico(tipo) {
  carregarEstabelecimentos(tipo);
}


async function carregarEstabelecimentos(tipoServico) {
  const { data, error } = await supabaseClient
    .from('lava_rapidos')
    .select('*')
    .eq('tipo_servico', tipoServico);

  if (error) {
    alert('Erro ao carregar estabelecimentos.');
    return;
  }

  let html = `
    <div class="home-header">
      <img src="images/logo-autopass.png" alt="Autopass" class="logo-autopass" />
      <h2 class="home-title">Estabelecimentos de ${tipoServico.replace('_', ' ')}</h2>
    </div>

    <div class="lista-estabelecimentos">
  `;

  if (data.length === 0) {
    html += `<p style="text-align:center; color:white;">Nenhum estabelecimento encontrado.</p>`;
  } else {
    data.forEach(estabelecimento => {
      html += `
        <div class="card parceiro-card">
          <img src="${estabelecimento.imagem_url}" alt="${estabelecimento.nome}" />
          <h3>${estabelecimento.nome}</h3>
          <p>⭐ ${estabelecimento.nota_media || 'Sem avaliação'}</p>
          <button onclick="verPerfilEstabelecimento('${estabelecimento.id}')">Ver Perfil</button>
        </div>
      `;
    });
  }

  html += `</div> ${menuInferior()}`;

  document.getElementById('app').innerHTML = html;
}

async function carregarEstabelecimentos(tipoServico) {
  const { data, error } = await supabaseClient
    .from('lava_rapidos')
    .select('*')
    .eq('tipo_servico', tipoServico);

  if (error) {
    alert('Erro ao carregar estabelecimentos.');
    console.error(error);
    return;
  }
  ...
}

