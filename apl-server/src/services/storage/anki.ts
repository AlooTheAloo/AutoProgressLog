export async function executeFetch(
  url: string,
  userid: number,
  request_sql: string,
  params: any[] = []
) {
  return await execute<
    | {
        message: string;
        response: any[];
      }
    | { error: string }
  >("POST", `${url}/ankidb/query`, userid, request_sql, params);
}

export async function executeModify(
  url: string,
  userid: number,
  request_sql: string,
  params: any[] = []
) {
  return await execute<
    | {
        message: string;
        lastID: number;
      }
    | {
        error: string;
      }
  >("PATCH", url, userid, request_sql, params);
}

async function execute<T>(
  method: "POST" | "PATCH",
  url: string,
  userid: number,
  request_sql: string,
  params: any[] = []
): Promise<T> {
  const response = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: userid,
      query: request_sql,
      queryParams: params,
    }),
  });
  return (await response.json()) as T;
}
