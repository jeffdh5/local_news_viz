local_news_viz
==============
Description:
The Local News Database Visualization is a front-end interface for displaying articles,
along with the relevance score of a specific query term. The main use-case for this interface
is testing various article geo-coding algorithms for accuracy.

Project dependencies:\n
1) Express

Installation Instructions:
1) Install node.js. A guide is included in the notes section of this Readme.
2) cd into project directory.
3) Type in "npm install" in console.
4) If you have not already set up a database on Parse.com:
	-Create an application on Parse, and create a new class called "articles". You can modify 
	this later by modifying parse_database_name in settings.js. 
	
	-Save the Parse Application ID of your new application, and find your REST API key. Modify 
	/scripts/settings.js accordingly.
	
	-An example JSON file has been included for you. To test it out, import articles.json 
	to your Parse application.
	
	-A JSON database compatible with the visualization app requires these fields:
		-author (String)
		-relevance (Array)
		-text (String)
		-title (String)
	
	-Example format: 
	{ "results": [
		{
			"author": "Anthony L. Komaroff, M.D. Ask Dr. K",
			"createdAt": "2014-04-11T06:55:03.002Z",
			"objectId": "Fr8OOKLOzm",
			"relevance": 0,
			"text": "Dear Dr. K: My cholesterol has always been fine, but recently it's started to\r\nrise, though not high enough for medication. What do I need to do?\r\n\r\nDear Reader: There are several ways you can lower your cholesterol besides\r\ntaking medicine. They involve cholesterol-friendly lifestyle changes: dietary\r\nmodifications and regular exercise.\r\n\r\nStart with your diet. First, let's consider fats. The types of fat you eat are\r\nas important as the amounts you eat. Most animal and dairy fats are full of\r\nunhealthy saturated fats, which raise cholesterol levels.\r\n\r\nIn fact, consuming foods with saturated fat will raise your blood levels of\r\ncholesterol more than consuming foods high in cholesterol itself (interestingly,\r\ncholesterol is also a type of fat). Saturated fats stimulate your liver to\r\nproduce more cholesterol, and your liver is the main source of cholesterol in\r\nyour body.\r\n\r\nSaturated fats are found mostly in animal products, such as meat, milk and eggs.\r\nA few vegetable oils, such as palm oil, coconut oil and cocoa butter, also\r\ncontain saturated fats.\r\n\r\nTrans fats are even worse and should be avoided completely. Trans fats raise LDL\r\n(bad) cholesterol and lower HDL (good) cholesterol. It's a double whammy. Trans\r\nfats can be found in hard (stick) margarines and processed cakes, biscuits,\r\ncookies and a range of other products. The FDA is likely to ban trans fats in\r\nthe near future.\r\n\r\nOn the other hand, most vegetable fats (oils) are made up of unsaturated fats\r\nthat are healthy for your heart. You can find these healthier fats in fish as\r\nwell as nuts, seeds, vegetables and most vegetable oils. Opt for these whenever\r\npossible. They don't raise your blood cholesterol levels.\r\n\r\nTwo more dietary changes can also help. First, increase your intake of soluble\r\ndietary fiber. Oat bran, barley, nuts, seeds, beans and lentils are all good\r\nsources. Second, increase your consumption of plant sterols and stanols. These\r\nnaturally occurring plant compounds limit the amount of cholesterol your body\r\ncan absorb. You can find sterol- and stanol-enriched orange juice, cereals and\r\nmargarine spreads in the grocery store.\r\n\r\nThe other key lifestyle change is regular exercise, which improves cholesterol\r\nlevels and protects against cardiovascular disease. It also raises HDL (good)\r\ncholesterol.\r\n\r\nAim for at least 30 minutes of moderate-intensity physical activity on most days\r\nof the week. Jogging, running, swimming, biking, tennis and basketball are all\r\ngreat options.\r\n\r\nContinue to maintain these lifestyle changes even if you eventually need\r\nmedication.\r\n\r\nIt sounds like you'd prefer not to take cholesterol medicines, but there's some\r\nnew information you should know. The statins, medicines that lower cholesterol,\r\nhave been discovered to protect against heart disease even in people with normal\r\ncholesterol levels. For that reason, statins are recommended in people with\r\nseveral risk factors for heart disease   even if their cholesterol levels are\r\nnormal.\r\n\r\nSo while you absolutely should consider lifestyle changes first to lower your\r\ncholesterol, check with your doctor about whether you might also benefit from\r\nstatins.\r\n\r\nDr. Komaroff is a physician and professor at Harvard Medical School. See his\r\nwebsite to send questions and get additional information:www.AskDoctorK.com .",
			"title": "Ask Dr. K: Change your diet and get exercise to lower cholesterol",
			"updatedAt": "2014-04-11T06:55:03.002Z"
		},
	]}
	
	-An example articles.JSON has been included for you.
	
5) If you have already set up a database on Parse.com:
	-Modify /scripts/settings.js accordingly. Input your Parse Application ID and
	REST API Key. 
	-Modify parse_database_classname to be exactly the same as the classname defined in
	your Parse application.
	-Modify database_name and query_term to be consistent with your particular database.

6) Type in "node server.js" in console.
7) In your browser, navigate to localhost:3000.

Module Organization
=========================
I divided my javascript logic into five main modules in /scripts:
-settings.js: Initializes global variables that will be used in the rest of the modules.

-parse_handler.js: Contains all the logic that deals with the Parse API. Contains javascript
interface for making API calls to the database, such as retrieving or deleting articles.

-articles.js: Main code for handling page layout and displaying articles.

-console.js: Module for handling all logging. This module is left out of articles.js, even
though articles.js initializes a Console instance, because this organization allows the Console
to exist independent of the articles page, if this project ever becomes more than a one-page
application.

-spinner.js: Small module for displaying spinners when page loads.

Notes
=========================
Good guide for installing node: http://howtonode.org/introduction-to-npm
