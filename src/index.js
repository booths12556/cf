const { PostalMime } = require('postal-mime');


async function streamToArrayBuffer(stream, streamSize) {
	let result = new Uint8Array(streamSize);
	let bytesRead = 0;
	const reader = stream.getReader();
	while (true) {
		const { done, value } = await reader.read();
		if (done) {
			break;
		}
		result.set(value, bytesRead);
		bytesRead += value.length;
	}
	return result;
}

export default {
	async email(message, env, ctx) {
		let from = message.headers.get("from");
		let to = message.headers.get("to");
		let subject = message.headers.get("subject");
		let data = "";
		if (message.raw != null) {
			const rawEmail = await streamToArrayBuffer(message.raw, message.rawSize);
			const parser = new PostalMime.default();
			const parsedEmail = await parser.parse(rawEmail);
			data = parsedEmail.html;
		}
		let response = await fetch("https://example.com/email", {
			method: "POST",
			headers: {
				"Content-type": "application/json; chatset=UTF-8"
			},
			body: JSON.stringify({
				"from": from,
				"to": to,
				"subject": subject,
				"data": data
			})
		});
		console.log(response.status, response.statusText, await response.text());
	}
}