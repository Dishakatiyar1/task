import React, {useState, useEffect} from "react";
import axios from "axios";
import {openai} from "./openAI";

const App = () => {
  const [data, setData] = useState([]);
  const [gptResponse, setGptResponse] = useState([]);

  const analyzeData = async (data, batchSize = 50) => {
    // Split the data into batches
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }

    // Process each batch and combine results
    let combinedResults = [];
    for (const batch of batches) {
      const gptQuery =
        "I am giving you an array of objects, each object have comment there can be three comments inside it, and a score key. please generate the relationship between the score and comments and how to attribute the behaviour of the person who has given high score and the comments given by that person, give me result in the array of object form which i can display in the form of table with entries scoreRange, numberOfEntries, averageScore, keyObservations" +
        JSON.stringify(batch);

      const gptResults = await openai.chat.completions.create({
        messages: [{role: "user", content: gptQuery}],
        model: "gpt-3.5-turbo",
      });

      const gptResponseData = gptResults.choices?.[0].message.content;
      setGptResponse(prevResponse => [...prevResponse, gptResponseData]);
      console.log("output", gptResponseData);
    }
  };

  useEffect(() => {
    // Fetch data from backend server
    axios
      .get("http://localhost:5000/api/data")
      .then(response => {
        console.log("res", response);
        setData(response);
        analyzeData(response.data);
      })
      .catch(error => console.error(error));
  }, []);

  return (
    <div>
      <h1>Data from Backend</h1>
      <table>
        <thead>
          <tr>
            <th>Score Range</th>
            <th>Number Of Entries</th>
            <th>Average Score</th>
            <th>Key Observations</th>
          </tr>
        </thead>
        <tbody>
          {gptResponse?.map(item => (
            <tr key={item.scoreRange}>
              <td>{item.scoreRange}</td>
              <td>{item.numberOfEntries}</td>
              <td>{item.averageScore}</td>
              <td>{item.keyObservations}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default App;
