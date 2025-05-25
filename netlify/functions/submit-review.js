const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { name, message, rating, image } = JSON.parse(event.body);

    const token = process.env.GITHUB_TOKEN;
    const repo = 'yamkel-cell/sutiyam';
    const workflow = 'add-review.yml';

    const githubResponse = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: { name, message, rating, image }
      })
    });

    const text = await githubResponse.text();

    if (!githubResponse.ok) {
      console.error("GitHub API Error Response:", text);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "GitHub Action trigger failed", details: text })
      };
    }

    console.log("GitHub Action successfully triggered:", text);
    return {
      statusCode: 200,
      body: 'Review submitted successfully and sent to GitHub for approval.'
    };
  } catch (err) {
    console.error("Function crashed with error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", message: err.message })
    };
  }
};
