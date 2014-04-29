//Modify this file to change the project parameters.



//Parse REST API authentication - Modify these to add in API authentification keys
parse_app_id = "Uzki9qm4y0TtV5tON7nS3JMy0MVlVpCwWk8zmM3f"
parse_rest_api_key = "unKRN6nyC3V4ynbmLq3lc3qwu81qSSVHOZ770ced"
parse_database_classname = "articles"
url = "https://api.parse.com/1/classes/" + parse_database_classname





//Interface display settings
database_name = "Marin Independent Journal, Lexis Nexis"
query_term = "San Francisco"




//DO NOT MODIFY
//these global variables initialize empty arrays that are populated by Parse API database

//all articles are loaded into article_list via AJAX calls to the Parse API.
//see updateArticles() in parse_handler.js to see how article_list is used.
article_list = [] 

//all logs are loaded into log_list
log_list = []

