#!/usr/bin/env python3

import os
import subprocess
import json
import requests
import argparse

MAX_CHAR_COUNT = 10000

def generate_commit_msg():
    parser = argparse.ArgumentParser(description='Generate commit message.')
    parser.add_argument('--message', type=str, help='User-specified commit message')
    args = parser.parse_args()

    # Get the diff of staged changes
    diff = subprocess.check_output(["git", "diff","-U10", "--staged"]).decode("utf-8")

    # Get stat of staged changes instead of full diff if diff length is more than 10000 characters
    if len(diff) > MAX_CHAR_COUNT:
      # Get the diff of staged changes
      diff_stat = subprocess.check_output(["git", "diff", "--staged", "--stat"]).decode("utf-8")

      # Get the actual diff with 10 lines of context
      diff_context = subprocess.check_output(["git", "diff", "-U3", "--staged"]).decode("utf-8")

      # Concatenate the statistical summary and the actual diff
      diff = diff_stat + "\n" + diff_context


    # Set your ChatGPT API endpoint and key
    chatgpt_api_endpoint = "https://api.openai.com/v1/completions"
    chatgpt_api_key = os.environ.get("CHATGPT_API_KEY")

    if not chatgpt_api_key:
        raise ValueError("Please set the CHATGPT_API_KEY environment variable.")

    # Read user-specified commit message (if any)
    user_commit_msg = args.message if args.message else ""

    prompt = f"""
    Please suggest two detailed commit messages for the code changes.
    Each commit message should be composed of a title and a description.
    In the description, list changes for each file in the format [filename]: [description].
    Each suggestion should be one continious line using || for seperators

    1. Commit message: [title] || [description] || [filename]: [description] || [filename]: [description]\n
    2. Commit message: [title] || [description] || [filename]: [description] || [filename]: [description]\n
    Here are the changes: {diff[:MAX_CHAR_COUNT]}
    """

    if user_commit_msg:
        prompt += f"\nThe user has already specified this commit message: {user_commit_msg}\n"

    # Call ChatGPT API to suggest a commit message based on the diff and user-specified commit message (if any)
    response = requests.post(
        chatgpt_api_endpoint,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {chatgpt_api_key}"
        },
        data=json.dumps({
            "prompt": prompt,
            "max_tokens": 2500,
            "model": "text-davinci-003",
            "temperature": 0
        })
    )

    commit_msg = response.json()
#     commit_messages = [line.split(":")[1].strip() for line in commit_msg.split("\n") if "Commit message:" in line]

    # Print the suggested commit message
    print(commit_msg)
#     print(commit_messages)
#     print("prompt", prompt)

if __name__ == "__main__":
    generate_commit_msg()
