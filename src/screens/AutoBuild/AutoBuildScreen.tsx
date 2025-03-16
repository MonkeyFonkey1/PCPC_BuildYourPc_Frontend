import { useState, useRef } from "react";
import axios from "axios";
import styles from "./AutoBuildScreen.module.css";
import CustomButton from "../../components/CustomButton/CustomButton";


interface ComponentType {
    type: string;
    modelName: string;
    price: number;
}

interface BuildType {
    components: ComponentType[];
    totalPrice: number;
}

function AutoBuildScreen() {
    const [preferences, setPreferences] = useState("");
    const [budget, setBudget] = useState("");
    const [loading, setLoading] = useState(false);
    const [build, setBuild] = useState<BuildType | null>(null);
    const [error, setError] = useState("");

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

            console.log("API Response:", response.data); // 🔹 Log API response

            if (response.data.sessionId) {
                localStorage.setItem("sessionId", response.data.sessionId);
            }

            // 🔹 Ensure `build` is correctly structured before setting state
            if (response.data.build) {
                setBuild({
                    components: response.data.build.components || [],
                    totalPrice: response.data.build.totalPrice || 0,
                });
            }

            // 🔹 Scroll down to generated build
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

            {/* 🔹 Loading Indicator */}
            {loading && <p className={styles.loading}>⏳ Generating build...</p>}

            {/* 🔹 Error Message */}
            {error && <p className={styles.error}>{error}</p>}

            {/* 🔹 Generated Build Section */}
            {build && (
                <div ref={buildRef} className={styles.result}>
                    <h2>Generated PC Build</h2>
                    <ul>
                        {build.components.length > 0 ? (
                            build.components.map((comp, index) => (
                                <li key={index}>
                                    <strong>{comp.type}:</strong> {comp.modelName} - ${comp.price.toFixed(2)}
                                </li>
                            ))
                        ) : (
                            <p>No components found.</p>
                        )}
                    </ul>
                    <p><strong>Total Price:</strong> ${build.totalPrice.toFixed(2)}</p>

                    <CustomButton text="Modify Build" onClick={handleGenerateBuild} />
                </div>
            )}
        </div>
    );
}

export default AutoBuildScreen;
