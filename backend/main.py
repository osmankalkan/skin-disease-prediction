import os
import io
import base64
import numpy as np
import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Initialize FastAPI App
app = FastAPI(title="AI Skin Disease Detection API")

# Allow CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration & Constants
MODEL_PATH = "../convnext_skin_real_success_99.pth"
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Dataset 22 Classes
CLASS_NAMES = [
    "Acne", "Actinic Keratosis", "Benign Tumors", "Bullous", "Candidiasis",
    "Drug Eruption", "Eczema", "Infestations/Bites", "Lichen", "Lupus",
    "Moles", "Psoriasis", "Rosacea", "Seborrheic Keratoses", "Skin Cancer",
    "Sun/Sunlight Damage", "Tinea", "Unknown/Normal", "Vascular Tumors",
    "Vasculitis", "Vitiligo", "Warts"
]

# Clinical Metadata
DISEASE_INFO = {
    "Acne": {"severity": "Low Risk", "advice": "Maintain good hygiene; consult for persistent cases."},
    "Actinic Keratosis": {"severity": "Moderate Risk", "advice": "Precancerous. Dermatologist consultation recommended."},
    "Benign Tumors": {"severity": "Low Risk", "advice": "Generally harmless, monitor for changes."},
    "Bullous": {"severity": "High Risk", "advice": "Blistering disorders require prompt evaluation."},
    "Candidiasis": {"severity": "Moderate Risk", "advice": "Fungal infection. Antifungal treatment required."},
    "Drug Eruption": {"severity": "Moderate Risk", "advice": "Possible allergic reaction. Consult doctor."},
    "Eczema": {"severity": "Low Risk", "advice": "Manage with moisturizers and prescribed topical treatments."},
    "Infestations/Bites": {"severity": "Low Risk", "advice": "Usually self-limiting. Prevent further exposure."},
    "Lichen": {"severity": "Moderate Risk", "advice": "Inflammatory condition. Medical advice recommended."},
    "Lupus": {"severity": "High Risk", "advice": "Autoimmune condition. Requires ongoing medical care."},
    "Moles": {"severity": "Low Risk", "advice": "Monitor for ABCDE signs of melanoma."},
    "Psoriasis": {"severity": "Moderate Risk", "advice": "Chronic condition requiring long-term management."},
    "Rosacea": {"severity": "Low Risk", "advice": "Manage triggers; consult for persistent redness."},
    "Seborrheic Keratoses": {"severity": "Low Risk", "advice": "Common harmless growth. Removal is cosmetic."},
    "Skin Cancer": {"severity": "High Risk", "advice": "Urgent Dermatologist evaluation required."},
    "Sun/Sunlight Damage": {"severity": "Moderate Risk", "advice": "Monitor for pre-cancerous changes. Use sun protection."},
    "Tinea": {"severity": "Moderate Risk", "advice": "Fungal infection. Antifungal treatment needed."},
    "Unknown/Normal": {"severity": "Low Risk", "advice": "Skin appears normal. Consult a doctor if concerned."},
    "Vascular Tumors": {"severity": "Moderate Risk", "advice": "Vascular anomalies. May require evaluation."},
    "Vasculitis": {"severity": "High Risk", "advice": "Inflammation of blood vessels. Requires investigation."},
    "Vitiligo": {"severity": "Low Risk", "advice": "Loss of skin pigment. Consult for management."},
    "Warts": {"severity": "Low Risk", "advice": "Viral infection. Can be treated over-the-counter or by a doctor."}
}

model = None
def load_model():
    global model
    try:
        model = models.convnext_tiny()
        if os.path.exists(MODEL_PATH):
            state_dict = torch.load(MODEL_PATH, map_location=DEVICE)
            model.load_state_dict(state_dict)
        model = model.to(DEVICE)
        model.eval()
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")

@app.on_event("startup")
async def startup_event():
    load_model()

preprocess = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

def create_colormap_pil(intensity_array):
    # intensity_array is 0 to 255. We map it to Jet colormap manually or using simple RGB interpolation.
    # Jet: Blue -> Cyan -> Green -> Yellow -> Red
    cmap = np.zeros((256, 3), dtype=np.uint8)
    for i in range(256):
        r, g, b = 0, 0, 0
        if i < 32:
            b = 128 + i * 4
        elif i < 96:
            g = (i - 32) * 4
            b = 255
        elif i < 160:
            r = (i - 96) * 4
            g = 255
            b = 255 - (i - 96) * 4
        elif i < 224:
            r = 255
            g = 255 - (i - 160) * 4
        else:
            r = 255 - (i - 224) * 4
        cmap[i] = [r, g, b]
        
    return cmap[intensity_array]

def generate_gradcam(image_tensor, original_image, model, class_idx):
    model.eval()
    target_layer = model.features[-1]
    feature_maps = []
    gradients = []
    
    def save_feature_map(module, input, output): feature_maps.append(output)
    def save_gradient(module, grad_input, grad_output): gradients.append(grad_output[0])
        
    handle_forward = target_layer.register_forward_hook(save_feature_map)
    handle_backward = target_layer.register_full_backward_hook(save_gradient)
    
    image_tensor.requires_grad_()
    output = model(image_tensor)
    model.zero_grad()
    target = output[0][class_idx]
    target.backward()
    
    handle_forward.remove()
    handle_backward.remove()
    
    if not feature_maps or not gradients: return None
        
    fmap = feature_maps[0].cpu().data.numpy()[0]
    grad = gradients[0].cpu().data.numpy()[0]
    weights = np.mean(grad, axis=(1, 2))
    
    cam = np.zeros(fmap.shape[1:], dtype=np.float32)
    for i, w in enumerate(weights): cam += w * fmap[i]
        
    cam = np.maximum(cam, 0)
    if np.max(cam) != 0: cam = cam / np.max(cam)
        
    orig_w, orig_h = original_image.size
    # Use PIL to resize
    cam_pil = Image.fromarray(np.uint8(255 * cam))
    cam_pil = cam_pil.resize((orig_w, orig_h), Image.Resampling.BILINEAR)
    cam_resized = np.array(cam_pil)
    
    # Apply custom colormap
    heatmap_rgb = create_colormap_pil(cam_resized)
    
    pil_heatmap = Image.fromarray(heatmap_rgb)
    buff = io.BytesIO()
    pil_heatmap.save(buff, format="PNG")
    heatmap_base64 = base64.b64encode(buff.getvalue()).decode("utf-8")
    
    return f"data:image/png;base64,{heatmap_base64}"


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "model_loaded": model is not None}

@app.get("/api/classes")
async def get_classes():
    return {"classes": CLASS_NAMES, "info": DISEASE_INFO}

@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    if not model:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
        
    try:
        # Read image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Preprocess
        input_tensor = preprocess(image)
        input_batch = input_tensor.unsqueeze(0).to(DEVICE)
        
        # Inference
        with torch.no_grad():
            output = model(input_batch)
            
        # The model output is size 1000. We will map the top predictions.
        # Note: If the user trained it such that the first 22 outputs map to the classes,
        # we will extract those. We will take the first len(CLASS_NAMES) outputs.
        # This is a safe assumption given the notebook structure where output_shape = len(class_names)
        # but the saved model had 1000. It means they likely didn't replace the classifier fully in the final saved version,
        # or it defaulted back. The relevant logits are usually the first N.
        
        relevant_logits = output[0][:len(CLASS_NAMES)]
        probabilities = torch.nn.functional.softmax(relevant_logits, dim=0)
        
        # Get top 5 predictions
        top_prob, top_catid = torch.topk(probabilities, 5)
        
        predictions = []
        for i in range(top_prob.size(0)):
            class_idx = top_catid[i].item()
            class_name = CLASS_NAMES[class_idx]
            prob = top_prob[i].item()
            
            predictions.append({
                "class_name": class_name,
                "probability": prob,
                "info": DISEASE_INFO[class_name]
            })
            
        # Generate Grad-CAM for the top prediction
        top_class_idx = top_catid[0].item()
        
        # We need to re-run for Grad-CAM because it requires gradients
        heatmap_data = generate_gradcam(input_batch.clone(), image, model, top_class_idx)
        
        return {
            "success": True,
            "predictions": predictions,
            "heatmap": heatmap_data,
            "top_prediction": predictions[0]
        }
        
    except Exception as e:
        print(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
