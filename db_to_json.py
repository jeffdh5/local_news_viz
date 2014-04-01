import json
import sqlite3 as sql

DB_name = 'database/marin' #change as required

db = sql.connect(DB_name)
cursor = db.cursor() 
cursor.execute('''SELECT title, byline, articleText FROM articles''')
all_rows = cursor.fetchall()
db.close()

json_list = []
dict = {}
for row in all_rows:
	dict["title"] = row[0]
	dict["author"] = row[1]
	dict["text"] = row[2]
	json_list.append(dict)
	dict = {}	

f = open('articles.json', 'w')
f.write(json.dumps(json_list))
f.close()	

