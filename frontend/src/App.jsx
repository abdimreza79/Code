import { useEffect, useState } from "react";

const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

const menuItems = [
  { id: "home", label: "صفحه اصلی" },
  { id: "standards", label: "استانداردها" },
  { id: "services", label: "خدمات" }
];

const standards = [
  { id: "cobit", title: "COBIT", description: "چارچوب حاکمیت فناوری اطلاعات." },
  { id: "isms", title: "ISMS", description: "سیستم مدیریت امنیت اطلاعات نسخه 2022." }
];

const initialFormState = {
  company: "",
  contact: ""
};

export default function App() {
  const [activeMenu, setActiveMenu] = useState("home");
  const [activeStandard, setActiveStandard] = useState("isms");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [formData, setFormData] = useState(initialFormState);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (activeMenu === "standards" && activeStandard === "isms") {
      fetch(`${apiBaseUrl}/api/questions`)
        .then((res) => res.json())
        .then((data) => {
          setQuestions(data.questions || []);
        })
        .catch(() => {
          setError("امکان دریافت سوالات وجود ندارد.");
        });
    }
  }, [activeMenu, activeStandard]);

  const handleAnswerChange = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${apiBaseUrl}/api/isms/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          company: formData.company,
          contact: formData.contact,
          answers
        })
      });

      if (!response.ok) {
        throw new Error("خطا در ثبت اطلاعات");
      }

      const data = await response.json();
      setResult(data);
    } catch (submitError) {
      setError("ثبت اطلاعات با مشکل مواجه شد.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="badge">سامانه ارزیابی ISMS 2022</p>
          <h1>پلتفرم وب مبتنی بر React + Node.js + SQL Server</h1>
          <p>
            این سامانه برای خوداظهاری مشتریان مطابق نسخه 2022 استاندارد
            ISO/IEC 27001 طراحی شده است و ارزیابی را بر اساس Annex A انجام می دهد.
          </p>
        </div>
      </header>

      <nav className="menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={activeMenu === item.id ? "active" : ""}
            onClick={() => setActiveMenu(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <main>
        {activeMenu === "home" && (
          <section className="card">
            <h2>خوش آمدید</h2>
            <p>
              از طریق منوی استانداردها می توانید به فرم خوداظهاری ISMS 2022 دسترسی پیدا
              کنید و نتیجه ارزیابی را به صورت آنی مشاهده نمایید.
            </p>
          </section>
        )}

        {activeMenu === "services" && (
          <section className="grid">
            <article className="card">
              <h3>مشاوره پیاده سازی</h3>
              <p>تدوین دامنه، خط مشی و ارزیابی ریسک مطابق ISO 27001.</p>
            </article>
            <article className="card">
              <h3>ممیزی داخلی</h3>
              <p>بازنگری کنترل ها و تهیه گزارش شکاف.</p>
            </article>
            <article className="card">
              <h3>آموزش و توانمندسازی</h3>
              <p>برگزاری کارگاه های ISMS و آگاهی کارکنان.</p>
            </article>
          </section>
        )}

        {activeMenu === "standards" && (
          <section>
            <div className="tabs">
              {standards.map((standard) => (
                <button
                  key={standard.id}
                  className={activeStandard === standard.id ? "active" : ""}
                  onClick={() => setActiveStandard(standard.id)}
                >
                  {standard.title}
                </button>
              ))}
            </div>

            {activeStandard === "cobit" && (
              <article className="card">
                <h3>COBIT</h3>
                <p>
                  COBIT چارچوبی برای حاکمیت و مدیریت فناوری اطلاعات است که به ایجاد
                  ارزش، مدیریت ریسک و سنجش عملکرد کمک می کند.
                </p>
              </article>
            )}

            {activeStandard === "isms" && (
              <section className="card">
                <h3>فرم خوداظهاری ISMS 2022</h3>
                <p>
                  لطفاً اطلاعات سازمانی را تکمیل کنید و میزان انطباق با الزامات
                  ISO/IEC 27001:2022 را مشخص نمایید.
                </p>

                {error && <div className="alert">{error}</div>}

                <form onSubmit={handleSubmit} className="form">
                  <div className="field">
                    <label>نام سازمان</label>
                    <input
                      value={formData.company}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          company: event.target.value
                        }))
                      }
                      placeholder="مثال: شرکت توسعه امنیت"
                      required
                    />
                  </div>

                  <div className="field">
                    <label>راه ارتباطی</label>
                    <input
                      value={formData.contact}
                      onChange={(event) =>
                        setFormData((prev) => ({
                          ...prev,
                          contact: event.target.value
                        }))
                      }
                      placeholder="ایمیل یا شماره تماس"
                      required
                    />
                  </div>

                  <div className="questions">
                    {questions.map((question) => (
                      <div key={question.id} className="question">
                        <p>{question.text}</p>
                        <div className="choices">
                          <label>
                            <input
                              type="radio"
                              name={question.id}
                              checked={answers[question.id] === true}
                              onChange={() => handleAnswerChange(question.id, true)}
                            />
                            بله
                          </label>
                          <label>
                            <input
                              type="radio"
                              name={question.id}
                              checked={answers[question.id] === false}
                              onChange={() => handleAnswerChange(question.id, false)}
                            />
                            خیر
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="actions">
                    <button type="submit" disabled={loading}>
                      {loading ? "در حال ثبت..." : "ثبت و ارزیابی"}
                    </button>
                    <button type="button" className="secondary" onClick={resetForm}>
                      پاکسازی فرم
                    </button>
                  </div>
                </form>

                {result && (
                  <div className="result">
                    <h4>نتیجه ارزیابی</h4>
                    <p>امتیاز کلی: {result.score}٪</p>
                    <p>{result.result}</p>
                    <div className="result-grid">
                      {result.details.map((detail) => (
                        <div key={detail.id} className="result-item">
                          <span>{detail.annex}</span>
                          <strong>{detail.answer}</strong>
                          <small>{detail.question}</small>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
