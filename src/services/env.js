async function fetchEnv () {
  const rawEnv = await fetch('/env.json');
  return rawEnv.json();
}

const promise = fetchEnv();

export const getEnv = async () => promise;

export default { getEnv };
