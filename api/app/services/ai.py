from app.core.config import settings
import chromadb
import chromadb.utils.embedding_functions as emb_funcs
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_react_agent
from langchain import hub
from langchain_core.messages import AIMessage, BaseMessage
from langgraph.graph import StateGraph, END
from collections import deque
from typing import AsyncGenerator, List, Tuple
from typing_extensions import TypedDict
from langchain_core.runnables import Runnable
from langchain_core.tools import tool
from langchain_core.prompts import ChatPromptTemplate


class AgentState(TypedDict):
    messages: List[BaseMessage] = []
    llm: ChatOpenAI
    vector_store: chromadb.Collection
    intent: str = "knowledge_retrieval"  # Default intent


def initialize_vector_store_client() -> chromadb.Collection:
    emb_func = emb_funcs.OpenAIEmbeddingFunction(
        api_key=settings.LLM_API_KEY,
        model_name="text-embedding-3-small",  # Use the appropriate embedding model
    )
    print("Initializing ChromaDB client...", flush=True)
    print(
        f"Connecting to ChromaDB server at {settings.VECTOR_STORE_HOST}:{settings.VECTOR_STORE_PORT}...",
        flush=True,
    )
    client = chromadb.HttpClient(
        host=settings.VECTOR_STORE_HOST, port=int(settings.VECTOR_STORE_PORT)
    )
    try:
        collection = client.get_collection(
            name=settings.VECTOR_STORE_COLLECTION_NAME, embedding_function=emb_func
        )
        print(
            f"Connected to ChromaDB server and retrieved collection '{settings.VECTOR_STORE_COLLECTION_NAME}'."
        )
    except Exception as e:
        print(
            f"Error connecting to ChromaDB server or retrieving collection '{settings.VECTOR_STORE_COLLECTION_NAME}': {e}"
        )
        print(
            "Please ensure your ChromaDB server is running and the collection exists."
        )
        exit(1)  # Exit if we can't connect to the essential knowledge base
    return collection


@tool
def query_vector_store(query: str) -> List[dict]:
    """
    Query the vector store for relevant documents based on the input query.
    Returns a list of documents that match the query with a similarity score above the threshold.
    only need to pass the query string.
    """
    sim_threshold = 0.3
    top_k = 5
    print(f"Querying vector store with query: '{query}'", flush=True)
    vector_store = (
        initialize_vector_store_client()
    )  # Ensure the vector store client is initialized
    print(f"Querying vector store with query: '{query}'", flush=True)
    if not query:
        print("Empty query provided. Returning empty results.")
        return []
    print("vector_store is initialized.", flush=True)
    print("vector_store:", vector_store, flush=True)
    results = vector_store.query(query_texts=[query], n_results=top_k)
    print(f"Query results: {results}", flush=True)
    if not results or "documents" not in results or not "distances" in results:
        print(f"No results found for query: '{query}'")
        return []
    final_results = []
    docs = results.get("documents", [])[0]
    distances = results.get("distances", [])[0]
    print(f"Found {len(docs)} documents with distances: {distances}", flush=True)
    for i, doc in enumerate(docs):
        dist = distances[i]
        if dist < sim_threshold:
            continue
        final_results.append(
            {
                "content": doc,
                "distance": dist,
            }
        )
    print(f"Found {len(final_results)} relevant documents for query: '{query}'")
    return "\n".join(
        [
            f" Content: {doc['content']}, Similarity: {doc['distance']}"
            for doc in final_results
        ]
    )


def run_react_agent_node(state: AgentState) -> AgentState:
    """
    This function runs the REACT agent node, which processes the current state and returns the updated state.
    It uses the agent executor to handle the conversation and tool calls.
    """
    if not state:
        print("No initial state provided. Returning empty state.")
        return AgentState()
    print(f"Running REACT agent node with state: {state}")
    custom_react_prompt = ChatPromptTemplate.from_template(
        """In a friendly way and in spanish answer the following questions as best you can. You have access to the following tools:
            {tools}

            Use the following format:

            Question: the input question you must answer
            Thought: you should always think about what to do
            Action: the action to take, should be one of [{tool_names}]
            Action Input: the input to the action
            Observation: the result of the action
            ... (this Thought/Action/Action Input/Observation can repeat N times)
            Thought: I now know the final answer
            Final Answer: If tools retrieved at least some information, generate a final answer based on the retrieved information. limit your response to the most relevant details.

            Begin!

            Question: {input}
            Thought:{agent_scratchpad}
        """
    )
    agent = create_react_agent(
        llm=state["llm"],
        tools=[query_vector_store],
        prompt=custom_react_prompt,
    )
    agent_executor = AgentExecutor(
        agent=agent, tools=[query_vector_store], verbose=True
    )
    try:
        response = agent_executor.invoke(
            {
                "input": state["messages"][-1].content,
                "chat_history": state["messages"][:-1],
            }
        )
        print(f"Agent response: {response}")
        new_messages = state["messages"] + [AIMessage(content=response["output"])]
        return {"messages": new_messages}
    except Exception as e:
        print(f"Error in run_react_agent_node: {e}")
        # Append an error message to the state
        return {
            "messages": state["messages"]
            + [AIMessage(content=f"An error occurred: {e}")]
        }


def llm_classify_intent_node(state: AgentState) -> AgentState:
    """
    Uses the LLM to classify the user's intent.
    Returns the updated state with the classification.
    """
    user_message = state["messages"][-1].content
    classification_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """You are an intelligent assistant designed to classify user queries.
                Classify the following user query into one of these categories:
                - 'greeting': If the user is simply saying hello or a similar pleasantry.
                - 'simple_query': If the user is asking a straightforward question that does NOT require searching a knowledge base (e.g., "What is 2+2?", "What's your name?").
                - 'knowledge_retrieval': If the user is asking a question that likely requires information from a knowledge base or external data (e.g., "What are the company's policies on remote work?", "Tell me about the new product features.").

                Respond with only the category name, e.g., 'greeting', 'simple_query', 'knowledge_retrieval'.
                Do NOT include any other text or punctuation.""",
            ),
            ("human", "{query}"),
        ]
    )
    classifier_chain = classification_prompt | state["llm"]
    response = classifier_chain.invoke({"query": user_message})
    intent = response.content.strip().lower()
    print(f"LLM classified intent: {intent}", flush=True)
    return {
        "messages": state["messages"],
        "llm": state["llm"],
        "intent": intent,
    }  # Pass intent back in state


def route_by_intent(state: AgentState) -> str:
    """
    Routes the workflow based on the intent classified by the LLM.
    """
    intent = state.get(
        "intent", "knowledge_retrieval"
    )  # Default to knowledge_retrieval if intent not found
    print(f"Routing based on intent: {intent}")
    if "greeting" in intent:
        return "greet_user"
    elif "simple_query" in intent:
        return "simple_llm_response"
    else:  # Default to knowledge_retrieval
        return "react_agent"


def greet_user_node(state: AgentState) -> AgentState:
    """
    Handles simple queries directly with the LLM without tools.
    """
    print("Responding to simple query with direct LLM call.")
    user_message_content = state["messages"][-1].content
    try:
        response_prompt = """Genera un saludo amigable para el usuario teniendo en cuenta el mensaje y siempre que tenga sentido en el contexto: {user_message} y el contexto de la conversación. Responde en español. y si te cuestionan como estas responde que estas bien y sugierele alguna pregunta como "¿En qué puedo ayudarte hoy?"."""
        response = state["llm"].invoke(
            response_prompt.format(user_message=user_message_content)
        )
        return {"messages": state["messages"] + [AIMessage(content=response.content)]}
    except Exception as e:
        print(f"Error in simple_llm_response_node: {e}")
        return {
            "messages": state["messages"]
            + [AIMessage(content=f"An error occurred: {e}")]
        }


def simple_llm_response_node(state: AgentState) -> AgentState:
    """
    Handles simple queries directly with the LLM without tools.
    """
    print("Responding to simple query with direct LLM call.")
    user_message_content = state["messages"][-1].content
    try:
        response = state["llm"].invoke(user_message_content)
        return {"messages": state["messages"] + [AIMessage(content=response.content)]}
    except Exception as e:
        print(f"Error in simple_llm_response_node: {e}")
        return {
            "messages": state["messages"]
            + [AIMessage(content=f"An error occurred: {e}")]
        }


# --- End New Code ---


def compile_agent_graph() -> Tuple[Runnable, chromadb.Collection, ChatOpenAI]:
    llm = ChatOpenAI(
        temperature=0,
        streaming=True,
        api_key=settings.LLM_API_KEY,
        model_name="gpt-4o-mini-2024-07-18",
    )
    workflow = StateGraph(AgentState)
    workflow.add_node("llm_classify_intent", llm_classify_intent_node)
    workflow.add_node("greet_user", greet_user_node)
    workflow.add_node("simple_llm_response", simple_llm_response_node)
    workflow.add_node("react_agent", run_react_agent_node)

    # Set the entry point to the LLM classifier
    workflow.set_entry_point("llm_classify_intent")

    # Add conditional edges from the classifier
    workflow.add_conditional_edges(
        "llm_classify_intent",
        route_by_intent,
        {
            "greet_user": "greet_user",
            "simple_llm_response": "simple_llm_response",
            "react_agent": "react_agent",
        },
    )

    # All final nodes lead to END
    workflow.add_edge("greet_user", END)
    workflow.add_edge("simple_llm_response", END)
    workflow.add_edge("react_agent", END)

    graph_compiled = workflow.compile()
    print("Agent graph compiled successfully.")
    return graph_compiled, llm


async def get_ai_response(
    _app_runnable: Runnable,
    llm: ChatOpenAI,
    new_user_query: str,
) -> AsyncGenerator[str, Tuple[List[str], str]]:
    """
    Asynchronous function to get AI response from the agent.
    It streams the response back to the client.
    """
    # async for response in _app_runnable.stream(new_user_query):
    #    yield response
    final_state = await _app_runnable.ainvoke(
        AgentState(messages=[AIMessage(content=new_user_query)], llm=llm)
    )
    print(f"Final state after agent execution: {final_state}")
    if final_state and "messages" in final_state and final_state["messages"]:
        ai_response_message = final_state["messages"][-1]
        if isinstance(ai_response_message, AIMessage):
            return ai_response_message.content
        else:
            print(f"Warning: Last message is not an AIMessage: {ai_response_message}")
            return "An unexpected response format was received."
    else:
        print("Error: Agent returned no messages in the final state.")
        return "Sorry, I could not generate a response."
