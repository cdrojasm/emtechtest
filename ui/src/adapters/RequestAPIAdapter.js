import axios from 'axios';
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

export class RequestAPIAdapter {

    REQUIRED_KEYS = ["msg"];
    BAD_PAYLOAD_FORMAT_ERROR_MSG = "BAD_PAYLOAD_FORMAT_ERROR";

    /* request attr */
    url = "";
    method = "";
    headers = {};
    requestData = {};
    params = {};
    has_jwt = false;
    responseDataAdapter = null;
    /* response attr */
    success = false;
    responseData = null;
    msg = "";
    status = "";
    data = {};
    outData = null;
    response = null;
    responseCode = null;

    constructor({ url, method, headers = {}, requestData = {}, params = {}, responseDataAdapter = null, has_jwt = false }) {
        this.url = url;
        this.method = method;
        this.headers = headers;
        this.requestData = requestData;
        this.params = params;
        this.responseDataAdapter = responseDataAdapter;
        this.has_jwt = has_jwt;
    }

    async sendRequest({ requestData = null, params = null, headers = null } = {}) {
        try {
            let _data = requestData || this.requestData;
            let _params = params || this.params;
            let _headers = headers || this.headers;
            const response = await axios({
                method: this.method,
                url: this.url,
                headers: _headers,
                data: _data,
                params: _params,
            });
            this.response = response;
            this.success = true;
        } catch (error) {
            this.handleError(error);
        }
        return this
    }

    clearResponse() {
        this.response = null;
        this.responseCode = null;
        this.data = {};
        this.requestData = {};
        this.outData = {};
        this.msg = "";
        this.success = false;
        this.headers = {};
        this.params = {};
        return null;
    }

    handleError(error) {
        if (error.response) {
            this.responseCode = error.response.status;
            this.data = error.response.data;
            return this
        } else if (error.request) {
            // The request was made but no response was received
            console.error("No response received [Posible network issue]:", error.request);
        } else {
            // Something happened in setting up the request
            console.error("Request error [Previous send to server error]:", error.message);
        }
        this.clearResponse();
        return null;
    }

    processResponse() {
        if (this.response && this.response.data) {
            const { data, status, statusText, headers, config, request } = this.response;
            this.responseCode = status;
            this.responseData = data;
            this.data = data.data;
            if (this.responseDataAdapter &&
                typeof this.responseDataAdapter === 'function' &&
                this.data &&
                typeof this.data === 'object') {
                this.outData = (new this.responseDataAdapter(this.data)).toJSON();
                this.success = true;
            }
        } else {
            throw new Error("No response received");
        }
    }

    checkResponsePayload() {
        const rsp = this.responseData;
        if (typeof rsp !== 'object' || rsp === null) {
            throw new Error("INVALID_RESPONSE: Response must be a non-null object");
        }
        if (!this.REQUIRED_KEYS.every((k) => rsp.hasOwnProperty(k))) {
            throw new Error("INVALID_RESPONSE: Response must have all required keys");
        }
        this.msg = rsp.msg;
        if (typeof this.msg !== 'string') {
            throw new Error("INVALID_RESPONSE: msg must be a string");
        }
    }

    adapt() {
        let returnObject = {
            msg: this.msg,
        }
        if (this.outData && this.outData !== null) {
            returnObject.data = this.outData;
        }
        return {
            msg: this.msg,
            data: this.outData
        };
    }

    process() {
        this.processResponse();
        this.checkResponsePayload();
        return this.adapt();
    }

    checkResponseCode() {
        if (!this.response) {
            throw new Error("No response received");
        }
        return this.response.status === 200 || this.response.status === 201;
    }
}