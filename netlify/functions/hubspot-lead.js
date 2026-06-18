// Netlify Function — cria/atualiza um Contato no HubSpot a partir dos formulários do site.
// O token fica seguro na variável de ambiente HUBSPOT_TOKEN (Netlify), nunca exposto no site.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = process.env.HUBSPOT_TOKEN;
  if (!token) {
    return { statusCode: 500, body: 'Configuração ausente: HUBSPOT_TOKEN não definido no Netlify.' };
  }

  let d;
  try { d = JSON.parse(event.body || '{}'); }
  catch (e) { return { statusCode: 400, body: 'JSON inválido.' }; }

  const email = (d.email || '').trim();
  if (!email) return { statusCode: 400, body: 'E-mail é obrigatório.' };

  // Monta propriedades padrão do HubSpot. A modalidade + todos os detalhes vão no campo "message".
  const message = 'Modalidade: ' + (d.formName || '') + '\n' + (d.detalhes || '');
  const properties = {
    email: email,
    firstname: (d.nome || '').trim(),
    phone: (d.telefone || '').trim(),
    city: (d.cidade || '').trim(),
    state: (d.estado || '').trim(),
    message: message
  };
  // remove vazios
  Object.keys(properties).forEach((k) => { if (!properties[k]) delete properties[k]; });

  const headers = {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  };
  const base = 'https://api.hubapi.com/crm/v3/objects/contacts';

  try {
    // tenta criar
    let res = await fetch(base, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ properties: properties })
    });

    // se já existe (mesmo e-mail), atualiza pelo ID retornado no erro 409
    if (res.status === 409) {
      const txt = await res.text();
      const m = txt.match(/Existing ID:\s*(\d+)/);
      if (m) {
        res = await fetch(base + '/' + m[1], {
          method: 'PATCH',
          headers: headers,
          body: JSON.stringify({ properties: properties })
        });
      }
    }

    if (!res.ok) {
      const errTxt = await res.text();
      return { statusCode: 502, body: 'Erro HubSpot: ' + errTxt };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return { statusCode: 500, body: 'Falha ao contatar o HubSpot: ' + (err && err.message) };
  }
};
