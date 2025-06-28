import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import styles from "./ManualBuildScreen.module.css";
import CustomButton from "../../components/CustomButton/CustomButton";
import { useNavigate } from "react-router-dom";

interface ComponentType {
  _id: string;
  type: string;
  modelName: string;
  price: number;
  specs?: Record<string, string>;
}

const SELECTION_ORDER = [
  "CPU",
  "RAM",
  "Motherboard",
  "GPU",
  "Storage",
  "PSU",
  "Case",
  "CPU Cooler",
  "Case Fan",
];

function ManualBuildScreen() {
  const [currentStep, setCurrentStep] = useState<number | null>(0);
  const [selectedComponents, setSelectedComponents] = useState<ComponentType[]>([]);
  const [availableComponents, setAvailableComponents] = useState<ComponentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingType, setEditingType] = useState<string | null>(null);
  const navigate = useNavigate();

  const sessionId = localStorage.getItem("sessionId");
  const currentType = currentStep !== null ? SELECTION_ORDER[currentStep] : null;

  const fetchCompatibleComponents = useCallback(async () => {
    if (!sessionId || !currentType) return;

    try {
      setLoading(true);
      setError("");

      let endpoint = "";
      if (currentType === "Motherboard") {
        endpoint = `/api/components/compatible-motherboards?sessionId=${sessionId}`;
      } else if (currentType === "CPU" || currentType === "RAM") {
        endpoint = `/api/components/search-without-compatibility?type=${currentType}`;
      } else {
        endpoint = `/api/components/search?type=${currentType}&sessionId=${sessionId}`;
      }

      const response = await axios.get(`http://localhost:3000${endpoint}`);
      setAvailableComponents(response.data);
    } catch (err) {
      console.error("Error fetching compatible components:", err);
      setError("Failed to load components. Try again.");
    } finally {
      setLoading(false);
    }
  }, [sessionId, currentType]);

  const handleComponentSelect = (component: ComponentType) => {
    let updatedComponents = [...selectedComponents];

    // If editing, replace the component
    if (editingType) {
      updatedComponents = updatedComponents.map((comp) =>
        comp.type === editingType ? component : comp
      );
      setSelectedComponents(updatedComponents);
      setEditingType(null);
      setCurrentStep(null); // Show results
      return;
    }

    // Add new component normally
    updatedComponents.push(component);
    setSelectedComponents(updatedComponents);
    setCurrentStep(prev => (prev !== null ? prev + 1 : null));
  };

  const handleSaveBuild = async () => {
    if (!sessionId) return;

    const build = {
      buildId: `manual_${Date.now()}`,
      components: selectedComponents.map(comp => ({
        type: comp.type,
        modelName: comp.modelName,
        price: comp.price,
      })),
      totalPrice: selectedComponents.reduce((sum, comp) => sum + comp.price, 0),
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      aiGenerated: false,
    };

    try {
      await axios.post(
        `http://localhost:3000/api/session-builds/${sessionId}/builds`,
        build,
        { withCredentials: true }
      );
      alert("✅ Build saved successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error saving build:", err);
      setError("Failed to save the build.");
    }
  };

  useEffect(() => {
    if (currentStep !== null && currentStep < SELECTION_ORDER.length) {
      fetchCompatibleComponents();
    }
  }, [currentStep, fetchCompatibleComponents]);

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate("/")}>← Home</button>
      <h1>Manual PC Build</h1>
      <p>Select components one step at a time. Only compatible options will be shown.</p>

      {currentStep !== null && currentType ? (
        <>
          <h2>Select {currentType}</h2>
          {loading ? (
            <p>Loading {currentType}s...</p>
          ) : (
            <ul className={styles.componentList}>
              {availableComponents.map(comp => (
                <li key={comp._id} className={styles.componentItem}>
                  <div>
                    <strong>{comp.modelName}</strong> - ${comp.price.toFixed(2)}
                    {comp.specs && (
                      <div className={styles.specs}>
                        {Object.entries(comp.specs)
                          .slice(0, 3)
                          .map(([key, val], i) => (
                            <div key={i}>
                              {key}: {typeof val === "object" ? JSON.stringify(val) : val}
                            </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <CustomButton text="Select" onClick={() => handleComponentSelect(comp)} />
                </li>
              ))}
            </ul>
          )}
        </>
      ) : selectedComponents.length === SELECTION_ORDER.length ? (
        <>
          <h2>✅ Build Complete</h2>
          <ul className={styles.summary}>
            {selectedComponents.map((comp) => (
              <li key={comp._id} className={styles.summaryItem}>
                <div>
                  <strong>{comp.type}:</strong> {comp.modelName} - ${comp.price.toFixed(2)}
                </div>
                <CustomButton
                  text="Edit"
                  onClick={() => {
                    setEditingType(comp.type);
                    setCurrentStep(SELECTION_ORDER.indexOf(comp.type));
                  }}
                />
              </li>
            ))}
          </ul>
          <div className={styles.buttonRow}>
            <CustomButton text="Save Build" onClick={handleSaveBuild} />
            <CustomButton text="Cancel" onClick={() => navigate("/")} />
          </div>
        </>
      ) : (
        <p className={styles.error}>Something went wrong. Please refresh the page.</p>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

export default ManualBuildScreen;
