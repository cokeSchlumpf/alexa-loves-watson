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

**Skills**

* Node JS programming skills are helpful

## Solution Outline

The whole solution consists of three parts which are briefly described below including their responsibilities in the demo.

### Watson Conversation Service

A cognitive service provided by IBM to quickly build, run and manage chatbots or virtual agents which can communicate over a variety of multiple channels - Including Amazon Alexa.

The Watson Conversation Service is mainly used to configure and build the whole dialog structure. For the purpose to show the capabilities of the service in this demo, it will also do some basic transformations of the data - In a real world scenario you would most probably do that within your backend application.

An overview about the basic concepts of Watson Conversation Service and some simple examples can be found here: [https://www.ibm.com/watson/services/conversation/](https://www.ibm.com/watson/services/conversation/).

### Apache OpenWhisk

Apache OpenWhisk is a Function-as-a-Service (FaaS) platform which executes functions in response to incoming events and costs nothing when not in use. It is available on IBM Bluemix.

In this demo OpenWhisk is used to implement backend logic of the service like getting and storing context information in the database etc. For this purpose the demo includes 4 OpenWhisk actions:

* **alexahandler** - A function which receives and responds to requests from Alexa.
* **conversation** - A function which acts as a client to Watson Conversation Service.
* **datastore** - A function which implements the data access layer which can be used by the other two actions.

* **datastore-api** - A function to access the datastore via a RESTful API. It is not necessary for the running solution, but really helpful to be able to see what's happening in the database.

An overview about the basic concepts of Apache OpenWhisk and some simple examples can be found here: [https://console.bluemix.net/openwhisk/learn/concepts?env_id=ibm:yp:us-south](https://console.bluemix.net/openwhisk/learn/concepts?env_id=ibm:yp:us-south).

### Amazon Alexa (and Alexa Skill Kit)

Amazon Alexa, the voice service that powers Echo, provides capabilities, that enable customers to interact with devices in a more intuitive way using voice.

In this demo the Amazon Alexa Skill Kit will be used to create an Alexa skill which basically gatheres every input and sends it to OpenWhisk/ Watson Conversation for processing. Thus in this use-case the interaction model features of the Skill Kit are not really utilized since this is already included within Watson Conversation.

An overview about the basic concepts of building custom skills for Alexa can be found here: [https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/overviews/understanding-custom-skills](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/overviews/understanding-custom-skills).

## Part 0: Clone the git repository

As you will need the code snippets and examples during the setup of the demo, it's a good idea to clone the repository:

```bash
git clone git@github.com:cokeSchlumpf/alexa-loves-watson.git
```

## Part 1: Creating a chatbot with Watson Conversation Service

This part will describe how to setup the Watson Conversation Service which includes the dialog logic which is later used as the interaction model for the Alexa skill.

### Quick Path: Setup the demo conversation

**Step 1.** Create an instance of Watson Conversation Service within your Bluemix Space on Bluemix US South.

  * Goto `http://console.bluemix.net`, make sure you have selected `US South` in the region selection in the top right corner.

    ![Bluemix Region US South](./images/wcs-bluemix-region.png)

  * Select `Catalog` on the top right menu. Within the catalog search for `Watson Conversation Service`. Select the entry to create a service instance. You may enter a sensefull name in the `Service name` field.

    ![Create a service instance](./images/wcs-create.png)

  * After you created the instance you will find it on the Bluemix Service Dashboard:

    ![Service Dashboard](./images/wcs-service-dashboard.png)

**Step 2.** Launch the service and upload the conversation.

  * Goto the Bluemix Service Dashboard and open the service. Within the service you'll find a button `Launch tool` to launch the actual Watson Conversation Service administration interface.

    ![Watson Conversation Service](./images/wcs-service.png)

    The actual service dashboard will look as similar to this:

    ![Watson Conversation Dashboard](./images/wcs-dashboard.png)
  
  * Click the upload symbol next to the create button to upload an existing conversation workspace and select the `./watson-conversation/workspace.json` from this repository.

  * When the workspace was uploaded you can inspect the conversation setup.

    ![Inspect Watson Conversation](./images/wcs-inspect.png)

    You can even directly try the conversation as a chatbot by selecting the speech bubble in the top right corner in the workspace. Don't worry if you get an error as shown in the screenshot above - Some answers don't work as expected due to missing context wich will later be sent through OpenWhisk to the conversation service.

### Details

Details on how the conversation is implemented will follow.

## Part 2: Create OpenWhisk actions

This part will describe how to setup the OpenWhisk actions and explain what they're doing. The demo includes 4 OpenWhisk actions:

**alexahandler.** A function/ action which receives and responds to requests from Alexa. Basically this is a HTTP endpoint which receives requests from Alexa of the following form:

```json
{
  "session": {
    "new": true,
    "sessionId": "...",
    "application": {
      "applicationId": "..."
    },
    "attributes": {},
    "user": {
      "userId": "..."
    }
  },
  "request": {
    "type": "IntentRequest",
    "requestId": "EdwRequestId.9223f200-9bf9-426d-8999-73d7cf928b36",
    "intent": {
      "name": "UtteranceIntent",
      "slots": {
        "Utterance": {
          "name": "Utterance",
          "value": "add two bottles of coke to my list"
        }
      }
    },
    "locale": "en-US",
    "timestamp": "2017-08-16T04:30:05Z"
  },
  "context": {
    "AudioPlayer": {
      "playerActivity": "IDLE"
    },
    "System": {
      "application": {
        "applicationId": "..."
      },
      "user": {
        "userId": "..."
      },
      "device": {
        "supportedInterfaces": {}
      }
    }
  },
  "version": "1.0"
}
```

And it should respond with a JSON file which can be interpreted by Amazon Alexa, like the following:

```json
{
  "outputSpeech": {
    "text": "Added 2 bottles Coke to your list! Something else?"
  },
  "shouldEndSession": false
}
```

For this purpose the action loads and saves the conversation context which related to the Alexa session from the database using the `datastore` action, before and after calling the `conversation` action.

**conversation.** A function/ action which acts as a client to Watson Conversation Service. As such it utilizes the [Watson Node SDK](https://www.npmjs.com/package/watson-developer-cloud) to send requests to the conversation service. As an input this action expects the current conversation context, a user id and the user's utterance. Based on the user id, the action will load and save the current shopping list from the database before and after calling the Watson Conversation Service.

The shopping list is not included in the context which was loaded by the `alexahandler` action, since it should be possible in a later stage to add other channels than Alexa to the application, e.g. Facebook Messenger.

**datastore.** A function/ action which implements the data access layer which can be used by the other two actions. The action basically uses the [Cloudant Node JS client](https://www.npmjs.com/package/cloudant) to implement CRUD operations against a Cloudant database.

**datastore-api.** A function/ action to access the datastore via a RESTful API. It is not necessary for the running solution, but really helpful to be able to see what's happening in the database.

### Quick Path: Setup the demo conversation

**Step 1.** Setup you credentials file

  * Within the cloned repository, copy/ move the file `package.parameters.template.json` to `package.parameters.json`. This file will later include the necessary credentials for your Cloudant and Watson Conversation Service, which will be injected to the OpenWhisk actions.

**Step 2.** Create and configure a Cloudant instance

  * Goto `http://console.bluemix.net`, make sure you have selected `US South` in the region selection in the top right corner.

    ![Bluemix Region US South](./images/wcs-bluemix-region.png)

  * Select `Catalog` on the top right menu. Within the catalog search for `Cloudant NoSQL`. Select the entry `Cloudant NoSQL database` to create a service instance. You may enter a sensefull name in the `Service name` field.

  * Via the service dashboard, open the Cloudant Database via the `Launch` button within the service page and create a new database with the name `remember-the-pineapple`.

    ![Cloudant Databse](./images/wsk-cloudantdb.png)

  * Go back to the service page and open the credentials tab, click `Open Credentials` to view the credentials.

    ![Cloudant Credentials](./images/wsk-cloudant-credentials.png)

    Those credentials look like:

    ```json
    {
      "username": "...",
      "password": "...",
      "host": "instance-bluemix.cloudant.com",
      "port": 443,
      "url": "https://user:password@instance-bluemix.cloudant.com"
    }
    ```

    Copy the url into the `package.parameters.json` file for `config.cloudant.url`.

**Step 3.** Get the Watson Conversation Service Credentials. 

  * Open the Watson Conversation Service Workspace as described above. Select the 2nd icon on the left menu and open the credentials tab. When the page is loaded it will show the credentials required to access your conversation from a client application.

  * Copy username, password and the workspace id in the conversation section within `package.parameters.json`.

**Step 4.** Deploy your OpenWhisk actions.

  * Go into every subdirectory of `./actions` and execute a `npm install` to download the action's dependencies.

  * Execute `./deploy.sh` to create all actions on your OpenWhisk account on Bluemix.

  * You can test if everything works by executing the following OpenWhisk action invocation:

    ```bash
    wsk action invoke remember-the-pineapple/conversation --result -p text "Please add 4 packages of tea to my list" -p userid "0001"
    ```

### Details

Details on how the actions are implemented will follow.

## Part 3: Create the Alexa skill

The Alexa skill is the last part which is necessary to build the demo. Follow the quick setup guide to setup.

### Quick path: Setup the skill

**Step 1.** Create a new skill.

  * Goto the Alexa [Skill Kit Webpage](https://developer.amazon.com/alexa-skills-kit), sign in, and create a new Skill.

    ![Create Skill](./images/alexa-create.png)

**Step 2.** Setup the skill.

  * On the Skill Information step, enter a name and an invocation name. E.g. `Remember the pineapple` and `Watson Smart List` - Shopping list is not a good idea since Alexa already has an in-built shopping list.

    ![Skill Information](./images/alexa-skillinfo.png)

  * On the interaction model page, enter the intent schema (`./alexa/intent-schema.json`) and the sample utterances (`./alexa/sample-utterances.json`).

    ![Interaction Model](./images/alexa-interactionmodel.png)

  * On the configuration page select `HTTPS` as Service Endpoint Type and enter a valid OpenWhisk URL like

    ```bash
    https://openwhisk.ng.bluemix.net/api/v1/web/${organisation}_${space}/remember-the-pineapple-api/alexahandler/ 

    # e.g.
    https://openwhisk.ng.bluemix.net/api/v1/web/wellnr_dev/remember-the-pineapple-api/alexahandler/
    ```

    ![Configuration](./images/alexa-configuration.png)

  * On the SSL certificate page select `My development endpoint is a sub-domain of a domain that has a wildcard certificate from a certificate authority`

  * On the test page you can now test the skill:

    ![Test](./images/alexa-test.png)