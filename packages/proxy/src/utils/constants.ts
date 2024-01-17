interface HeadersInterface {
	[key: string]: string;
}

export const T_HEADERS: HeadersInterface = {
	T_PROXY_URL: 'T-PROXY-URL',
	T_REDACTED: 'T-REDACTED',
	T_STORE: 'T-STORE',
	T_PUBLISH: 'T-PUBLISH',
};

export const BLACKLISTED_HEADERS = [
	...Object.values(T_HEADERS).map((h) => h.toLowerCase()),
  // blacklist all the headers which could cause an error
  // or one that has already been set by the prover
	'host',
	'user-agent',
	'postman-token',
	'accept-encoding',
	'cache-control',
	'content-length',
  'accept',
  'connection',
];
