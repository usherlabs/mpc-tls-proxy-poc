import { spawn } from 'child_process';
import { Request, Response } from 'express';
import parser from 'http-string-parser';
import util from 'util';

import { T_HEADERS } from './utils/constants';

const exec = util.promisify(require('child_process').exec);

const FORWARD_HEADER_KEY = 'forward-';
const REQUEST_RESPONSE_STRING_SEPERATOR = 'seperator';
const CONTENT_TYPE = 'content-type';

type CustomRequest = {
	url: string;
	method: string;
	host: string;
	headers: { key: string; value: string }[];
	body?: string;
};
type HttpPayload = {
	headers: Record<string, string>;
	body?: string;
};

export async function verifyProof(_request: Request, response: Response) {
	const { request: httpRequest, response: httpResponse } =
		await verifyProofJson();
	console.log('These are the verified results');
	console.log(`Request Headers:${JSON.stringify(httpRequest.headers)}`);
	console.log(`Response Headers:${JSON.stringify(httpResponse.headers)}`);
	console.log(`Response Body:${JSON.stringify(httpResponse.body)}`);

	response.send({ httpRequest, httpResponse });
}

export async function generateProof(request: Request, response: Response) {
	try {
		const proxyURL = request.header(T_HEADERS.T_PROXY_URL);
		const contentTypeHeader = request.header(CONTENT_TYPE);
		const _redactedParameters = request.header(T_HEADERS.T_REDACTED);
		const _store = request.header(T_HEADERS.T_STORE);
		const _shouldPublish = Boolean(request.header(T_HEADERS.T_PUBLISH));

		const urlObject = new URL(`${proxyURL}`);

		// get all the fowarded headers
		const headers = request.headers as Record<string, string>;
		console.log(headers);
		// const contentType =
		const fowardedHeaders = Object.entries(headers)
			.filter(([headerKey]) => headerKey.startsWith(FORWARD_HEADER_KEY))
			.map(([headerKey, headerValue]) => {
				const key = headerKey.replace(FORWARD_HEADER_KEY, '');
				return { key: key, value: headerValue };
			});
		
		if(contentTypeHeader){
			fowardedHeaders.push({
				key: CONTENT_TYPE,
				value: contentTypeHeader
			})
		}

		//create a json representation of the request
		const customRequest: CustomRequest = {
			url: String(proxyURL),
			method: request.method,
			host: urlObject.host,
			headers: fowardedHeaders,
		};
		if (customRequest.method === 'POST') {
			customRequest['body'] = JSON.stringify(request.body);
		}

		// for debug
		// console.log(
		// 	`cargo run --release --example simple_prover ${JSON.stringify(
		// 		customRequest,
		// 	)}`,
		// );
		// spawn the command to run the prover process while passing in the url
		const output = await exec(
			`bin/simple_prover '${JSON.stringify(customRequest)}'`,
		);

		// some loggign on the MPC-TLS connection
		console.log(`Proof generated with output: \n\n${output.stdout}`);
		if (output.stderr) {
			console.log(`Proof generated with error: \n\n${output.stderr}`);
		}

		const { request: _httpRequest, response: httpResponse } =
			await verifyProofJson();

		//TODO some headers starting with "http" are causing response to fail, look into it
		Object.entries(httpResponse.headers).forEach(([headerKey, headerValue]) => {
			if (headerKey.toLowerCase().includes('http')) return;
			response.setHeader(headerKey, headerValue);
		});

		response.send(httpResponse.body);
	} catch (err) {
		return response
			.status(500)
			.send({ message: `Error:${(err as { message: string }).message}` });
	}
}

function parseHttpString(httpString: string) {
	const [requestString, responseString] = httpString.split(
		REQUEST_RESPONSE_STRING_SEPERATOR,
	);
	if (!requestString || !responseString) return;

	const request = parser.parseRequest(requestString);
	const response = parser.parseResponse(responseString);

	return { request, response };
}

function verifyProofJson(): Promise<{
	request: HttpPayload;
	response: HttpPayload;
}> {
	return new Promise((resolve) => {
		const verifierProcess = spawn(`npm`, ['run', 'start:verifier']);
		verifierProcess.stdout.on('data', (data) => {
			const httpPayload = `${data}`;
			const parsedHttpDetails = parseHttpString(httpPayload);
			if (!parsedHttpDetails) return;
			const { request, response } = parsedHttpDetails;
			resolve({ request, response });
		});
	});
}
