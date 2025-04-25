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
async function carregarHomeCliente() {
  const plano = localStorage.getItem('plano') || 'Básico';
  const usuario = localStorage.getItem('usuario') || 'Usuário';

  document.getElementById('app').innerHTML = `
    <div class="topo">
      <div class="avatar">${usuario.charAt(0).toUpperCase()}</div>
      <div>
        <h3>Olá, ${usuario}</h3>
        <p class="plano">Você está no plano <span>${plano}</span></p>
      </div>
    </div>

    <h4>Lava Rápidos próximos</h4>
    <div id="map" style="width: 100%; height: 400px; border-radius: 8px; margin-bottom: 20px;"></div>

    <div class="bottom-nav nav-modern">
      <div class="nav-item ativo">🏠</div>
      <div class="nav-item" onclick="abrirMapa()">📍</div>
      <div class="nav-item" onclick="fazerLogout()">🚪</div>
    </div>
  `;

  setTimeout(inicializarMapa, 500); // Aguarda carregamento do container
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
  const usuario_id = localStorage.getItem('usuario_id');
  const { data } = await supabaseClient
    .from('lava_rapidos')
    .select('*')
    .eq('usuario_id', usuario_id)
    .limit(1);

  let botaoCadastro = '';

  if (!data || data.length === 0) {
    botaoCadastro = `<button onclick="carregarCadastroLavaRapido()">Cadastrar Lava Rápido</button>`;
  }

  document.getElementById('app').innerHTML = `
    <h2>Painel da Empresa</h2>
    ${botaoCadastro}
    <button onclick="abrirConfiguracoesEmpresa()">Configurações</button>
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

function carregarCadastroLavaRapido() {
  document.getElementById('app').innerHTML = `
    <div class="auth-box">
      <h2>Cadastrar Lava Rápido</h2>
      <input type="text" id="nome" placeholder="Nome do Lava Rápido" />
      <input type="text" id="endereco" placeholder="Endereço completo" />
      <input type="text" id="contato" placeholder="Telefone / E-mail" />
      <input type="text" id="horario" placeholder="Horário de funcionamento" />
      <input type="text" id="imagem" placeholder="URL da imagem" />
      <textarea id="servicos" placeholder='Serviços (JSON Ex: [{"nome":"Lavagem Simples","preco":30}])'></textarea>
      <button onclick="salvarLavaRapido()">Salvar</button>
      <button onclick="carregarHomeEmpresa()">Voltar</button>
    </div>
  `;
}

async function inicializarMapa() {
  // Obtém localização do usuário
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const userLat = pos.coords.latitude;
    const userLng = pos.coords.longitude;

    const mapa = new google.maps.Map(document.getElementById('map'), {
      center: { lat: userLat, lng: userLng },
      zoom: 14
    });

    // Marca o usuário no mapa
    new google.maps.Marker({
      position: { lat: userLat, lng: userLng },
      map: mapa,
      title: 'Você está aqui',
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
    });

    // Busca os lava rápidos do Supabase
    const { data, error } = await supabaseClient
      .from('lava_rapidos')
      .select('*');

    if (!data || error) {
      console.error('Erro ao buscar lava rápidos:', error);
      return;
    }

    data.forEach(lr => {
      if (lr.latitude && lr.longitude) {
        const marcador = new google.maps.Marker({
          position: {
            lat: parseFloat(lr.latitude),
            lng: parseFloat(lr.longitude)
          },
          map: mapa,
          title: lr.nome
        });

        const info = new google.maps.InfoWindow({
          content: `
            <strong>${lr.nome}</strong><br/>
            ${lr.endereco}<br/>
            <button onclick="abrirPerfilLavaRapido('${lr.id}')">Ver Perfil</button>
          `
        });

        marcador.addListener('click', () => {
          info.open(mapa, marcador);
        });
      }
    });

  }, () => {
    alert('Não foi possível obter sua localização.');
  });
}

function carregarCadastroLavaRapido() {
  document.getElementById('app').innerHTML = `
    <div class="auth-box">
      <h2>Cadastrar Lava Rápido</h2>
      <input type="text" id="nome" placeholder="Nome do Lava Rápido" />
      <input type="text" id="endereco" placeholder="Endereço completo" />
      <input type="text" id="contato" placeholder="Telefone / WhatsApp / E-mail" />
      <input type="text" id="horario" placeholder="Horário de funcionamento" />
      <input type="text" id="imagem" placeholder="URL da imagem/logo" />
      <textarea id="descricao" rows="3" placeholder='Descrição (opcional)'></textarea>
      <button onclick="salvarLavaRapido()">Salvar</button>
      <button onclick="carregarHomeEmpresa()">Voltar</button>
    </div>
  `;
}

async function salvarLavaRapido() {
  const nome = document.getElementById('nome').value;
  const endereco = document.getElementById('endereco').value;
  const contato = document.getElementById('contato').value;
  const horario = document.getElementById('horario').value;
  const imagem = document.getElementById('imagem').value;
  const descricao = document.getElementById('descricao').value;

  const usuario_id = localStorage.getItem('usuario_id');
  const coords = await obterCoordenadas(endereco);

  if (!coords) {
    alert('Endereço inválido');
    return;
  }

  const { error } = await supabaseClient
    .from('lava_rapidos')
    .insert([{
      nome,
      endereco,
      contato,
      horario_funcionamento: horario,
      imagem_url: imagem,
      latitude: coords.lat,
      longitude: coords.lng,
      usuario_id,
      descricao
    }]);

  if (error) {
    alert('Erro ao cadastrar: ' + error.message);
  } else {
    alert('✅ Cadastro realizado com sucesso!');
    carregarHomeEmpresa();
  }
}


async function obterCoordenadas(endereco) {
  const key = '19c5bb473fe64738ae7e47a920ce3e4a';
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(endereco)}&key=${key}`;

  const resp = await fetch(url);
  const data = await resp.json();

  if (data.results && data.results.length > 0) {
    const loc = data.results[0].geometry;
    return { lat: loc.lat, lng: loc.lng };
  }

  return null;
}

async function abrirConfiguracoesEmpresa() {
  const usuario_id = localStorage.getItem('usuario_id');
  const { data, error } = await supabaseClient
    .from('lava_rapidos')
    .select('*')
    .eq('usuario_id', usuario_id)
    .single();

  if (error || !data) {
    alert('Lava Rápido não encontrado.');
    return;
  }

  document.getElementById('app').innerHTML = `
    <div class="auth-box">
      <h2>Configurações</h2>
      <input type="text" id="nome" value="${data.nome}" placeholder="Nome" />
      <input type="text" id="endereco" value="${data.endereco}" placeholder="Endereço" />
      <input type="text" id="contato" value="${data.contato}" placeholder="Contato" />
      <input type="text" id="horario" value="${data.horario_funcionamento}" placeholder="Horário" />
      <input type="text" id="imagem" value="${data.imagem_url}" placeholder="Imagem" />
      <textarea id="descricao" rows="3" placeholder="Descrição">${data.descricao || ''}</textarea>
      <button onclick="atualizarLavaRapido('${data.id}')">Salvar Alterações</button>
      <button onclick="carregarHomeEmpresa()">Voltar</button>
    </div>
  `;
}

async function atualizarLavaRapido(id) {
  const nome = document.getElementById('nome').value;
  const endereco = document.getElementById('endereco').value;
  const contato = document.getElementById('contato').value;
  const horario = document.getElementById('horario').value;
  const imagem = document.getElementById('imagem').value;
  const descricao = document.getElementById('descricao').value;

  const coords = await obterCoordenadas(endereco);

  const { error } = await supabaseClient
    .from('lava_rapidos')
    .update({
      nome,
      endereco,
      contato,
      horario_funcionamento: horario,
      imagem_url: imagem,
      latitude: coords.lat,
      longitude: coords.lng,
      descricao
    })
    .eq('id', id);

  if (error) {
    alert('Erro ao atualizar: ' + error.message);
  } else {
    alert('✅ Informações atualizadas com sucesso!');
    carregarHomeEmpresa();
  }
}
