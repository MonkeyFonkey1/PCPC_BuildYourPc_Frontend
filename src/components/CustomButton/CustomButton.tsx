import React from "react";
import styles from "./CustomButton.module.css";

interface ButtonProps {
    text: string;
    onClick?: () => void;
}

const CustomButton: React.FC<ButtonProps> = ({ text, onClick }) => {
    return (
        <button className={styles.button} onClick={onClick}>
            {text}
        </button>
    );
};

export default CustomButton;
