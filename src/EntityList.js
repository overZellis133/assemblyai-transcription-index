import React from "react";
import "./EntityList.css";

const EntityList = (props) => {
    const {chapterStart, chapterEnd, entities} = props;

    return (
        <div className="row">
            {entities.filter((entity, i) => entity.end > chapterStart && entity.start < chapterEnd)
                .map(entity => {
                return (
                    <div className="chip">
                        <img src="https://i.ibb.co/MpyFM6k/hashtag-just-icon.png" alt="" width="96" height="96" /> <strong>{`${entity.entity_type}: ${entity.text}`}</strong>
                    </div>
                );
            })}
        </div>
    );
}

export default EntityList