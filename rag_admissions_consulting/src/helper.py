def load_pdf_files(path: str) -> list[str]:
    loader = DirectoryLoader(path, glob="*.pdf", loader_cls=PyPDFLoader)

    documents = loader.load()
    return documents


def load_pdf_files(path: Path) -> list[str]:
    return [f for f in path.glob("*.pdf")]
