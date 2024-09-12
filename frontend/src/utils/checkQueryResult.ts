import { UseQueryResult } from "@tanstack/react-query";

export const checkQueryResult = <T>(
  query: UseQueryResult<T, Error>,
  status = 400,
) => {
  if (query.isError) {
    throw new Response("", {
      status,
      statusText: `${query.error}`,
    });
  }
};
