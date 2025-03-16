from setuptools import setup, find_packages

setup(
    name="rag_admissions_consulting",
    version="0.1.0",
    author="Caonam030402",
    description="RAG Admissions Consulting",
    packages=find_packages(),
    install_requires=[
        "pandas",
        "numpy",
        "scikit-learn",
        "scipy",
        "pinecone",
        "langchain",
        "langchain-pinecone",
        "langchain-openai",
        "langchain-google-genai",
        "langchain-community",
        "langchain-experimental",
    ],
)
