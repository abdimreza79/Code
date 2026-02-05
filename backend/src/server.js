import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sql from "mssql";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const questions = [
  {
    id: "context",
    text: "سازمان شما دامنه و زمینه ISMS را مطابق نسخه 2022 تعریف کرده است؟"
  },
  {
    id: "leadership",
    text: "حمایت مدیریت ارشد از خط مشی امنیت اطلاعات مستند شده است؟"
  },
  {
    id: "risk",
    text: "ارزیابی ریسک امنیت اطلاعات به صورت دوره ای انجام می شود؟"
  },
  {
    id: "annexA",
    text: "کنترل های ضمیمه A ISO 27001:2022 در سازمان شما پیاده سازی شده اند؟"
  },
  {
    id: "monitoring",
    text: "پایش و بازنگری اثربخشی کنترل ها انجام می شود؟"
  }
];

const annexMapping = {
  context: "A.5.1 - خط مشی امنیت اطلاعات",
  leadership: "A.5.2 - نقش ها و مسئولیت ها",
  risk: "A.5.7 - اطلاعات تهدیدات",
  annexA: "A.5.8 - مدیریت دارایی ها",
  monitoring: "A.5.35 - بازنگری مستقل"
};

const sqlConfig = {
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

async function saveAssessment(payload) {
  if (!process.env.SQL_SERVER) {
    return;
  }

  const pool = await sql.connect(sqlConfig);
  await pool
    .request()
    .input("company", sql.NVarChar, payload.company)
    .input("contact", sql.NVarChar, payload.contact)
    .input("score", sql.Int, payload.score)
    .input("result", sql.NVarChar, payload.result)
    .input("details", sql.NVarChar(sql.MAX), JSON.stringify(payload.details))
    .query(
      `
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='IsmsAssessments' AND xtype='U')
      CREATE TABLE IsmsAssessments (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Company NVARCHAR(200),
        Contact NVARCHAR(200),
        Score INT,
        Result NVARCHAR(200),
        Details NVARCHAR(MAX),
        CreatedAt DATETIME DEFAULT GETDATE()
      )

      INSERT INTO IsmsAssessments (Company, Contact, Score, Result, Details)
      VALUES (@company, @contact, @score, @result, @details)
      `
    );
}

function evaluateAssessment(answers) {
  const yesCount = questions.filter((question) => answers[question.id] === true).length;
  const score = Math.round((yesCount / questions.length) * 100);

  let result = "نیازمند اقدام اصلاحی";
  if (score >= 80) {
    result = "همسویی بالا با الزامات ISO 27001:2022";
  } else if (score >= 50) {
    result = "همسویی متوسط - برنامه بهبود پیشنهاد می شود";
  }

  const details = questions.map((question) => ({
    id: question.id,
    annex: annexMapping[question.id],
    answer: answers[question.id] === true ? "انجام شده" : "نیازمند اقدام",
    question: question.text
  }));

  return { score, result, details };
}

app.get("/api/questions", (req, res) => {
  res.json({ questions });
});

app.post("/api/isms/submit", async (req, res) => {
  const { company, contact, answers } = req.body;

  if (!company || !contact || !answers) {
    return res.status(400).json({ message: "اطلاعات ناقص است." });
  }

  const evaluation = evaluateAssessment(answers);
  const payload = {
    company,
    contact,
    ...evaluation
  };

  try {
    await saveAssessment(payload);
  } catch (error) {
    console.error("SQL error:", error);
  }

  return res.json(payload);
});

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
