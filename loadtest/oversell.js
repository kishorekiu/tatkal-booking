import http from "k6/http";
import { check, sleep } from "k6";

// 200 virtual users fire one booking each, all at the same moment, for 5 seats.
export const options = {
  scenarios: {
    burst: {
      executor: "per-vu-iterations",
      vus: Number(__ENV.VUS || 200),
      iterations: 1,
      maxDuration: "30s",
    },
  },
};

const URL = __ENV.URL || "http://localhost:3000/api/book-naive";

// JITTER (seconds): spread arrivals so the OS listen backlog doesn't refuse connections.
const JITTER = Number(__ENV.JITTER || 0);

export default function () {
  sleep(Math.random() * JITTER);
  const res = http.post(
    URL,
    JSON.stringify({ userId: `user-${__VU}` }),
    { headers: { "Content-Type": "application/json" } }
  );
  check(res, { "booked or sold out": (r) => r.status === 200 || r.status === 409 });
}
