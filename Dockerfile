# استخدم Node.js كبيئة أساسية
FROM node:18

# تعيين مجلد العمل داخل الحاوية
WORKDIR /usr/src/app

# نسخ ملفات package.json + package-lock.json
COPY package*.json ./

# تثبيت الـ dependencies
RUN npm install

# نسخ باقي الملفات
COPY . .

# تعيين البورت
EXPOSE 3000

# أمر التشغيل
CMD ["node", "server.js"]
