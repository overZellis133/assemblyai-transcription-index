import React, { useState, useEffect } from "react";
import Word from "./Word";
import "./Transcript.css";

const Transcript = (props) => {
    const {words, chapters} = props.data;
    const [audioTime, setAudioTime] = useState(props.audioTime);

    const handleClick = (startTime) => {
        props.clicked(startTime);
    }

    const handleChapterClick = (e) => {
        props.clickedChapter(e);
    }

    const checkTime = () => {
        setAudioTime(props.getTime());
    }

    useEffect(() => {
        setInterval(() => {
            checkTime();
        }, 100)
    }, [audioTime]);

    return (
        <div className="wordList">
            {chapters.map((chapter, i) => {
                return (
                    <div className="chapter container">
                        <div className="navbar chapterHeader row container">
                            <div className="chapterTitle col">
                                <div className="chapterNumber row"><strong>{`CH${i+1}: ${chapter.gist.toUpperCase()}`}</strong></div>
                                {/* <div className="chapterName row"><strong>{chapter.gist.toUpperCase()}</strong></div> */}
                            </div>
                            <div className="chapterTime col row justify-content-end">
                                <span className="start" accessKey={i} onClick={handleChapterClick}>{`${Math.floor(chapter.start / 1000 / 60)}:${(Math.round(chapter.start 
                                    / 1000 % 60)) < 10 ? "0" + Math.round(chapter.start / 1000 % 60) 
                                    : Math.round(chapter.start / 1000 % 60)}`}
                                </span> - 
                                <span className="end" accessKey={i} onClick={handleChapterClick}>{`${Math.floor(chapter.end 
                                    / 1000 / 60)}:${(Math.round(chapter.end / 1000 % 60)) < 10 
                                    ? "0" + Math.round(chapter.end / 1000 % 60) : Math.round(chapter.end / 1000 % 60)}`}
                                </span>
                            </div>
                        </div>
                        {words.map((word, i) => {
                            if (word.end > chapter.start && word.start <= chapter.end) {
                                return (
                                    <Word 
                                        audioTime={audioTime} 
                                        start={word.start} 
                                        end={word.end} 
                                        index={i} 
                                        word={word.text} 
                                        key={Math.random()} 
                                        clicked={handleClick}
                                    />
                                );
                            }
                        })}
                    </div> 
                );
            })}
        </div>
    );
}

export default Transcript;