// payaibackend.js
// Handles all communication with the PayAI RESTful backend, including connection/session management.
import axios from 'axios';
import http from 'http';
import https from 'https';
const authToken = process.argv[3] || "";
// HTTP/HTTPS agent for connection pooling
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });
// Singleton axios instances for HTTP and HTTPS
const axiosHttp = axios.create({
    httpAgent,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    },
});
const axiosHttps = axios.create({
    httpsAgent,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    },
});
// Helper to select the correct axios instance based on protocol
function getAxiosInstance(url) {
    return url.startsWith('https') ? axiosHttps : axiosHttp;
}
class PayAIError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
    }
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
export async function createOffer({ handle, amount, currency, description, host }) {
    const url = `${host}/api/agents/${encodeURIComponent(handle)}/offers`;
    const axiosInstance = getAxiosInstance(url);
    try {
        const response = await axiosInstance.post(url, { amount, currency, description });
        return response.data;
    }
    catch (err) {
        let data = {};
        let status;
        if (typeof err === 'object' && err !== null && 'response' in err && err.response?.data) {
            data = err.response.data;
            status = err.response.status;
        }
        throw new PayAIError(data.message || 'Failed to create offer.', data.code || 'API_ERROR', data.details || { status, response: data });
    }
}
/**
 * Query offers from the PayAI backend
 * @param {Object} params
 * @param {number} [params.page] - Page number (default 1)
 * @param {number} [params.limit] - Page size (default 10)
 * @param {string} [params.status] - Offer status
 * @param {string} [params.seller_id] - Seller ID
 * @param {string} [params.buyer_id] - Buyer ID
 * @param {string} [params.sort_by] - Sort by field
 * @param {string} [params.sort_order] - Sort order ('asc' or 'desc')
 * @param {string} params.host - PayAI backend host URL
 * @returns {Promise<Object>} - Offers and pagination info
 */
export async function queryOffers({ page = 1, limit = 10, status, seller_id, buyer_id, sort_by = 'created_at', sort_order = 'desc', host }) {
    const url = new URL(`${host}/api/offers`);
    if (page)
        url.searchParams.append('page', String(page));
    if (limit)
        url.searchParams.append('limit', String(limit));
    if (status)
        url.searchParams.append('status', status);
    if (seller_id)
        url.searchParams.append('seller_id', seller_id);
    if (buyer_id)
        url.searchParams.append('buyer_id', buyer_id);
    if (sort_by)
        url.searchParams.append('sort_by', sort_by);
    if (sort_order)
        url.searchParams.append('sort_order', sort_order);
    const axiosInstance = getAxiosInstance(url.toString());
    try {
        const response = await axiosInstance.get(url.toString());
        return response.data;
    }
    catch (err) {
        let data = {};
        let statusCode;
        if (typeof err === 'object' && err !== null && 'response' in err && err.response?.data) {
            data = err.response.data;
            statusCode = err.response.status;
        }
        throw new PayAIError(data.message || 'Failed to query offers.', data.code || 'API_ERROR', data.details || { status: statusCode, response: data });
    }
}
