export function success(data = null, message = "OK") {
  return Response.json({
    success: true,
    message,
    data,
  });
}

export function fail(message = "Error", status = 500) {
  return Response.json(
    {
      success: false,
      message,
    },
    { status }
  );
}