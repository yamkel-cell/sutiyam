const fetch = require('node-fetch');

exports.handler = async (event) => {
  console.log("Incoming request:", event);

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    console.log("Parsed body:", body);

    const { name, message, rating, image } = body;

    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error("Missing GITHUB_TOKEN in environment variables");
    }

    const repo = 'yamkel-cell/sutiyam';
    const workflow = 'add-review.yml';

    const payload = {
      ref: 'main',
      inputs: { name, message, rating, image }
    };

    console.log("Triggering GitHub workflow with payload:", payload);

    const githubResponse = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await githubResponse.text();
    console.log("GitHub response status:", githubResponse.status);
    console.log("GitHub response body:", responseText);

    if (!githubResponse.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: "GitHub API request failed",
          status: githubResponse.status,
          response: responseText
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Review submitted and GitHub Action triggered" })
    };
  } catch (err) {
    console.error("Handler error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error", message: err.message })
    };
  }
};
