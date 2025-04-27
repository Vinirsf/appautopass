const SUPABASE_URL = 'https://SEU-SUPABASE-URL';
const SUPABASE_ANON_KEY = 'SEU-ANON-KEY';
const { createClient } = supabase;
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (session?.user) {
    const user = session.user;
    localStorage.setItem('logado', 'true');
    localStorage.setItem('usuario', user.email);
    localStorage.setItem('usuario_id', user.id);
    localStorage.setItem('tipo', 'cliente'); // padrão
    carregarHomeCliente();
  } else {
    carregarEscolhaInicial();
  }
});

function carregarEscolhaInicial() {
  document.getElementById('app').innerHTML = `
    <div class="auth-box">
      <h2>Bem-vindo ao Autopass</h2>
      <button onclick="carregarLoginCliente()">Entrar</button>
      <button onclick="carregarCadastroCliente()">Criar Conta</button>
    </div>
  `;
}

function carregarHomeCliente() {
  document.getElementById('app').innerHTML = `
    <div class="home-header">
      <img src="images/logo-autopass.png" alt="Autopass" class="logo-autopass" />
      <h2 style="color: #edcd33;">Escolha seu serviço</h2>
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
  `;
}


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
