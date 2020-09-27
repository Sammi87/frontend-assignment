import {React, ReactDOM} from "https://unpkg.com/es-react/dev";
import htm from "https://cdn.pika.dev/htm";

import { useServices } from "./useServices.js";
import useInterval from "./useInterval.js";
import { styles } from "./styles.js";

const html = htm.bind(React.createElement);

const ServicePoller = () => {
    const [inputValue, setInputValue] = React.useState("");
    const [isEditing, setIsEditing] = React.useState({});

    const {
        services,
        error,
        handleCreate,
        handleUpdate,
        handleDelete,
        fetchServices
    } = useServices();

    React.useEffect(() => {
        async function fetchAllServices() {
            await fetchServices();
        }
        fetchAllServices();
    }, []);

    useInterval(fetchServices, 60000)

    return html`
    <main style=${styles.main}>
      <h1>KRY status poller</h1>
      ${error != null &&
        html`
          <div style=${{color: "red"}}>${error.message}</div>
        `}
      <br />
        
      <form onSubmit=${(e) => { 
          e.preventDefault();
          handleCreate(inputValue)
      }} style=${styles.createForm}>
        <label style=${styles.createLabel} htmlFor="url-input">Enter service url</label>
        <input style=${styles.createInput} id="url-input" 
            placeholder="http://example.com" 
            value=${inputValue} onChange=${(e) => setInputValue(e.target.value)} />  
        <button style=${styles.createButton} type="submit">Save</button>
      </form>
    
      <h2 style=${{marginBottom: "0.5rem"}}>Services</h2>
      <ul style=${{padding: "0", margin: "0"}}>
        ${services.map(
            (service, index) => html`
                <li key=${service.name} style=${styles.listItem}>
                    ${ isEditing && isEditing.name === service.name ?
                        html`
                            <input style=${styles.updateInput}  
                                 placeholder="http://new-example.com" 
                                 onChange=${(e) => setIsEditing({name: service.name, value: e.target.value})} />
                            <button onClick=${() => handleUpdate(isEditing, index, () => setIsEditing(null))} 
                                style=${styles.smallButton}>Save</button>
                            <button onClick=${() => setIsEditing(null)} 
                                style=${styles.closeButton}><img alt="Close edit input" src="close.svg"/>
                            </button>
                        ` : 
                        html`
                             <div style=${{flex: 1}}>
                                <p style=${styles.smallText}>Url</p>
                                <p style=${{margin: "0 0.5rem 0 0"}}>${`http://${service.name}`}</p>
                            </div>
                            <div style=${styles.itemWrapper}>
                                <div>
                                    <p style=${styles.smallText}>Status</p>
                                    <p style=${{margin: "0 0.5rem 0 0"}}>${service.status}</p>
                                </div>
                                <div style=${{display: "flex", alignItems: "flex-end"}}>
                                    <button onClick=${() => setIsEditing({name: service.name, value: service.name})} 
                                        style=${styles.editButton}>
                                        <img alt="Edit service" src="edit.svg"/>
                                    </button>
                                    <button onClick=${() => handleDelete(service.name)} 
                                        style=${styles.deleteButton}>
                                        <img alt="Delete service" src="delete.svg"/>
                                    </button>
                                </div>
                            </div>
                        `
                    }
                </li>
            `
        )}
      </ul>
    </main>
  `;
}

ReactDOM.render(React.createElement(ServicePoller), document.getElementById("main"));

