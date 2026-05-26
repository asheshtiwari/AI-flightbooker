import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

/**
 * Custom hook for mapping API requests and state
 */
export const useFetch = (url, autoFetch = true, params = null) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(autoFetch);
    const [error, setError] = useState(null);

    const postData = useCallback(async (payload) => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(url, payload);
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.message || err.message;
            setError(msg);
            throw msg;
        } finally {
            setLoading(false);
        }
    }, [url]);

    const serializedParams = JSON.stringify(params);

    useEffect(() => {
        if (!autoFetch) return;

        let isMounted = true;
        
        const fetchData = async () => {
            setLoading(true);
            try {
                const config = { params: serializedParams ? JSON.parse(serializedParams) : null };
                const res = await axios.get(url, config);
                if (isMounted) setData(res.data);
            } catch (err) {
                if (isMounted) setError(err.response?.data?.message || err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        
        return () => { isMounted = false; };
    }, [url, autoFetch, serializedParams]);

    return { data, loading, error, postData };
};