export async function getHashForParamsFromVK() {
  if (sessionStorage.getItem('fixture-decline') === 'true') throw new Error('Подпись отклонена');
  return { sign: 'synthetic-browser-signature', ts: Math.floor(Date.now() / 1000) };
}
