const normalizeHost = host => (host || '').replace(/\/$/, '');

const post = async (host, path, contentType, body) => {
  const response = await fetch(`${normalizeHost(host)}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body,
  });

  if (!response.ok) {
    throw new Error(`Elasticsearch responded with ${response.status} ${response.statusText}`);
  }

  return response.json();
};

export const search = (host, { index, body }) =>
  post(
    host,
    `/${index ? `${index}/` : ''}_search`,
    'application/json',
    JSON.stringify(body),
  );

export const msearch = (host, lines) =>
  post(
    host,
    '/_msearch',
    'application/x-ndjson',
    `${lines.map(line => JSON.stringify(line)).join('\n')}\n`,
  );

export const createEsClient = ({ host }) => ({
  search: params => search(host, params),
});

export default createEsClient;
