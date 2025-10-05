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
  // Remove o trecho do celular do responsável até a próxima linha que começa com "*"
  const textoFiltrado = texto.replace(/Confirme o celular do responsável desta conta:[\s\S]*?(?=\n\*)/, "");

  const linhas = textoFiltrado.split(/\r?\n/).map(l => l.trim()).filter(l => l !== "");
  const telefones = [];

  for (let i = 0; i < linhas.length - 1; i++) {
    if (linhas[i] === "DDD:" && /^\d{2}$/.test(linhas[i + 1])) {
      const ddd = linhas[i + 1];
      for (let j = i + 2; j < linhas.length - 1; j++) {
        if (linhas[j] === "Telefone:" && /^\d{8,9}$/.test(linhas[j + 1])) {
          const numero = linhas[j + 1];
          telefones.push({ ddd, numero });
          break;
        }
      }
    } else {
      const direto = linhas[i].match(/\b(\d{2})(\d{8,9})\b/);
      if (direto) {
        const ddd = direto[1];
        const numero = direto[2];
        if (!telefones.some(t => t.ddd === ddd && t.numero === numero)) {
          telefones.push({ ddd, numero });
        }
      }
    }
  }

  // Captura números diretos apenas no texto filtrado
  const diretos = textoFiltrado.match(/\b(\d{2})(\d{8,9})\b/g);
  if (diretos) {
    diretos.forEach(num => {
      const ddd = num.slice(0, 2);
      const numero = num.slice(2);
      if (!telefones.some(t => t.ddd === ddd && t.numero === numero)) {
        telefones.push({ ddd, numero });
      }
    });
  }

  return telefones.slice(0, 4); // limita a 4 telefones
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
  apagarCampos(); // limpa os campos antes de preencher
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
  apagarCampos(); // limpa os campos antes de preencher
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
  if (tipoTransferido !== "faster") {
    alert("Os dados atuais não são do tipo Faster.");
    return;
  }

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

  const email = document.getElementById("email").value.trim();
  const telefonesFormatados = telefones.map(formatarTelefone).join(", ");

  let mensagem = `No seu cadastro constam as seguintes informações para contato:  ${telefonesFormatados}`;

  if (email) {
    const emailFormatado = formatarEmail(email);
    mensagem += ` e ${emailFormatado}. Deseja remover ou adicionar algum contato?`;

    if (email.includes("@hotmail")) {
      const aviso = `\n\nE-mails com domínio @hotmail têm apresentado problemas para receber comunicados que enviamos. Você tem outro e-mail com domínio diferente?\nExemplo: @gmail, @yahoo, @icloud, etc.`;
      mensagem += aviso;
      mostrarMensagem("Atenção! Cliente usa domínio @hotmail.", "red");
    }
  } else {
    mensagem += `. Deseja remover ou adicionar algum contato?\nIdentificamos que não há e-mail cadastrado em sistema, deseja adicionar algum?`;
  }

  navigator.clipboard.writeText(mensagem);
  mostrarMensagem("Copiado! Verifique as informações antes de enviar para o cliente", "limegreen");
}

function copiarDesk() {
  if (tipoTransferido !== "desk") {
    alert("Os dados atuais não são do tipo Desk.");
    return;
  }

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

  const email = document.getElementById("email").value.trim();
  const telefonesFormatados = telefones.map(formatarTelefone).join(", ");

  let mensagem = `No seu cadastro constam as seguintes informações para contato:  ${telefonesFormatados}`;

  if (email) {
    const emailFormatado = formatarEmail(email);
    mensagem += ` e ${emailFormatado}. Deseja remover ou adicionar algum contato?`;
  } else {
    mensagem += `. Deseja remover ou adicionar algum contato?\nIdentificamos que não há e-mail cadastrado em sistema, deseja adicionar algum?`;
  }

  navigator.clipboard.writeText(mensagem);
  mostrarMensagem("Copiado! Verifique as informações antes de enviar para o cliente", "limegreen");
}

let tipoTransferido = ""; // variável global

async function transferirFaster() {
  apagarCampos();
  const texto = await lerAreaTransferencia();
  if (identificarTipoConteudo(texto) !== "faster") {
    alert("Os dados não são do tipo Faster.");
    return;
  }

  tipoTransferido = "faster"; // registra tipo
  const telefones = extrairTelefones(texto);
  const email = extrairEmail(texto);

  telefones.forEach((tel, i) => {
    const campo = document.getElementById(`telefone${i + 1}`);
    if (campo) campo.value = tel.ddd + tel.numero;
  });

  if (email) document.getElementById("email").value = email;
}

async function transferirDesk() {
  apagarCampos();
  const texto = await lerAreaTransferencia();
  if (identificarTipoConteudo(texto) !== "desk") {
    alert("Os dados não são do tipo Desk.");
    return;
  }

  tipoTransferido = "desk"; // registra tipo
  const telefones = extrairTelefones(texto);
  const email = extrairEmail(texto);

  telefones.forEach((tel, i) => {
    const campo = document.getElementById(`telefone${i + 1}`);
    if (campo) campo.value = tel.ddd + tel.numero;
  });

  if (email) document.getElementById("email").value = email;
}
