import { Link } from "react-router-dom";
import CustomButton from "../../components/CustomButton/CustomButton";
import styles from "./HomeScreen.module.css";

function HomeScreen() {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1>Build Your Dream PC</h1>
                <p>Choose your components manually or let AI create the best build for you.</p>
                <div className={styles.buttons}>
                    <Link to="/build">
                        <CustomButton text="Manual Build" />
                    </Link>
                    <Link to="/auto-build">
                        <CustomButton text="Automatic Build" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default HomeScreen;
