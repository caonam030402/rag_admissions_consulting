from store import store
from shared.helper import helper
from embeddings import embeddings
from shared.enum import ModelType,FileDataType
from loguru import logger

def seed_data(type: FileDataType = FileDataType.PDF):
    store.initStore()
    
    # load files
    if type == FileDataType.CSV:
        extracted_data = helper.load_csv_files(path="../data/csv/")
    elif type == FileDataType.PDF:
        extracted_data = helper.load_pdf_files(path="../data/pdf/") 
    elif type == FileDataType.JSON:
        extracted_data = helper.load_json_files(path="../data/json/")
    else :
        raise Exception("Invalid file type")    
    
    text_chunks = helper.text_split(extracted_data)
    
    # embeddings
    embeddings_model = embeddings.get_embeddings(ModelType.HUGGINGFACE)
    
    # upload to pinecone
    store.uploadToStore(text_chunks, embeddings_model)
    
    logger.info("Uploaded to pinecone")
    

if __name__ == "__main__":
    seed_data(FileDataType.JSON)