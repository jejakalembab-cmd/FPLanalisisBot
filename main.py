import os
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, ContextTypes, filters

BOT_TOKEN = os.getenv("BOT_TOKEN")

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("📲 Selamat datang ke FPLanalisisBot!")

async def id_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    await update.message.reply_text(f"🧾 Telegram ID anda ialah: {user_id}")

async def team_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("📝 Pasukan demo anda: Haaland, Saka, Palmer, Udogie, Areola")

async def captain_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("🧢 Cadangan kapten GW ini: Haaland (vs BOU, Home) ⭐")

async def chatbot_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    msg = update.message.text.lower()
    if "kapten" in msg:
        await captain_handler(update, context)
    elif "wildcard" in msg:
        await update.message.reply_text("🎯 Wildcard biasanya digunakan sekitar GW8–GW10.")
    elif "tukar" in msg or "transfer" in msg:
        await update.message.reply_text("🔁 Transfer popular: Gordon → Diaby.")
    else:
        await update.message.reply_text("🤖 Saya tak faham. Cuba taip /help atau tanya tentang kapten, wildcard, atau transfer.")

if __name__ == '__main__':
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("id", id_handler))
    app.add_handler(CommandHandler("team", team_handler))
    app.add_handler(CommandHandler("captain", captain_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, chatbot_handler))
    print("Bot is running...")
    app.run_polling()