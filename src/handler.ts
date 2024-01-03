import http from "http";
import { Request, Response } from "express";
import { CUSTOM_HEADERS } from "./utils/constants";
var querystring = require("querystring");

export default function (req: Request, response: Response) {
  const proxyURL = req.header(CUSTOM_HEADERS.T_PROXY_URL);
  const redactedParameters = req.header(CUSTOM_HEADERS.T_REDACTED);
  const store = req.header(CUSTOM_HEADERS.T_STORE);
  const shouldPublish = Boolean(req.header(CUSTOM_HEADERS.T_PUBLISH));

  const urlObject = new URL(`${proxyURL}`);
  const postData = querystring.stringify({
    ...req.body,
  });

  const options = {
    port: 80,
    path: urlObject.pathname,
    method: req.method,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(postData),
    },
    host: urlObject.host,
    body: req.body,
  };
  const proxiedResponse = http.request(options, function (res) {
    response.writeHead(response.statusCode, res.headers);
    res.pipe(response, {
      end: true,
    });
  });

  proxiedResponse.write(postData);
  req.pipe(proxiedResponse, {
    end: true,
  });
}
