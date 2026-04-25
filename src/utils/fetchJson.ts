import fetchBase from './fetchBase';

const fetchJson = async <T>(
  input: string | URL | Request,
  init?: RequestInit,
): Promise<T> => {
  const response = await fetchBase(input, init);

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new Error(response.statusText, { cause: response });
  }

  return json as T;
};

export default fetchJson;
