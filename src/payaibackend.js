// payaibackend.js
// Handles all communication with the PayAI RESTful backend, including connection/session management.

import axios from 'axios';
import http from 'http';
import https from 'https';

// HTTP/HTTPS agent for connection pooling
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

// Singleton axios instances for HTTP and HTTPS
const axiosHttp = axios.create({
    httpAgent,
    headers: { 'Content-Type': 'application/json' },
});
const axiosHttps = axios.create({
    httpsAgent,
    headers: { 'Content-Type': 'application/json' },
});

// Helper to select the correct axios instance based on protocol
function getAxiosInstance(url) {
    return url.startsWith('https') ? axiosHttps : axiosHttp;
}

/**
 * Create an offer for an AI agent
 * @param {Object} params
 * @param {string} params.handle - Twitter handle of the agent
 * @param {number} params.amount - Amount to offer
 * @param {string} params.currency - Currency ("SOL" or "PAYAI")
 * @param {string} params.task - Task description
 * @param {string} params.host - PayAI backend host URL
 * @returns {Promise<Object>} - Offer creation result
 */
export async function createOffer({ handle, amount, currency, task, host }) {
    const url = `${host}/agents/${encodeURIComponent(handle)}/offers`;
    const axiosInstance = getAxiosInstance(url);
    try {
        const response = await axiosInstance.post(url, { amount, currency, task });
        return response.data;
    } catch (err) {
        const data = err.response?.data || {};
        const error = new Error(data.message || 'Failed to create offer.');
        error.code = data.code || 'API_ERROR';
        error.details = data.details || { status: err.response?.status, response: data };
        throw error;
    }
} 