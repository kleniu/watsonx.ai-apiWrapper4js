# watsonx.ai-apiWrapper4js
Explore the power of [Watsonx.ai's API](https://cloud.ibm.com/apidocs/watsonx-ai) through this super-simplified code snippets for JavaScript developers. Inside, you'll find detailed examples and code snippets on how to integrate and interact with Watsonx.ai's large language models (LLMs) hosted on the Watsonx.ai platform. Whether you're building applications, experimenting with AI, or seeking to enhance your projects with advanced language capabilities, this resource is tailored to provide you with practical, easy-to-follow guidance. Perfect for developers looking to harness the capabilities of next-generation AI models in their JavaScript applications.

## What Can It Do and How Can You Play With It?
![Demo](DOCS/output.gif)

### Prerequisites: Set up environmental variables.

Setting up the three environment variables WX_APIKEY, WX_BASEURL, and WX_PROJECTID is essential for authenticating and configuring access to specific IBM Cloud services and WatsonX environments through API calls.

You need to copy the `.env-example` file to a `.env` file and modify the environment variables according to your specific configurations.

To install required packages using Yarn, I assume that Node.js and Yarn are installed on your machine as described at the end of this file. 

Navigate to the directory of your project where the `package.json` file is located. You can install all the dependencies listed in `package.json` by running:

```bash
yarn install
```

Now you are able to run an app
```shell
node ./app.js
```

### How to use the watsonx.ai API js wrapper
The `WXClass` wrapper, located in `SDK/WatsonxAI.js`, facilitates interaction with `Granite` or `LLAMA 3` models in chat mode.

To interact with the Granite LLM model, use the `graniteChatTextGeneration` method, and for the LLAMA3 model, use the `llama3ChatTextGeneration` method.

All tasks, such as Bearer Token generation for proper authentication, are automatically handled based on the `WX_APIKEY` environment variable using the `'ibm-cloud-sdk-core'` SDK.

The example code is provided in the `app.js` file, which is a terminal application.

#### Other useful helpers
1. You can read a list of available LLMs using the `listModelsIDs` method.

```javascript
const WXClass = require('./SDK/WatsonxAI');
let wx = new WXClass();
async function main() {
    let modelsID = await wx.listModelsIDs();
    console.log(modelsID);
}
main();
```
It's good to start with these as they are super small and hence extremely quick: 
```json
['ibm-mistralai/mistral-8x7b-instruct-v01-q', 'ibm/granite-13b-chat-v2', 'ibm/granite-13b-instruct-v2', 'ibm/granite-20b-multilingual', 'meta-llama/llama-3-70b-instruct', 'meta-llama/llama-3-8b-instruct', ...]
```
1. You can read detailed information about a particular model using the `getModelsInfo` method.

```javascript
const WXClass = require('./SDK/WatsonxAI');
let wx = new WXClass();

async function main() {
    let modelID = "meta-llama/llama-3-70b-instruct";
    let models = await wx.getModelsInfo(modelID);
    console.log(JSON.stringify(models, null, 2));
}
main();
```
Here is the example outputt for `meta-llama/llama-3-70b-instruct`. Notice that they show the model class along with the description of possible use-cases.
```json
[
  {
    "model_id": "meta-llama/llama-3-70b-instruct",
    "label": "llama-3-70b-instruct",
    "provider": "Meta",
    "source": "Hugging Face",
    "short_description": "Llama-3-70b-instruct is an auto-regressive language model that uses an optimized transformer architecture.",
    "long_description": "Llama-3-70b-instruct is a pretrained and fine-tuned generative text model with 70 billion parameters, optimized for dialogue use cases.",
    "tier": "class_2",
    "number_params": "70b",
    "min_shot_size": 1,
    "task_ids": [
      "question_answering",
      "summarization",
      "retrieval_augmented_generation",
      "classification",
      "generation",
      "code",
      "extraction"
    ],
    "tasks": [
      {
        "id": "question_answering",
        "ratings": {
          "quality": 4
        }
      },
      {
        "id": "summarization",
        "ratings": {
          "quality": 3
        }
      },
      {
        "id": "retrieval_augmented_generation",
        "ratings": {
          "quality": 4
        }
      },
      {
        "id": "classification",
        "ratings": {
          "quality": 4
        }
      },
      {
        "id": "generation"
      },
      {
        "id": "code"
      },
      {
        "id": "extraction",
        "ratings": {
          "quality": 4
        }
      }
    ],
    "model_limits": {
      "max_sequence_length": XXX
    },
    "limits": {
      "lite": {
        "call_time": "5m0s",
        "max_output_tokens": XXX
      },
      "v2-professional": {
        "call_time": "10m0s",
        "max_output_tokens": XXX
      },
      "v2-standard": {
        "call_time": "10m0s",
        "max_output_tokens": XXX
      }
    },
    "lifecycle": [
      {
        "id": "available",
        "start_date": "2024-04-18"
      }
    ]
  }
]
```

### Docs and links.
- [watsonx.ai API](https://cloud.ibm.com/apidocs/watsonx-ai)
- [watsonx.ai DOCS](https://dataplatform.cloud.ibm.com/docs/content/wsj/getting-started/welcome-main.html?context=wx&audience=wdp)
- [IAM Identity Services API](https://cloud.ibm.com/apidocs/iam-identity-token-api)


## Configuring a Local Development Environment.

### 1. Install NVM
Install Node Version Manager (NVM) using Homebrew on macOS, you can follow these steps. 
```shell
brew update
brew install nvm
```
After installing, you need to configure the shell's environment variables to use NVM. Add the following to your `~/.zshrc` file
```
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
```
source `~/.zshrc` file
```shell
source ~/.zshrc
```

### 2. Install Node.JS and Yarn
You can list of available node versions using `nvm list-remote` command.
Install the `v20.12.2` version of node.
```
nvm install 20.12.2
node --version
npm --version
npm install -g yarn
yarn --version
```
