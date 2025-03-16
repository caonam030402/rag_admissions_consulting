from langchain.document_loaders import PyPDFLoader,DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter 
from langchain.document_loaders import TextLoader


class Helper:
    def __init__(self, chunk_size: int = 500,chunk_overlap: int = 20):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        
    def load_pdf_files(path: str) -> list[str]:
        loader=DirectoryLoader(path,glob="*.pdf",loader_cls=PyPDFLoader)

        documents=loader.load()
        return documents

    def load_csv_files(path: str) -> list[str]:
        loader=TextLoader(path)
        documents=loader.load()
        return documents
    
    def text_split(self, extracted_data: str) -> list:
        text_splitter=RecursiveCharacterTextSplitter(chunk_size=self.chunk_size, chunk_overlap=self.chunk_overlap)
        text_chunks=text_splitter.split_documents(extracted_data)
        return text_chunks
    
    
helper = Helper(chunk_size=500, chunk_overlap=20)