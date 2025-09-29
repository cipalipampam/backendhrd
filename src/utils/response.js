export function ok(res, message, data) {
	return res.json({ status: 200, message, data });
}

export function created(res, message, data) {
	return res.status(201).json({ status: 201, message, data });
}

export function notFound(res, message) {
	return res.status(404).json({ message });
}

export function badRequest(res, message, errors) {
	return res.status(400).json({ message, errors });
}

export function serverError(res, error) {
	return res.status(500).json({ message: 'Internal server error', error: error?.message });
}


