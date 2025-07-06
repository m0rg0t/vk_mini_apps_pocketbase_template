import fetch from "node-fetch";
import { POCKETBASE_BEARER_TOKEN } from "../config.js";

export default function pbFetch(url, options = {}, { isPublic = false } = {}) {
  const opts = { ...options, headers: { ...(options.headers || {}) } };
  if (!isPublic && POCKETBASE_BEARER_TOKEN) {
    opts.headers["Authorization"] = `Bearer ${POCKETBASE_BEARER_TOKEN}`;
  }

  // console.log("opt.headers", opts.headers);
  return fetch(url, opts);
}
