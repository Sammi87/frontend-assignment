import { React } from "https://unpkg.com/es-react/dev";
const API_ENDPOINT = "/service";

export const api = {
    all: () => {
        return fetch(API_ENDPOINT)
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error(res.statusText)
            })
    },
    create: (url) => {
        return fetch(API_ENDPOINT, {
            method: "post",
            body: JSON.stringify({
                url: url,
                name: url.replace(/http:\/\/|www\.|/gi, "")
            }),
        }).then((res) => {
            if (res.ok) {
                return res;
            }
            throw new Error(res.statusText)
        })
    },
    delete: async (name) => {
        return fetch(API_ENDPOINT, {
            method: "delete",
            body: JSON.stringify({ name }),
        }).then((res) => {
            if (res.ok) {
                return res;
            }
            throw new Error(res.statusText)
        })
    }
}

export const useServices = () => {
    const [services, setServices] = React.useState([]);
    const [error, setError] = React.useState(null);

    const fetchServices = async () => {
        try {
            const data = await api.all();
            setServices(data);
        } catch (e) {
            setError(e);
        }
    }

    const handleCreate = async (inputValue) => {
        setError(null);

        if (!inputValue) return setError({message: "Url cannot be empty"});
        const trimmedInputValue = inputValue.replace(/http:\/\/|www\.|/gi, "")

        const exists = services.find((service) => service.name === trimmedInputValue);
        if (exists) return setError({message: "Url already exists"});

        try {
            await api.create(inputValue)
            setServices([...services, {name: trimmedInputValue, status: "UNKNOWN"}])
        } catch(e) {
            setError(e)
        };
    }

    const handleDelete = async (name) => {
        setError(null);
        try {
            await api.delete(name)
            setServices(services.filter(service => service.name !== name))
        } catch(e) {
            setError(e);
        }
    }

    const handleUpdate = async (newValue, index, callback) => {
        setError(null);
        try {
            await api.delete(newValue.name);
            await api.create(newValue.value);

            setServices(services.map((service, i) => {
                return i === index ? {
                    name: newValue.value.replace(/http:\/\/|www\.|/gi, ""),
                    status: "UNKNOWN"
                } : service
            }));

            callback();
        } catch(e) {
            setError(e);
        }
    }

    return {
        services,
        error,
        handleCreate,
        handleUpdate,
        handleDelete,
        fetchServices
    }
}