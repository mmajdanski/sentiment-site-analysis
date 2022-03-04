// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { positive_words, negative_words } from "../../public/word_data.js";
const axios = require("axios");
const jsdom = require("jsdom");

const { JSDOM } = jsdom;

const axiosConfig = {
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Origin, X-Requested-With, Content-Type, Accept",
  },
  crossDomain: true,
};

type WordObj = {
  word: string;
  count: number;
  percentage: number;
  suspicious?: boolean;
};

type Words = {
  positive: Array<WordObj> | WordObj[];
  negative: Array<WordObj> | WordObj[];
  positive_sum: number;
  negative_sum: number;
  positive_to_negative_percentage: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Words>
) {
  let dom;
  try {
    console.log("HERE IS THE REQUESTING URL");
    console.log(req.body.requesting_url);
    let response_data = await axios.get(req.body.requesting_url, axiosConfig);
    console.log("trying to log the response DATA:", response_data);
    dom = new JSDOM(response_data.data);
    console.log("trying to use the JSDOM library to read the data");
  } catch (error) {
    console.log(error);
  }

  let document: string[] = dom.window.document.body.textContent
    .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, "")
    .split(" ");

  //Change to only look at PROPER DOM elements, not the entire body (scripts may be in the body)

  let found_existing_word = false;

  let words: Words = {
    positive: [],
    negative: [],
    positive_sum: 0,
    negative_sum: 0,
    positive_to_negative_percentage: 0,
  };

  document.forEach((document_word) => {
    document_word = document_word.replace(
      /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
      ""
    );
    // positive_word = positive_word.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
    if (positive_words.includes(document_word)) {
      found_existing_word = false;

      words.positive.forEach((word_obj) => {
        if (word_obj.word == document_word) {
          word_obj.count!++; //We do not need to create a new object, increase the count of the word
          found_existing_word = true; //Flag to say that the word ALREADY exists in our Array
        }
      });

      if (!found_existing_word)
        words.positive.push({ word: document_word, count: 1, percentage: 0 }); //If the object doesnt exist in our array, we create it
    }
  });

  document.forEach((document_word) => {
    document_word = document_word.replace(
      /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
      ""
    );
    //negative_word = negative_word.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '')
    if (negative_words.includes(document_word)) {
      found_existing_word = false;

      words.negative.forEach((word_obj) => {
        if (word_obj.word == document_word) {
          word_obj.count!++; //We do not need to create a new object, increase the count of the word
          found_existing_word = true; //Flag to say that the word ALREADY exists in our Array
        }
      });

      if (!found_existing_word)
        words.negative.push({ word: document_word, count: 1, percentage: 0 }); //If the object doesnt exist in our array, we create it
    }
  });

  let positive_word_sum = 0;
  //Calculate Positive Word Sum
  words.positive.forEach((positive_word) => {
    positive_word_sum += positive_word.count;
  });

  words.positive_sum = positive_word_sum; //Here is our sum of positive words

  //Calculate % Makeup
  words.positive.forEach((positive_word) => {
    positive_word.percentage = parseInt(
      ((positive_word.count / positive_word_sum) * 100).toFixed()
    );
  });

  let negative_word_sum = 0;
  //Calculate Positive Word Sum
  words.negative.forEach((negative_word) => {
    negative_word_sum += negative_word.count;
  });

  words.negative_sum = negative_word_sum; // Here is our sum of negative words

  //Calculate % Makeup
  words.negative.forEach((negative_word) => {
    negative_word.percentage = parseInt(
      ((negative_word.count / negative_word_sum) * 100).toFixed()
    );
  });

  words.positive_to_negative_percentage = parseInt(
    (
      (words.positive_sum / (words.positive_sum + words.negative_sum)) *
      100
    ).toFixed()
  );

  words.positive.sort(function (a, b) {
    return b.count - a.count;
  });

  words.negative.sort(function (a, b) {
    return b.count - a.count;
  });

  res.status(200).json(words);
}
