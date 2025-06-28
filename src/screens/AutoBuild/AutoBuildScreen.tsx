import { useState, useRef } from "react";
import axios from "axios";
import styles from "./AutoBuildScreen.module.css";
import CustomButton from "../../components/CustomButton/CustomButton";

interface ComponentType {
    _id: string;
    type: string;
    modelName: string;
    price: number;
}

interface BuildType {
    buildId: string;
    components: ComponentType[];
    totalPrice: number;
}

function AutoBuildScreen() {
    const [preferences, setPreferences] = useState("");
    const [budget, setBudget] = useState("");
    const [loading, setLoading] = useState(false);
    const [build, setBuild] = useState<BuildType | null>(null);
    const [error, setError] = useState("");
    const [editingComponentType, setEditingComponentType] = useState<string | null>(null);
    const [availableComponents, setAvailableComponents] = useState<ComponentType[]>([]);
    const buildRef = useRef<HTMLDivElement>(null);

    const handleGenerateBuild = async () => {
        const sessionId = localStorage.getItem("sessionId");

        setLoading(true);
        setError("");
        setBuild(null);

        try {
            const response = await axios.post(
                "http://localhost:3000/api/automatic-builds/automatic-build",
                { preferences, budget: Number(budget), sessionId },
                { withCredentials: true }
            );

            if (response.data.sessionId) {
                localStorage.setItem("sessionId", response.data.sessionId);
            }

            if (response.data.build) {
                setBuild(response.data.build);
            }

            setTimeout(() => {
                buildRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 300);

        } catch (err) {
            if (axios.isAxiosError(err)) {
                console.error("Error:", err.response ? err.response.data : err.message);
            } else {
                console.error("Error:", err);
            }
            setError("Failed to generate build. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableComponents = async (componentType: string) => {
        setEditingComponentType(componentType);
        setAvailableComponents([]);
        setLoading(true);
        setError("");

        try {
            const sessionId = localStorage.getItem("sessionId");
            let response;

            if (componentType === "Motherboard") {
                response = await axios.get(
                    `http://localhost:3000/api/components/compatible-motherboards?sessionId=${sessionId}`
                );
            } else {
                response = await axios.get(
                    `http://localhost:3000/api/components/search?type=${componentType}&sessionId=${sessionId}`
                );
            }

           setAvailableComponents(response.data);
        } catch (err) {
            console.error("Error fetching components:", err);
            setError("Failed to fetch components. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleReplaceComponent = async (newComponentId: string) => {
        const sessionId = localStorage.getItem("sessionId");
    
        console.log("Replacing component:", newComponentId); 
    
        setLoading(true);
        setError("");
    
        try {
            const response = await axios.post(
                "http://localhost:3000/api/session-builds/replace-component",
                {
                    sessionId,
                    buildId: build?.buildId,
                    componentType: editingComponentType,
                    newComponentId
                },
                { withCredentials: true }
            );
    
            console.log("API Response:", response.data); 
    
            if (response.data.build) {
                setBuild({ ...response.data.build });  
                console.log("Updated Build in State:", response.data.build);
                setEditingComponentType(null); 
            }
        } catch (err) {
            console.error("Error replacing component:", err);
            setError("Failed to replace component. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h1>Automatic PC Build</h1>
            <p>Enter your preferences and budget, and let AI generate the best build for you.</p>

            <div className={styles.inputSection}>
                <textarea
                    className={styles.input}
                    placeholder="Describe your needs (e.g., gaming, video editing)..."
                    value={preferences}
                    onChange={(e) => setPreferences(e.target.value)}
                />
                <input
                    className={styles.input}
                    type="number"
                    placeholder="Enter your budget ($)"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                />
                <CustomButton text="Generate Build" onClick={handleGenerateBuild} />
            </div>

            {loading && <p className={styles.loading}>⏳ Processing...</p>}
            {error && <p className={styles.error}>{error}</p>}

            {build && (
  <div ref={buildRef} className={styles.resultBox}>
    <h2>Generated PC Build</h2>
    <div className={styles.buildList}>
      <ul>
        {build.components.map((comp, index) => (
          <li key={index} className={styles.buildItem}>
            <span>
              <strong>{comp.type}:</strong> {comp.modelName} - ${comp.price.toFixed(2)}
            </span>
            <CustomButton text="Edit" onClick={() => fetchAvailableComponents(comp.type)} />
          </li>
        ))}
      </ul>
      <p className={styles.totalPrice}>
        <strong>Total Price:</strong> ${build.totalPrice.toFixed(2)}
      </p>
    </div>
  </div>
)}

{editingComponentType && (
  <div className={styles.selectionModal}>
    <div className={styles.modalContent}>
      <h2>Select a New {editingComponentType}</h2>
      <ul className={styles.componentList}>
        {availableComponents.map((comp) => (
          <li key={comp._id} className={styles.componentItem}>
            <span><strong>{comp.modelName}</strong> - ${comp.price.toFixed(2)}</span>
            <CustomButton text="Select" onClick={() => handleReplaceComponent(comp._id)} />
          </li>
        ))}
      </ul>
      <CustomButton text="Cancel" onClick={() => setEditingComponentType(null)} />
    </div>
  </div>
)}

        </div>
    );
}

export default AutoBuildScreen;
