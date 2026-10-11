// Respect the production authentication window when running the full suite.
export async function postAuth(request, action, data) {
  let response = await request.post(`/api/auth/${action}`, { data });
  if (response.status() === 429) {
    await new Promise(resolve => setTimeout(resolve, 60000));
    response = await request.post(`/api/auth/${action}`, { data });
  }
  return response;
}
