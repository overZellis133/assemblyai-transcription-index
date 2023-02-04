import React from "react";
import "./Word.css";

const Word = (props) => {

    const {start, index, word, end, audioTime} = props;

    const styles = {
        activeText: {
          backgroundColor: "darkturquoise",
          color: "black"
        },
        inactiveText: {
          backgroundColor: null,
        }
      };

    const handleClick = () => {
        props.clicked(start);
        console.log("start:", start / 1000, "time:", audioTime, "end:", end / 1000);
    }

    return (
        <span style={ audioTime >= start / 1000 ? styles.activeText : null} key={index} className={start} onClick={handleClick}>{word} </span>
    );
}

export default Word;