from store import store
from shared.helper import helper
from embeddings import embeddings
from shared.enum import ModelType
from loguru import logger

def main():
    store.initStore()
    
    # load csv files
    extracted_data = helper.load_pdf_files(path="../data/pdf/")
    
    # split text
    text_chunks = helper.text_split(extracted_data)
    
    # embeddings
    embeddings_model = embeddings.get_embeddings(ModelType.HUGGINGFACE)
    
    # upload to pinecone
    store.uploadToStore(text_chunks, embeddings_model)
    
    logger.info("Uploaded to pinecone")
    

if __name__ == "__main__":
    main()