"""
Diva Dynamic Yoga — Flask Backend
"""

from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

# ── Data ────────────────────────────────────────────────────────────────────

SCHEDULE = [
    {
        "day": "Monday",
        "morning": "05:30 – 06:30 AM",
        "kids": None,
        "adults": None,
        "note": "Morning Batch (Adults & All Levels)",
    },
    {
        "day": "Wednesday",
        "morning": "05:30 – 06:30 AM",
        "kids": None,
        "adults": None,
        "note": "Morning Batch (Adults & All Levels)",
    },
    {
        "day": "Saturday",
        "morning": None,
        "kids": "05:00 – 06:00 PM",
        "adults": "06:00 – 07:00 PM",
        "note": "Kids (5–6 PM) · Adults (6–7 PM)",
    },
    {
        "day": "Sunday",
        "morning": None,
        "kids": "05:00 – 06:00 PM",
        "adults": "06:00 – 07:00 PM",
        "note": "Kids (5–6 PM) · Adults (6–7 PM)",
    },
]

CLASSES = [
    {
        "id": "core-strength",
        "title": "Core Strength",
        "tagline": "Intensive mobility and strength with home drills and progress checks.",
        "benefits": ["Stronger deep core and spinal support", "Improved posture, reduced lower-back strain", "Enhanced balance and everyday movement"],
        "icon": "🔥",
        "color": "#5B8A7A",
    },
    {
        "id": "therapy-flow",
        "title": "Therapy Flow",
        "tagline": "Gentle sequences addressing chronic aches and posture.",
        "benefits": ["Pain relief for back, neck and knees", "Joint-safe progressions and mobility-focused work", "Breath-led relaxation to improve recovery"],
        "icon": "🌿",
        "color": "#8A7B5B",
    },
    {
        "id": "online-live",
        "title": "Live Online",
        "tagline": "Interactive remote classes — real-time guidance plus recordings.",
        "benefits": ["Flexible access from home", "Session recordings for repeat practice", "Trainer feedback and class modifications"],
        "icon": "📡",
        "color": "#5B6F8A",
    },
    {
        "id": "mobility-booster",
        "title": "Mobility Booster",
        "tagline": "Dynamic joint drills and targeted mobility protocols.",
        "benefits": ["Range of motion improvements", "Reduced stiffness", "Great for desk workers & athletes"],
        "icon": "⚡",
        "color": "#7A5B8A",
    },
    {
        "id": "gentle-flow",
        "title": "Gentle & Open Flow",
        "tagline": "Slow, deliberate sequences for recovery and relaxation.",
        "benefits": ["Beginner-friendly", "Breath-first approach", "Improves sleep & overall calm"],
        "icon": "🌸",
        "color": "#8A5B6F",
    },
    {
        "id": "breath-calm",
        "title": "Breath & Calm",
        "tagline": "Short module focused on pranayama and restorative breathing.",
        "benefits": ["Stress reduction", "Better sleep", "Improved lung capacity"],
        "icon": "🫁",
        "color": "#5B8A6F",
    },
]

MUDRAS = [
    {
        "name": "Gyan Mudra",
        "gesture": "Index finger touches the thumb.",
        "element": "Air",
        "element_emoji": "💨",
        "benefits": ["Improves focus, memory, calmness"],
        "used_in": "Meditation, Pranayama",
    },
    {
        "name": "Prana Mudra",
        "gesture": "Thumb touches ring and little finger.",
        "element": "Water + Earth",
        "element_emoji": "💧",
        "benefits": ["Boosts vitality, reduces fatigue, increases immunity"],
        "used_in": "Energy-building practices",
    },
    {
        "name": "Apana Mudra",
        "gesture": "Thumb touches middle and ring finger.",
        "element": "Earth + Water",
        "element_emoji": "🌍",
        "benefits": ["Improves digestion, detox, hormonal balance"],
        "used_in": "Therapy, digestive support practices",
    },
    {
        "name": "Vayu Mudra",
        "gesture": "Index finger folded and pressed lightly with the thumb.",
        "element": "Air",
        "element_emoji": "🌬️",
        "benefits": ["Reduces anxiety, restlessness, joint discomfort"],
        "used_in": "Mobility, relaxation phases",
    },
    {
        "name": "Shunya Mudra",
        "gesture": "Middle finger pressed gently by the thumb.",
        "element": "Space (Ether)",
        "element_emoji": "✨",
        "benefits": ["Helps with ear pressure, imbalance, mental lightness"],
        "used_in": "Quiet calming practices",
    },
    {
        "name": "Dhyana Mudra",
        "gesture": "Hands in lap, right over left, palms facing upward.",
        "element": "Space",
        "element_emoji": "🌌",
        "benefits": ["Deepens meditation, enhances stillness"],
        "used_in": "Meditation, Savasana",
    },
]

ELEMENTS = [
    {"name": "Space (Ether)", "emoji": "🌌", "qualities": "Expansion, openness", "imbalance": "Overthinking, lack of clarity", "balanced": "Meditation, Dhyana Mudra"},
    {"name": "Air", "emoji": "💨", "qualities": "Movement, breathing", "imbalance": "Anxiety, instability", "balanced": "Mobility flows, Vayu Mudra"},
    {"name": "Fire", "emoji": "🔥", "qualities": "Heat, transformation", "imbalance": "Anger, stress, acidity", "balanced": "Core strengthening, breath control"},
    {"name": "Water", "emoji": "💧", "qualities": "Fluidity, emotions", "imbalance": "Emotional heaviness, stiffness", "balanced": "Flowing sequences, Prana Mudra"},
    {"name": "Earth", "emoji": "🌍", "qualities": "Stability, grounding", "imbalance": "Weakness, insecurity", "balanced": "Standing postures, Apana Mudra"},
]

# ── Routes ───────────────────────────────────────────────────────────────────

@app.route("/")
def home():
    return render_template("index.html", page="home")

@app.route("/about")
def about():
    return render_template("about.html", page="about")

@app.route("/classes")
def classes():
    return render_template("classes.html", page="classes", classes=CLASSES)

@app.route("/schedule")
def schedule():
    return render_template("schedule.html", page="schedule", schedule=SCHEDULE)

@app.route("/teachers")
def teachers():
    return render_template("teachers.html", page="teachers")

@app.route("/mudras")
def mudras():
    return render_template("mudras.html", page="mudras", mudras=MUDRAS, elements=ELEMENTS)

@app.route("/contact")
def contact():
    return render_template("contact.html", page="contact")

@app.route("/api/book", methods=["POST"])
def book_trial():
    data = request.get_json()
    name = data.get("name", "").strip()
    phone = data.get("phone", "").strip()
    email = data.get("email", "").strip()
    message = data.get("message", "").strip()

    if not name or not phone:
        return jsonify({"success": False, "error": "Name and phone are required."}), 400

    # In production, send email / save to DB here
    return jsonify({
        "success": True,
        "message": f"Thank you {name}! We'll reach out on {phone} shortly to confirm your slot."
    })

# ── Run ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app.run(debug=True, port=5000)
