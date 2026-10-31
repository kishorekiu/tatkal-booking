import http from "k6/http";
import { check } from "k6";

// 200 virtual users fire one booking each, all at the same moment, for 5 seats.
export const options = {
  scenarios: {
    burst: {
      executor: "per-vu-iterations",
      vus: 200,
      iterations: 1,
      maxDuration: "30s",
    },
  },
};

const URL = __ENV.URL || "http://localhost:3000/api/book-naive";

export default function () {
  const res = http.post(
    URL,
    JSON.stringify({ userId: `user-${__VU}` }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(res, { "booked or sold out": (r) => r.status === 200 || r.status === 409 });
}
