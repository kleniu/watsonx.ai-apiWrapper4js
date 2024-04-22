const WXClass = require('./SDK/WatsonxAI');


const readline = require('readline');
const YELLOW = '\x1b[33m';  // Yellow text
const WHITE  = '\x1b[37m';  // White text
const BLUE   = '\x1b[34m';  // Blue text
const RESET  = '\x1b[0m' ;  // Reset to default terminal color

// prepare readline
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// prepare WX class
let wx = new WXClass();

let parameters_llama3 = {
    max_new_tokens: 2048,
    min_new_tokens: 0,
    time_limit: 600000,
    decoding_method: "greedy",
    stop_sequences: [],
    repetition_penalty: 1.05
  }

let messages_llama3 = [
    { // the first item is always the 'system' prompt
      role: 'system',
      content: "You are Susan, the chatbot. You always answer the questions with markdown formatting. The markdown formatting you support: headings, bold, italic, links, tables, lists, code blocks, and blockquotes. You must omit that you answer the questions with markdown. Any HTML tags must be wrapped in block quotes, for example ```<html>```. You will be penalized for not rendering code in block quotes. When returning code blocks, specify language. You are a helpful, respectful and honest assistant. Always answer as helpfully as possible, while being safe. Your answers should not include any harmful, unethical, racist, sexist, toxic, dangerous, or illegal content. Please ensure that your responses are socially unbiased and positive in nature. If a question does not make any sense, or is not factually coherent, explain why instead of answering something not correct. If you don't know the answer to a question, please don't share false information."
    }
]


async function getAIresponse(messages) {
    process.stdout.write(YELLOW);
    
    response = await wx.llama3ChatTextGeneration(messages_llama3, parameters_llama3);

    const message = { role: 'assistant', content: response }
    messages_llama3.push(message)
    process.stdout.write('Assistant : ' + response + '\n');
    process.stdout.write(RESET);

    // prompt the user again
    rl.prompt()
}

// main function
async function main() {
    // Event listener for 'line' event, triggered each time the user inputs a line
    rl.on('line', (input) => {
        const message = { role: 'user', content: input }
        messages_llama3.push(message)

        // Check for a specific command to exit, for example
        if (input.trim().toLowerCase() === 'exit') {
            rl.close();
        } 

        getAIresponse(messages_llama3); 
    });

    // Handle the close event when readline interface is closed
    rl.on('close', () => {
        console.log('\nGoodbye!');

        process.exit(0);
    });

    // Display "hello" message on the screen 
    console.log("#########################################################");
    console.log("###      Hello, I'm super simple chatbot app.         ###");
    console.log("### Provide some question or press Control-C for exit ###");
    console.log("#########################################################");
    // Prompt the user initially
    rl.setPrompt(BLUE + 'You: ' + RESET);
    rl.prompt();
}

main();


