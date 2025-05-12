import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "./SessionBuildDetailsScreen.module.css";

interface ComponentType {
  type: string;
  modelName: string;
  price: number;
}

function SessionBuildDetailsScreen() {
  const { buildId } = useParams();
  const sessionId = localStorage.getItem("sessionId");
  const [components, setComponents] = useState<ComponentType[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [createdAt, setCreatedAt] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBuildDetails = async () => {
      if (!sessionId || !buildId) return;

      try {
        const response = await axios.get(
          `http://localhost:3000/api/session-builds/${sessionId}/builds/${buildId}`
        );

        const build = response.data;
        setComponents(build.components || []);
        setTotalPrice(build.totalPrice || 0);
        setCreatedAt(new Date(build.createdAt).toLocaleString());
      } catch (err) {
        console.error("Failed to fetch build details", err);
        setError("Could not load build data.");
      }
    };

    fetchBuildDetails();
  }, [sessionId, buildId]);

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate("/session-builds")}>
        ← Back to Session Builds
      </button>
      <h1>Build Details</h1>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.infoBox}>
        <p><strong>Build ID:</strong> {buildId}</p>
        <p><strong>Total Price:</strong> ${totalPrice.toFixed(2)}</p>
        <p><strong>Created At:</strong> {createdAt}</p>
      </div>

      <h2>Components</h2>
      <ul className={styles.componentList}>
        {components.map((comp, index) => (
          <li key={index}>
            <strong>{comp.type}:</strong> {comp.modelName} - ${comp.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SessionBuildDetailsScreen;
