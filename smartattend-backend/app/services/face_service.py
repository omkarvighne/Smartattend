import cv2
import numpy as np
import faiss
import os
import json
from deepface import DeepFace

# In-memory FAISS index (swap for persistent file/Milvus in production)
EMBEDDING_DIM = 128
index = faiss.IndexFlatL2(EMBEDDING_DIM)

# Maps FAISS index position → student_id
# In production store this in PostgreSQL
index_to_student: dict[int, str] = {}
student_to_index: dict[str, int] = {}

def extract_embedding(image_bytes: bytes) -> np.ndarray:
    """Convert raw image bytes → 128-dim face embedding."""
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    result = DeepFace.represent(
        img_path=img,
        model_name="Facenet",       # 128-dim, fast, accurate
        enforce_detection=True,
        detector_backend="opencv"
    )
    embedding = np.array(result[0]["embedding"], dtype=np.float32)
    return embedding

def enroll_student(student_id: str, image_bytes: bytes) -> bool:
    """Store a student's face embedding in FAISS."""
    global index
    embedding = extract_embedding(image_bytes)
    embedding = embedding.reshape(1, -1)

    pos = index.ntotal
    index.add(embedding)
    index_to_student[pos] = student_id
    student_to_index[student_id] = pos
    return True

def verify_student(student_id: str, image_bytes: bytes, threshold: float = 15.0) -> dict:
    """
    Compare live face against stored embedding.
    Returns { matched: bool, score: float }
    """
    if student_id not in student_to_index:
        return {"matched": False, "score": 0.0, "reason": "No enrolled face found"}

    live_embedding = extract_embedding(image_bytes).reshape(1, -1)

    stored_pos = student_to_index[student_id]
    stored_embedding = index.reconstruct(stored_pos).reshape(1, -1)

    # L2 distance — lower = more similar
    distance = float(np.linalg.norm(live_embedding - stored_embedding))
    matched = distance < threshold

    return {
        "matched": matched,
        "score": round(distance, 4),
        "reason": "Verified" if matched else "Face did not match"
    }