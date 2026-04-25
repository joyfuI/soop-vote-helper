const fetchBase = async (input: string | URL | Request, init?: RequestInit) => {
  const response = await fetch(input, init);
  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(message || response.statusText, { cause: response });
  }
  return response;
};

export default fetchBase;
