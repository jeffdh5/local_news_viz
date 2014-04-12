import re
from datetime import datetime
import ArticlesDB
import codecs

"""

Parser for Lexis Nexis Marin Independent Journal. 
2/13/14 by Jeff Huang

The following parser has been tested on the January 2014 articles on Lexis Nexis by
the Marin Independent Journal.

This parser will
1 - clean articles in your dataset by stripping extraneous information and removing
extraneous newlines.
2 - store key information in a database



PARAMETERS

Strip parameters are regexes that define lines you want to strip from your input.

Parse parameters are the strings that represent the beginning labels of details from
an article. An example is the byline, which is represented (in Lexis Nexis) as
"BYLINE: [text]". The parse parameter I included is "BYLINE: ". 

Key translate parameters are the translations of parse parameters into the key parameters
specified by your database's dictionary (because we need to create a universal format across
various sources).



NOTE

clean_output() needs to be modified or removed if you change the input to a non-Marin independent
Journal dataset. Parse calls clean_output() in its return statement, so watch out for that.
The purpose it serves right now is to handle weird formatting issues that happen when a
Marin independent journal article doesn't have a byline, or says "author" + marin independent journal
in the byline.


"""
input = open("sampleset.txt", 'r+').read() #txt file containing sampleset

doc_divider = r"[0-9]+ of [0-9]+ DOCUMENTS" #regex for the string that denotes division of documents

#STRIP PARAMETERS
#doc_divider = r"[0-9]+ of [0-9]+ DOCUMENTS" #this is defined above, but just in case we change that part we still need this
byline = r'BYLINE: .+\n'
section = r'SECTION: .+\n'
length = r'LENGTH: .+\n'
load_date = r'LOAD-DATE: .+\n'
pub_lang = r'LANGUAGE: ENGLISH'
pub_type = r'PUBLICATION-TYPE: Newspaper'
copyright = r'Copyright 2014 Marin Independent Journal, a MediaNews Group publication'
all_rights_reserved = r'All Rights Reserved'
marin = re.escape("Marin Independent Journal (California)") #re.escape escapes parenthesis, which is a python special character

#Defined in a list
strip_parameters = [doc_divider, 
					byline, 
					section, 
					length, 
					load_date, 
					pub_lang, 
					pub_type, 
					copyright, 
					all_rights_reserved, 
					marin]


parse_parameters = ["BYLINE: ", 
					"SECTION: ", 
					"LENGTH: ", 
					"LOAD-DATE: "]
					#These are the start of the strings that contain information we want. These parameters
					#usually denote labels. For example, we might want to parse the byline of an article
					#which is formatted as 'Byline: By Marin Independent Journal'.
					
					#These must be in order of which they appear in the document.


# We need to translate our parse parameters to keys that fit into the parameters of our database
# For example, we parse "BYLINE" because that's what Marin Independent Journal uses, but our
# database which contains other sources as well uses "byline" instead.
key_translate = {'byline': 'BYLINE', 
				'articleDate': 'PUB-DATE', 
				'title': 'TITLE', 
				'section': 'SECTION', 
				'articleText': 'CONTENT', 
				'accessDate': 'LOAD-DATE'}


# Generate a template dict with all database fields, default value is 'N/A'
# Database takes in a list of dicts, each dict is an article and will end up as a row in database's
# "articles" table
# See ArticlesDB.py for details
article_keys = ['articleText', 
				'title', 
				'byline', 
				'articleDate', 
				'section', 
                'articlePosition', 
                'cleanFormat', 
                'newspaperName', 
                'source', 
                'accessDate', 
                'comments'] 

# Zips up list of article keys into a dictionary where each list element is a key, and its
# value is na
article_template = dict(zip(article_keys, ['na'.decode(encoding='UTF-8')]*5+[-1, 0]+ 
                            ['na'.decode(encoding='UTF-8')]*4))



#divides a set of documents into individual ones, where the contents are stored in a list
def div_into_documents(input):
	index_list = [m.start() for m in re.finditer(doc_divider, input)]
	document_list = []
	
	while len(index_list) > 0:
		new_doc = ""
		start = input[index_list[0]:]
		
		if len(index_list) > 1:
			i = index_list[1] - index_list[0]
		else:
			i = len(input)-1 - index_list[0]
			
		while i > 0:
			new_doc = new_doc + start[0]
			start = start[1:]
			i = i-1
		document_list.append(new_doc)
		index_list = index_list[1:]
	return document_list

#strips extraneous characters
def strip(input, parameters): 	
	#parameters is a list of regex statements that you want to strip from the input document.
	#Strip should delete 'xx of xx DOCUMENTS', language, publication type
	for param in parameters: 
		input = re.sub(param, "", input)
	return(input.strip()) #strips the document of leftover newlines

def parse(input, parameters):
	#parses input for key details of text such as title
	out_param = {}
	output = ""
	
	parsed_input = input
	
	while len(parsed_input) > 0:
		if parsed_input == "":
			return output;
		for param in parameters:
			if parsed_input[0:len(param)] == param:
				out_param[param.strip(' :')] = get_till_newline(parsed_input[len(param):])
				parsed_input = parsed_input[len(param):]
		output = output + parsed_input[0]
		parsed_input = parsed_input[1:]
	
	#added in strip_till_newline here to get rid of the date. delete that if you aren't using lexis nexis
	content = strip(input, strip_parameters)
	
	out_param["PUB-DATE"] = get_till_newline(content)
	
	content = strip_till_newline(content)
	
	out_param["TITLE"] = get_till_newline(content)
	out_param["CONTENT"] = strip_till_newline(content)
	return clean_output(out_param)

def clean_output(out_param):
	#clean output is a function
	
	if "BYLINE" not in out_param:
		out_param["BYLINE"] = ""
	if out_param["BYLINE"] != "By Marin Independent Journal" and out_param["BYLINE"] != "Marin Independent Journal":
		out_param["BYLINE"] = re.sub("Marin Independent Journal", "", out_param["BYLINE"]).strip()
	return out_param

#########################################################################################

#helper functions

#returns the first line
def get_till_newline(input):
	output = ""
	while len(input) > 0:
		if input[0:1] == "\n":
			return output
		else:
			output = output + input[0]
			input = input[1:]
	return output

#returns input, with the first line stripped
def strip_till_newline(input):
	return re.sub(get_till_newline(input), "", input).strip()

# Convert parsed date to SQLite format: "YYYY-MM-DD HH:MM:SS.SSS"
# Ref http://docs.python.org/2/library/datetime.html#strftime-strptime-behavior
def date_convert(date_string):
    
    dt_raw = re.findall(r'\D+\d+\D{2}\d{4}', date_string)[0]
    dt = datetime.strptime(dt_raw, "%B %d, %Y")
    return(dt.strftime('%Y-%m-%d'))

#########################################################################################

# Script starts here

# Create a list of dicts for input into database
articles = []

print("Processing articles. Please give it a few minutes...")
for doc in div_into_documents(input):
    parsed_article = parse(doc, parse_parameters)
    
    # Convert parsed dates to SQLite format
    parsed_article['PUB-DATE'] = date_convert(parsed_article['PUB-DATE'])
    parsed_article['LOAD-DATE'] = date_convert(parsed_article['LOAD-DATE'])
    
    # Populate article template with parsed data converted to unicode
    article = article_template.copy() 

    for key in key_translate.keys():
        article[key] = unicode(parsed_article[key_translate[key]], 'utf-8')
    
    articles.append(article)

print("Articles processed.\n")
print("Inputting articles into database...")
ArticlesDB.DB_input(articles, 'test') # Read into database
ArticlesDB.DB_read('test')


