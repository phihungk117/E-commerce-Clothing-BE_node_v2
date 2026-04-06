const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Octokit } = require("@octokit/rest");
const fs = require("fs");

async function run() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const githubToken = process.env.GITHUB_TOKEN;

    if (!apiKey || !githubToken) {
      console.error("Missing GEMINI_API_KEY or GITHUB_TOKEN");
      process.exit(1);
    }

    // Initialize Octokit and Gemini
    const octokit = new Octokit({ auth: githubToken });
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Get PR details
    const eventPath = process.env.GITHUB_EVENT_PATH;
    const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));
    const pr = event.pull_request;

    if (!pr) {
      console.log("No pull request found in event payload");
      return;
    }

    const owner = event.repository.owner.login;
    const repo = event.repository.name;
    const pull_number = pr.number;

    // Fetch the PR Diff
    const { data: diff } = await octokit.pulls.get({
      owner,
      repo,
      pull_number,
      mediaType: {
        format: "diff",
      },
    });

    // Check if diff is too large
    if (diff.length > 50000) {
        console.log("Diff is too large for a single pass, truncating...");
    }
    const truncatedDiff = diff.substring(0, 50000); // Simple truncation for safety

    // Prompt for Gemini
    const prompt = `
You are an expert code reviewer. Review the following code changes (git diff) from a Pull Request.
Focus on:
1. Bugs and potential runtime errors.
2. Security vulnerabilities.
3. Code quality, performance, and maintainability.
4. Clean code best practices.

Provide the review in Markdown format. Use emojis nicely.
If the code looks good, say so but still point out minor optional improvements if any.

Changes:
\`\`\`diff
${truncatedDiff}
\`\`\`
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reviewComment = response.text();

    // Post the review as a comment on the PR
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: pull_number,
      body: `## 🤖 Gemini Code Review\n\n${reviewComment}`,
    });

    console.log("Review posted successfully!");
  } catch (error) {
    console.error("Error running review:", error);
    process.exit(1);
  }
}

run();
