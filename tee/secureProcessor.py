import base64
import hashlib
import hmac
import json
import os
import re
import sys
import zlib


DEFAULT_SECRET = "dev-only-tee-secret-change-me"
MAX_TEXT_CHARS = 120000
DEFAULT_ATS_KEYWORDS = [
    "python",
    "javascript",
    "node.js",
    "react",
    "sql",
    "aws",
    "docker",
    "api",
    "testing",
    "git",
]
SKILL_KEYWORDS = [
    "python",
    "javascript",
    "typescript",
    "node.js",
    "express",
    "react",
    "next.js",
    "java",
    "spring",
    "c#",
    ".net",
    "php",
    "laravel",
    "sql",
    "postgresql",
    "mysql",
    "mongodb",
    "firebase",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "rest api",
    "graphql",
    "git",
    "github actions",
    "ci/cd",
    "testing",
    "pytest",
    "jest",
    "machine learning",
    "nlp",
    "data analysis",
    "pandas",
    "numpy",
]


def get_shared_secret():
    return (os.environ.get("TEE_SHARED_SECRET") or DEFAULT_SECRET).encode("utf-8")


def build_keystream(secret_bytes, nonce_bytes, length):
    output = bytearray()
    counter = 0

    while len(output) < length:
        counter_bytes = counter.to_bytes(4, byteorder="big", signed=False)
        block = hashlib.sha256(secret_bytes + nonce_bytes + counter_bytes).digest()
        output.extend(block)
        counter += 1

    return bytes(output[:length])


def decrypt_payload(envelope):
    secret = get_shared_secret()
    nonce = base64.b64decode(envelope["nonce"])
    cipher_bytes = base64.b64decode(envelope["ciphertext"])
    expected_mac = hmac.new(secret, nonce + cipher_bytes, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected_mac, envelope.get("mac", "")):
        raise ValueError("Encrypted payload integrity check failed.")

    keystream = build_keystream(secret, nonce, len(cipher_bytes))
    plain_bytes = bytes(left ^ right for left, right in zip(cipher_bytes, keystream))

    return plain_bytes.decode("utf-8")


def normalize_whitespace(text):
    return re.sub(r"\s+", " ", text or "").strip()


def decode_pdf_string(token):
    content = token[1:-1]
    content = content.replace(r"\(", "(").replace(r"\)", ")").replace(r"\\", "\\")
    content = content.replace(r"\n", " ").replace(r"\r", " ").replace(r"\t", " ")
    return content


def extract_strings_from_pdf_blob(blob_text):
    matches = re.findall(r"\((?:\\.|[^\\()])*\)", blob_text)
    values = []

    for token in matches:
        decoded = normalize_whitespace(decode_pdf_string(token))
        if re.search(r"[A-Za-z]{2,}", decoded):
            values.append(decoded)

    return values


def extract_text_from_pdf_bytes(file_bytes):
    text_fragments = []
    latin_blob = file_bytes.decode("latin-1", errors="ignore")
    text_fragments.extend(extract_strings_from_pdf_blob(latin_blob))

    for stream_match in re.finditer(rb"stream\r?\n(.*?)\r?\nendstream", file_bytes, flags=re.S):
        chunk = stream_match.group(1)
        try:
            inflated = zlib.decompress(chunk)
        except zlib.error:
            continue

        inflated_text = inflated.decode("latin-1", errors="ignore")
        text_fragments.extend(extract_strings_from_pdf_blob(inflated_text))

    extracted = normalize_whitespace(" ".join(text_fragments))

    if not extracted:
        raise ValueError("Unable to extract readable text from PDF inside secure processor.")

    return extracted


def extract_resume_text(payload):
    input_type = payload.get("input_type")

    if input_type == "text":
      resume_text = normalize_whitespace(payload.get("content", ""))
      if not resume_text:
          raise ValueError("Resume text is empty.")
      return resume_text

    if input_type != "file":
        raise ValueError("Unsupported secure payload type.")

    filename = (payload.get("filename") or "").lower()
    mime_type = (payload.get("mime_type") or "").lower()
    file_bytes = base64.b64decode(payload.get("content_base64", ""))

    if not file_bytes:
        raise ValueError("Uploaded resume file is empty.")

    if mime_type == "application/pdf" or filename.endswith(".pdf"):
        return extract_text_from_pdf_bytes(file_bytes)

    if mime_type.startswith("text/") or filename.endswith(".txt"):
        decoded = file_bytes.decode("utf-8", errors="ignore")
        resume_text = normalize_whitespace(decoded)
        if not resume_text:
            raise ValueError("Resume text file is empty.")
        return resume_text

    raise ValueError("Unsupported file format. Only PDF and text resumes are allowed.")


def contains_keyword(text, keyword):
    pattern = r"(?<!\w)" + re.escape(keyword.lower()) + r"(?!\w)"
    return re.search(pattern, text.lower()) is not None


def extract_skills(resume_text):
    found_skills = [skill for skill in SKILL_KEYWORDS if contains_keyword(resume_text, skill)]
    return sorted(set(found_skills))


def score_resume(resume_text, extracted_skills, target_keywords):
    matched_keywords = [keyword for keyword in target_keywords if contains_keyword(resume_text, keyword)]
    keyword_score = round((len(matched_keywords) / max(len(target_keywords), 1)) * 70)

    structure_score = 0
    lowered = resume_text.lower()

    if re.search(r"[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}", resume_text, re.I):
        structure_score += 6
    if re.search(r"(\+\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}", resume_text):
        structure_score += 6
    if "experience" in lowered:
        structure_score += 5
    if "education" in lowered:
        structure_score += 5
    if "project" in lowered or "projects" in lowered:
        structure_score += 4
    if re.search(r"\b\d+%|\b\d+\+|\$\d+", resume_text):
        structure_score += 4
    if 300 <= len(resume_text) <= 6000:
        structure_score += 5
    elif len(resume_text) >= 150:
        structure_score += 2
    if extracted_skills:
        structure_score += min(len(extracted_skills), 3)

    total_score = min(100, keyword_score + structure_score)

    return total_score, matched_keywords


def generate_suggestions(resume_text, extracted_skills, target_keywords, matched_keywords):
    suggestions = []
    missing_keywords = [keyword for keyword in target_keywords if keyword not in matched_keywords]

    if missing_keywords:
        suggestions.append(
            "Add role-relevant keywords that are currently missing: "
            + ", ".join(missing_keywords[:5])
            + "."
        )

    if not re.search(r"\b\d+%|\b\d+\+|\$\d+", resume_text):
        suggestions.append("Include measurable impact such as percentages, revenue, or delivery metrics.")

    lowered = resume_text.lower()
    if "summary" not in lowered and "profile" not in lowered:
        suggestions.append("Add a short professional summary tailored to the target role.")

    if "experience" not in lowered:
        suggestions.append("Add a clearly labeled experience section with recent responsibilities and outcomes.")

    if len(extracted_skills) < 4:
        suggestions.append("Highlight more technical skills and tools explicitly so ATS systems can detect them.")

    if len(resume_text) < 300:
        suggestions.append("Expand project or work details so the resume is not too brief for screening.")
    elif len(resume_text) > 7000:
        suggestions.append("Condense long paragraphs into concise bullet points for better ATS readability.")

    if not suggestions:
        suggestions.append("Tailor the resume for each job description and keep skills aligned with the role.")

    return suggestions[:4]


def analyze_resume(resume_text, target_keywords):
    bounded_text = resume_text[:MAX_TEXT_CHARS]
    extracted_skills = extract_skills(bounded_text)
    ats_score, matched_keywords = score_resume(bounded_text, extracted_skills, target_keywords)
    suggestions = generate_suggestions(bounded_text, extracted_skills, target_keywords, matched_keywords)

    return {
        "ats_score": ats_score,
        "extracted_skills": extracted_skills,
        "suggestions": suggestions,
    }


def main():
    try:
        raw_input = sys.stdin.read()
        if not raw_input:
            raise ValueError("Secure processor received an empty request.")

        request_payload = json.loads(raw_input)
        encrypted_payload = request_payload.get("encrypted_payload")
        if not encrypted_payload:
            raise ValueError("Secure processor request did not contain encrypted payload.")

        decrypted_payload = decrypt_payload(encrypted_payload)
        parsed_payload = json.loads(decrypted_payload)
        resume_text = extract_resume_text(parsed_payload)

        if len(resume_text) > MAX_TEXT_CHARS:
            raise ValueError("Resume content is too large for secure processing.")

        target_keywords = parsed_payload.get("job_keywords") or DEFAULT_ATS_KEYWORDS
        target_keywords = [normalize_whitespace(keyword).lower() for keyword in target_keywords if keyword]
        if not target_keywords:
            target_keywords = DEFAULT_ATS_KEYWORDS

        result = analyze_resume(resume_text, target_keywords)
        sys.stdout.write(json.dumps(result))
    except Exception as error:
        sys.stdout.write(json.dumps({"error": str(error)}))
        sys.exit(1)


if __name__ == "__main__":
    main()
