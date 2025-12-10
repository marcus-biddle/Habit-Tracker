// Route handler to prevent 400 errors for favicon.ico requests
export async function loader() {
  // Return a 204 No Content response to satisfy browser favicon requests
  return new Response(null, {
    status: 204,
    headers: {
      'Content-Type': 'image/x-icon',
    },
  });
}

