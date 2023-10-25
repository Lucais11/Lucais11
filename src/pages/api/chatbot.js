const axios = require('axios');
const cheerio = require('cheerio');
const scrapeDocs = require('./flyscraper');

require('dotenv').config();

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const OPENAI_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
  // Get the scraped data
  const docsData = await scrapeDocs();
  if (!docsData) {
    return res.status(500).send("Failed to fetch doc data");
}

// Combine all the scraped content
let combinedDocsContent = '';
for (let key in docsData) {
    combinedDocsContent += `---- ${key.toUpperCase()} ----\n` + docsData[key] + '\n\n';
}

// Combine the user's question with the aggregated scraped docs
const combinedPrompt = req.body.question + "\n" + combinedDocsContent;
  // Then pass the combined content to the OpenAI API
  try {
      const response = await axios.post(OPENAI_API_URL, {
        model: "gpt-3.5-turbo-16k",
        temperature: 0,
        messages: [
          {"role": "system", "content": "You are a chatbot trained to answer questions about everything fly.io documentation. Assist the user with their questions regarding it.If you cannot answer the question with the context, don't lie and make up stuff. Just say you need more context"},
          {
            "role": "user",
            "content": req.body.question
          },
          {
            "role": "assistant",
            "content": combinedPrompt
          },
        ]
      }, {
          headers: {
              'Authorization': `Bearer ${OPENAI_KEY}`,
              "Content-Type": "application/json"
          }
      });
if (response.data?.choices?.[0]?.message?.content) {
  res.status(200).send(response.data.choices[0].message.content.trim());
} else {
  console.error("Unexpected response structure:", JSON.stringify(response.data, null, 2));

  res.status(500).send("Unexpected response from AI");
}
  } catch (error) {
    console.error("Error querying the AI model:", error.message, error.response?.data);
    res.status(500).send(`Error querying the AI model: ${error.message}`)
  }
}




