import './App.css';
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Transcript from './Transcript';
import EntityList from './EntityList';

// Set AssemblyAI Axios Header
const assembly = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: "abaa61a3587e41deb982f2f31597ae0a",
    "content-type": "application/json",
    "transfer-encoding": "chunked",
  },
})

function App() {

  const [audioFile, setAudioFile] = useState(null);
  const [audioTitle, setAudioTitle] = useState("");
  const [uploadURL, setUploadURL] = useState(null);
  const [transcriptID, setTranscriptID] = useState("");
  const [transcriptData, setTranscriptData] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chapters, setChapters] = useState(null);
  const [topics, setTopics] = useState(null);
  const [entities, setEntities] = useState(null);
  const [autoHighlights, setAutoHighlights] = useState(null);
  const [customVocabulary, setCustomVocabulary] = useState([]);
  const audioPlayer = useRef(0);


  const handleSubmit = (e) => {
    e.preventDefault();
    submitTranscriptionHandler();
  }

  const handleChange = (e) => {
    setAudioFile(e.target.files[0]);
    setAudioTitle(e.target.files[0].name);
    console.log(e.target.files[0]);
    console.log(e.target.files[0].name)
  }

  const handleDownload = () => {
    assembly
        .get(`/transcript/${transcriptID}/vtt`)
        .then((res) => console.log(res.data))
        .catch((err) => console.error(err));
  }

  const handleChapterClick = (e) => {
    let chapterNum = e.target.accessKey;
    let chapterPlace = e.target.className;
    let time = chapters[chapterNum][chapterPlace] / 1000;
    audioPlayer.current.currentTime = time;
  }

  const handleEntityClick = (e) => {
    console.log(autoHighlights);
    let entityNum = e.currentTarget.accessKey;
    let entityPlace = e.currentTarget.classList[0];
    let time = entities[entityNum][entityPlace] / 1000;
    audioPlayer.current.currentTime = time;
  }

  const handleWordClick = (start) => {
    let time = start / 1000;
    audioPlayer.current.currentTime = time;
  }

  const handleVocab = (e) => {
    e.preventDefault();
    setCustomVocabulary(e.target.value.split(",").map(val => val.trim()));
  }

  const checkTime = () => {
    if (transcriptData.status === "completed") {
      return audioPlayer.current.currentTime;
    }
  }

  useEffect(() => {
    if (audioFile) {
      assembly
        .post("/upload", audioFile)
        .then((res) => setUploadURL(res.data.upload_url))
        .catch((err) => console.error(err))
    }
  }, [audioFile])

   // Submit the Upload URL to AssemblyAI and retrieve the Transcript ID
   const submitTranscriptionHandler = () => {
    assembly
      .post("/transcript", {
        audio_url: uploadURL,
        auto_chapters: true,
        iab_categories: true,
        entity_detection: true,
        word_boost: customVocabulary, 
        "boost_param": "high",
        "auto_highlights": true,
      })
      .then((res) => {
        setTranscriptID(res.data.id)

        checkStatusHandler()
      })
      .catch((err) => console.error(err))
  }

  // Check the status of the Transcript
  const checkStatusHandler = async () => {
    setIsLoading(true)
    try {
      await assembly.get(`/transcript/${transcriptID}`).then((res) => {
        console.log(res.data);
        setTranscriptData(res.data)
      })
    } catch (err) {
      console.error(err)
    }
  }

  // Periodically check the status of the Transcript
  useEffect(() => {
    const interval = setInterval(() => {
      if (transcriptData.status !== "completed" && isLoading) {
        checkStatusHandler()
      } else {
        setIsLoading(false)
        setTranscript(transcriptData.text)
        setChapters(transcriptData.chapters)
        setEntities(transcriptData.entities)
        setTopics(transcriptData.iab_categories_result);
        setAutoHighlights(transcriptData.auto_highlights_result);
        clearInterval(interval)
      }
    }, 1000)
    return () => clearInterval(interval)
  },)

  return (
    <div className="App-header">
      
      {/* Upload Audio File */}
      {transcriptData.status !== "completed" ? 
        <div className="file-input">
        <h2>Transcription App</h2>
          <input placeholder="Add a file URL" />
          <p>--- Or ---</p>
          <form className="upload-form" onSubmit={handleSubmit}>
            <input type="file" className="file-upload" accept="audio/*" name="file-upload" onChange={handleChange} />
            <input type="submit" value="Upload" />
          </form>
          <hr></hr> 
          <div>
            <textarea placeholder="Type custom vocabulary. Separate with commas" onChange={handleVocab}>
            </textarea>
          </div>
        </div> :
        <div>
          <h2>{audioTitle}</h2>
        </div>
        }
      
      {/* Download VTT */}
      {transcriptData.status === "completed" && transcript ? (
        <div>
          <button className="btn btn-warning" onClick={handleDownload}>Download VTT</button>
        </div>
      ): <div></div>}

      {/* Audio Player */}
      {transcriptData.status === "completed" ? <audio controls='controls' ref={audioPlayer} src={URL.createObjectURL(audioFile)}></audio> : ""}
      
      {/* Topics */}
      {transcriptData.status === "completed" && transcript ? (
        <div className="col-6">
          <p><strong><u>Topics </u></strong></p>
          <p>{Object.keys(topics.summary).map(label => {
            return (
              topics.summary[label] > 0.75 ?
              (<button className="btn btn-outline-success tag">
                <strong>{`${label.slice(label.lastIndexOf(">")+1).split(/(?=[A-Z])/).join(" ")}`}</strong>
              </button>) :
              topics.summary[label] > .5 ?
              (
                <button className="btn btn-outline-warning tag">
                <strong>{`${label.slice(label.lastIndexOf(">")+1).split(/(?=[A-Z])/).join(" ")}`}</strong>
              </button>
              ) :
              (
                <button className="btn btn-outline-danger tag">
                <strong>{`${label.slice(label.lastIndexOf(">")+1).split(/(?=[A-Z])/).join(" ")}`}</strong>
              </button>
              )
            );
          })}</p>
        </div>
      ): <div></div>}

      <div className="metadata row">
      
      {/* Transcript */}
      
        <div className="transcript col-6">
          {transcriptData.status === "completed" && transcript ? (
                  <div>
                    <h3><strong><u>Transcript</u></strong></h3>
                    <div className="words">
                      <Transcript 
                        data={transcriptData} 
                        audioTime={audioPlayer.current.currentTime} 
                        clicked={handleWordClick}
                        getTime={checkTime}
                        clickedChapter={handleChapterClick}
                      />
                    </div>
                  </div>
              ) : (
                <p>{transcriptData.status}</p>
              )}
        </div>
        
        {/* Chapters */}
        
        <div className="chapters col-6">
          {transcriptData.status === "completed" && chapters ? (
            <div>
              <h3><strong><u>Chapters</u></strong></h3>
                {chapters.map((chapter, i) => {
                  return (
                    <div className="container" key={i}>
                      <div className="navbar title row container">
                        <div className="col"><strong>CH{i+1}: {chapter.gist}</strong></div>
                        <div className="col row justify-content-end">
                          <span className="start" accessKey={i} onClick={handleChapterClick}>
                            {new Date(chapter.start).toISOString().slice(11, 19)}
                          </span> - 
                          <span className="end" accessKey={i} onClick={handleChapterClick}>
                            {new Date(chapter.end).toISOString().slice(11, 19)}
                          </span>
                        </div>
                      </div>
                      <p><strong>Summary: </strong>{chapter.headline}</p>
                      <p><strong>Abstract: </strong>{chapter.summary}</p>
                      <div>
                        <div><strong>Keywords: </strong></div>
                        {entities.map((entity, i) => {
                          if (entity.end > chapter.start && entity.start < chapter.end) {
                            return (
                                <div className="start chip" accessKey={i} onClick={handleEntityClick}>
                                  <img 
                                    src={entity.entity_type === "event" ? "https://i.ibb.co/KXwLtMc/event-icon-cropped.png" : 
                                      entity.entity_type === "medical_condition" ? "https://i.ibb.co/3TbQN0z/medical-icon-cropped.png" : 
                                      entity.entity_type === "organization" ? "https://i.ibb.co/b2dT58S/company-icon-cropped.png" : 
                                      entity.entity_type === "location" ? "https://i.ibb.co/FD4gdCz/location-icon-cropped.png" : 
                                      entity.entity_type === "occupation" ? "https://i.ibb.co/kJTFgtG/occupation-icon.jpg" : 
                                      entity.entity_type === "person_name" ? "https://i.ibb.co/4s3xrBQ/person-icon.webp" : 
                                      entity.entity_type === "date" | entity.entity_type === "date_of_birth" | entity.entity_type === "person_age" ? "https://i.ibb.co/z81jc8m/date-icon-cropped.png" : 
                                      "https://i.ibb.co/MpyFM6k/hashtag-just-icon.png"} 
                                    alt="" 
                                    width="96" 
                                    height="96"  
                                  />
                                  <strong>
                                    {`${entity.entity_type.toUpperCase()}: ${entity.text} (${new Date(entity.start).toISOString().slice(11, 19)}), `}
                                  </strong>
                                </div>
                            );
                          }
                        })}
                      </div>
                      <hr></hr>
                    </div>
                    );
                  })}
            </div>
            ) : (
              <p>{transcriptData.status}</p>
            )}
        </div>
      </div>
    </div>
  );
}

export default App;
