# pip install langchain
# pip install langchain-community
# pip install langgraph
# pip install langchain-google-genai
# pip install sqlalchemy
# pip install pymysql
# pip install google-generativeai


# legacy code ignore it
from langchain_community.utilities import SQLDatabase

# mysql_uri = (
#     f"mysql+pymysql://{username}:{password}@{host}:{port}/{database_schema}"
# )

db = SQLDatabase.from_uri(mysql_uri)

print(f"Dialect: {db.dialect}")
print(f"Available tables: {db.get_usable_table_names()}")

import os

#Google_API_KEY

from langchain.chat_models import init_chat_model

llm = init_chat_model(
    "gemini-2.0-flash",
    model_provider="google_genai"
)


from langchain_community.agent_toolkits.sql.toolkit import SQLDatabaseToolkit

toolkit = SQLDatabaseToolkit(
    db=db,
    llm=llm
)

# print(toolkit.get_tools())

# ================================
# Pull SQL Agent Prompt
# ================================
from langsmith import Client

client = Client()

# Pull the public template safely
prompt_template = client.pull_prompt(
    "langchain-ai/sql-agent-system-prompt", 
    dangerously_pull_public_prompt=True
)

assert len(prompt_template.messages) == 1

print(prompt_template.input_variables)

# ================================
# Create System Prompt
# ================================
system_message = prompt_template.format(
    dialect="postgresql",
    top_k=5
)

# ================================
# Create ReAct Agent
# ================================
from langgraph.prebuilt import create_react_agent

agent_executor = create_react_agent(
    llm,
    toolkit.get_tools(),
    prompt=system_message
)

# ================================
# Example Query
# ================================
example_query = "Who is the topper of university ?"

# ================================
# Run Agent with Streaming
# ================================
events = agent_executor.stream(
    {"messages": [("user", example_query)]},
    stream_mode="values",
)

# ================================
# Print Agent Steps
# ================================
for event in events:
    event["messages"][-1].pretty_print()
