# سامانه خوداظهاری ISMS 2022

این مخزن شامل یک برنامه تحت وب با فرانت React، بک اند Node.js و ذخیره سازی SQL Server است. فرم خوداظهاری ISMS 2022 اطلاعات مشتری را دریافت و بر اساس Annex A استاندارد ISO 27001:2022 ارزیابی می کند.

## اجرا

### بک اند

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### فرانت

```bash
cd frontend
npm install
npm run dev
```

در صورت نیاز متغیر `VITE_API_URL` را برای اتصال به API تنظیم کنید.
