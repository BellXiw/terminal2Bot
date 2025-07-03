
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, ContextTypes, filters
from datetime import datetime, timedelta
import json, os

TOKEN = "7634182260:AAFaddkoCNkcZdVV5GPcszVKrUb0kLp97zE"
HISTORY_FILE = "history.json"

def load_history():
    if os.path.exists(HISTORY_FILE):
        with open(HISTORY_FILE, "r") as f:
            return json.load(f)
    return {}

def save_history(history):
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

def clear_old_entries(history):
    now = datetime.now()
    cutoff = now - timedelta(days=1)
    for user_id in list(history.keys()):
        history[user_id] = [e for e in history[user_id] if datetime.strptime(e["timestamp"], "%Y-%m-%d %H:%M") > cutoff]

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [[InlineKeyboardButton("🎯 Начать игру", web_app=WebAppInfo(url="https://your-webapp-url.vercel.app"))]]
    markup = InlineKeyboardMarkup(keyboard)
    await update.message.reply_text("Добро пожаловать! Найди пары чисел за 30 секунд:", reply_markup=markup)

async def history(update: Update, context: ContextTypes.DEFAULT_TYPE):
    history = load_history()
    user_id = str(update.effective_user.id)
    entries = history.get(user_id, [])
    if not entries:
        await update.message.reply_text("История пуста.")
        return
    text = "Последние игры:\n\n"
    for entry in entries[-10:]:
        emoji = "✅" if entry["result"] == "win" else "❌"
        text += f"{entry['time']} {emoji}\n"
    await update.message.reply_text(text)

async def webapp_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    data = update.effective_message.web_app_data.data
    user = update.effective_user
    chat = update.effective_chat
    result = "win" if data == "win" else "fail"
    text = f"{user.mention_html()} открыл доступ ✔️" if result == "win" else f"{user.mention_html()} ошибка ✖️"
    if chat.type == "private":
        text = text.replace(user.mention_html(), user.first_name)
    history = load_history()
    user_id = str(user.id)
    history.setdefault(user_id, []).append({
        "result": result,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M"),
        "time": datetime.now().strftime("%H:%M")
    })
    clear_old_entries(history)
    save_history(history)
    await context.bot.send_message(chat.id, text=text, parse_mode="HTML")

def main():
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("history", history))
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, webapp_handler))
    app.run_polling()

if __name__ == '__main__':
    main()
