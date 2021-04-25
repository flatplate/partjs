class NotAuthenticatedError extends Error {
    constructor(message) {
        super(message);
        this.name = "NotAuthenticatedError";
    }
}

class ServerError extends Error {
    constructor(message) {
        super(message);
        this.name = "ServerError";
    }
}

class ConnectionError extends Error {
    constructor(message) {
        super(message);
        this.name = "ConnectionError";
    }
}

class InputError extends Error {
    constructor(message) {
        super(message);
        this.name = "InputError";
    }
}

export { NotAuthenticatedError, ServerError, ConnectionError, InputError };
