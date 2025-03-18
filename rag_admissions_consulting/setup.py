from setuptools import setup, find_packages

setup(
    name="rag_admissions_consulting",
    version="0.1.0",
    author="Caonam030402",
    description="RAG Admissions Consulting",
    packages=find_packages(),
    python_requires=">=3.10",
    install_requires=[
        "pandas",
        "numpy",
        "scikit-learn",
        "scipy",
        "pinecone[grpc]",
        "langchain",
        "langchain-pinecone",
        "langchain-openai",
        "langchain-google-genai",
        "langchain-community",
        "langchain-experimental",
        "langchain-huggingface==0.1.2",
        "langchain-ollama",
        "beautifulsoup4",
        "requests",
        "streamlit",
        "loguru",
        "python-dotenv",
        "torch>=2.0.0",
        "sentence-transformers==2.4.0",
        "flask",
        "pypdf",
        "tqdm",
        "typer",
        "mkdocs",
        "ruff",
        "protoc_gen_openapiv2"
    ],
    options={
        'install': {'user': True}
    }
)
