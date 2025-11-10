# app.py
"""
Word Weaver - Local GPT-2 demo (Streamlit)
- Runs GPT-2 locally with transformers + torch (CPU)
- Generates one token at a time using model logits + sampling
- Shows tokens table, 3D token flow visualization, and top-k probabilities
"""

import os
import time
import json
import random
import streamlit as st
import pandas as pd
import streamlit.components.v1 as components
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM

# ---------- Page config & CSS ----------
st.set_page_config(page_title="Word Weaver - LLM Simulator (Local GPT-2)", layout="wide")

NAVBAR = """
<style>
/* top nav */
#topnav {
  position: fixed; top: 0; left: 0; right: 0; height: 56px;
  background: linear-gradient(90deg,#0f172a,#0b1220);
  color: #fff; display:flex; align-items:center; padding:0 18px; z-index:9999;
  box-shadow: 0 3px 8px rgba(2,6,23,0.45);
}
#topnav a { color:#e6eef8; margin-right:14px; text-decoration:none; font-weight:600 }
#topnav .title { font-size:18px; margin-right:30px; display:flex; gap:10px; align-items:center; }
.main-content { padding-top:80px; padding-left:18px; padding-right:18px; }
.card { background:white; border-radius:10px; padding:14px; box-shadow:0 6px 18px rgba(4,10,20,0.06); margin-bottom:16px; }
.token-pill { display:inline-block; padding:6px 10px; margin:6px; border-radius:999px; background:#eef2ff; border:1px solid #c7d2fe; font-weight:600; }
.fixed-small { font-size:22px; font-weight:700; }
</style>

<div id="topnav">
  <div class="title">🧵 <span>Word Weaver - LLM Simulator (Local GPT-2)</span></div>
  <a href="#input-output">Input / Output</a>
  <a href="#tokens">Generated Tokens</a>
  <a href="#transformer">Transformer Layers</a>
  <a href="#probabilities">Next-word Probabilities</a>
  <div style="flex:1"></div>
  <div style="font-size:13px; color:#cfe1ff">Offline demo</div>
</div>
<div class="main-content"></div>
"""
st.markdown(NAVBAR, unsafe_allow_html=True)

def section_anchor(title, anchor):
    st.markdown(f"<a id='{anchor}'></a>\n\n### {title}", unsafe_allow_html=True)

# ---------- Sidebar controls ----------
st.sidebar.header("Controls")
model_name = st.sidebar.selectbox("Model (local)", ["meta-llama/Llama-3.2-3B"], index=0)
temperature = st.sidebar.slider("Sampling temperature", 0.1, 1.5, 0.8, 0.05)
num_candidates = st.sidebar.slider("Number of candidates shown (top-k)", 5, 40, 20)
speed = st.sidebar.slider("Transformer animation speed (0.0 fastest)", 0.0, 1.0, 0.25, 0.05)

# ---------- Cache model + tokenizer ----------
@st.cache_resource(show_spinner=False)
def load_model_and_tokenizer(mname="meta-llama/Llama-3.2-3B"):
    from transformers import AutoModelForCausalLM, AutoTokenizer
    import torch

    tokenizer = AutoTokenizer.from_pretrained(mname)
    model = AutoModelForCausalLM.from_pretrained(
        mname,
        load_in_8bit=True,
        device_map="auto"
    )

    model.eval()
    return model, tokenizer


model, tokenizer = load_model_and_tokenizer(model_name)

# ---------- Session state ----------
if 'prompt' not in st.session_state: st.session_state['prompt'] = ""
if 'output' not in st.session_state: st.session_state['output'] = ""
if 'tokens' not in st.session_state: st.session_state['tokens'] = []
if 'token_ids' not in st.session_state: st.session_state['token_ids'] = []
if 'candidates' not in st.session_state: st.session_state['candidates'] = []
if 'probs' not in st.session_state: st.session_state['probs'] = []
if 'last_token' not in st.session_state: st.session_state['last_token'] = ""

# ---------- Utilities ----------
def encode_text_with_gpt2(text):
    # returns list of token ids and token strings
    ids = tokenizer.encode(text, add_special_tokens=False)
    token_strs = [tokenizer.decode([i]) for i in ids]
    return ids, token_strs

def compute_next_token_and_probs(context_text, temp=1.0, top_k=20):
    """
    Returns: next_token_str, topk_candidates(list of str), topk_probs(list of floats)
    Ensures tensors and model are on the same device.
    """
    device = next(model.parameters()).device  # detect where the model is (CPU or GPU)
    
    # Tokenize and move input_ids to the same device
    inputs = tokenizer(context_text, return_tensors="pt", add_special_tokens=False).to(device)
    input_ids = inputs["input_ids"]

    with torch.no_grad():
        outputs = model(input_ids)
        logits = outputs.logits  # shape [1, seq_len, vocab_size]
        last_logits = logits[0, -1]  # tensor of shape [vocab_size]

        # apply temperature
        last_logits = last_logits / temp

        # get probabilities
        probs = torch.softmax(last_logits, dim=-1)

        # top-k
        topk = torch.topk(probs, k=top_k)
        top_ids = topk.indices.cpu().tolist()
        top_vals = topk.values.cpu().tolist()
        top_tokens = [tokenizer.decode([tid]) for tid in top_ids]

        # sample 1 token from full distribution
        next_id = torch.multinomial(probs, num_samples=1).item()
        next_token = tokenizer.decode([next_id])

    return next_token, top_tokens, top_vals


# ---------- Preset prompts ----------
preset_prompts = [
    "Once upon a time",
    "The quick brown fox",
    "In a world where",
    "I love programming because",
    "During the storm, the",
    "Researchers discovered a new"
]

# ---------- Layout: Input / Output ----------
section_anchor("Input / Output", "input-output")
col1, col2 = st.columns([3,2])
with col1:
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.write("*Input Prompt* — type your prompt or choose a preset.")
    prompt_input = st.text_input("Prompt", value=st.session_state['prompt'], key="prompt_input")
    # preset buttons
    preset_cols = st.columns(len(preset_prompts))
    for i, p in enumerate(preset_prompts):
        if preset_cols[i].button(p):
            st.session_state['prompt'] = p
            st.session_state['output'] = p
            ids, strs = encode_text_with_gpt2(p)
            st.session_state['token_ids'] = ids
            st.session_state['tokens'] = strs

    st.markdown("<hr/>", unsafe_allow_html=True)
    gen_col, reset_col = st.columns([1,1])
    with gen_col:
        generate_clicked = st.button("Generate Next Token")
    with reset_col:
        reset_clicked = st.button("Reset")
        if reset_clicked:
            st.session_state['prompt'] = ""
            st.session_state['output'] = ""
            st.session_state['tokens'] = []
            st.session_state['token_ids'] = []
            st.session_state['candidates'] = []
            st.session_state['probs'] = []
            st.session_state['last_token'] = ""

    # sync typed prompt into session
    if prompt_input != st.session_state['prompt']:
        st.session_state['prompt'] = prompt_input
        if prompt_input.strip():
            st.session_state['output'] = prompt_input
            ids, strs = encode_text_with_gpt2(prompt_input)
            st.session_state['token_ids'] = ids
            st.session_state['tokens'] = strs
    st.markdown("</div>", unsafe_allow_html=True)

with col2:
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.write("*Output (built token-by-token)*")
    if st.session_state['last_token']:
        st.markdown(f"<div style='font-size:64px; font-weight:800; line-height:0.9'>{st.session_state['last_token']}</div>", unsafe_allow_html=True)
    if st.session_state['output']:
        st.markdown(f"<div class='fixed-small'>{st.session_state['output']}</div>", unsafe_allow_html=True)
    else:
        st.write("No output yet.")
    st.markdown("</div>", unsafe_allow_html=True)

# ---------- When Generate button pressed ----------
if generate_clicked:
    context = st.session_state['output'] if st.session_state['output'] else st.session_state['prompt']
    if not context.strip():
        st.warning("Please type a prompt or choose a preset before generating.")
    else:
        try:
            next_token, top_tokens, top_probs = compute_next_token_and_probs(context_text=context, temp=temperature, top_k=max(num_candidates, 20))
        except Exception as e:
            st.error(f"Model inference failed: {e}")
            # --- safer fallback sampler ---
            # small fallback pool of tokens
            fallback_pool = ["the","a","story","world","time","data","love","storm","new","city",
                             "this","that","an","model","people","night","light","voice","city","found"]

            # choose a next_token randomly
            next_token = random.choice(fallback_pool)

            # Build a candidate list that includes the chosen token followed by unique samples from pool
            # ensure we never sample more items than available
            remaining_pool = [p for p in fallback_pool if p != next_token]
            k = max(0, min(len(remaining_pool), num_candidates - 1))
            sampled = random.sample(remaining_pool, k=k) if k > 0 else []
            top_tokens = [next_token] + sampled

            # Create pseudo-probabilities: give the chosen token a higher weight, rest equal-shared
            if len(top_tokens) > 1:
                top_probs = [0.45] + [round((0.55 / (len(top_tokens) - 1)), 6)] * (len(top_tokens) - 1)
            else:
                top_probs = [1.0]

            # In case num_candidates was larger than pool size, pad the lists if you want stable UI length
            # but usually we keep lengths equal to actual candidate count


        # update tokenization lists
        ids, strs = encode_text_with_gpt2(st.session_state['output'])
        st.session_state['token_ids'] = ids
        st.session_state['tokens'] = strs

        # update candidates/probs (convert probabilities to python floats)
        st.session_state['candidates'] = top_tokens[:num_candidates]
        # normalize top_probs slice
        top_probs = top_probs[:num_candidates]
        s = sum(top_probs) or 1.0
        normalized = [float(p/s) for p in top_probs]
        st.session_state['probs'] = normalized
        st.session_state['last_token'] = next_token
        time.sleep(max(0.01, 0.08 * speed))

# ---------- Section: Tokens table ----------
section_anchor("Generated Tokens", "tokens")
with st.container():
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown("<strong>What this shows:</strong> token id and text for the current output.", unsafe_allow_html=True)
    if st.session_state['tokens']:
        df = pd.DataFrame({
            "index": list(range(1, len(st.session_state['tokens'])+1)),
            "token_text": st.session_state['tokens'],
            "token_id": st.session_state['token_ids']
        })
        # use width='stretch' recommended in new Streamlit versions
        st.dataframe(df, width='stretch', height=260)
    else:
        st.info("No tokens yet. Type a prompt and click Generate Next Token.")
    st.markdown("</div>", unsafe_allow_html=True)

# ---------- Section: Transformer (3D simulated) ----------
section_anchor("Transformer Layers (simulated)", "transformer")
with st.container():
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.write("*Transformer layers* — visual simulation: recent tokens flowing through layered space.")
    js_tokens = st.session_state['tokens'][-24:]
    html_template = '''
    <div id="trf" style="width:100%; height:420px; background:#f8fafc; border-radius:8px; overflow:hidden;"></div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script>
    (function(){
        const tokens = _TOKENS_;
        const container = document.getElementById('trf');
        const width = container.clientWidth || 900;
        const height = 380;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, width/height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
        renderer.setSize(width, height);
        container.appendChild(renderer.domElement);
        camera.position.z = 50;
        const layers = 6;
        const sprites = [];
        function makeSprite(text){
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const size = 256;
            canvas.width = size; canvas.height = size;
            ctx.clearRect(0,0,size,size);
            ctx.font = 'bold 36px Arial';
            ctx.fillStyle = '#0b2';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(text, size/2, size/2);
            const texture = new THREE.CanvasTexture(canvas);
            const material = new THREE.SpriteMaterial({ map: texture });
            return new THREE.Sprite(material);
        }
        for(let i=0;i<tokens.length;i++){
            const sp = makeSprite(tokens[i] || '');
            const layer = i % layers;
            sp.position.x = (Math.random()-0.5)*40;
            sp.position.y = (Math.random()-0.5)*18;
            sp.position.z = -layer*10 - Math.random()*4;
            sp.scale.set(6,6,1);
            scene.add(sp); sprites.push(sp);
        }
        function animate(){
            requestAnimationFrame(animate);
            for(let i=0;i<sprites.length;i++){
                const s = sprites[i];
                s.position.z += 0.08;
                s.rotation.z += 0.001;
                if(s.position.z > 30) s.position.z = -layers*10 - Math.random()*6;
            }
            renderer.render(scene, camera);
        }
        animate();
        window.addEventListener('resize', ()=>{
            const w = container.clientWidth;
            renderer.setSize(w, height);
            camera.aspect = w/height;
            camera.updateProjectionMatrix();
        });
    })();
    </script>
    '''
    html_code = html_template.replace('_TOKENS_', json.dumps(js_tokens))
    components.html(html_code, height=460)
    st.markdown("</div>", unsafe_allow_html=True)

# ---------- Section: Next-word probabilities ----------
section_anchor("Next-word Probabilities", "probabilities")
with st.container():
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown("<strong>What this shows:</strong> candidate tokens and their model probabilities for the next step.", unsafe_allow_html=True)
    if st.session_state['candidates']:
        dfp = pd.DataFrame({
            "candidate": st.session_state['candidates'],
            "probability": st.session_state['probs']
        })
        # ensure length >= 1
        if dfp['probability'].isnull().any():
            dfp['probability'] = dfp['probability'].fillna(0.0)
        # show bar chart
        try:
            st.bar_chart(dfp.set_index('candidate')['probability'], width='stretch', height=220)
        except Exception:
            st.line_chart(dfp['probability'])
        st.table(dfp.style.format({"probability":"{:.3f}"}))
    else:
        st.info("Generate a token to see probabilities.")
    st.markdown("</div>", unsafe_allow_html=True)

# Footer
st.markdown("<div style='height:20px'></div>", unsafe_allow_html=True)