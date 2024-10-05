# Description

NodeJS-contained action for getting the `job_id` and `html_url` from a Github workflow job run. This uses
a similar logic as [Tiryoh/gha-jobid-action](https://github.com/Tiryoh/gha-jobid-action), but is contained
in such a way that the runner doesn't need to have things like `curl` or `jq` installed.

## Simple Usage

```yaml
name: Verifications
on:
  push:
    branches:
      - main

jobs:
  manual-check:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Get job info
        id: my_action
        uses: daleyjem/gh-job-id@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          job_name: "manual-check"
          
      - name: Output our action
        run: echo ${{ steps.my_action.outputs.job_id }} - ${{ steps.my_action.outputs.html_url }}
```

## Using inside of a reusable workflow

When using a reusable workflow:

```yaml
name: Parent Workflow
on:
  pull_request:
    branches:
      - main
jobs:
	main_job:
		uses: ./.github/workflows/reusable.yml
```

Github creates the reusable workflow's job name to be a concatenation with the parent workflow's job name (e.g. `<main workflow job> / <reusable workflow job>`), so be sure to specify the `job_name` input accordingly:

```yaml
name: Reusable Workflow
on:
  workflow_call:
jobs:
  reusable_job:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Run our action
        id: my_action
        uses: ./
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          job_name: "main_job / reusable_job"

      - name: Output our action
        run: echo ${{ steps.my_action.outputs.job_id }} - ${{ steps.my_action.outputs.html_url }}
```






