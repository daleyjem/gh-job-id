import { getInput, setOutput } from '@actions/core'
import { context } from '@actions/github'

const github_token = getInput('github_token') ?? process.env.GITHUB_TOKEN
const repository = getInput('repository') ?? `${context.repo?.owner}/${context.repo?.repo}`
const run_id = getInput('run_id') ?? context.runId
const job_name = getInput('job_name') ?? context.job
const per_page = getInput('per_page') ?? 100

async function getJobInfo() {
  const githubApi = `/repos/${repository || process.env.GITHUB_REPOSITORY}/actions/runs/${run_id || process.env.GITHUB_RUN_ID}/jobs`
  const headers = {
    'Authorization': `Bearer ${github_token}`,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  }
  const queryParams = `per_page=${per_page || 30}`
  const url = `${context.apiUrl}${githubApi}?${queryParams}`

  const response = await fetch(url, { method: 'GET', headers })
  if (!response.ok) {
    throw new Error(`Failed to fetch job info: ${response.status} ${response.statusText}`)
  }

  const jobInfo = await response.json()

  if (jobInfo.message && jobInfo.message.includes("Resource not accessible by integration")) {
    console.error("Resource not accessible by integration")
    process.exit(1)
  }

  const total_count = jobInfo.total_count
  const job = jobInfo.jobs.find(job => job.name === job_name)

  if (!job) {
    console.error(`No job found with name ${job_name}`)
    process.exit(1)
  }

  const job_id = job.id
  const html_url = job.html_url

  if (!job_id) {
    console.error(`parse error, job_id is ${job_id} and total_count is ${total_count}. 'job_name' or 'per_page' might be wrong.`)
    process.exit(1)
  }

  console.log(`job_id=${job_id}`)
  console.log(`html_url=${html_url}`)

  setOutput('job_id', job_id)
  setOutput('html_url', html_url)
}

getJobInfo().catch(error => {
  console.error("Error:", error.message)
  process.exit(1)
})
