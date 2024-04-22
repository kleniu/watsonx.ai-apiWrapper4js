const axios                = require('axios');
const { IamAuthenticator } = require('ibm-cloud-sdk-core');
const dotenv               = require('dotenv');

// read Environmental Variables
require('dotenv').config();

class DetailedError extends Error {
  constructor(message, description) {
    super(message);                            // Pass message to the Error constructor
    this.description = description;
    this.name        = this.constructor.name;  // Set error name to the class name
  }
}

// class definition
class WXClass {
    constructor() {
        // set environmental variables
        dotenv.config();

        // check required environmental variables
        if (!process.env.WX_APIKEY)
            throw new Error("No WX_APIKEY key was set.");
        if (!process.env.WX_BASEURL)
            throw new Error("No WX_BASEURL key was set.");
        if (!process.env.WX_PROJECTID)
            throw new Error("No WX_PROJECTID key was set.");
        
        //set environmental variables
        this.baseurl   = process.env.WX_BASEURL
        this.projectID = process.env.WX_PROJECTID
        this.apikeyIAM = process.env.WX_APIKEY

        // instantiate axios and IBM IAM authenticator
        this.axiosInstance = axios.create();
        this.authenticator = new IamAuthenticator({ apikey: this.apikeyIAM });
    }

    // private methods
    async #getBearerToken() {
      let token = '';
      if( this.authenticator.tokenManager.isTokenExpired() ) {
        const token = await this.authenticator.tokenManager.requestToken();
        this.authenticator.tokenManager.saveTokenInfo(token);
      }
      token = this.authenticator.tokenManager.accessToken;
      return token
    }

    async #makeRequest(method, url, data, headers) {
      try {
        const response = await this.axiosInstance({ method, url, data, headers });
        return response.data;
      } catch (error) {
        console.debug(error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error("Response error:", error.response.status, error.response.data);
          let desc = ''
          switch (error.response.status) {
            case (400):
              desc = `The input parameters in the request body are either incomplete, or in the wrong format, or some other input validation failed. Details ${JSON.stringify(error.response.data)}`;
              break;
            case (401):
              desc = 'You are not authorized to make this request. Regenerate token again or provide a valid one.';
              break;
            case (403):
              desc = 'The supplied authentication is not authorized.';
              break;
            case (404):
              desc = 'The requested resource could not be found.'
              break;
            default:
              desc = 'Unknown error.'
          }
          throw new DetailedError(
            "API Response Error",
            `Error making ${method.toUpperCase()} request to ${url}: Server responded with status ${error.response.status}. ${desc}`
          );
        } else if (error.request) {
          // The request was made but no response was received
          // console.error("No response:", error.request);
          throw new DetailedError(
            "Network Error",
            `Error making ${method.toUpperCase()} request to ${url}: No response received`
          );
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error("Error setting up request:", error.message);
          throw new DetailedError(
            "Request Setup Error",
            `Error making ${method.toUpperCase()} request to ${url}: ${error.message}`
          );
        }
      }
    }
  
    // public methods
    async checkAPIbaseurl(baseurl) {
      const url = `${baseurl}/ml/v1/foundation_model_specs?limit=1&version=2024-03-27`;
      try {
        const response = await this.#makeRequest('get', url);
      } catch (detailedError) {
          return false;
      }
      return true;
    }
    
    async getModelsInfo(modelID = null) {
      const baseurl = this.baseurl; 
      const url = `${baseurl}/ml/v1/foundation_model_specs?limit=200&version=2024-03-27`;
      const response = await this.#makeRequest('get', url);
      if ( modelID !== null ) {
        return response.resources.filter( model => model.model_id === modelID);
      }
      else {
        return response.resources;
      }
    }

    async listModelsIDs() {
      const baseurl = this.baseurl; 
      const url = `${baseurl}/ml/v1/foundation_model_specs?limit=200&version=2024-03-27`;
      const response = await this.#makeRequest('get', url);
      return response.resources.map(model => model.model_id);
    }

    async textGeneration(modelID, prompt, parameters) {
      const projectID = this.projectID;
      const baseurl   = this.baseurl;
      const token     = await this.#getBearerToken();

      const url = `${baseurl}/ml/v1/text/generation?version=2024-03-27`
      const headers = {"Content-Type" : "application/json", "Accept" : "application/json", "Authorization" : `Bearer ${token}`};
      const data = {
        model_id: modelID,
        input: prompt,
        parameters: parameters,
        project_id: projectID,
      };
      const response = await this.#makeRequest('post', url, data, headers);
      return response.results[0].generated_text; 
    }

    granitePrepareChatPrompt(messages) {
      const granite_prompt = messages.reduce((prev, cur) => {
          switch(cur.role) {
              case 'system':
                  return prev += '<|system|>\n' + cur.content + '\n'; 
              case 'user':
                  return prev += '<|user|>\n' + cur.content + '\n'; 
              case 'assistant':
                  return prev += '<|assistant|>\n' + cur.content + '\n';
          }
      }, '');
      return granite_prompt
    }

    async graniteChatTextGeneration(messages, parameters) {
      const granite_prompt = this.granitePrepareChatPrompt(messages) + '<|assistant|>\n'
      const generated_text = await this.textGeneration('ibm/granite-13b-chat-v2', granite_prompt, parameters );
      return generated_text.trim();
    }

    llama3PrepareChatPrompt(messages) {
      const granite_prompt = messages.reduce((prev, cur) => {
          switch(cur.role) {
              case 'system':
                  return prev += '<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n' + cur.content + '\n<|eot_id|>\n'; 
              case 'user':
                  return prev += '<|start_header_id|>user<|end_header_id|>\n' + cur.content + '\n<|eot_id|>\n'; 
              case 'assistant':
                  return prev += '<|start_header_id|>assistant<|end_header_id|>\n' + cur.content + '\n<|eot_id|>\n';
          }
      }, '');
      return granite_prompt
    }

    async llama3ChatTextGeneration(messages, parameters) {
      const granite_prompt = this.llama3PrepareChatPrompt(messages) + '<|start_header_id|>assistant<|end_header_id|>\n'
      const generated_text = await this.textGeneration('meta-llama/llama-3-70b-instruct', granite_prompt, parameters );
      return generated_text.trim();
    }
    

}

module.exports = WXClass;

