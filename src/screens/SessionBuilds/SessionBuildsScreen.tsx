import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./SessionBuildsScreen.module.css";
import { useNavigate } from "react-router-dom";
import CustomButton from "../../components/CustomButton/CustomButton";

interface BuildType {
  buildId: string;
  totalPrice: number;
  createdAt: string;
  components: { type: string; modelName: string }[];
}

function SessionBuildsScreen() {
  const [builds, setBuilds] = useState<BuildType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const sessionId = localStorage.getItem("sessionId");

  useEffect(() => {
    if (!sessionId) return;

    const fetchBuilds = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await axios.get(
          `http://localhost:3000/api/session-builds/${sessionId}/builds`
        );
        setBuilds(response.data);
      } catch (err) {
        console.error("Failed to load builds:", err);
        setError("There are no session builds available!");
      } finally {
        setLoading(false);
      }
    };

    fetchBuilds();
  }, [sessionId]);

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={() => navigate("/")}>← Home</button>
      <h1>Session Builds</h1>

      {loading && <p>Loading builds...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <ul className={styles.buildList}>
        {builds.map((build) => (
          <li key={build.buildId} className={styles.buildItem}>
            <div>
              <strong>Build ID:</strong> {build.buildId}<br />
              <strong>Total Price:</strong> ${build.totalPrice.toFixed(2)}<br />
              <strong>Components:</strong> {build.components.length}<br />
              <strong>Created At:</strong> {new Date(build.createdAt).toLocaleString()}
            </div>
            <CustomButton text="View" onClick={() => navigate(`/session-builds/${build.buildId}`)} />
            </li>
        ))}
      </ul>
    </div>
  );
}

export default SessionBuildsScreen;
