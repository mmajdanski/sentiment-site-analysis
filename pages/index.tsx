import type { NextPage } from "next";
import Head from "next/head";
import { useEffect, useRef } from "react";
import {
  PieChart,
  Pie,
  Legend,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const axios = require("axios");

import { useState } from "react";

const data01 = [
  { name: "Group A", value: 400 },
  { name: "Group B", value: 300 },
  { name: "Group C", value: 300 },
  { name: "Group D", value: 200 },
  { name: "Group E", value: 278 },
  { name: "Group F", value: 189 },
];

type Results = {
  positive: [];
  negative: [];
  positive_sum: number;
  negative_sum: number;
  positive_to_negative_percentage: number;
};

type WordObj = {
  word: string;
  count: number;
  percentage: number;
  suspicious?: boolean;
};

type pieData = [
  {
    name: string;
    value: number;
    percentage: number;
  }
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const Home: NextPage = () => {
  const handleButton = async (requestingUrl: string) => {
    await axios
      .post("http://localhost:3000/api/fetchhtml", {
        requesting_url: requestingUrl,
      })
      .then(function (response: any) {
        setResults(response.data);
        //{ positive: [], negative: [], positive_sum: 0, negative_sum: 0, positive_to_negative_percentage: 0};
        let pos_pie_data = response.data.positive.map((positive_word: any) => {
          return {
            name: positive_word.word,
            value: positive_word.count,
            percentage: positive_word.percentage,
          };
        });

        let neg_pie_data = response.data.negative.map((negative_word: any) => {
          return {
            name: negative_word.word,
            value: negative_word.count,
            percentage: negative_word.percentage,
          };
        });

        setPositivePieData(pos_pie_data);
        setNegativePieData(neg_pie_data);
      })
      .catch(function (error: any) {
        console.log(error);
      });
  };

  const inputContainer = useRef<HTMLInputElement>(null);

  let [requestingUrl, setRequestingUrl] = useState("");
  let [positivePieData, setPositivePieData] = useState<pieData>();
  let [negativePieData, setNegativePieData] = useState<pieData>();

  let [results, setResults] = useState<Results>({
    positive: [],
    negative: [],
    positive_sum: 0,
    negative_sum: 0,
    positive_to_negative_percentage: 0,
  });

  useEffect(() => {
    if (inputContainer.current != null) inputContainer.current.focus();
  }, []);

  const handleCountCalculation = (data: pieData) => {
    let total_count = data
      .map((data) => {
        return data.value;
      })
      .reduce((previousValue, currentValue) => {
        return previousValue + currentValue;
      }, 0);

    return total_count;
  };

  const removeWord = (word_name: string, type: string) => {
    if (type === "positive" && positivePieData) {
      let newPositiveData: any = positivePieData.filter((data) => {
        return data.name !== word_name;
      });
      if (newPositiveData) setPositivePieData(newPositiveData);
    }

    if (negativePieData && type === "negative") {
      let newNegativeData: any = negativePieData.filter((data) => {
        return data.name !== word_name;
      });
      if (newNegativeData) setNegativePieData(newNegativeData);
    }
  };

  return (
    <div id="pageDiv" className="w-full h-full bg-slate-200">
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div
        id="itemsDiv"
        className="text-center flex flex-col justify-center items-center pt-24"
      >
        <div
          id="cardDiv"
          className="p-10 border border-indigo-300 bg-white rounded-lg shadow-lg"
        >
          <input
            className="border-b border-indigo-900"
            id="url"
            name="url"
            type="text"
            placeholder="Ex: http://example.com"
            ref={inputContainer}
            onChange={(e) => setRequestingUrl(e.target.value)}
          />
          <button
            className="ml-4 p-2 border bg-indigo-300 rounded-md shadow-lg shadow-indigo-400"
            type="button"
            onClick={() => handleButton(requestingUrl)}
          >
            Analyze
          </button>

          <p className="mt-4 text-red-600 text-lg w-full bg-slate-200 font-semibold rounded-md">
            Format: http://example.com
          </p>
        </div>
        <div id="chart-headers" className="align-bottom pt-8 text-5xl">
          Sentiment Analysis
        </div>
        <div
          id="chart-headers"
          className="align-bottom pt-8 text-4xl w-1/3 flex items-stretch"
        >
          <p className="grow">Positive&nbsp;</p>
          <p className="grow">vs.&nbsp;</p>
          <p className="grow">Negative&nbsp;</p>
        </div>
        <div className="flex bg-slate-900 h-full my-4 rounded-3xl">
          <PieChart width={400} height={400}>
            <Pie
              dataKey="value"
              isAnimationActive={false}
              data={positivePieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
            >
              {positivePieData &&
                positivePieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
            </Pie>

            <Tooltip />
          </PieChart>
          <PieChart width={400} height={400}>
            <Pie
              dataKey="value"
              isAnimationActive={false}
              data={negativePieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
            >
              {negativePieData &&
                negativePieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      </div>
      <div
        id="bottomContent"
        className="text-center flex flex-row justify-center space-x-64"
      >
        <div id="positiveBreakdown">
          <div
            id="highLevelPositiveBreakdown"
            className="bg-emerald-800 text-white p-4"
          >
            <p>
              Total Count of Positive Words:{" "}
              {positivePieData && handleCountCalculation(positivePieData)}
            </p>
            <p>
              Positive Words :{" "}
              {positivePieData &&
                negativePieData &&
                (
                  (handleCountCalculation(positivePieData) /
                    (handleCountCalculation(positivePieData) +
                      handleCountCalculation(negativePieData))) *
                  100
                ).toFixed(2)}
              &nbsp;%
            </p>
          </div>
          <h3>Positive Breakdown</h3>
          <ul>
            {positivePieData &&
              positivePieData.map((positive_word: any) => {
                return (
                  <li key={positive_word.name}>
                    {positive_word.name} occured {positive_word.value} times (
                    {positive_word.percentage}%)
                    <button
                      className="bg-slate-800 text-white p-1 ml-2 mb-2 rounded-md hover:bg-red-700 transition duration-300"
                      onClick={() => removeWord(positive_word.name, "positive")}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>
        <div id="negativeBreakdown">
          <div
            id="highLevelNegativeBreakdown"
            className="bg-red-700 text-white p-4"
          >
            <p>
              Total Count of Positive Words:{" "}
              {negativePieData && handleCountCalculation(negativePieData)}
            </p>
            <p>
              Negative Words:{" "}
              {positivePieData &&
                negativePieData &&
                (
                  (handleCountCalculation(negativePieData) /
                    (handleCountCalculation(positivePieData) +
                      handleCountCalculation(negativePieData))) *
                  100
                ).toFixed(2)}
              &nbsp;%
            </p>
          </div>
          <h3>Negative Breakdown</h3>
          <ul>
            {negativePieData &&
              negativePieData.map((negative_word: any) => {
                return (
                  <li key={negative_word.name}>
                    {negative_word.name} occured {negative_word.value} times (
                    {negative_word.percentage}%)
                    <button
                      className="bg-slate-800 text-white p-1 ml-2 mb-2 rounded-md hover:bg-red-700 transition duration-300"
                      onClick={() => removeWord(negative_word.name, "negative")}
                    >
                      Remove
                    </button>
                  </li>
                );
              })}
          </ul>
        </div>
      </div>
    </div>
  );
};

const readSite = () => {};

export default Home;
