import os, json, time, re
import pandas as pd
from tqdm import tqdm
import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout
from openai import OpenAI

# --- config ---
QUESTION = "What time is service?"
MODEL_ANSWER = "gpt-4o-mini"   # fast/cheap; swap to gpt-4o if you want. 
MODEL_GRADER = "gpt-4o-mini"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=OPENAI_API_KEY)

# --- utils ---
def clean_text(html, max_chars=10000):
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script","style","noscript","svg","header","footer","nav"]):
        tag.decompose()
    text = " ".join(soup.get_text(" ", strip=True).split())
    return text[:max_chars]

def fetch_site_text(url):
    try:
        r = requests.get(url, timeout=20, headers={"User-Agent":"Mozilla/5.0"})
        r.raise_for_status()
        return clean_text(r.text)
    except Exception as e:
        return f"[ERROR fetching site: {e}]"

def ask_chatbot(chatbot_url, question=QUESTION, timeout_ms=60000):
    """
    Specific strategy for pastors.ai chatbots:
    - Find the input field with id="question"
    - Type the question and click the send button
    - Wait for the response in the message area
    """
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            page.goto(chatbot_url, timeout=timeout_ms)
            
            # Wait for the page to load and find the input field
            page.wait_for_selector("#question", timeout=30000)
            
            # Clear any existing text and type the question
            page.fill("#question", question)
            
            # Click the send button
            page.click("#get_answer_btn")
            
            # Wait for the response to appear - wait longer for the AI to respond
            page.wait_for_selector("#qa li.sender p", timeout=90000)
            
            # Wait a bit more for the response to fully load
            page.wait_for_timeout(3000)
            
            # Get all sender messages and take the last one (the response)
            messages = page.locator("#qa li.sender p").all()
            if messages:
                # Get the last message (the response)
                last_message = messages[-1]
                text = last_message.inner_text(timeout=10000)
            else:
                text = "[No response received]"
                
        except Exception as e:
            text = f"[ERROR: {str(e)}]"
        finally:
            browser.close()
            
        return re.sub(r"\s+\n", "\n", text).strip()

def llm_answer_from_site(question, website_url):
    if website_url == "NO_WEBSITE":
        return "No website available for ground truth comparison"
    
    site_text = fetch_site_text(website_url)
    system = (
        "You answer strictly from the provided website text. "
        "If the text is insufficient, say 'Unknown from site text'. "
        "Return ONLY the direct answer (no fluff)."
    )
    user = f"Website URL: {website_url}\nWebsite text:\n{site_text}\n\nQuestion: {question}"
    # If your SDK version prefers the Responses API, swap to client.responses.create.
    resp = client.chat.completions.create(
        model=MODEL_ANSWER,
        messages=[{"role":"system","content":system},
                  {"role":"user","content":user}]
    )
    return resp.choices[0].message.content.strip()

def llm_grade(question, bot_answer, gpt_answer):
    # Handle case where no ground truth is available
    if gpt_answer == "No website available for ground truth comparison":
        return {
            "grade": "N/A",
            "soft_match": False,
            "justification": "No website available for comparison"
        }
    
    system = (
        "You are a strict, consistent grader. "
        "Grade the experimental chatbot answer against the ground-truth answer ONLY. "
        "Output VALID JSON with keys: grade (A|B|C|D|F), soft_match (true/false), justification (short)."
    )
    rubric = (
        "Rubric:\n"
        "A = excellent complete answer\n"
        "B = good answer with enough correct information\n"
        "C = mediocre; some correct but missing others\n"
        "D = incomplete; unacceptable to church\n"
        "F = completely wrong\n"
        "Note: If answers are semantically identical despite wording differences, set soft_match true."
    )
    user = (
        f"{rubric}\n\nQuestion: {question}\n\n"
        f"Experimental chatbot answer:\n{bot_answer}\n\n"
        f"Ground truth answer:\n{gpt_answer}\n\n"
        "Return JSON only."
    )
    resp = client.chat.completions.create(
        model=MODEL_GRADER,
        messages=[{"role":"system","content":system},
                  {"role":"user","content":user}]
    )
    raw = resp.choices[0].message.content.strip()
    try:
        return json.loads(raw)
    except Exception:
        m = re.search(r"\{.*\}", raw, re.S)
        return json.loads(m.group(0)) if m else {"grade":"D","soft_match":False,"justification":"Malformed grader output."}

def run_batch(csv_path, out_csv="report.csv", out_json="report.json"):
    df = pd.read_csv(csv_path)
    rows = []
    for _, row in tqdm(df.iterrows(), total=len(df)):
        chatbot = row["Chatbot"].strip()
        site = row["Website"].strip()
        
        # Convert chatbot handle to full URL if needed
        if chatbot.startswith("@"):
            chatbot_url = f"https://pastors.ai/{chatbot}"
        else:
            chatbot_url = chatbot
            
        # Ensure website has protocol
        if not site.startswith(("http://", "https://")):
            site = f"https://{site}"
            
        try:
            bot_ans = ask_chatbot(chatbot_url)
        except PWTimeout:
            bot_ans = "[TIMEOUT querying chatbot]"
        except Exception as e:
            bot_ans = f"[ERROR querying chatbot: {e}]"
            
        gt_ans  = llm_answer_from_site(QUESTION, site)
        grade   = llm_grade(QUESTION, bot_ans, gt_ans)
        rows.append({
            "chatbot_url": chatbot_url,
            "website_url": site,
            "bot_answer": bot_ans,
            "gpt_answer": gt_ans,
            "grade": grade.get("grade"),
            "soft_match": grade.get("soft_match"),
            "justification": grade.get("justification")
        })
        time.sleep(0.5)

    out_df = pd.DataFrame(rows)
    out_df.to_csv(out_csv, index=False)
    with open(out_json, "w") as f:
        json.dump(rows, f, indent=2)
    return out_df

if __name__ == "__main__":
    run_batch("data/churches_cleaned.csv")
