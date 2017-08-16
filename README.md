# Alexa loves Watson - Alexa, OpenWhisk and Watson Conversation

This demo shows how you can integrate Amazon Alexa with IBM Watson Conversation Service. To implement some application logic we'll also use Apache OpenWhisk and IBM Cloudant to provide a serverless backend for the service.

The demo realizes a simple 'smart' shopping list which can be managed using an Alexa voice interface.

**Sample Secenario 1 - Adding an item to the list**

|User Utterance|Sample Answer|
|:-|-:|
|Alexa, ask *Watson Smart List* to put two bottles of coke on my list.||
||Ok, I added to 2 bottles coke to your list|

**Sample Scenario 2 - Adding an item to the list without specifying the amount**

In this secenario the skill will not just basically answer, it will lead you through a short dialog until it has enough information to add the item to the list.

|User Utterance|Sample Answer|
|:-|-:|
|Alexa, ask *Watson Smart List* to put coke on my list.||
||What count should I node on the list?|
|two bottles||
||Ok, I added to 2 bottles coke to your list|

**Sample Scenario 3 - Asking if an element is on the shopping list**

|User Utterance|Sample Answer|
|:-|-:|
|Alexa, ask *Watson Smart List* if coke is on my list.||
||Yes, you have 2 bottles coke on your list|

**Sample Scenario 4 - Asking for the whole shopping list**

|User Utterance|Sample Answer|
|:-|-:|
|Alexa, ask *Watson Smart List* what's on my list.||
||Your current shopping list contains: 2 bottles coke, 4 packages tea.|

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
* Make sure that OpenWhisk CLI is properly configured as described on the CLI installation instructions.

## Solution Outline

The whole solution consists of three parts which are briefly described below including their responsibilities in the demo.

### Watson Conversation Service

A cognitive service provided by IBM to quickly build, run and manage chatbots or virtual agents which can communicate over a variety of multiple channels - Including Amazon Alexa.

The Watson Conversation Service is mainly used to configure and build the whole dialog structure. For the purpose to show the capabilities of the service in this demo, it will also do some basic transformations of the data - In a real world scenario you would most probably do that within your backend application.

An overview about the basic concepts of Watson Conversation Service and some simple examples can be found here: [https://www.ibm.com/watson/services/conversation/](https://www.ibm.com/watson/services/conversation/).

### Apache OpenWhisk

Apache OpenWhisk is a Function-as-a-Service (FaaS) platform which executes functions in response to incoming events and costs nothing when not in use. It is available on IBM Bluemix.

In this demo OpenWhisk is used to implement backend logic of the service like getting and storing context information in the database etc. Fot this purpose the demo includes 4 OpenWhisk actions:

* **alexahandler** - A function which receives and responds to requests from Alexa.
* **conversation** - A function which acts as a client to Watson Conversation Service.
* **datastore** - A function which implements the data access layer which can be used by the other two actions.

* **datastore-api** - A function to access the datastore via a RESTful API. It is not necessary for the running solution, but really helpful to be able to see what's happening in the database.

An overview about the basic concepts of Apache OpenWhisk and some simple examples can be found here: [https://console.bluemix.net/openwhisk/learn/concepts?env_id=ibm:yp:us-south](https://console.bluemix.net/openwhisk/learn/concepts?env_id=ibm:yp:us-south).

### Amazon Alexa (and Alexa Skill Kit)

Amazon Alexa, the voice service that powers Echo, provides capabilities, that enable customers to interact with devices in a more intuitive way using voice.

In this demo the Amazon Alexa Skill Kit will be used to create an Alexa skill which basically gatheres every input and sends it to OpenWhisk/ Watson Conversation for processing. Thus in this use-case the interaction model features of the Skill Kit are not really utilized since this is already included within Watson Conversation.

An overview about the basic concepts of building custom skills for Alexa can be found here: [https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/overviews/understanding-custom-skills](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/overviews/understanding-custom-skills).

## Part 1: Creating a chatbot with Watson Conversation Service

This part will describe how to setup the Watson Conversation Service which includes the dialog logic which is later used as the interaction model for the Alexa skill.

### Quick path: Setup the demo conversation

**Step 1.** Create an instance of Watson Conversation Service within your Bluemix Space on Bluemix US South.

  * Goto `http://console.bluemix.net`, make sure you have selected `US South` in the region selection in the top right corner.

    ![Bluemix Region US South](./images/wcs-bluemix-region.png)