import { useState, useEffect, useCallback } from 'react';
import { getCallgents, postCallgents, putCallgent, deleteCallgent } from '@/services/ant-design-pro/api';
import { message } from 'antd';

export default () => {
    const [callgents, setCallgents] = useState<API.Callgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [initialValues, setInitialValues] = useState<API.Callgent | null>(null);

    // Initialize callgent list
    const fetchCallgents = useCallback(async (searchTerm = '') => {
        setLoading(true);
        try {
            const response = await getCallgents({ query: searchTerm });
            setCallgents(response.data);
        } catch (error) {
            message.error('Failed to load callgents');
        } finally {
            setLoading(false);
        }
    }, []);

    // Open the modal and set initial values
    const openModal = useCallback((item: API.Callgent | null = null) => {
        setInitialValues(item || null);
        setModalOpen(true);
    }, []);

    // Close the modal and clear initial values
    const closeModal = useCallback(() => {
        setModalOpen(false);
        setInitialValues(null);
    }, []);

    // Save or update a Callgent
    const saveCallgent = useCallback(async (values: API.Callgent) => {
        try {
            let response: ApiResponse<API.Callgent>;
            if (initialValues) {
                response = await putCallgent(values, initialValues.id!);
                if (response) {
                    setCallgents((prevCallgents) =>
                        prevCallgents.map((callgent) =>
                            callgent.id === initialValues.id ? response.data : callgent
                        )
                    );
                }
            } else {
                response = await postCallgents(values);
                if (response) {
                    setCallgents((prevCallgents) => [response.data, ...prevCallgents]);
                }
            }
            closeModal();
        } catch (error) {
            console.log(error);
            message.error(initialValues ? 'Failed to update Callgent' : 'Failed to create Callgent');
        }
    }, [initialValues, closeModal]);

    // Delete a Callgent
    const removeCallgent = useCallback(async (id: string) => {
        try {
            await deleteCallgent(id);
            message.success('Callgent deleted successfully');
            setCallgents((prevCallgents) => prevCallgents.filter((callgent) => callgent.id !== id));
        } catch (error) {
            message.error('Failed to delete Callgent');
        }
    }, []);

    useEffect(() => {
        fetchCallgents();
    }, [fetchCallgents]);

    return {
        callgents,
        loading,
        modalOpen,
        initialValues,
        openModal,
        closeModal,
        saveCallgent,
        removeCallgent,
        setModalOpen,
        fetchCallgents
    };
};
