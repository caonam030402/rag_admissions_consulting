from langchain_community.document_loaders import (
    PyPDFLoader,
    DirectoryLoader,
    CSVLoader,
    JSONLoader,
)
from langchain.text_splitter import RecursiveCharacterTextSplitter


class Helper:
    def __init__(self, chunk_size: int = 1500, chunk_overlap: int = 150):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def load_pdf_file(self, file_path: str) -> list[str]:
        """Load a single PDF file"""
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        return documents

    def load_pdf_files(self, path: str) -> list[str]:
        """Load all PDF files from a directory"""
        loader = DirectoryLoader(path, glob="*.pdf", loader_cls=PyPDFLoader)
        documents = loader.load()
        return documents

    def load_csv_files(self, path: str) -> list[str]:
        loader = DirectoryLoader(
            path,
            glob="*.csv",
            loader_cls=lambda file_path: CSVLoader(file_path, encoding="utf-8"),
        )
        documents = loader.load()
        return documents

    def load_json_files(self, path: str) -> list[str]:
        loader = DirectoryLoader(
            path,
            glob="*.json",
            loader_cls=lambda file_path: JSONLoader(
                file_path, jq_schema=".", text_content=False
            ),
        )
        documents = loader.load()
        return documents

    def text_split(self, extracted_data: str) -> list:
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size, chunk_overlap=self.chunk_overlap
        )
        text_chunks = text_splitter.split_documents(extracted_data)
        return text_chunks


helper = Helper(chunk_size=500, chunk_overlap=20)
