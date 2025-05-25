const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { name, message, rating, image } = JSON.parse(event.body);

  // Replace with your GitHub PAT (store this in Netlify environment variables)
  const token = process.env.GITHUB_TOKEN;
  const repo = 'yamkel-cell/sutiyam';
  const workflow = 'add-review.yml';

  const response = await fetch(`https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`, {
    method: 'POST',
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github+json',
    },
    body: JSON.stringify({
      ref: 'main',
      inputs: { name, message, rating, image }
    })
  });

  if (response.ok) {
    return { statusCode: 200, body: 'Review submitted successfully' };
  } else {
    const errorText = await response.text();
    return { statusCode: 500, body: `GitHub Action failed: ${errorText}` };
  }
};

