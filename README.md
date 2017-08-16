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
* Make sure that OpenWhisk CLI is properly configured as described on the CLI installation instructions:

  ```bash
  wsk property set --apihost openwhisk.ng.bluemix.net --auth foo:bar
  ```

## Solution Outline

The whole solution consists of three parts:

### Watson Conversation Service

A cognitive service provided by IBM to quickly build, run and manage chatbots or virtual agents which can communicate over a variety of multiple channels - Including Amazon Alexa.

The Watson Conversation Service is mainly used to configure and build the whole dialog structure. For the purpose to show the capabilities of the service in this demo, it will also do some basic transformations of the data - In a real world scenario you would most probably do that within your backend application.

[![Watson Conversation Service Overview](https://img.youtube.com/vi/1rTl1WEbg5U/2.jpg)](https://www.youtube.com/watch?v=1rTl1WEbg5U)

An overview about the basic concepts of Watson Conversation Service and some simple examples can be found here: [https://www.ibm.com/watson/services/conversation/](https://www.ibm.com/watson/services/conversation/).

<iframe width="560" height="315" src="https://www.youtube.com/embed/1rTl1WEbg5U" frameborder="0" allowfullscreen></iframe>

### Apache OpenWhisk

Apache OpenWhisk is a Function-as-a-Service (FaaS) platform which executes functions in response to incoming events and costs nothing when not in use. It is available as 