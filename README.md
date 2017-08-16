# Alexa loves Watson - Alexa, OpenWhisk and Watson Conversation

This demo shows how you can integrate Amazon Alexa with IBM Watson Conversation Service. To implement some application logic we'll also use Apache OpenWhisk and IBM Cloudant to provide a serverless backend for the service.

The demo realizes a simple 'smart' shopping list which can be managed using an Alexa voice interface.

**Sample Secenario 1 - Adding an item to the list without specifying the amount**

|User Utterance|Sample Answer|
|:-|-:|
|Alexa, ask *Watson Smart List* to put coke on my list.||
||What count should I node on the list?|
|two bottles||
||Ok, I added to 2 bottles coke to your list|


## Prerequisits

To execute the instructions to build the example the following things should be in place:

**Acounts**

* Amazon Developer Account [http://developer.amazon.com/](http://developer.amazon.com/)
* IBM Bluemix Account [http://bluemix.net/](http://bluemix.net/)

**Installed applications**

* Installed Cloud Foundry or Bluemix CLI [http://docs.cloudfoundry.org/cf-cli/install-go-cli.html](http://docs.cloudfoundry.org/cf-cli/install-go-cli.html)
* Installed OpenWhisk CLI [https://console.bluemix.net/openwhisk/learn/cli?env_id=ibm:yp:us-south](https://console.bluemix.net/openwhisk/learn/cli?env_id=ibm:yp:us-south)
* A running NodeJS development environment (node, npm)
* A source code editor like VSCode, Atom, Sublime, etc.
* For Windows only: Cygwin, Powershell or similar to run the shell scripts.

**Setup**

* A Bluemix space in the Bluemix US South region must exist which will be used for this demo.
* Make sure that OpenWhisk CLI is properly configured as described on the CLI installation instructions:

  ```bash
  wsk property set --apihost openwhisk.ng.bluemix.net --auth foo:bar
  ```

## Part 1: Configure a Dialog