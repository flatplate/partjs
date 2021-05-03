import { throws } from "assert";

export class PartAPI {
    constructor(apiEndpoint) {
        this.apiEndpoint = apiEndpoint ? apiEndpoint : "";
        this.authenticated = null;
        this.authenticationToken = null;
        this.listeners = {};
        this.lastAuthenticationCheck = new Date(0);
    }

    fetch(...args) {
        return fetch(...args).then((res) => {
            if (!res.ok) {
                if (res.status === 401) {
                    this.checkAuthentification();
                }
                if (res.message) {
                    throw Error(res.message);
                }
                return res.json().then((json) => {
                    throw Error(json.message);
                });
            } else {
                return res.json();
            }
        });
    }

    getQuestions() {
        return this.fetch(this.apiEndpoint + "/getQuestions").then((response) => response.data);
    }

    editQuestion(questionData) {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(questionData),
        };
        return this.fetch(this.apiEndpoint + "/editQuestion", requestOptions);
    }

    createQuestion(questionData) {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(questionData),
        };
        return this.fetch(this.apiEndpoint + "/createQuestion", requestOptions);
    }

    deleteQuestion(questionId) {
        const questionData = {
            id: questionId,
        };
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(questionData),
        };
        return this.fetch(this.apiEndpoint + "/deleteQuestion", requestOptions);
    }

    getQuestionTypes() {
        return this.fetch(this.apiEndpoint + "/questionTypes").then((res) => res.data);
    }

    getSurveys() {
        return this.fetch(this.apiEndpoint + "/getSurveys").then((res) => res.data);
    }

    createSurvey(surveyData) {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(surveyData),
        };

        return this.fetch(this.apiEndpoint + "/createSurvey", requestOptions);
    }

    authenticate(username, password) {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username, password: password }),
        };
        return this.fetch(this.apiEndpoint + "/authenticate", requestOptions)
            .then((res) => {
                this.authenticated = true;
                this.authenticationToken = res.data;
                this.notify("authenticated", this.authenticated);
            })
            .catch((error) => {
                this.authenticated = false;
                this.authenticationToken = null;
                this.notify("authenticated", this.authenticated);
                throw error;
            });
    }

    checkAuthentification() {
        const currentDate = new Date();

        if (currentDate.getTime() - this.lastAuthenticationCheck.getTime() < 1000) {
            return;
        }

        this.lastAuthenticationCheck = currentDate;

        return this.fetch(this.apiEndpoint + "/authenticated")
            .then((res) => {
                this.authenticated = true;
                this.authenticationToken = res.data;
                this.notify("authenticated", this.authenticated);
            })
            .catch((error) => {
                this.authenticated = false;
                this.authenticationToken = null;
                this.notify("authenticated", this.authenticated);
            });
    }

    addListener(event, listener) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(listener);
    }

    removeListener(event, listener) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter((oldListener) => oldListener !== listener);
        }
    }

    notify(event, value) {
        if (this.listeners[event]) {
            this.listeners[event].forEach((listener) => listener(value));
        }
    }

    getQuestionById(id) {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id }),
        };
        return this.fetch(this.apiEndpoint + "/getQuestionById", requestOptions);
    }

    getSurveyById(id) {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id }),
        };
        return fetch(this.apiEndpoint + "/getSurveyById", requestOptions)
            .then((res) => res.json())
            .then((res) => {
                console.log(res);
                return res.data;
            });
    }

    editSurvey(surveyData) {
        console.log(surveyData);
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(surveyData),
        };
        return this.fetch(this.apiEndpoint + "/editSurvey", requestOptions);
    }

    setActiveSurvey(surveyId) {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ surveyId: surveyId }),
        };
        return this.fetch(this.apiEndpoint + "/setActiveSurvey", requestOptions);
    }

    setInactiveSurvey(surveyId) {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ surveyId: surveyId }),
        };
        return this.fetch(this.apiEndpoint + "/setInactiveSurvey", requestOptions);
    }

    postResponse(surveyId, response) {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ surveyId: surveyId, response: response }),
        };
        return this.fetch(this.apiEndpoint + "/postResponse", requestOptions);
    }

    getActiveSurvey() {
        return this.fetch(this.apiEndpoint + "/getActiveSurvey");
    }

    getDataTypes(file, onProgress) {
        // Using XHR here because we need to check the progress of the file upload
        // which the fetch API doesn't support
        const formData = new FormData();
        const maxBlobSize = 1024 * 10; // 10kB;
        const blob = file.slice(0, maxBlobSize);
        formData.append("file", blob);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", this.apiEndpoint + "/dataType", true);

        if (onProgress) xhr.upload.onprogress = onProgress;

        xhr.send(formData);

        return new Promise((resolve, reject) => {
            xhr.onload = () => {
                if (xhr.status !== 200) {
                    if (xhr.status === 401) {
                        this.checkAuthentification();
                    }
                    reject(`Error ${xhr.status}: ${xhr.statusText}`);
                } else {
                    resolve(JSON.parse(xhr.responseText));
                }
            };
        });
    }

    uploadDataFile(file, onProgress) {
        // Using XHR here because we need to check the progress of the file upload
        // which the fetch API doesn't support
        const formData = new FormData();
        formData.append("file", file);

        var xhr = new XMLHttpRequest();
        xhr.open("POST", this.apiEndpoint + "/dataFileUpload", true);

        if (onProgress) xhr.upload.onprogress = onProgress;

        xhr.send(formData);

        return new Promise((resolve, reject) => {
            xhr.onload = () => {
                if (xhr.status !== 200) {
                    if (xhr.status === 401) {
                        this.checkAuthentification();
                    }
                    reject(`Error ${xhr.status}: ${xhr.statusText}`);
                } else {
                    resolve(JSON.parse(xhr.responseText));
                }
            };
        });
    }

    getDataEvaluationStrategies() {
        return this.fetch(this.apiEndpoint + "/dataEvaluationStrategies").then((res) => res.data);
    }

    getMetrics() {
        return this.fetch(this.apiEndpoint + "/metrics").then((res) => res.data);
    }

    createMetric(metricName) {
        const requestOptions = {
            method: "PUT",
        };
        return this.fetch(this.apiEndpoint + `/metrics?metricName=${metricName}`, requestOptions);
    }

    deleteMetric(metricName) {
        const requestOptions = {
            method: "DELETE",
        };
        return this.fetch(this.apiEndpoint + `/metrics?metricName=${metricName}`, requestOptions);
    }

    getResponses() {
        return this.fetch(this.apiEndpoint + "/getResponses").then((res) => res.data);
    }

    getEvaluations() {
        return this.fetch(this.apiEndpoint + "/getEvaluations").then(res => res.data);
    }

    getEvaluationMetadata() {
        return this.fetch(this.apiEndpoint + "/evaluationMetadata").then(res => res.data);
    }

    createEvaluation(evaluationData) {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({evaluationData: evaluationData}),
        };

        return this.fetch(this.apiEndpoint + "/createEvaluation", requestOptions);
    }

    editEvaluation(evaluationData) {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({evaluationData: evaluationData}),
        };

        return this.fetch(this.apiEndpoint + "/editEvaluation", requestOptions);
    }

    getEvaluationById(id) {
        return this.fetch(this.apiEndpoint + "/evaluationById?id=" + id.toString()).then(res => res.data);
    }

    deleteEvaluation(id) {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({id: id}),
        };
        return this.fetch(this.apiEndpoint + "/deleteEvaluation", requestOptions).then(res => res.data);
    }

    deleteSurvey(id) {
        return this.fetch(this.apiEndpoint + `/deleteSurvey?id=${id}`);
    }

    logout() {
        return this.fetch(this.apiEndpoint + "/logout");
    }

    getResponseById(id) {
        return this.fetch(this.apiEndpoint + `/getResponse?id=${id}`).then(res => res.data);
    }
}
