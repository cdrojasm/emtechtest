import { isValidUUID4 } from "../utils/validators.js";

export class chatAdapter {
    REQUIRED_KEYS = ["id", "title", "user_id", "created_at"];
    validate() {
        for (const key of this.REQUIRED_KEYS) {
            if (!this[key]) {
                throw new Error(`Missing required key: ${key}`);
            }
        }
        if (!isValidUUID4(this.id)) {
            throw new Error(`Invalid UUID: ${this.id}`);
        }
        if (typeof this.title !== 'string') {
            throw new Error(`Invalid title: ${this.title}`);
        }
        if (typeof this.userId !== 'string') {
            throw new Error(`Invalid userId: ${this.userId}`);
        }
        if (this.createdAt && !(this.createdAt instanceof Date)) {
            throw new Error(`Invalid createdAt date: ${this.createdAt}`);
        }
    }

    toModel() {
        return {
            id: this.id,
            title: this.title,
            user_id: this.userId,
            created_at: this.createdAt ? this.createdAt.toISOString() : null,
        };
    }
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            userId: this.userId,
            createdAt: this.createdAt ? this.createdAt.toISOString() : null,
        };
    }
    constructor({
        
        created_at = null,
        id = null,
        title = null,
        user_id = null
    }) {
        this.id = id;
        this.title = title;
        this.userId = user_id;
        this.createdAt = created_at ? new Date(created_at) : null;
    }
}


export class userAdapter {

    REQUIRED_KEYS = ["name", "email", "phone", "id"];

    validate() {
        for (const key of this.REQUIRED_KEYS) {
            if (!this[key]) {
                throw new Error(`Missing required key: ${key}`);
            }
        }
        if (typeof this.id !== 'string' ) {
            throw new Error(`Invalid type for id: ${this.id}`);
        }
        if (typeof this.name !== 'string') {
            throw new Error(`Invalid username: ${this.name}`);
        }
        if (typeof this.email !== 'string') {
            throw new Error(`Invalid email: ${this.email}`);
        }
        if (typeof this.phone !== 'string' ) {
            throw new Error(`Invalid phone: ${this.phone}`);
        }
        if (this.createdAt && !(this.createdAt instanceof Date)) {
            throw new Error(`Invalid createdAt date: ${this.createdAt}`);
        }
        if (this.lastConnection && !(this.lastConnection instanceof Date)) {
            throw new Error(`Invalid lastConnection date: ${this.lastConnection}`);
        }
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            createdAt: this.createdAt ? this.createdAt.toISOString() : null,
            lastConnection: this.lastConnection ? this.lastConnection.toISOString() : null
        };
    }

    toModel() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            phone: this.phone,
            created_at: this.createdAt ? this.createdAt.toISOString() : null,
            last_connection: this.lastConnection ? this.lastConnection.toISOString() : null
        };
    }

    constructor({
        id = null,
        name = null,
        email = null,
        phone = null,
        created_at = null,
        last_connection = null,
    }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.createdAt = created_at ? new Date(created_at) : null;
        this.lastConnection = last_connection ? new Date(last_connection) : null;
    }
}

export class qualificationInstrumentAdapter { }
export class closeConnectionAdapter { }
export class cleanCacheKeyAdapter { }
export class sendMessageAdapter { }
export class receiveMessageAdapter { }