# Rag_Admissions_consulting

A RAG-based chatbot system for admissions consulting, leveraging advanced language models and retrieval-augmented generation to provide accurate and contextual responses to admission-related queries.

## Project Organization

```
├── client                    <- Frontend client application
├── server                    <- Backend server application
├── rag_admissions_consulting <- Core RAG implementation
│   ├── docs                  <- Project documentation
│   │   └── docs             <- Documentation source files
│   │
│   ├── models               <- Trained models and embeddings
│   │
│   ├── notebooks            <- Jupyter notebooks for exploration and testing
│   │   ├── data_preprocessing.ipynb
│   │   ├── load_file.ipynb
│   │   └── trials.ipynb
│   │
│   ├── references           <- Data dictionaries and reference materials
│   │
│   ├── reports              <- Generated analysis reports and figures
│   │   └── figures
│   │
│   ├── src                  <- Source code for the RAG system
│   │   ├── data_preprocessing.py <- Data preprocessing utilities
│   │   ├── embeddings.py    <- Text embedding generation and handling
│   │   ├── llms.py          <- Language model integration
│   │   ├── main.py          <- Main application entry point
│   │   ├── promt.py         <- Prompt engineering and management
│   │   ├── rag_agent.py     <- RAG agent implementation
│   │   ├── seed.py          <- Data seeding utilities
│   │   └── store.py         <- Vector store and data storage
│   │
│   ├── config.py            <- Configuration settings
│   ├── pyproject.toml       <- Project dependencies and metadata
│   ├── requirements.txt     <- Python package dependencies
│   └── setup.py             <- Package installation script
```

## Features

- Client-server architecture for scalable deployment
- RAG (Retrieval-Augmented Generation) for accurate and contextual responses
- Vector store for efficient knowledge retrieval
- Customizable prompt engineering
- Modular design for easy extension and maintenance

## Getting Started

Refer to the documentation in the `docs` directory for setup and usage instructions.
