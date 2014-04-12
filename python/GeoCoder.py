import sqlite3 as sql
import ner
import os
import subprocess
import time
import re
import numpy
import math
import json

"""
DOCUMENTATION

Geocoder
3/21/14 by Jeff Huang

DESCRIPTION
This script will take a database with a table "articles" that has the fields "title and
articleText". It will then divide the article into paragraphs and analyze each paragraph
for its named geographic entities. It will then form a matrix with these results where each
document represents a vector. We multiply this matrix by a scaling vector. The result is 
a vector where each element describes the relevance of an article to a particular geographic 
entity.

Currently, the script only prints the titles of the articles relevant to the particular
entity. You can modify the end of the script to do what you want with the information.


NOTE
When you are done with the program, you'll want to get the PID code and kill it 
after, do this with os module in python. 

#in terminal: lsof -i:8080
#get the pid that says "java"
#then, kill ______ (PID)


TO DO LIST
1 - the code timer doesn't get seconds (not sure what unit they use for measuring time 
elapsed).
2 - results after normalization don't seem to be very different from results before. need
to test this out more.
3 - testing features



ALGORITHMIC NOTES
We parse each article into paragraphs. Marin Independent Journal is nicely formatted
such that paragraphs are indicated by \n\n.

Now, we need to run each PARAGRAPH of each article through NER. We then form a matrix
which we will call the document-paragraph matrix. This matrix is m*n, where m denotes
the number of documents, and n denotes the max# of paragraphs. Each row therefore
represents a document vector. Each element of this vector is the total count of
the query geographic term in a paragraph, divided by the total number of geographic
terms in that paragraph. If a document has fewer than the max number of paragraphs of
any article in your dataset, then the last elements of that vector are set to zero. We
normalize the rows of this matrix by its Euclidean norm to scale across articles of
different lengths.

We multiply this by a scaling vector of n elements. The first element is n*2, and the 
rest of the elements are n-1, n-2, n-3, etc. The last element is 1. The reason the first
element is multiplied by two, is because the existence of a geographic term in the first 
paragraph disproportionately predicts that the article is about that query term.

Each row of this matrix is a vector corresponding to a document, and each element
corresponds to a a value between 1 and zero.

General rule of thumb for selecting the minimum score of relevance below:
[Testing has been done on the marin database with San Francisco as the query term]

100 is a pretty good number to choose. Scores in the 0-100 range tend to contain
San Francisco, but are only tangentially relevant. Scores above that tend to be
articles about events actually in San Francisco.

"""

#Parameters

DB_name = 'database/Monterey' #change as required
entity = "San Francisco" #particular entity you are interested in
score = 100 #minimum score of relevance

#listening on localhost:8080
process = subprocess.Popen('java -mx1000m -cp stanford-ner.jar edu.stanford.nlp.ie.NERServer -loadClassifier classifiers/english.muc.7class.distsim.crf.ser.gz -port 8080 -outputFormat inlineXML', shell=True, stderr=subprocess.STDOUT)
time.sleep(5)
tagger = ner.SocketNER(host='localhost', port=8080)

#Documentation for running stanford-ner server in socket mode
#http://stackoverflow.com/questions/15722802/how-do-i-use-python-interface-of-stanford-nernamed-entity-recogniser

#########################################################################################

# Parsing work

def div_into_paragraphs():
	#divides all articles into paragraphs. returns a list, in which every element is also
	#a list representing the paragraphs of an article.
	#output is a list inside a list: [[article1p1, article1p2], [article2p1, article2p2, etc.]]
	#each element inside the outside list is an article, and each element inside the inner
	#list is a paragraph of that particular article.
	
	db = sql.connect(DB_name)
	cursor = db.cursor() 
	cursor.execute('''SELECT title, byline, articleText FROM articles''')
	all_rows = cursor.fetchall()
	db.close()
	
	all_articles = []
	for row in all_rows:
		titles.append(row[0])
		authors.append(row[1])
		raw_articles.append(row[2])
		article = row[2]
		#print(article)
		paragraphs = get_article_paragraphs(article)
		all_articles.append(paragraphs)		
		paragraphs = ""
	return all_articles

def get_article_paragraphs(article):
	#helper function for div_into_paragraphs. gets the paragraphs for one article
	
	if "\n\n" in article:
		article = re.sub("\n\n", "\n", article)
	paragraph_list = []
	paragraph = ""
	
	while len(article) != 0:
		if article[0] == '\n':
			if len(paragraph)>0:
				paragraph_list.append(paragraph)
			paragraph = ""
		else:
			paragraph = paragraph + article[0]
		article = article[1:]
	
	if paragraph != "":
		if len(paragraph)>0:
			paragraph_list.append(paragraph)
	return paragraph_list
	
#########################################################################################

# Algorithm work

def create_document_vector(articles):	
	#initializes document vector with all elements set to 0
	
	max = 0
	for article in articles:
		if len(article) > max:
			max = len(article)
	vector = []
	while max > 0:
		max = max - 1
		vector.append(0)
	return vector
	
def set_vector_values(query, article, document_vector):
	#sets document vector values according to the docs above	
	vector = document_vector	
	c = 0
	#print(len(article))
	#print(article)
	for paragraph in article:
		#print(paragraph)
		norm = float(0)
		if "LOCATION" in tagger.get_entities(paragraph):
			locations = tagger.get_entities(paragraph)['LOCATION']
			query_count = 0
			for location in locations:
				if location == query:
					query_count = query_count+1

			vector[c] = float(query_count)/float(len(locations))
			#print("OK WE MADE IT IN")

			norm = norm + pow(vector[c], 2)
		#print(vector[c])
		#print("at" + str(c))
		c += 1
		norm = math.sqrt(norm)
		if norm>float(0):
			for elem in vector:
				elem = elem/norm #normalize the vector
	return vector

def create_scaling_vector(articles):
	#initializes a scaling vector, specific details explained above in docs 
	
	max = 0
	for article in articles:
		if len(article) > max:
			max = len(article)
	vector = []
	while max > 0:
		vector.append((max))
		max = max - 1
	vector[0] = vector[0]*2
	return vector

#########################################################################################

#script starts here

titles = []
authors = []
raw_articles = []

articles = div_into_paragraphs()
matrix = []
print("Computing matrix. Please give it a few minutes...")
for article in articles:
	#parsed_article = get_article_paragraphs(article)
	vector = create_document_vector(articles)
	vector = set_vector_values(entity, article, vector)
	matrix.append(vector)
	#print(vector)
start = time.time()
matrix = numpy.matrix(matrix)
elapsed = (time.time() - start)
print("Matrix computed. Took " + str(elapsed) + " seconds. [not accurate right now]") #this doesn't work right. Doesn't get seconds
vector = numpy.array([create_scaling_vector(articles)])
print("Computing matrix-array product...")
print("Product computed. See below.")

product = matrix*numpy.transpose(vector)

print(product)

json_list = []
product = product.tolist()
c = 0
while c < len(product)-1:
	print(titles[c])
	print("Score: " + str(product[c]) + "\n")

	dict = {}
	dict["title"] = titles[c]
	dict["author"] = authors[c]
	dict["text"] = raw_articles[c]
	dict["relevance"] = product[c][0]
	json_list.append(dict)
	dict = {}		
	c += 1

f = open('articles.json', 'w')
f.write(json.dumps(json_list))
f.close()	



