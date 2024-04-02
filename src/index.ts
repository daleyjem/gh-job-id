import { getInput, setOutput } from '@actions/core'
import { context, getOctokit } from '@actions/github'

const github_token = getInput('github_token') || process.env.GITHUB_TOKEN
const owner = getInput('owner') || context.repo.owner
const repo = getInput('repo') || context.repo.repo
const run_id = Number(getInput('run_id') || context.runId)
const job_name = getInput('job_name') || context.job

console.log('Using inputs:', {
  repo,
  run_id,
  job_name,
})

if (!github_token) throw new Error('No github token provided')

const octokit = getOctokit(github_token)

const getJobInfo = async () => {
  const jobs = await octokit.paginate(octokit.rest.actions.listJobsForWorkflowRun, {
    run_id,
    owner,
    repo,
  }).catch(reason => {
    console.log(`Failed to fetch job info.`)
    throw new Error(reason)
  })

  const job = jobs.find(job => job.name === job_name)

  if (!job) {
    console.error(`No job found with name ${job_name}`)
    process.exit(1)
  }

  const job_id = job.id
  const html_url = job.html_url

  console.log(`job_id=${job_id}`)
  console.log(`html_url=${html_url}`)

  setOutput('job_id', job_id)
  setOutput('html_url', html_url)
}

getJobInfo().catch(error => {
  console.error("Error:", error.message)
  process.exit(1)
})
