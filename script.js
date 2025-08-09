async function lerAreaTransferencia() {
  try {
    return await navigator.clipboard.readText();
  } catch (err) {
    alert("Erro ao acessar a área de transferência.");
    return "";
  }
}

function identificarTipoConteudo(texto) {
  if (
    texto.includes("Confirme o telefone com o cliente:") &&
    texto.includes("Confirme o e-mail do responsável desta conta:")
  ) {
    return "faster";
  } else if (
    texto.includes("Usuário:") &&
    texto.includes("Cadastro Geral") &&
    texto.includes("Desktop Internet Services")
  ) {
    return "desk";
  } else {
    return "desconhecido";
  }
}

function extrairTelefonesFaster(texto) {
  const inicio = texto.indexOf("Confirme o telefone com o cliente:");
  const fim = texto.indexOf("Confirme o e-mail do responsável desta conta:");

  if (inicio === -1 || fim === -1 || fim <= inicio) return [];

  const trecho = texto.slice(inicio, fim);
  const linhas = trecho.split(/\r?\n/);
  const telefones = [];

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();

    if (linha === "DDD:" && linhas[i + 1] && linhas[i + 1].trim().length === 2) {
      const ddd = linhas[i + 1].trim();
      const telIndex = i + 2;

      // Procurar por "Telefone:" e número logo depois
      if (linhas[telIndex] && linhas[telIndex].trim() === "Telefone:" && linhas[telIndex + 1]) {
        const numero = linhas[telIndex + 1].replace(/\D/g, "");
        if (numero.length >= 8) {
          const jaExiste = telefones.some(t => t.ddd === ddd && t.numero === numero);
          if (!jaExiste) telefones.push({ ddd, numero });
        }
      }
    }

    if (telefones.length >= 4) break;
  }

  return telefones;
}

function extrairTelefonesDesk(texto) {
  const linhas = texto.split(/\r?\n/);
  const telefones = [];
  const rótulosPermitidos = [
    "Fone Principal",
    "Fone Alternativo",
    "WhatsApp",
    "Fone 6 (Último Contato)",
    "Fone 7 (Mais Utilizado)"
  ];

  for (let i = 0; i < linhas.length; i++) {
    const linhaAtual = linhas[i].trim();
    const proximaLinha = linhas[i + 1] ? linhas[i + 1].replace(/\D/g, "") : "";

    if (rótulosPermitidos.includes(linhaAtual) && proximaLinha.length === 11) {
      const ddd = proximaLinha.slice(0, 2);
      const numero = proximaLinha.slice(2);
      const jaExiste = telefones.some(t => t.ddd === ddd && t.numero === numero);
      if (!jaExiste) telefones.push({ ddd, numero });
    }

    if (telefones.length >= 4) break;
  }

  return telefones;
}

function extrairEmail(texto) {
  const regex = /[\w.-]+@[\w.-]+\.\w+/g;
  const emails = texto.match(regex);
  return emails ? emails[0] : "";
}

function formatarTelefone(telefone) {
  const ultimos4 = telefone.numero.slice(-4);
  return `(${telefone.ddd}) X XXXX-${ultimos4}`;
}

function formatarEmail(email) {
  const [usuario, dominio] = email.split("@");
  const visivel = usuario.slice(0, 2) + "********";
  return `${visivel}@${dominio}`;
}

function mostrarMensagem(texto, cor) {
  const container = document.getElementById("mensagem-status");
  const msg = document.createElement("div");
  msg.textContent = texto;
  msg.style.color = cor;
  msg.style.marginTop = "6px";
  msg.style.fontWeight = "bold";
  msg.style.fontSize = "14px";
  container.appendChild(msg);
  setTimeout(() => msg.remove(), 6000);
}

async function transferirFaster() {
  const texto = await lerAreaTransferencia();
  if (identificarTipoConteudo(texto) !== "faster") {
    alert("Os dados não são do tipo Faster.");
    return;
  }

  const telefones = extrairTelefonesFaster(texto);
  const email = extrairEmail(texto);

  telefones.forEach((tel, i) => {
    const campo = document.getElementById(`telefone${i + 1}`);
    if (campo) campo.value = tel.ddd + tel.numero;
  });

  if (email) document.getElementById("email").value = email;
}

async function transferirDesk() {
  const texto = await lerAreaTransferencia();
  if (identificarTipoConteudo(texto) !== "desk") {
    alert("Os dados não são do tipo Desk.");
    return;
  }

  const telefones = extrairTelefonesDesk(texto);
  const email = extrairEmail(texto);

  telefones.forEach((tel, i) => {
    const campo = document.getElementById(`telefone${i + 1}`);
    if (campo) campo.value = tel.ddd + tel.numero;
  });

  if (email) document.getElementById("email").value = email;
}

function copiarFaster() {
  const telefones = [];
  for (let i = 1; i <= 4; i++) {
    const valor = document.getElementById(`telefone${i}`).value;
    if (valor.length >= 10) {
      telefones.push({
        ddd: valor.slice(0, 2),
        numero: valor.slice(2)
      });
    }
  }

  const email = document.getElementById("email").value;
  const emailFormatado = formatarEmail(email);
  const telefonesFormatados = telefones.map(formatarTelefone).join(", ");

  let mensagem = `No seu cadastro constam as seguintes informações para contato:  ${telefonesFormatados} e ${emailFormatado}. Deseja remover ou adicionar algum contato?`;

  if (email.includes("@hotmail")) {
    const aviso = `\n\nE-mails com domínio @hotmail, tem apresentado problemas para receber comunicados que enviamos. Você tem outro e-mail com domínio diferente?\nExemplo: @gmail, @yahoo, @icloud, etc.`;
    mensagem += aviso;
    mostrarMensagem("Atenção! Cliente usa domínio @hotmail.", "red");
  }

  navigator.clipboard.writeText(mensagem);
  mostrarMensagem("Copiado! Verifique as informações antes de enviar para o cliente", "limegreen");
}

function copiarDesk() {
  const telefones = [];
  for (let i = 1; i <= 4; i++) {
    const valor = document.getElementById(`telefone${i}`).value;
    if (valor.length >= 10) {
      telefones.push({
        ddd: valor.slice(0, 2),
        numero: valor.slice(2)
      });
    }
  }

  const email = document.getElementById("email").value;
  const emailFormatado = formatarEmail(email);
  const telefonesFormatados = telefones.map(formatarTelefone).join(", ");

  const mensagem = `No seu cadastro constam as seguintes informações para contato:  ${telefonesFormatados} e ${emailFormatado}. Deseja remover ou adicionar algum contato?`;

  navigator.clipboard.writeText(mensagem);
  mostrarMensagem("Copiado! Verifique as informações antes de enviar para o cliente", "limegreen");
}

function apagarCampos() {
  for (let i = 1; i <= 4; i++) {
    document.getElementById(`telefone${i}`).value = "";
  }
  document.getElementById("email").value = "";
}
