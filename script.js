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

function extrairTelefones(texto) {
  const regex = /(?:\D|^)(\d{2})(\d{4,5})(\d{4})(?:\D|$)/g;
  const telefones = [];
  let match;
  while ((match = regex.exec(texto)) !== null) {
    telefones.push({ ddd: match[1], numero: match[2] + match[3] });
  }
  return telefones.slice(0, 4);
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

  const telefones = extrairTelefones(texto);
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

  const telefones = extrairTelefones(texto);
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